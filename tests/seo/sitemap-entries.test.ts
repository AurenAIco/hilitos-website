// tests/seo/sitemap-entries.test.ts — behavioral proof for
// lib/seo/sitemapEntries.ts (S7B extension point, closed by the final
// pre-launch value pass). Pure function, no fetch/env involved, so this
// exercises it directly against a synthetic StorefrontCatalogV2 — the
// complement to tests/seo/robots-sitemap.test.ts, which only ever sees the
// "unavailable" (catalog: null) branch because STOREFRONT_BACKEND_URL is
// unset for that whole test process.
import test from "node:test";
import assert from "node:assert/strict";
import { buildSitemapEntries, STATIC_PUBLIC_ROUTES } from "@/lib/seo/sitemapEntries";
import type { StorefrontCatalogV2, StorefrontDesign } from "@/lib/contract";

const ORIGIN = "https://hilitos.co";

function design(overrides: Partial<StorefrontDesign> & Pick<StorefrontDesign, "designRef" | "slug" | "category">): StorefrontDesign {
  return {
    name: `Diseño ${overrides.designRef}`,
    description: "",
    primaryImage: { url: `/products/${overrides.designRef}.jpg` },
    availability: "available",
    priceFrom: 50000,
    colors: [],
    sizes: [],
    featuredRank: null,
    variants: [
      {
        ref: `${overrides.designRef}-A`,
        color: { name: "Beige" },
        size: "RN",
        price: 50000,
        image: { url: `/products/${overrides.designRef}.jpg` },
        availability: "available",
      },
    ],
    ...overrides,
  };
}

const CATEGORIES: StorefrontCatalogV2["categories"] = [
  { slug: "batas" },
  { slug: "conjuntos" },
  { slug: "amigurumis" }, // deliberately empty — no design references this slug below
];

test("buildSitemapEntries() returns only the static routes when the catalog is null (unavailable)", () => {
  const entries = buildSitemapEntries(ORIGIN, null);
  assert.equal(entries.length, STATIC_PUBLIC_ROUTES.length);
  for (const entry of entries) {
    assert.equal(entry.url.startsWith(ORIGIN), true);
    assert.equal(/\/productos\/.+/.test(entry.url), false);
    assert.equal(/\/colecciones\/.+/.test(entry.url), false);
  }
});

test("buildSitemapEntries() returns only the static routes for a valid catalog with zero designs", () => {
  const catalog: StorefrontCatalogV2 = { schemaVersion: 2, categories: CATEGORIES, designs: [] };
  const entries = buildSitemapEntries(ORIGIN, catalog);
  assert.equal(entries.length, STATIC_PUBLIC_ROUTES.length);
});

test("buildSitemapEntries() adds one /productos/[slug] entry per published design, sourced from the design's own slug", () => {
  const catalog: StorefrontCatalogV2 = {
    schemaVersion: 2,
    categories: CATEGORIES,
    designs: [
      design({ designRef: "4194", slug: "design-4194", category: "batas" }),
      design({ designRef: "2814", slug: "design-2814", category: "conjuntos" }),
    ],
  };
  const entries = buildSitemapEntries(ORIGIN, catalog);
  const productUrls = entries.map((e) => e.url).filter((u) => u.includes("/productos/"));
  assert.deepEqual(new Set(productUrls), new Set([`${ORIGIN}/productos/design-4194`, `${ORIGIN}/productos/design-2814`]));
});

test("buildSitemapEntries() adds /colecciones/[slug] only for categories with at least one published design", () => {
  const catalog: StorefrontCatalogV2 = {
    schemaVersion: 2,
    categories: CATEGORIES,
    designs: [
      design({ designRef: "4194", slug: "design-4194", category: "batas" }),
      design({ designRef: "2814", slug: "design-2814", category: "batas" }),
    ],
  };
  const entries = buildSitemapEntries(ORIGIN, catalog);
  const collectionUrls = entries.map((e) => e.url).filter((u) => u.includes("/colecciones/"));
  assert.deepEqual(collectionUrls, [`${ORIGIN}/colecciones/batas`]);
  // "conjuntos" and "amigurumis" have zero designs in this catalog — must
  // not appear, even though they are real, valid category slugs.
  assert.equal(entries.some((e) => e.url.includes("/colecciones/conjuntos")), false);
  assert.equal(entries.some((e) => e.url.includes("/colecciones/amigurumis")), false);
});

test("buildSitemapEntries() never references /admin", () => {
  const catalog: StorefrontCatalogV2 = {
    schemaVersion: 2,
    categories: CATEGORIES,
    designs: [design({ designRef: "4194", slug: "design-4194", category: "batas" })],
  };
  for (const entries of [buildSitemapEntries(ORIGIN, null), buildSitemapEntries(ORIGIN, catalog)]) {
    for (const entry of entries) {
      assert.equal(entry.url.includes("/admin"), false);
    }
  }
});
