// tests/storefront-v2/collections-route.test.ts — Slice S2
// (/colecciones/[slug] live) pure-logic proof.
//
// node:test via the S1 runner: no DOM, no React render, no network. Proves
// lib/catalog/collectionRoute.ts's slug validation, category isolation, and
// route-state resolution directly — this repo's test harness (`node --test`,
// no jsdom/RTL) cannot render app/(public)/colecciones/[slug]/page.tsx, so
// every branch the page delegates to that module is exercised here instead.
// See collections-route-source-hygiene.test.ts for the complementary static
// proof that the page component actually wires these functions in
// (notFound(), zero ROUTE SKELETON markers, no fixture import).
import test from "node:test";
import assert from "node:assert/strict";
import type { CategorySlug, StorefrontCatalogV2, StorefrontDesign } from "../../lib/contract";
import type { CatalogResult } from "../../lib/catalog/storefront";
import {
  FROZEN_COLLECTION_SLUGS,
  getCollectionDesigns,
  getCollectionMeta,
  isCollectionSlug,
  resolveCollectionView,
} from "../../lib/catalog/collectionRoute";

const ALL_SIX: readonly CategorySlug[] = [
  "ajuares-y-estuches",
  "batas",
  "conjuntos",
  "mantas-y-cobijas",
  "mamelucos",
  "amigurumis",
];

function makeDesign(category: CategorySlug, ref: string): StorefrontDesign {
  return {
    designRef: ref,
    slug: `design-${ref}`,
    name: `Diseño ${ref}`,
    description: "",
    category,
    primaryImage: { url: `/storage/v1/object/public/product-images/products/${ref}/cover.jpg` },
    availability: "available",
    priceFrom: 50000,
    colors: [{ name: "Blanco" }],
    sizes: ["UNICA"],
    featuredRank: null,
    variants: [
      {
        ref: `${ref}-BLANCO-UNICA`,
        color: { name: "Blanco" },
        size: "UNICA",
        price: 50000,
        image: { url: `/storage/v1/object/public/product-images/products/${ref}/cover.jpg` },
        availability: "available",
      },
    ],
  };
}

function makeCatalog(designs: StorefrontDesign[], categoryOverrides: Partial<Record<CategorySlug, { name?: string | null; description?: string | null }>> = {}): StorefrontCatalogV2 {
  return {
    schemaVersion: 2,
    categories: ALL_SIX.map((slug) => ({
      slug,
      name: categoryOverrides[slug]?.name ?? null,
      description: categoryOverrides[slug]?.description ?? null,
    })),
    designs,
  };
}

// ---- FROZEN_COLLECTION_SLUGS / isCollectionSlug ---------------------------

test("FROZEN_COLLECTION_SLUGS is exactly the six frozen category slugs", () => {
  assert.deepEqual([...FROZEN_COLLECTION_SLUGS].sort(), [...ALL_SIX].sort());
  assert.equal(FROZEN_COLLECTION_SLUGS.length, 6);
});

test("isCollectionSlug accepts each of the six valid slugs", () => {
  for (const slug of ALL_SIX) {
    assert.equal(isCollectionSlug(slug), true, `expected "${slug}" to be a valid collection slug`);
  }
});

test("isCollectionSlug rejects every non-frozen slug — no arbitrary slug ever resolves", () => {
  const adversarial = [
    "esenciales", // the obsolete nav destination this slice removes
    "",
    " ",
    "Batas", // wrong case
    "batas ", // trailing space
    " batas",
    "ajuares-y-estuches-2",
    "ajuar", // partial
    "amigurumis/../../admin",
    "../admin",
    "batas/conjuntos",
    "catalogo",
    "productos",
    "null",
    "undefined",
    "12345",
    "amigurumis%20",
    "AMIGURUMIS",
    "mantas-y-cobijas ",
  ];
  for (const slug of adversarial) {
    assert.equal(isCollectionSlug(slug), false, `expected "${slug}" to be rejected`);
  }
});

// ---- getCollectionDesigns (category isolation) -----------------------------

test("getCollectionDesigns returns only designs belonging to the requested category", () => {
  const designs = ALL_SIX.flatMap((slug, i) => [makeDesign(slug, `${i}00`), makeDesign(slug, `${i}01`)]);
  const catalog = makeCatalog(designs);

  for (const slug of ALL_SIX) {
    const result = getCollectionDesigns(catalog, slug);
    assert.equal(result.length, 2, `expected exactly 2 designs for "${slug}"`);
    assert.ok(
      result.every((d) => d.category === slug),
      `expected every returned design to belong to "${slug}", got categories: ${result.map((d) => d.category).join(", ")}`,
    );
  }
});

test("getCollectionDesigns never leaks another category's designs (isolation, not just count)", () => {
  const batas = [makeDesign("batas", "b1"), makeDesign("batas", "b2")];
  const conjuntos = [makeDesign("conjuntos", "c1")];
  const catalog = makeCatalog([...batas, ...conjuntos]);

  const result = getCollectionDesigns(catalog, "batas");
  assert.deepEqual(
    result.map((d) => d.designRef),
    ["b1", "b2"],
  );
});

test("getCollectionDesigns returns an empty array for a category with zero designs (valid empty catalog)", () => {
  const catalog = makeCatalog([makeDesign("batas", "b1")]);
  assert.deepEqual(getCollectionDesigns(catalog, "amigurumis"), []);
});

// ---- getCollectionMeta -----------------------------------------------------

test("getCollectionMeta returns a non-empty Spanish title/description default for every slug with no catalog", () => {
  for (const slug of ALL_SIX) {
    const meta = getCollectionMeta(slug);
    assert.ok(meta.title.length > 0, `expected non-empty title for "${slug}"`);
    assert.ok(meta.description.length > 0, `expected non-empty description for "${slug}"`);
  }
});

test("getCollectionMeta prefers the live catalog's category name/description when present", () => {
  const catalog = makeCatalog([], {
    batas: { name: "Batas de invierno", description: "Colección especial de temporada." },
  });
  const meta = getCollectionMeta("batas", catalog);
  assert.equal(meta.title, "Batas de invierno");
  assert.equal(meta.description, "Colección especial de temporada.");
});

test("getCollectionMeta falls back to the Spanish default when the catalog's category name/description is null", () => {
  const catalog = makeCatalog([]); // categories all null name/description
  const fallback = getCollectionMeta("conjuntos");
  const withCatalog = getCollectionMeta("conjuntos", catalog);
  assert.deepEqual(withCatalog, fallback);
});

// ---- resolveCollectionView (route states) ----------------------------------

test("resolveCollectionView: unavailable (fetch failed, no last-good) — honest unavailable state for every slug", () => {
  const unavailable: CatalogResult = { status: "unavailable", catalog: null, fetchedAt: null };
  for (const slug of ALL_SIX) {
    assert.deepEqual(resolveCollectionView(unavailable, slug), { kind: "unavailable" });
  }
});

test("resolveCollectionView: valid empty catalog — category-specific honest empty state", () => {
  const catalog = makeCatalog([makeDesign("batas", "b1")]); // no amigurumis designs
  const ok: CatalogResult = { status: "ok", catalog, fetchedAt: 1000 };
  const view = resolveCollectionView(ok, "amigurumis");
  assert.deepEqual(view, { kind: "ready", stale: false, fetchedAt: 1000, designs: [] });
});

test("resolveCollectionView: valid populated catalog — renders only this category's designs", () => {
  const catalog = makeCatalog([makeDesign("batas", "b1"), makeDesign("conjuntos", "c1")]);
  const ok: CatalogResult = { status: "ok", catalog, fetchedAt: 2000 };
  const view = resolveCollectionView(ok, "batas");
  assert.equal(view.kind, "ready");
  assert.equal(view.kind === "ready" ? view.stale : undefined, false);
  assert.deepEqual(view.kind === "ready" ? view.designs.map((d) => d.designRef) : [], ["b1"]);
});

test("resolveCollectionView: stale catalog preserves the visible stale disclosure when empty", () => {
  const catalog = makeCatalog([makeDesign("batas", "b1")]); // no amigurumis designs
  const stale: CatalogResult = { status: "stale", catalog, fetchedAt: 3000 };
  const view = resolveCollectionView(stale, "amigurumis");
  assert.deepEqual(view, { kind: "ready", stale: true, fetchedAt: 3000, designs: [] });
});

test("resolveCollectionView: stale catalog preserves the visible stale disclosure when populated", () => {
  const catalog = makeCatalog([makeDesign("batas", "b1"), makeDesign("batas", "b2")]);
  const stale: CatalogResult = { status: "stale", catalog, fetchedAt: 4000 };
  const view = resolveCollectionView(stale, "batas");
  assert.equal(view.kind, "ready");
  assert.equal(view.kind === "ready" ? view.stale : undefined, true);
  assert.equal(view.kind === "ready" ? view.designs.length : -1, 2);
});
