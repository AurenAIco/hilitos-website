// next.config.ts — SHARED (Violeta/foundation). Do NOT edit without Violeta approval.
//
// FORBIDDEN (RE-2, mission pack §7.10):
//   output: "export"   ❌  (breaks dynamic routes + ISR; reduces Next.js to a
//                           static GH-Pages clone). Target runtime is Vercel
//                           SSR/SSG/ISR. Leave `output` unset (default) — do
//                           NOT set "export". No `next export` script either.
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // TODO(OQ#1 — Juanpa/backend): replace with the REAL durable public
      // image-bucket domain before Verde connects the live catalog. This is a
      // clearly-marked placeholder; the committed fixture renders exclusively
      // from local /public/fixtures/** assets, so no real remote domain is
      // required for the Amarillo (fixture-only) build. This satisfies
      // Amarillo precondition #8 (RE-4) — do NOT re-STOP over it.
      {
        protocol: "https",
        hostname: "image-bucket-placeholder.invalid",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
