// app/robots.ts — SKELETON created by Violeta/foundation; ongoing owner: VERDE.
// S7A (SEO foundation) makes this environment-aware instead of hardcoded.
//
// ⛔ FAIL-CLOSED by default. The live production site (GitHub Pages /
// master / hilitos.co) remains canonical and indexed until an authorized
// Gate A6 cutover (Juanpa + Mónica). Crawling opens ONLY when BOTH of the
// following hold:
//   1. we are NOT on a non-production Vercel deployment
//      (isNonProductionVercelEnv — checked FIRST, below), and
//   2. the resolved origin's hostname is exactly hilitos.co or
//      www.hilitos.co (isCanonicalProductionHostname).
//
// Guard 1 exists because guard 2 alone was NOT sufficient — an independent
// review reproduced a preview deployment emitting `Allow: /` simply
// because NEXT_PUBLIC_SITE_URL=https://hilitos.co had been configured in
// Vercel's Preview scope as well as Production (Vercel's "add variable" UI
// pre-checks all three environments by default). The VERCEL_ENV guard
// therefore deliberately takes PRECEDENCE over NEXT_PUBLIC_SITE_URL:
// crawlability is never decided by the resolved hostname alone.
//
// ⚠️ Note also that VERCEL_PROJECT_PRODUCTION_URL resolves to the project's
// production CUSTOM domain once hilitos.co is attached to the Vercel
// project (see lib/seo/siteUrl.ts's header). So a *production* deployment
// can satisfy guard 2 with nobody setting NEXT_PUBLIC_SITE_URL at all —
// production-origin resolution changes at DOMAIN ATTACHMENT. Attaching the
// domain is itself a Gate A6 action; do not treat "no env var set" as
// proof that crawling is still closed. See docs/SEO.md.
import type { MetadataRoute } from "next";
import { isCanonicalProductionHostname, isNonProductionVercelEnv, resolveSiteUrl } from "@/lib/seo/siteUrl";

/** The blanket fail-closed response — the same `Disallow: /` this file has
 * emitted since the foundation skeleton. Never references a sitemap: an
 * origin we refuse to have crawled must not advertise one either. */
function disallowAllRobots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: "/",
      },
    ],
  };
}

export default function robots(): MetadataRoute.Robots {
  // GUARD 1 — every non-production Vercel environment (preview,
  // development, any custom environment) fails closed regardless of what
  // origin resolved. Checked BEFORE the hostname logic on purpose.
  if (isNonProductionVercelEnv()) {
    return disallowAllRobots();
  }

  const { origin, hostname } = resolveSiteUrl();

  // GUARD 2 — only the real production custom domain is crawlable. Local
  // development and any non-canonical Vercel production alias
  // (*.vercel.app) both land here and fail closed.
  if (!isCanonicalProductionHostname(hostname)) {
    return disallowAllRobots();
  }

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
