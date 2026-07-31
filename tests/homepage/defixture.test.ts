// tests/homepage/defixture.test.ts — S1 de-fixture slice regression guard.
//
// Proves the public homepage (app/(public)/page.tsx) has zero dependency on
// the V1 fixture (lib/fixture.ts / catalog.fixture.json) or its synthetic
// data, renders no PendingBlock, and — where it optionally consumes the live
// StorefrontCatalogV2 path — can never produce a product card from an
// empty/unavailable catalog while still being able to render real featured
// designs when the live catalog contract supplies them.
//
// Two styles, same convention as tests/storefront-v2/storefront-image-host.test.ts:
//  1. Static source-text scans of app/(public)/page.tsx and
//     components/product/FeaturedDesigns.tsx — deliberately does NOT import
//     either file (both are React components; this repo's node:test process
//     never imports app/** or components/**, see seam-isolation.test.ts).
//  2. Direct calls to getFeaturedDesigns (lib/catalog/storefront.ts) — a
//     plain, dependency-free function (no Next.js/React runtime), same as
//     this repo's other node:test files import buildStorefrontImageUrl etc.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getFeaturedDesigns } from "@/lib/catalog/storefront";
import type { StorefrontCatalogV2, StorefrontDesign } from "@/lib/contract";

const ROOT = process.cwd();
const HOMEPAGE_PATH = join(ROOT, "app", "(public)", "page.tsx");
const FEATURED_DESIGNS_PATH = join(ROOT, "components", "product", "FeaturedDesigns.tsx");

/** Strip `//` line comments and block comments before scanning, so a doc
 * comment that legitimately *names* something forbidden (like this file's
 * own header) never false-positives. Same helper as storefront-image-host.test.ts. */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

const homepageSrc = readFileSync(HOMEPAGE_PATH, "utf8");
const homepageCode = stripComments(homepageSrc);

// ── 1. No fixture import of any kind ────────────────────────────────────────

test("homepage does not import the V1 fixture module or JSON", () => {
  for (const forbidden of ["lib/fixture\"", "@/lib/fixture\"", "catalog.fixture.json"]) {
    assert.equal(homepageCode.includes(forbidden), false, `homepage must not reference "${forbidden}"`);
  }
});

test("homepage does not import the synthetic V2 fixture/adapter either (no substitute fixture data)", () => {
  for (const forbidden of ["catalog.contract.v2.fixture", "lib/fixture.v2", "fixture.v2"]) {
    assert.equal(homepageCode.includes(forbidden), false, `homepage must not reference "${forbidden}"`);
  }
});

// ── 2. No PendingBlock, no "PENDIENTE" ──────────────────────────────────────

test("homepage does not import or render PendingBlock", () => {
  assert.equal(homepageCode.includes("PendingBlock"), false, "homepage must not import or render PendingBlock");
});

test("homepage source contains no PENDIENTE placeholder text", () => {
  assert.equal(homepageSrc.includes("PENDIENTE"), false, "homepage must render no PENDIENTE placeholder");
});

// ── 3. No V1 ProductCard / V1 availability labels ───────────────────────────

test("homepage does not import or render the V1 ProductCard", () => {
  assert.equal(homepageCode.includes("ProductCard"), false, "homepage must not import or render the V1 ProductCard");
});

test("homepage does not reference the V1 availability label map or badge", () => {
  for (const forbidden of ["AVAILABILITY_LABELS_ES", "AvailabilityBadge"]) {
    assert.equal(homepageCode.includes(forbidden), false, `homepage must not reference "${forbidden}"`);
  }
});

// ── 4. No known V1 fixture references, prices, or placeholder images ───────

const KNOWN_FIXTURE_REFS = ["2257", "2301", "2288", "2260", "2199", "2312", "2334"];
const KNOWN_FIXTURE_PRICES = ["48000", "32000", "89000", "76000", "52000", "61000"];
const KNOWN_FIXTURE_PRICE_LABELS = ["Desde $48.000"];
const KNOWN_PLACEHOLDER_IMAGES = ["placeholder-a.jpg", "placeholder-b.jpg"];

test("homepage contains no known V1 fixture product reference", () => {
  for (const ref of KNOWN_FIXTURE_REFS) {
    assert.equal(homepageSrc.includes(ref), false, `homepage must not contain known fixture ref "${ref}"`);
  }
});

test("homepage contains no known V1 fixture price or price label", () => {
  for (const price of [...KNOWN_FIXTURE_PRICES, ...KNOWN_FIXTURE_PRICE_LABELS]) {
    assert.equal(homepageSrc.includes(price), false, `homepage must not contain known fixture price "${price}"`);
  }
});

test("homepage contains no known V1 placeholder product image path", () => {
  for (const image of KNOWN_PLACEHOLDER_IMAGES) {
    assert.equal(homepageSrc.includes(image), false, `homepage must not reference "${image}"`);
  }
});

// ── 5. Only the V2 catalog path is retained for product rendering ──────────

test("homepage's only product-data imports are the live V2 catalog path", () => {
  assert.equal(homepageCode.includes('from "@/lib/catalog/storefront"'), true, "expected homepage to import from lib/catalog/storefront");
  assert.equal(homepageCode.includes("getFeaturedDesigns"), true, "expected homepage to import getFeaturedDesigns");
  assert.equal(homepageCode.includes("getStorefrontCatalog"), true, "expected homepage to import getStorefrontCatalog");
  assert.equal(homepageCode.includes('from "@/components/product/FeaturedDesigns"'), true, "expected homepage to import the V2 FeaturedDesigns component");
});

// ── 6. Empty/unavailable catalog cannot create product cards ───────────────

test("homepage forces an empty featured list when the live catalog is unavailable (result.catalog is null)", () => {
  // Static proof of the exact guard: featured is derived from
  // `result.catalog ? getFeaturedDesigns(result.catalog) : []` — never a
  // fallback to fixture data or an unconditional call on a possibly-null catalog.
  assert.match(
    homepageCode,
    /const\s+featured\s*=\s*result\.catalog\s*\?\s*getFeaturedDesigns\(result\.catalog\)\s*:\s*\[\]/,
    "expected homepage to force featured=[] when result.catalog is null/unavailable",
  );
});

test("getFeaturedDesigns returns no designs for an empty live catalog", () => {
  const emptyCatalog: StorefrontCatalogV2 = { schemaVersion: 2, categories: [], designs: [] };
  assert.deepEqual(getFeaturedDesigns(emptyCatalog), []);
});

test("FeaturedDesigns (the homepage's only product-rendering component) renders nothing for an empty designs array", () => {
  const src = readFileSync(FEATURED_DESIGNS_PATH, "utf8");
  const code = stripComments(src);
  assert.match(
    code,
    /if\s*\(\s*designs\.length\s*===\s*0\s*\)\s*return\s*null;/,
    "expected FeaturedDesigns to early-return null for an empty designs array",
  );
});

// ── 7. Valid real featured designs render only from the V2 catalog contract ─

function makeVariant(overrides: Partial<StorefrontDesign["variants"][number]> = {}): StorefrontDesign["variants"][number] {
  return {
    ref: "4194-CRUDO-0",
    color: { name: "Crudo", hex: "#E7DCC8" },
    size: "0",
    price: 65000,
    image: { url: "/storage/v1/object/public/product-images/products/x/4194.jpg", alt: "Ajuar", width: 800, height: 1000 },
    availability: "available",
    ...overrides,
  };
}

function makeDesign(overrides: Partial<StorefrontDesign> = {}): StorefrontDesign {
  return {
    designRef: "4194",
    slug: "ajuar-real",
    name: "Ajuar real",
    description: "",
    category: "batas",
    primaryImage: { url: "/storage/v1/object/public/product-images/products/x/4194.jpg", alt: "Ajuar", width: 800, height: 1000 },
    availability: "available",
    priceFrom: 65000,
    colors: [{ name: "Crudo", hex: "#E7DCC8" }],
    sizes: ["0"],
    featuredRank: 1,
    variants: [makeVariant()],
    ...overrides,
  };
}

test("getFeaturedDesigns selects only featured, available real designs — sorted by rank, sold_out excluded", () => {
  const rank2 = makeDesign({ designRef: "5001", slug: "rank-2", featuredRank: 2 });
  const rank1 = makeDesign({ designRef: "5002", slug: "rank-1", featuredRank: 1 });
  const soldOutFeatured = makeDesign({
    designRef: "5003",
    slug: "sold-out-featured",
    featuredRank: 3,
    availability: "sold_out",
  });
  const notFeatured = makeDesign({ designRef: "5004", slug: "not-featured", featuredRank: null });

  const catalog: StorefrontCatalogV2 = {
    schemaVersion: 2,
    categories: [{ slug: "batas", name: "Batas" }],
    designs: [rank2, rank1, soldOutFeatured, notFeatured],
  };

  const result = getFeaturedDesigns(catalog);

  assert.deepEqual(
    result.map((d) => d.designRef),
    ["5002", "5001"],
    "expected only the two featured+available designs, sorted ascending by featuredRank",
  );
  assert.ok(
    result.every((d) => d.availability === "available" && d.featuredRank !== null),
    "no returned design may be sold_out or unranked",
  );
});
