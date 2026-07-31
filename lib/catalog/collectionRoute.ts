// lib/catalog/collectionRoute.ts
// VERDE (Slice S2 — /colecciones/[slug] live). Pure, framework-free helpers
// for app/(public)/colecciones/[slug]/page.tsx: frozen-slug validation,
// per-category design isolation, and Spanish editorial fallbacks. Kept out
// of the page component so slug validation and category isolation can be
// unit-tested directly (node:test) without pulling React/Next runtime into
// the test process — mirrors lib/admin/routing.ts's separation of pure
// decision logic from middleware.ts.
//
// Does NOT duplicate catalog fetch/parse logic — that stays exclusively in
// lib/catalog/storefront.ts (getStorefrontCatalog). This module only
// filters/labels the already-fetched, already-validated StorefrontCatalogV2.
import type { CategorySlug, StorefrontCatalogV2, StorefrontDesign } from "@/lib/contract";
import type { CatalogResult } from "@/lib/catalog/storefront";

/** The ONLY six legal /colecciones/[slug] values (mirrors
 * lib/fixture.schema.v2.ts's CATEGORY_SLUGS_FROZEN_ORDER). Any other slug
 * must never resolve — notFound(), never a 200. */
export const FROZEN_COLLECTION_SLUGS: readonly CategorySlug[] = [
  "ajuares-y-estuches",
  "batas",
  "conjuntos",
  "mantas-y-cobijas",
  "mamelucos",
  "amigurumis",
];

export function isCollectionSlug(slug: string): slug is CategorySlug {
  return (FROZEN_COLLECTION_SLUGS as readonly string[]).includes(slug);
}

export interface CollectionMeta {
  title: string;
  description: string;
}

/** Fail-closed Spanish title/description per frozen category. The live
 * envelope's CategoryContract.name/description (Mónica-owned, may be null
 * pending approval — see lib/contract.ts) win when present; these are the
 * defaults so the route always renders an honest Spanish h1 + blurb even
 * before that editorial content lands. */
const COLLECTION_META_ES: Record<CategorySlug, CollectionMeta> = {
  "ajuares-y-estuches": {
    title: "Ajuares y estuches",
    description: "Ajuares y estuches tejidos a mano para la llegada del bebé.",
  },
  batas: {
    title: "Batas",
    description: "Batas tejidas a mano, suaves y abrigadas.",
  },
  conjuntos: {
    title: "Conjuntos",
    description: "Conjuntos tejidos a mano para vestir con estilo.",
  },
  "mantas-y-cobijas": {
    title: "Mantas y cobijas",
    description: "Mantas y cobijas tejidas a mano para acompañar cada momento.",
  },
  mamelucos: {
    title: "Mamelucos",
    description: "Mamelucos tejidos a mano, cómodos para el día a día.",
  },
  amigurumis: {
    title: "Amigurumis",
    description: "Amigurumis tejidos a mano, piezas únicas y coleccionables.",
  },
};

/** Resolve the editorial title/description for one collection. Pass the
 * live catalog when available so a Mónica-approved name/description can
 * override the default; omit (or pass null, e.g. the "unavailable" state)
 * to get the fail-closed Spanish default. */
export function getCollectionMeta(slug: CategorySlug, catalog?: StorefrontCatalogV2 | null): CollectionMeta {
  const fallback = COLLECTION_META_ES[slug];
  const fromCatalog = catalog?.categories.find((c) => c.slug === slug);
  return {
    title: fromCatalog?.name ?? fallback.title,
    description: fromCatalog?.description ?? fallback.description,
  };
}

/** Category isolation: only designs whose `category` matches this exact
 * slug — never any other category's designs, regardless of catalog
 * ordering or how many categories the envelope carries. */
export function getCollectionDesigns(catalog: StorefrontCatalogV2, slug: CategorySlug): StorefrontDesign[] {
  return catalog.designs.filter((design) => design.category === slug);
}

/** Discriminated view state for a validated slug + this request's
 * CatalogResult (lib/catalog/storefront.ts). Pure — takes the already-
 * fetched result, decides nothing about the network. Kept separate from the
 * page component so every route state (unavailable / valid-empty / valid-
 * populated / stale) is unit-testable without a fetch mock or a React
 * render harness (neither is available in this repo's `node --test`
 * suite — see tests/storefront-v2/collections-route.test.ts). */
export type CollectionViewState =
  | { kind: "unavailable" }
  | { kind: "ready"; stale: boolean; fetchedAt: number | null; designs: StorefrontDesign[] };

export function resolveCollectionView(result: CatalogResult, slug: CategorySlug): CollectionViewState {
  if (result.status === "unavailable" || !result.catalog) {
    return { kind: "unavailable" };
  }
  return {
    kind: "ready",
    stale: result.status === "stale",
    fetchedAt: result.fetchedAt,
    designs: getCollectionDesigns(result.catalog, slug),
  };
}
