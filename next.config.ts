// next.config.ts — SHARED (Violeta/foundation). Do NOT edit without Violeta approval.
//
// FORBIDDEN (RE-2, mission pack §7.10):
//   output: "export"   ❌  (breaks dynamic routes + ISR; reduces Next.js to a
//                           static GH-Pages clone). Target runtime is Vercel
//                           SSR/SSG/ISR. Leave `output` unset (default) — do
//                           NOT set "export". No `next export` script either.
import type { NextConfig } from "next";
import { resolveStorefrontImageHost } from "./lib/catalog/storefrontImageHost";

// Gate G5 (Verde, storefront catalog connect) update: the live
// GET /storefront/catalog contract emits image URLs as a bare PATH
// (e.g. "/storage/v1/object/public/product-images/products/{id}/{ref}.jpg"
// — see ai-agent-platform's storefront_catalog_service.py, which strips
// scheme+host by design), never a full URL. lib/catalog/storefront.ts's
// buildStorefrontImageUrl() turns that path into an absolute URL by
// prepending STOREFRONT_IMAGE_HOST — a plain PUBLIC object-storage
// hostname (not a Supabase client/key/URL of any kind; this app never talks
// to Supabase directly). This is read here, at config-eval time, so
// next/image's remotePatterns allowlist matches whatever host that helper
// used. OQ#1 (Juanpa/backend) is still OPEN: no real value is hardcoded
// here — it stays unset until Juanpa/Violeta configure it in the real
// deploy environment. Unset locally, this still resolves to the original
// inert placeholder, so the Amarillo fixture-only build keeps working
// exactly as before (Amarillo precondition #8, RE-4) — do NOT re-STOP.
//
// WAVE 3 correction (Wave-1 review V-5/V-6; VIOLETA_SHARED_FILE_APPROVAL:
// T05_NEXT_CONFIG_REMOTE_IMAGE_G5_2026_07_29 — this file's only change
// remains the storefront remote-image hostname contract, nothing else):
// hostname resolution now goes through lib/catalog/storefrontImageHost.ts's
// resolveStorefrontImageHost — the SAME function buildStorefrontImageUrl
// (lib/catalog/storefront.ts) calls at request time, so this allowlist and
// the URL builder can never disagree (closes V-6). A malformed configured
// value now fails THIS build loudly with a clear error (closes V-5) instead
// of silently falling back and 400ing at runtime. protocol/pathname below
// are unchanged from the previously reviewed diff.
const STOREFRONT_IMAGE_HOST = resolveStorefrontImageHost(process.env.STOREFRONT_IMAGE_HOST);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: STOREFRONT_IMAGE_HOST,
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
