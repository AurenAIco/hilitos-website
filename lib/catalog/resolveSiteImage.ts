// lib/catalog/resolveSiteImage.ts — IMG-S8B3 (Public Editorial Image
// Resolution). Pure per-slot resolution helper: no I/O of its own, no
// React/Next.js runtime dependency, deterministic given its four
// arguments (plus the process-env-derived STOREFRONT_IMAGE_HOST that
// buildStorefrontImageUrl itself reads — the same "pure enough" bar every
// other product/collection image URL in this codebase already accepts;
// see lib/catalog/storefront.ts's header).
//
// ZERO-VISIBLE-CHANGE INVARIANT: with no valid override for a slot (empty
// map, missing slot, or a malformed entry that never should have survived
// parseSiteImageResponse but is defensively re-checked here anyway), this
// ALWAYS returns fallbackSrc/fallbackAlt UNCHANGED — never a modified
// path, never a modified alt, never a thrown error.
import { buildStorefrontImageUrl } from "./storefront";
import { isValidSiteImagePath, type SiteImageOverrideMap, type SiteImageSlotKey } from "./siteImages";

export interface ResolvedSiteImage {
  src: string;
  alt: string;
}

/** REAL backend contract (corrected 2026-08-16): `SiteImageOverride.imagePath`
 * is BUCKET-RELATIVE (`editorial/{uuid}/{slot_key}.{ext}` — see
 * lib/catalog/siteImages.ts's isValidSiteImagePath), never already a public
 * Storage object path. This is the SAME public-object prefix the live
 * catalog contract's image paths already carry (see storefront_catalog_
 * service.py / lib/catalog/storefront.ts's buildStorefrontImageUrl header)
 * — prepending it here, before handing the result to buildStorefrontImageUrl,
 * is what turns a bucket-relative editorial path into the same shape of
 * root-relative path buildStorefrontImageUrl already expects for every other
 * image in this repo. buildStorefrontImageUrl itself is NOT changed. */
const SITE_IMAGE_STORAGE_PREFIX = "/storage/v1/object/public/product-images/";

/**
 * Resolve ONE editorial image slot: a valid managed override wins,
 * otherwise the caller's bundled fallback renders exactly as it does
 * today.
 *
 * - No override for `slotKey` (including `overrides` being `{}`, or the
 *   entry present but missing/blank `imagePath`) => `{ src: fallbackSrc,
 *   alt: fallbackAlt }`, returned byte-for-byte unchanged.
 * - Valid override => `{ src: <managed URL>, alt: <override alt, or
 *   fallbackAlt if the override alt is missing/blank> }`. `imagePath` is
 *   re-validated with `isValidSiteImagePath` (the SAME check
 *   parseSiteImageResponse already applies before this function ever sees
 *   data from a live fetch — defense in depth, not duplicated policy: one
 *   shared validator, imported from lib/catalog/siteImages.ts). A slot
 *   whose `imagePath` fails that check is treated exactly like "no
 *   override" and falls back. The bucket-relative `imagePath` is turned
 *   into the canonical public object path by prepending
 *   `SITE_IMAGE_STORAGE_PREFIX`, THEN handed to `buildStorefrontImageUrl`
 *   — the SAME canonical path→URL builder every product/category image in
 *   this repo already uses (lib/catalog/storefront.ts) — so a managed
 *   image can never resolve to a host outside the already-established
 *   public storefront image-host contract, and next.config.ts's existing
 *   remotePatterns allowlist (which that same builder is proven to agree
 *   with) needs no change for these slots.
 * - `updatedAt`, when present on the override, is appended as a `?v=`
 *   cache-busting query token so a stable storage path whose CONTENT was
 *   just replaced (backend storage paths are stable + cache-control
 *   no-cache; the metadata map is what says which content is current) is
 *   not served stale from an intermediate cache or next/image's own
 *   optimizer cache — see the mission report's CACHE STRATEGY section for
 *   why this is the smallest sufficient fix rather than a global caching
 *   change. Applied ONLY to managed-override URLs, never to the bundled
 *   fallback path — the fallback's cache behavior is completely
 *   untouched by this feature.
 */
export function resolveSiteImage(
  slotKey: SiteImageSlotKey,
  fallbackSrc: string,
  fallbackAlt: string,
  overrides: SiteImageOverrideMap,
): ResolvedSiteImage {
  const override = overrides?.[slotKey];

  if (!override || !isValidSiteImagePath(override.imagePath)) {
    return { src: fallbackSrc, alt: fallbackAlt };
  }

  const trimmedAlt = typeof override.altText === "string" ? override.altText.trim() : "";
  const alt = trimmedAlt.length > 0 ? override.altText! : fallbackAlt;

  let src = buildStorefrontImageUrl(`${SITE_IMAGE_STORAGE_PREFIX}${override.imagePath}`);
  if (typeof override.updatedAt === "string" && override.updatedAt.trim().length > 0) {
    const token = encodeURIComponent(override.updatedAt);
    src += (src.includes("?") ? "&" : "?") + `v=${token}`;
  }

  return { src, alt };
}
