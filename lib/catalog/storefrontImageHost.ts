// lib/catalog/storefrontImageHost.ts
// VERDE (Gate G5 — storefront catalog connect), WAVE 3 surgical correction
// (Wave-1 review V-5/V-6, feeds Decision Log #4). Single source of truth for
// the STOREFRONT_IMAGE_HOST contract: what counts as a valid bare hostname,
// and what the fallback is when the env var is unset.
//
// Deliberately dependency-free (no "@/lib/contract", no fetch, no
// Next.js/React runtime API) so it is safe to import from BOTH
// next.config.ts (build/config-eval time — see that file's own comment) and
// lib/catalog/storefront.ts's buildStorefrontImageUrl (request time),
// without either import site risking a build-graph or client-bundle issue.
// Both callers now compute the hostname through this identical function, so
// next/image's allowlist and the URL builder can never disagree — this is
// what closes V-6 (the fallback literal + validation used to be duplicated
// verbatim in both files, with nothing proving they'd stay equal).

/** Fallback hostname when STOREFRONT_IMAGE_HOST is unset or empty (after
 * trim). An RFC 2606 reserved, non-resolvable TLD — can never accidentally
 * resolve to a live third party. Local dev and the Amarillo fixture-only
 * build never set the real env var, so this is what they render against;
 * that build only ever reads local /public/fixtures/** images and is
 * unaffected either way (Amarillo precondition #8 / RE-4). */
export const STOREFRONT_IMAGE_HOST_FALLBACK = "image-bucket-placeholder.invalid";

/**
 * True only for a bare hostname: no scheme, no port, no pathname, no query
 * string, no fragment, no whitespace anywhere, and RFC-1123-ish label
 * characters only (letters, digits, hyphens; no leading/trailing hyphen per
 * label). Deliberately conservative — a false negative here just fails the
 * build with a clear message for a human to correct; a false positive would
 * let a malformed value silently reach `next/image`, which 400s on every
 * image at runtime instead (Wave-1 review V-5, GAP 4b).
 */
export function isBareHostname(value: string): boolean {
  if (value.length === 0 || value.length > 253) return false;
  if (/\s/.test(value)) return false;
  // A bare hostname never contains any of these — one check rejects a
  // scheme ("https://host"), a port ("host:1234"), a pathname ("host/path"),
  // a query string ("host?x=1"), and a fragment ("host#x") all at once.
  if (/[:/?#]/.test(value)) return false;
  return /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.(?!-)[A-Za-z0-9-]{1,63}(?<!-))*$/.test(value);
}

/**
 * Resolve STOREFRONT_IMAGE_HOST — the ONLY function next.config.ts's
 * remotePatterns (build/config-eval time) and buildStorefrontImageUrl
 * (request time) are allowed to compute this from.
 *
 * - Unset / empty (after trim) => STOREFRONT_IMAGE_HOST_FALLBACK. Expected
 *   steady state before the real host is configured (OQ#1 still open).
 * - Present but not a bare hostname => throws. At build time
 *   (next.config.ts) this fails the build loudly, per the Wave-1 review
 *   requirement. At request time (buildStorefrontImageUrl) this can only
 *   happen if the value legitimately differs between build and runtime
 *   environments (already-documented build-time/runtime asymmetry, Wave-1
 *   review V-4/GAP 4a) — throwing here is a deliberate fail-closed choice,
 *   consistent with this module's existing fallback contract, over silently
 *   emitting an image URL next/image would 400 on anyway.
 * - Valid => lowercased before returning. DNS hostnames are case-insensitive,
 *   but next/image's remotePatterns hostname match (picomatch, no `nocase`)
 *   is case-SENSITIVE while WHATWG URL.hostname lowercases every runtime
 *   image URL. Without this normalization, an uppercase configured value
 *   passes validation and the build succeeds, but every request-time URL
 *   fails the allowlist match and 400s (independent review finding B-1,
 *   2026-07-29) — the exact silent-divergence failure this shared resolver
 *   exists to prevent.
 */
export function resolveStorefrontImageHost(rawValue: string | undefined): string {
  const trimmed = rawValue?.trim() ?? "";
  if (!trimmed) return STOREFRONT_IMAGE_HOST_FALLBACK;
  if (!isBareHostname(trimmed)) {
    throw new Error(
      `STOREFRONT_IMAGE_HOST is set to an invalid value: ${JSON.stringify(rawValue)}. ` +
        "It must be a bare hostname only — no scheme (e.g. \"https://\"), no port, " +
        "no path, no query string, no fragment, and no whitespace. " +
        'Example of a valid value: "cdn.example.com".',
    );
  }
  return trimmed.toLowerCase();
}
