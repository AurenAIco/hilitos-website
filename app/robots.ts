// app/robots.ts — SKELETON created by Violeta/foundation; ongoing owner: VERDE.
// S7A (SEO foundation) makes this environment-aware instead of hardcoded.
//
// ⛔ STILL FAIL-CLOSED for every origin except the real production custom
// domain (S-3, mission pack §7.7): the live production site (GitHub Pages /
// master / hilitos.co) remains canonical and indexed until an authorized
// Gate A6 cutover (Juanpa + Mónica). No Vercel deployment of THIS app may be
// crawled before that — including this project's own Vercel "production"
// alias (e.g. *.vercel.app), which is NOT the custom domain and is treated
// identically to a preview here.
//
// This file resolves the request/build-time origin (lib/seo/siteUrl.ts) and
// allows crawling ONLY when that origin's hostname is exactly hilitos.co or
// www.hilitos.co (isCanonicalProductionHostname) — i.e. only AFTER the DNS
// cutover has actually pointed that domain at this app AND
// NEXT_PUBLIC_SITE_URL=https://hilitos.co (or an equivalent Vercel custom
// domain wiring) is configured. Until then this keeps emitting the same
// blanket `Disallow: /` the skeleton always has, for both Vercel
// preview/production deployments and local development — opening crawling
// is still exclusively a Gate A6 / cutover action, never a side effect of
// this code shipping.
import type { MetadataRoute } from "next";
import { isCanonicalProductionHostname, resolveSiteUrl } from "@/lib/seo/siteUrl";

export default function robots(): MetadataRoute.Robots {
  const { origin, hostname } = resolveSiteUrl();

  if (isCanonicalProductionHostname(hostname)) {
    return {
      rules: [
        {
          userAgent: "*",
          allow: "/",
          // Defense in depth alongside app/(admin)/layout.tsx's per-response
          // `robots: { index: false, follow: false }` meta tag (ADM1a-S1) —
          // that meta tag is the authoritative guard; this just keeps
          // crawlers from requesting the admin surface at all.
          disallow: "/admin",
        },
      ],
      sitemap: `${origin}/sitemap.xml`,
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        disallow: "/",
      },
    ],
  };
}
