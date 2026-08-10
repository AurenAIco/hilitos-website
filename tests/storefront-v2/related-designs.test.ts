// tests/storefront-v2/related-designs.test.ts — cleanup-pass audit:
// behavioral proof for lib/catalog/storefront.ts's getRelatedDesigns
// (Slice C, final pre-launch value pass), which shipped with no dedicated
// test file. Pure function, no fetch/env involved.
import test from "node:test";
import assert from "node:assert/strict";
import { getRelatedDesigns } from "@/lib/catalog/storefront";
import type { StorefrontCatalogV2, StorefrontDesign } from "@/lib/contract";

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

const CURRENT = design({ designRef: "4194", slug: "design-4194", category: "batas" });
const SIBLING_1 = design({ designRef: "2814", slug: "design-2814", category: "batas" });
const SIBLING_2 = design({ designRef: "2820", slug: "design-2820", category: "batas" });
const SIBLING_3 = design({ designRef: "2809", slug: "design-2809", category: "batas" });
const SIBLING_4 = design({ designRef: "2808", slug: "design-2808", category: "batas" });
const SIBLING_5 = design({ designRef: "2810", slug: "design-2810", category: "batas" });
const OTHER_CATEGORY = design({ designRef: "1449", slug: "design-1449", category: "mantas-y-cobijas" });
const SOLD_OUT_SIBLING = design({ designRef: "9999", slug: "design-9999", category: "batas", availability: "sold_out" });

function catalogOf(designs: StorefrontDesign[]): StorefrontCatalogV2 {
  return { schemaVersion: 2, categories: [{ slug: "batas" }, { slug: "mantas-y-cobijas" }], designs };
}

test("getRelatedDesigns() excludes the current design by designRef", () => {
  const catalog = catalogOf([CURRENT, SIBLING_1]);
  const related = getRelatedDesigns(catalog, CURRENT);
  assert.equal(related.some((d) => d.designRef === CURRENT.designRef), false);
});

test("getRelatedDesigns() only returns designs in the same category", () => {
  const catalog = catalogOf([CURRENT, SIBLING_1, OTHER_CATEGORY]);
  const related = getRelatedDesigns(catalog, CURRENT);
  assert.deepEqual(related.map((d) => d.designRef), ["2814"]);
  assert.equal(related.some((d) => d.category !== "batas"), false);
});

test("getRelatedDesigns() returns an empty array when no other design shares the category (clean empty state)", () => {
  const catalog = catalogOf([CURRENT, OTHER_CATEGORY]);
  const related = getRelatedDesigns(catalog, CURRENT);
  assert.deepEqual(related, []);
});

test("getRelatedDesigns() defaults to a max of 4, in stable catalog-emission order (no shuffling)", () => {
  const catalog = catalogOf([CURRENT, SIBLING_1, SIBLING_2, SIBLING_3, SIBLING_4, SIBLING_5]);
  const related = getRelatedDesigns(catalog, CURRENT);
  assert.equal(related.length, 4);
  assert.deepEqual(
    related.map((d) => d.designRef),
    ["2814", "2820", "2809", "2808"],
    "must be exactly the first 4 same-category siblings in catalog order",
  );
});

test("getRelatedDesigns() respects a custom limit", () => {
  const catalog = catalogOf([CURRENT, SIBLING_1, SIBLING_2, SIBLING_3]);
  const related = getRelatedDesigns(catalog, CURRENT, 2);
  assert.equal(related.length, 2);
});

test("getRelatedDesigns() calling it twice with the same catalog returns the identical order (deterministic, no randomization)", () => {
  const catalog = catalogOf([CURRENT, SIBLING_1, SIBLING_2, SIBLING_3, SIBLING_4, SIBLING_5]);
  const first = getRelatedDesigns(catalog, CURRENT).map((d) => d.designRef);
  const second = getRelatedDesigns(catalog, CURRENT).map((d) => d.designRef);
  assert.deepEqual(first, second);
});

test("getRelatedDesigns() includes a sold_out same-category sibling (DesignCard renders its own honest 'Agotado' badge — not hidden)", () => {
  const catalog = catalogOf([CURRENT, SOLD_OUT_SIBLING]);
  const related = getRelatedDesigns(catalog, CURRENT);
  assert.deepEqual(related.map((d) => d.designRef), ["9999"]);
});

test("getRelatedDesigns() can only ever draw from designs already present in the passed-in catalog — no separate fetch, no schema/backend dependency", () => {
  const emptyCatalog: StorefrontCatalogV2 = { schemaVersion: 2, categories: [], designs: [] };
  assert.deepEqual(getRelatedDesigns(emptyCatalog, CURRENT), []);
});
