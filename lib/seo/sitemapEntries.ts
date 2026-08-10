// lib/seo/sitemapEntries.ts — pure sitemap-entry builder for app/sitemap.ts
// (closes the S7B extension point: dynamic /productos/[slug] and
// /colecciones/[slug] entries, final pre-launch value pass). Same reasoning
// as lib/catalog/collectionRoute.ts's resolveCollectionView: no fetch, no
// env, no Next.js request context — a deterministic projection from an
// already-resolved origin + an already-fetched catalog (or null, on
// "unavailable") into MetadataRoute.Sitemap entries, so it is directly
// unit-testable without mocking the network layer.
import type { MetadataRoute } from "next";
import type { StorefrontCatalogV2 } from "@/lib/contract";

// Finished, indexable, static public routes. /catalogo is included: its
// content is fetched live but the ROUTE itself is static and finished.
// /personalizados joined in the 2026-08 brand refresh (frontend-only
// editorial route). Deliberately excludes every app/(admin)/** route (never
// indexable — see app/(admin)/layout.tsx's own noindex metadata).
export const STATIC_PUBLIC_ROUTES = ["/", "/catalogo", "/personalizados", "/nosotros", "/privacy"];

/**
 * Build the full sitemap: the four static routes, plus — only when a live
 * catalog is available — one /productos/[slug] entry per published design
 * and one /colecciones/[slug] entry per category that actually has at least
 * one published design in it. A `catalog` of null (the "unavailable"
 * fallback — see lib/catalog/storefront.ts's fallback contract) yields the
 * static routes only: never invent a product/collection URL from stale
 * memory or a guess. An empty-but-valid catalog (zero designs) behaves
 * identically for the same reason.
 */
export function buildSitemapEntries(origin: string, catalog: StorefrontCatalogV2 | null): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = STATIC_PUBLIC_ROUTES.map((route) => ({
    url: route === "/" ? origin : `${origin}${route}`,
    changeFrequency: "weekly",
    priority: route === "/" ? 1 : 0.7,
  }));

  if (!catalog) {
    return staticEntries;
  }

  const productEntries: MetadataRoute.Sitemap = catalog.designs.map((design) => ({
    url: `${origin}/productos/${design.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // Typed as Set<string>, not Set<CategorySlug>: catalog.categories'
  // CategoryContract.slug is the general `string` field (shared with the V1
  // contract) — narrowing the Set to CategorySlug would make `.has()` reject
  // that wider type at compile time even though every real value matches.
  const nonEmptyCategorySlugs = new Set<string>(catalog.designs.map((d) => d.category));
  const collectionEntries: MetadataRoute.Sitemap = catalog.categories
    .filter((category) => nonEmptyCategorySlugs.has(category.slug))
    .map((category) => ({
      url: `${origin}/colecciones/${category.slug}`,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  return [...staticEntries, ...collectionEntries, ...productEntries];
}
