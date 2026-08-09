// app/sitemap.ts — SKELETON created by Violeta/foundation; ongoing owner: VERDE.
// S7A (SEO foundation) fixed the origin (lib/seo/siteUrl.ts) — no more
// unconditional localhost fallback. Note app/robots.ts stays fail-closed
// (Disallow: /) for every origin except the real hilitos.co custom domain
// until Gate A6, so this sitemap remains inert for real crawlers on any
// Vercel/local origin in the meantime — see that file for the cutover
// contract.
//
// S7B EXTENSION POINT CLOSED (final pre-launch value pass): dynamic entries
// for /productos/[slug] and every non-empty /colecciones/[slug] now come
// from Verde's live catalog data layer (lib/catalog/storefront.ts) — the
// same getStorefrontCatalog() every storefront route already calls, so a
// slug can never appear here that isn't a real, currently-published design.
// The actual entry-building is a pure function (lib/seo/sitemapEntries.ts)
// so it's unit-testable without mocking fetch/env; this file is just the
// thin async wrapper Next.js's file convention requires.
//
// FAIL-CLOSED GATE (cleanup-pass audit): dynamic entries are built ONLY on
// status "ok" — a genuinely fresh, this-request fetch. "stale" is
// deliberately treated the same as "unavailable" here, NOT the same as it
// is on the human-facing catalog/product/collection pages. Those pages show
// stale (real, previously-live) data WITH a visible CatalogStatusBanner
// disclosing it; a sitemap is machine-read XML with no way to disclose
// anything, and getStorefrontCatalog()'s in-process last-good cache is
// unbounded — it can be arbitrarily old if the backend has been down for a
// while, not just "up to one revalidate window" stale. On both "stale" and
// "unavailable" this falls back to the four static routes rather than
// throwing: a sitemap missing today's products is far better than either a
// build failure or a crawlable URL sourced from data of unknown age, and
// the next successful ("ok") revalidation fills it back in.
import type { MetadataRoute } from "next";
import { getStorefrontCatalog } from "@/lib/catalog/storefront";
import { buildSitemapEntries } from "@/lib/seo/sitemapEntries";
import { resolveSiteUrl } from "@/lib/seo/siteUrl";

// Kept numerically identical to lib/catalog/storefront.ts's
// CATALOG_REVALIDATE_SECONDS (also used by app/(public)/catalogo/page.tsx
// and the other catalog-backed routes) — if you change one, change both.
export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { origin } = resolveSiteUrl();
  const result = await getStorefrontCatalog();
  const freshCatalog = result.status === "ok" ? result.catalog : null;
  return buildSitemapEntries(origin, freshCatalog);
}
