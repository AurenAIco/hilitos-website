// tests/homepage/home-featured-gate.test.ts — S1 stale-honesty regression guard
// (independent Opus review, S1 blocking finding).
//
// WHAT THIS PROVES
// The homepage may render the live featured rail ONLY on a fresh fetch. The
// bug this closes: getStorefrontCatalog() returns a NON-null `catalog` for
// status "stale" as well as "ok" (lib/catalog/storefront.ts's fallbackResult),
// so the previous gate — `result.catalog ? getFeaturedDesigns(...) : []` —
// happily rendered last-good product names, refs, COP prices and "Disponible"
// badges with no disclosure, on a page that carries no CatalogStatusBanner.
//
// HONESTY BOUNDARY — how the proof chain works, and what it does NOT do.
// app/(public)/page.tsx is an async Server Component whose tree contains
// next/image and next/link; this repo's `node --test` harness has no Next
// runtime, so the page itself cannot be rendered here (a direct
// renderToStaticMarkup of DesignCard fails with "Invalid src prop … hostname
// is not configured under images"). The proof is therefore two-part:
//   (1) tests/homepage/defixture.test.ts pins, by exact regex on the committed
//       source, that the page's gate IS
//         result.status === "ok" && result.catalog ? getFeaturedDesigns(...) : []
//       and that no bare `result.catalog ?` gate survives; and
//   (2) THIS file drives the real getStorefrontCatalog() through genuine
//       "unavailable" -> "ok" -> "stale" transitions and proves what that
//       expression yields for each — including, explicitly, that the OLD gate
//       WOULD have leaked (result.catalog is non-null and getFeaturedDesigns
//       returns real designs in the stale state). That last assertion is what
//       makes this a regression test rather than a restatement of the fix.
//
// NO NETWORK: globalThis.fetch is replaced with a local stub before the module
// under test is imported. Nothing here contacts the backend, and
// STOREFRONT_BACKEND_URL is set only inside this test process (node:test runs
// each test file in its own child process, so it never leaks to another file).
//
// STOREFRONT_BACKEND_URL must be set BEFORE lib/catalog/storefront.ts is
// imported — that module reads it once at module top level. Static ESM imports
// hoist, so the import happens dynamically inside before(), exactly as
// tests/storefront-v2/whatsapp-number-configured.test.ts does for
// NEXT_PUBLIC_WHATSAPP_NUMBER.
import test, { before } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { CatalogResult } from "@/lib/catalog/storefront";
import type { StorefrontCatalogV2, StorefrontDesign } from "@/lib/contract";

// Every one of these is imported dynamically inside before(), never statically.
// FeaturedDesigns pulls in DesignCard, which imports buildStorefrontImageUrl
// from lib/catalog/storefront — so a static import here would hoist that module
// above the env assignment and pin BACKEND_BASE_URL to "", making every fetch
// fail closed to "unavailable" and rendering the "ok"/"stale" cases untestable.
let getStorefrontCatalog: typeof import("@/lib/catalog/storefront").getStorefrontCatalog;
let getFeaturedDesigns: typeof import("@/lib/catalog/storefront").getFeaturedDesigns;
let FeaturedDesigns: typeof import("@/components/product/FeaturedDesigns").FeaturedDesigns;

/** The homepage's featured gate, mirrored verbatim from app/(public)/page.tsx.
 * defixture.test.ts pins the page's source to this exact expression, so a
 * divergence between the two fails there rather than passing silently here. */
function homeFeaturedGate(result: CatalogResult): StorefrontDesign[] {
  return result.status === "ok" && result.catalog ? getFeaturedDesigns(result.catalog) : [];
}

// ── The one design the fake backend publishes. Every string a visitor could
// mistake for current stock is derived from THIS object, so the markup
// assertions below can never drift from the fixture-free live shape. ─────────
const STALE_DESIGN_REF = "4821";
const STALE_DESIGN_NAME = "Ajuar tejido de prueba";
const STALE_PRICE = 137000;

function makeDesign(): StorefrontDesign {
  return {
    designRef: STALE_DESIGN_REF,
    slug: "ajuar-tejido-de-prueba",
    name: STALE_DESIGN_NAME,
    description: "",
    category: "ajuares-y-estuches",
    primaryImage: {
      url: `/storage/v1/object/public/product-images/products/x/${STALE_DESIGN_REF}.jpg`,
      alt: STALE_DESIGN_NAME,
    },
    availability: "available",
    priceFrom: STALE_PRICE,
    colors: [{ name: "Crudo", hex: "#E7DCC8" }],
    sizes: ["RN"],
    featuredRank: 1,
    variants: [
      {
        ref: `${STALE_DESIGN_REF}-CRUDO-RN`,
        color: { name: "Crudo", hex: "#E7DCC8" },
        size: "RN",
        price: STALE_PRICE,
        image: { url: `/storage/v1/object/public/product-images/products/x/${STALE_DESIGN_REF}.jpg` },
        availability: "available",
      },
    ],
  };
}

const LIVE_CATALOG: StorefrontCatalogV2 = {
  schemaVersion: 2,
  categories: [{ slug: "ajuares-y-estuches", name: "Ajuares y estuches" }],
  designs: [makeDesign()],
};

/** Flipped between tests to drive the real fallback contract. */
let backendUp = false;

before(async () => {
  process.env.STOREFRONT_BACKEND_URL = "https://backend.invalid";
  // Replace fetch BEFORE the module under test loads. No request ever leaves
  // this process: the stub either throws or returns a synthetic Response.
  globalThis.fetch = (async () => {
    if (!backendUp) throw new Error("simulated backend outage (no network in tests)");
    return new Response(JSON.stringify(LIVE_CATALOG), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof globalThis.fetch;

  const storefront = await import("@/lib/catalog/storefront");
  getStorefrontCatalog = storefront.getStorefrontCatalog;
  getFeaturedDesigns = storefront.getFeaturedDesigns;
  ({ FeaturedDesigns } = await import("@/components/product/FeaturedDesigns"));
});

// The three states below are driven in order on a single module instance,
// because that is the only way to reach them honestly: "unavailable" exists
// only while no earlier success has been cached, and "stale" only after one
// has. node:test runs top-level tests in declaration order.

// ── 3. unavailable ──────────────────────────────────────────────────────────

test("status 'unavailable' (fetch failed, no last-good yet) renders no featured designs", async () => {
  backendUp = false;
  const result = await getStorefrontCatalog();

  assert.equal(result.status, "unavailable", "expected no last-good cache to exist yet");
  assert.equal(result.catalog, null);
  assert.deepEqual(homeFeaturedGate(result), [], "the homepage must render zero product cards when unavailable");
});

// ── 1. ok ───────────────────────────────────────────────────────────────────

test("status 'ok' (fresh fetch, valid catalog) may render the real featured designs", async () => {
  backendUp = true;
  const result = await getStorefrontCatalog();

  assert.equal(result.status, "ok");
  assert.notEqual(result.catalog, null);

  const featured = homeFeaturedGate(result);
  assert.deepEqual(
    featured.map((d) => d.designRef),
    [STALE_DESIGN_REF],
    "a fresh catalog's featured, available designs must reach the homepage rail",
  );
  assert.equal(featured[0].name, STALE_DESIGN_NAME);
  assert.equal(featured[0].priceFrom, STALE_PRICE);
});

// ── 2. stale ────────────────────────────────────────────────────────────────

test("status 'stale' (fetch failed, last-good available) renders no featured designs", async () => {
  backendUp = false;
  const result = await getStorefrontCatalog();

  assert.equal(result.status, "stale", "expected the earlier success to be served as last-good");
  assert.notEqual(result.catalog, null, "stale carries last-good data — this is exactly why the bare gate leaked");

  // The regression itself: the PRE-FIX gate (`result.catalog ? ... : []`)
  // would have produced real, renderable product data here.
  const wouldHaveLeaked = getFeaturedDesigns(result.catalog as StorefrontCatalogV2);
  assert.equal(
    wouldHaveLeaked.length,
    1,
    "sanity: the stale catalog really does contain a featured design the old gate would have rendered",
  );

  // The fix: the status check blocks it.
  assert.deepEqual(homeFeaturedGate(result), [], "the homepage must render zero product cards when stale");
});

// ── 4. no stale product data can reach the rendered homepage markup ─────────

test("stale names, refs, prices and availability claims cannot reach the homepage markup", async () => {
  backendUp = false;
  const result = await getStorefrontCatalog();
  assert.equal(result.status, "stale");

  // FeaturedDesigns is the homepage's ONLY product-rendering component (pinned
  // by tests/homepage/defixture.test.ts). Render it with exactly what the gate
  // hands it in the stale state.
  const html = renderToStaticMarkup(
    createElement(FeaturedDesigns, { designs: homeFeaturedGate(result) }),
  );

  assert.equal(html, "", "the featured rail must contribute no markup at all in the stale state");

  const staleDesign = (result.catalog as StorefrontCatalogV2).designs[0];
  const forbidden = [
    staleDesign.name,
    staleDesign.designRef,
    `Ref. ${staleDesign.designRef}`,
    String(staleDesign.priceFrom),
    "137.000", // es-CO formatting of the stale priceFrom
    "Disponible", // the availability label DesignCard would have rendered
    "Agotado",
    "Piezas destacadas", // the rail's own heading
  ];
  for (const needle of forbidden) {
    assert.equal(html.includes(needle), false, `stale catalog data leaked into homepage markup: "${needle}"`);
  }
});
