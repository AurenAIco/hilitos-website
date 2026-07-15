// app/sitemap.ts — SKELETON created by Violeta/foundation; ongoing owner: VERDE.
//
// Lists ONLY the static public routes. The base URL is a documented placeholder
// until Gate A6 (the real custom domain stays on GitHub Pages/master until an
// authorized cutover). Note robots.ts is fail-closed (Disallow: /) until A6,
// so this sitemap is inert for crawlers in the meantime.
//
// VERDE EXTENSION POINT: in the Verde catalog mission, extend this to add
// dynamic entries for /productos/[slug] and /colecciones/[slug] from the
// catalog data layer (lib/catalog/**, returning the frozen contracts).
import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"; // TODO(A6): real origin at cutover

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["/", "/catalogo", "/nosotros", "/privacy"];
  return staticRoutes.map((route) => ({
    url: `${SITE_URL}${route === "/" ? "" : route}`,
    changeFrequency: "weekly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
