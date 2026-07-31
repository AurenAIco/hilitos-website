// lib/seo/siteUrl.ts — S7A (SEO foundation). Server-only site-origin
// resolver: the single source of truth every SEO surface (app/layout.tsx
// metadataBase, app/robots.ts, app/sitemap.ts) uses to compute the public
// site origin. Mirrors the shape of lib/catalog/storefrontImageHost.ts's
// resolveStorefrontImageHost — pure, dependency-free, throws loudly on a
// malformed *configured* value instead of silently falling back to
// something a crawler or social-media scraper would treat as canonical.
//
// Resolution priority:
//   1. NEXT_PUBLIC_SITE_URL, if set and valid — the authoritative override,
//      e.g. NEXT_PUBLIC_SITE_URL=https://hilitos.co at the Gate A6 cutover.
//   2. A Vercel-supplied deployment origin, when running on Vercel (VERCEL
//      is set) and no override is configured: VERCEL_PROJECT_PRODUCTION_URL
//      for a Vercel "production" deployment (the project's own stable
//      alias — NOT the real custom domain until A6), else VERCEL_URL (the
//      specific preview/branch deployment's own unique host).
//   3. http://localhost:3000 — ONLY when neither of the above applies, i.e.
//      we are not running under Vercel at all (this app's only deploy
//      target — see next.config.ts's RE-2 comment) and nothing else was
//      configured. A process with no VERCEL env and no NEXT_PUBLIC_SITE_URL
//      can only be a local `next dev` or a local `next build` — this is
//      what "explicit local development" means here.
//
// Deliberately does NOT decide "is this the canonical hilitos.co production
// domain" — that policy question belongs to app/robots.ts, which stays
// FAIL-CLOSED (Disallow: /) for every origin this resolver can return
// except the real custom domain (docs/OWNERSHIP.md §7 / the A6 cutover
// gate). isCanonicalProductionHostname below is only the shared primitive
// robots.ts uses to make that call — resolving an origin here never opens
// crawling by itself.
//
// No secrets are read or exposed: NEXT_PUBLIC_SITE_URL is already
// client-public by Next.js convention, and the VERCEL_* variables consulted
// here are non-secret deployment metadata (flags/hostnames), never tokens
// or keys.

export interface SiteUrlEnv {
  NEXT_PUBLIC_SITE_URL?: string;
  VERCEL?: string;
  VERCEL_ENV?: string;
  VERCEL_URL?: string;
  VERCEL_PROJECT_PRODUCTION_URL?: string;
}

export interface ResolvedSiteUrl {
  /** Normalized absolute origin: "<protocol>//<host>", no trailing slash,
   * no path/query/fragment. Safe to interpolate a leading-slash path
   * directly (`${origin}${path}`) or pass straight to `new URL()`. */
  origin: string;
  /** Lowercased hostname only (no port) — for domain-identity checks, e.g.
   * robots.ts's canonical-production-domain check. */
  hostname: string;
  /** Where this origin came from. Diagnostic only; no caller should branch
   * on this to decide crawlability — use isCanonicalProductionHostname. */
  source: "configured" | "vercel" | "localhost";
}

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1"]);
const LOCALHOST_FALLBACK_ORIGIN = "http://localhost:3000";

/** The real Hilitos production custom domain(s) — the ONLY hostnames
 * app/robots.ts is allowed to treat as publicly crawlable (Gate A6). Kept
 * here, next to the resolver, so the repo has exactly one such list. */
export const CANONICAL_PRODUCTION_HOSTNAMES: readonly string[] = ["hilitos.co", "www.hilitos.co"];

export function isCanonicalProductionHostname(hostname: string): boolean {
  return CANONICAL_PRODUCTION_HOSTNAMES.includes(hostname.toLowerCase());
}

function normalizeConfiguredSiteUrl(rawValue: string): ResolvedSiteUrl {
  let parsed: URL;
  try {
    parsed = new URL(rawValue);
  } catch {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL is set to an invalid URL: ${JSON.stringify(rawValue)}. ` +
        'It must be an absolute origin, e.g. "https://hilitos.co" — no path, query ' +
        "string, or fragment.",
    );
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL must use http or https, got ${JSON.stringify(parsed.protocol)} ` +
        `(value: ${JSON.stringify(rawValue)}).`,
    );
  }

  const hostname = parsed.hostname.toLowerCase();
  const isLocal = LOCAL_HOSTNAMES.has(hostname);
  if (parsed.protocol !== "https:" && !isLocal) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must use https:// for a real public origin " +
        `(value: ${JSON.stringify(rawValue)}). http:// is only accepted for localhost.`,
    );
  }

  if (parsed.pathname !== "/" && parsed.pathname !== "") {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be an origin only, with no path " +
        `(value: ${JSON.stringify(rawValue)}, found path ${JSON.stringify(parsed.pathname)}).`,
    );
  }
  if (parsed.search !== "" || parsed.hash !== "") {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be an origin only, with no query string or fragment " +
        `(value: ${JSON.stringify(rawValue)}).`,
    );
  }

  // parsed.origin is already normalized by the WHATWG URL parser: lowercased
  // host, no trailing slash, no path/query/fragment.
  return { origin: parsed.origin, hostname, source: "configured" };
}

function resolveVercelOrigin(env: SiteUrlEnv): ResolvedSiteUrl | null {
  if (!env.VERCEL) return null;

  const host =
    (env.VERCEL_ENV === "production" && env.VERCEL_PROJECT_PRODUCTION_URL) ||
    env.VERCEL_URL ||
    undefined;

  if (!host) {
    throw new Error(
      "Running on Vercel (VERCEL is set) but neither VERCEL_PROJECT_PRODUCTION_URL nor " +
        "VERCEL_URL is available to derive a deployment origin, and NEXT_PUBLIC_SITE_URL " +
        "is not configured. Refusing to fall back to localhost for a Vercel deployment.",
    );
  }

  return { origin: `https://${host}`, hostname: host.toLowerCase(), source: "vercel" };
}

/**
 * Resolve the public site origin. Reads `process.env` by default; pass an
 * explicit `env` (tests do) to avoid mutating global process.env.
 */
export function resolveSiteUrl(env: SiteUrlEnv = process.env as SiteUrlEnv): ResolvedSiteUrl {
  const configured = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return normalizeConfiguredSiteUrl(configured);
  }

  const vercelOrigin = resolveVercelOrigin(env);
  if (vercelOrigin) return vercelOrigin;

  return {
    origin: LOCALHOST_FALLBACK_ORIGIN,
    hostname: "localhost",
    source: "localhost",
  };
}
