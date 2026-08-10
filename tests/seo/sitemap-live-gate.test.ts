// tests/seo/sitemap-live-gate.test.ts — cleanup-pass audit: proves
// app/sitemap.ts's fail-closed gate against the REAL getStorefrontCatalog()
// fallback contract (unavailable -> ok -> stale), not just against the pure
// lib/seo/sitemapEntries.ts helper (see tests/seo/sitemap-entries.test.ts
// for that half). Mirrors tests/homepage/home-featured-gate.test.ts's
// technique exactly: a local fetch stub, no network, driving the module's
// real in-process last-good cache through genuine state transitions.
//
// STOREFRONT_BACKEND_URL must be set BEFORE lib/catalog/storefront.ts is
// imported (module-level constant) — imports happen dynamically inside
// before(), same convention as every other file in this suite that needs
// this.
import test, { before } from "node:test";
import assert from "node:assert/strict";
import type { StorefrontCatalogV2 } from "@/lib/contract";

let sitemap: typeof import("@/app/sitemap").default;
let getStorefrontCatalog: typeof import("@/lib/catalog/storefront").getStorefrontCatalog;

const DESIGN_REF = "4194";
const CATALOG: StorefrontCatalogV2 = {
  schemaVersion: 2,
  categories: [{ slug: "ajuares-y-estuches", name: "Ajuares y estuches" }],
  designs: [
    {
      designRef: DESIGN_REF,
      slug: "design-4194",
      name: "Ajuar de prueba",
      description: "",
      category: "ajuares-y-estuches",
      primaryImage: { url: `/products/${DESIGN_REF}.jpg` },
      availability: "available",
      priceFrom: 89900,
      colors: [{ name: "Beige" }],
      sizes: ["RN"],
      featuredRank: null,
      variants: [
        {
          ref: `${DESIGN_REF}-BEIGE-RN`,
          color: { name: "Beige" },
          size: "RN",
          price: 89900,
          image: { url: `/products/${DESIGN_REF}.jpg` },
          availability: "available",
        },
      ],
    },
  ],
};

let backendUp = false;

before(async () => {
  process.env.STOREFRONT_BACKEND_URL = "https://backend.invalid";
  globalThis.fetch = (async () => {
    if (!backendUp) throw new Error("simulated backend outage (no network in tests)");
    return new Response(JSON.stringify(CATALOG), { status: 200, headers: { "content-type": "application/json" } });
  }) as typeof globalThis.fetch;

  ({ getStorefrontCatalog } = await import("@/lib/catalog/storefront"));
  sitemap = (await import("@/app/sitemap")).default;
});

function productUrls(entries: Awaited<ReturnType<typeof sitemap>>) {
  return entries.map((e) => e.url).filter((u) => u.includes("/productos/"));
}

// Driven in order on one module instance — "stale" only exists after an
// earlier "ok", same constraint as home-featured-gate.test.ts.

test("sitemap(): status 'unavailable' (no last-good yet) emits only the static routes", async () => {
  backendUp = false;
  const status = (await getStorefrontCatalog()).status;
  assert.equal(status, "unavailable");
  const entries = await sitemap();
  assert.equal(productUrls(entries).length, 0, "must not invent a product URL with no live data at all");
});

test("sitemap(): status 'ok' (fresh fetch) emits the real product URL", async () => {
  backendUp = true;
  const status = (await getStorefrontCatalog()).status;
  assert.equal(status, "ok");
  const entries = await sitemap();
  assert.deepEqual(productUrls(entries).map((u) => u.split("/productos/")[1]), ["design-4194"]);
});

test("sitemap(): status 'stale' (backend down again, serving last-good) falls back to static-only — NOT the same treatment as the human-facing pages", async () => {
  backendUp = false;
  const status = (await getStorefrontCatalog()).status;
  assert.equal(status, "stale", "expected the earlier 'ok' fetch to now be served as last-good");
  const entries = await sitemap();
  assert.equal(
    productUrls(entries).length,
    0,
    "a sitemap must not list a product URL sourced from unbounded-age cached data, even though /productos/[slug] itself would render it with a stale banner",
  );
});

test("sitemap(): a later 'ok' fetch immediately restores the dynamic entries", async () => {
  backendUp = true;
  const status = (await getStorefrontCatalog()).status;
  assert.equal(status, "ok");
  const entries = await sitemap();
  assert.equal(productUrls(entries).length, 1);
});
