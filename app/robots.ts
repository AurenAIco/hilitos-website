// app/robots.ts — SKELETON created by Violeta/foundation; ongoing owner: VERDE.
//
// ⛔ FAIL-CLOSED (S-3, mission pack §7.7): Disallow ALL crawling.
// The redesign must NEVER be indexed while the live production site
// (GitHub Pages / master / hilitos.co) is the canonical, indexed site.
// This applies to every preview and any future Vercel deployment.
//
// Opening crawling is a Gate A6 / cutover action (Juanpa + Mónica approval),
// executed by the robots owner (Verde) as part of the A6 checklist — e.g.
// gated on a production env flag. NEVER open it before A6.
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: "/",
      },
    ],
  };
}
