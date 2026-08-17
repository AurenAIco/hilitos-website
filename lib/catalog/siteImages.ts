// lib/catalog/siteImages.ts — IMG-S8B3 (Public Editorial Image Resolution).
// Server-side ONLY fetch adapter for the public
// GET /storefront/{slug}/site-images endpoint (ai-agent-platform IMG-S8B1,
// merged upstream in a different repo). Mirrors lib/catalog/storefront.ts's
// conventions deliberately (same STOREFRONT_BACKEND_URL env var — same
// backend service, same deploy; same "never throw into rendering" contract;
// same hand-rolled shape-guard style) but is intentionally simpler: there is
// no last-good cache here, because the correct fallback for "no valid
// override" IS the bundled asset already compiled into every page. An empty
// map is not a degraded state to disclose — it is the honest, correct
// response whenever managed editorial images are unavailable.
//
// FROZEN TENANT (mission spec): this frontend is single-tenant (Hilitos
// only). STOREFRONT_SITE_IMAGES_SLUG below is a repo constant, never user
// input and never a company_id — the backend resolves company identity
// server-side from the slug alone, exactly like every other storefront
// fetch in this codebase never sends a company_id.
//
// PRODUCTION MIGRATION NOT YET APPLIED (mission spec): the live endpoint's
// backing table may not exist yet. Per the backend's own contract, a
// missing/unreadable table is CAUGHT server-side and degrades to a 200
// response with an empty `{}` body, not a 500 (corrected 2026-08-16 — an
// earlier version of this comment assumed a 500 here). Either shape is
// handled identically by this module regardless: a non-2xx status (should
// one ever occur, for an unrelated reason) and a 200 with an empty/absent
// map both resolve through the exact same code path as "no rows" or
// "network unreachable" — see getStorefrontSiteImages()'s try/catch below.
// This module makes NO live network calls during implementation/tests;
// every test stubs globalThis.fetch first (see tests/site-images/*.test.ts).
//
// ZERO-VISIBLE-CHANGE INVARIANT: getStorefrontSiteImages() NEVER throws and
// NEVER returns anything but a plain object keyed by SiteImageSlotKey. Every
// failure mode — missing/invalid backend URL, network error, timeout, a
// non-2xx status (should one ever occur), a 200 with an empty/missing-table
// body, invalid JSON, a non-object body, or one malformed slot inside an
// otherwise-valid map — degrades to that slot (or the whole map) being absent, so
// resolveSiteImage() (./resolveSiteImage.ts) falls back to the bundled
// asset silently. No banner, no spinner, no thrown error ever reaches a
// page render.
import { cache } from "react";

/** Backend base URL — the SAME env var lib/catalog/storefront.ts reads for
 * the live catalog endpoint (same backend service). Server-side only —
 * never NEXT_PUBLIC_*, never sent to the browser. No default: an unset
 * value fails closed to an empty override map rather than guessing a
 * production origin. */
const BACKEND_BASE_URL = process.env.STOREFRONT_BACKEND_URL?.trim() || "";

/** Frozen single-tenant storefront slug (mission "FROZEN TENANT"). Never
 * derived from user input, config, or any per-request value — the backend
 * resolves company identity server-side from this slug alone. */
export const STOREFRONT_SITE_IMAGES_SLUG = "hilitos";

/** Management staleness window, in seconds — mission target "~5 minutes".
 * Passed straight to fetch's `next.revalidate`, the same ISR convention
 * lib/catalog/storefront.ts's CATALOG_REVALIDATE_SECONDS already uses in
 * this repo. Kept as its own named constant (not imported from
 * storefront.ts) so this endpoint's cache window can diverge from the
 * catalog's later without touching that file — today they are numerically
 * identical by coincidence of the same ~5 minute target, not by shared
 * reference. */
export const SITE_IMAGES_REVALIDATE_SECONDS = 300;

/** Bounded-fetch timeout, in ms (mission "must not hang forever"). This
 * endpoint's backing table may not exist in production yet, so a
 * slow/hanging connection is an expected near-term condition, not a rare
 * edge case — this is deliberately request-scoped (AbortSignal.timeout),
 * not a change to any global fetch/caching architecture. */
const FETCH_TIMEOUT_MS = 5000;

/** The FROZEN 16 slot keys — exactly these, no more, no less, no mascot.
 * Single source of truth: every consumer (resolveSiteImage, every wired
 * component) imports SiteImageSlotKey from here rather than re-typing the
 * union, so a typo anywhere else in the app fails to compile instead of
 * silently no-op-ing at runtime. */
export const SITE_IMAGE_SLOT_KEYS = [
  "home_hero",
  "home_benefit_cotton",
  "home_benefit_handmade",
  "home_benefit_made_in_colombia",
  "home_benefit_shipping",
  "home_history_teaser",
  "home_process_knitting",
  "home_process_hand_finishing",
  "home_process_quality_check",
  "home_process_arrival",
  "home_personalizados_band",
  "home_regalos_band",
  "nosotros_hero",
  "nosotros_process",
  "nosotros_material",
  "personalizados_hero",
] as const;

export type SiteImageSlotKey = (typeof SITE_IMAGE_SLOT_KEYS)[number];

const SITE_IMAGE_SLOT_KEY_SET: ReadonlySet<string> = new Set(SITE_IMAGE_SLOT_KEYS);

export function isSiteImageSlotKey(value: string): value is SiteImageSlotKey {
  return SITE_IMAGE_SLOT_KEY_SET.has(value);
}

/** One validated managed-image override. `altText` is null when the backend
 * sent no alt text, or a blank/whitespace-only string — resolveSiteImage
 * treats null identically to "use the fixed fallback alt" (mission rule).
 * `updatedAt` is null when absent/blank; when present it drives the
 * per-image cache-busting query token (see resolveSiteImage.ts). */
export interface SiteImageOverride {
  imagePath: string;
  altText: string | null;
  updatedAt: string | null;
}

export type SiteImageOverrideMap = Partial<Record<SiteImageSlotKey, SiteImageOverride>>;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** REAL backend contract (corrected 2026-08-16 after independent review
 * found the original root-relative assumption below rejected every
 * genuine backend response): `image_path` is BUCKET-RELATIVE, never
 * root-relative and never already containing the Storage object prefix —
 * exactly `editorial/{company_id-as-uuid}/{slot_key}.{ext}`, e.g.
 * `editorial/550e8400-e29b-41d4-a716-446655440000/home_hero.jpg`. The
 * public-URL prefix (`/storage/v1/object/public/product-images/`) is
 * prepended separately, in resolveSiteImage.ts, before handing the result
 * to buildStorefrontImageUrl — see that file.
 *
 * This regex is intentionally an EXACT-shape allowlist (not a generic
 * "no scheme / no traversal" blacklist): a fixed literal `editorial/`
 * segment, a 36-character UUID-shaped company id, a single slot-key
 * segment restricted to `[a-z0-9_]+` (no `/`, so no extra nested
 * segments and no traversal token can ever appear there), and a
 * closed extension allowlist (`jpg|png|webp`). Anything not matching
 * this exact shape — a leading slash, `../`, an embedded scheme
 * (`http://`, `https://`, `javascript:`, `data:`), a protocol-relative
 * `//host/…`, a query string, a malformed/wrong-length company id, an
 * unknown extension — is rejected outright. This is what stops a
 * malformed/malicious backend response from ever injecting an arbitrary
 * host or path: a value that fails this check is dropped HERE and never
 * reaches buildStorefrontImageUrl.
 *
 * Exported (not just used internally) so resolveSiteImage.ts (./resolveSiteImage.ts)
 * can apply the SAME check as defense-in-depth on any override map it is
 * handed — one shared validator, never two independently-maintained copies
 * that could drift (same discipline as lib/catalog/storefrontImageHost.ts's
 * resolveStorefrontImageHost being the single shared hostname resolver for
 * both next.config.ts and lib/catalog/storefront.ts). */
const SITE_IMAGE_PATH_RE = /^editorial\/[0-9a-fA-F-]{36}\/[a-z0-9_]+\.(jpg|png|webp)$/;

export function isValidSiteImagePath(v: unknown): v is string {
  return typeof v === "string" && SITE_IMAGE_PATH_RE.test(v);
}

function normalizeAltText(v: unknown): string | null {
  if (typeof v !== "string") return null;
  return v.trim().length > 0 ? v : null;
}

function normalizeUpdatedAt(v: unknown): string | null {
  return typeof v === "string" && v.trim().length > 0 ? v : null;
}

/** Validate + normalize ONE slot entry. Returns null (reject) rather than
 * throwing, so one malformed slot can be dropped without discarding the
 * rest of an otherwise-valid map (mission "reject malformed entries
 * individually where cheaply possible, rather than discarding the whole
 * map"). */
function toValidOverride(v: unknown): SiteImageOverride | null {
  if (!isPlainObject(v)) return null;
  if (!isValidSiteImagePath(v.image_path)) return null;
  return {
    imagePath: v.image_path,
    altText: normalizeAltText(v.alt_text),
    updatedAt: normalizeUpdatedAt(v.updated_at),
  };
}

/** Parse + validate the full response body. Never throws. An invalid
 * top-level shape (not a plain object — an array, a string, null, a
 * number, …) yields `{}`. A valid top-level object keeps only the entries
 * that are (a) one of the frozen 16 slot keys and (b) individually
 * well-formed; unknown slot keys (including a hypothetical "brand_mascot")
 * are silently ignored, never an error (mission "unknown slot ignored"). */
export function parseSiteImageResponse(data: unknown): SiteImageOverrideMap {
  if (!isPlainObject(data)) return {};

  const result: SiteImageOverrideMap = {};
  for (const [key, value] of Object.entries(data)) {
    if (!isSiteImageSlotKey(key)) continue;
    const override = toValidOverride(value);
    if (override) result[key] = override;
  }
  return result;
}

/**
 * Fetch the public editorial-image overrides for the frozen Hilitos slug.
 * Server-side only. NEVER throws — every failure mode (unset backend URL,
 * network error/timeout, a non-2xx status, a 200 with an empty/missing-table
 * body, invalid JSON, malformed top-level shape) degrades to `{}`, an
 * empty override map. Consumers treat `{}` identically to "no managed
 * image for any slot" — the bundled asset renders exactly as it does
 * today. No secret is required: this is a public endpoint, no auth header
 * is sent.
 *
 * Wrapped in React `cache()` so multiple Server Components rendered within
 * the same request (BenefitsStrip, HistoryTeaser, ProcessStrip, …) share
 * one fetch instead of issuing the request once per component. (Outside a
 * React Server render — e.g. this repo's node:test files — `cache()` is a
 * plain passthrough with no memoization, so tests calling this function
 * repeatedly with different fetch stubs remain fully isolated.)
 */
export const getStorefrontSiteImages = cache(async function getStorefrontSiteImages(): Promise<SiteImageOverrideMap> {
  if (!BACKEND_BASE_URL) {
    console.warn("event=storefront_site_images_backend_url_unset | fail_closed");
    return {};
  }

  try {
    const res = await fetch(
      `${BACKEND_BASE_URL.replace(/\/+$/, "")}/storefront/${STOREFRONT_SITE_IMAGES_SLUG}/site-images`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: SITE_IMAGES_REVALIDATE_SECONDS },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      },
    );

    if (!res.ok) {
      throw new Error(`storefront site-images fetch failed with status ${res.status}`);
    }

    const data: unknown = await res.json();
    return parseSiteImageResponse(data);
  } catch (err) {
    console.warn(`event=storefront_site_images_fetch_failed | error=${String(err)}`);
    return {};
  }
});
