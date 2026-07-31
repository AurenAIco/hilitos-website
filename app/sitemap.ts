// app/sitemap.ts — SKELETON created by Violeta/foundation; ongoing owner: VERDE.
// S7A (SEO foundation) fixes the origin (lib/seo/siteUrl.ts) — no more
// unconditional localhost fallback — and lists only finished, indexable
// public routes. Note app/robots.ts stays fail-closed (Disallow: /) for
// every origin except the real hilitos.co custom domain until Gate A6, so
// this sitemap remains inert for real crawlers on any Vercel/local origin
// in the meantime — see that file for the cutover contract.
//
// S7B EXTENSION POINT: add dynamic entries for /productos/[slug] and
// /colecciones/[slug] here once Verde's catalog data layer (lib/catalog/**)
// exposes an enumerable list of published slugs. Do NOT invent product or
// collection URLs ahead of real, published catalog data — an unpublished or
// wrong slug in a sitemap is worse than omitting it (crawlers penalize
// sitemaps with dead links).
import type { MetadataRoute } from "next";
import { resolveSiteUrl } from "@/lib/seo/siteUrl";

// Finished, indexable, static public routes only. /catalogo is included:
// its content is fetched live (lib/catalog/storefront.ts) but the ROUTE
// itself is static and finished. Deliberately excludes every app/(admin)/**
// route (never indexable — see app/(admin)/layout.tsx's own noindex
// metadata) and every dynamic [slug] route (no enumerable published data
// source wired up yet — S7B).
const STATIC_PUBLIC_ROUTES = ["/", "/catalogo", "/nosotros", "/privacy"];

export default function sitemap(): MetadataRoute.Sitemap {
  const { origin } = resolveSiteUrl();
  return STATIC_PUBLIC_ROUTES.map((route) => ({
    url: route === "/" ? origin : `${origin}${route}`,
    changeFrequency: "weekly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
