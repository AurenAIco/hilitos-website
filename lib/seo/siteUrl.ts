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
//      for a Vercel "production" deployment, else VERCEL_URL (the specific
//      preview/branch deployment's own unique host).
//   3. http://localhost:3000 — ONLY when neither of the above applies, i.e.
//      we are not running under Vercel at all (this app's only deploy
//      target — see next.config.ts's RE-2 comment) and nothing else was
//      configured. A process with no VERCEL env and no NEXT_PUBLIC_SITE_URL
//      can only be a local `next dev` or a local `next build` — this is
//      what "explicit local development" means here.
//
// ⚠️ VERCEL_PROJECT_PRODUCTION_URL — ACCURATE SEMANTICS (corrected after
// independent review). Per Vercel's system-environment-variable reference
// it is "the shortest production CUSTOM domain or vercel.app domain", and
// it "is always set, EVEN IN PREVIEW DEPLOYMENTS". Two consequences this
// module and app/robots.ts must both respect:
//   (a) it is NOT necessarily a *.vercel.app alias — once hilitos.co is
//       ATTACHED to the Vercel project it resolves to hilitos.co itself,
//       with nobody setting any environment variable. Production-origin
//       resolution therefore changes at DOMAIN ATTACHMENT, not at the
//       NEXT_PUBLIC_SITE_URL step;
//   (b) because it is also present in preview builds, the
//       `VERCEL_ENV === "production"` conjunct in resolveVercelOrigin below
//       is load-bearing — without it every preview would resolve to the
//       production origin.
// Neither (a) nor (b) is what gates crawling: crawlability is decided
// FIRST by VERCEL_ENV, in app/robots.ts, via isNonProductionVercelEnv
// below. Resolving an origin here never opens crawling by itself.
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
  /** Normalized absolute origin: "<protocol>//<host>", lowercased host, no
   * trailing slash, no path/query/fragment. Safe to interpolate a
   * leading-slash path directly (`${origin}${path}`) or pass straight to
   * `new URL()`. Guaranteed to agree with `hostname` — both are derived
   * from the same WHATWG URL parse (see normalizeSiteOrigin). */
  origin: string;
  /** Lowercased hostname only (no port) — for domain-identity checks, e.g.
   * robots.ts's canonical-production-domain check. */
  hostname: string;
  /** Where this origin came from. Diagnostic only; no caller should branch
   * on this to decide crawlability — see app/robots.ts. */
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

/**
 * True when we are running on a Vercel deployment whose environment is
 * anything OTHER than "production" (i.e. "preview", "development", or any
 * custom environment name). app/robots.ts consults this FIRST and fails
 * closed on it, so a preview deployment can never become crawlable merely
 * because NEXT_PUBLIC_SITE_URL is also configured in Preview scope — the
 * exact defect the independent review reproduced.
 *
 * Deliberately keyed on VERCEL_ENV rather than VERCEL: VERCEL_ENV is unset
 * off-Vercel (local dev), which this returns false for — local dev is
 * still non-crawlable, but via the hostname check (localhost is never a
 * canonical production hostname), not via this guard.
 */
export function isNonProductionVercelEnv(env: SiteUrlEnv = process.env as SiteUrlEnv): boolean {
  const vercelEnv = env.VERCEL_ENV?.trim();
  return Boolean(vercelEnv) && vercelEnv !== "production";
}

/**
 * The ONE normalizer both resolution branches go through, so `origin` and
 * `hostname` are always derived from the same WHATWG URL parse and can
 * never disagree (e.g. origin "https://HILITOS.CO" alongside hostname
 * "hilitos.co", which the pre-correction Vercel branch could produce by
 * string-interpolating an unparsed host).
 *
 * `varName` names the environment variable in every thrown message so a
 * misconfiguration is actionable at build time.
 */
function normalizeSiteOrigin(rawValue: string, varName: string): { origin: string; hostname: string } {
  let parsed: URL;
  try {
    parsed = new URL(rawValue);
  } catch {
    throw new Error(
      `${varName} is set to an invalid URL: ${JSON.stringify(rawValue)}. ` +
        'It must be an absolute origin, e.g. "https://hilitos.co" — no path, query ' +
        "string, or fragment.",
    );
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(
      `${varName} must use http or https, got ${JSON.stringify(parsed.protocol)} ` +
        `(value: ${JSON.stringify(rawValue)}).`,
    );
  }

  // WHATWG URL parsing already lowercases the host, so `hostname` and
  // `origin` below are consistently cased by construction.
  const hostname = parsed.hostname.toLowerCase();
  const isLocal = LOCAL_HOSTNAMES.has(hostname);

  if (parsed.protocol !== "https:" && !isLocal) {
    throw new Error(
      `${varName} must use https:// for a real public origin ` +
        `(value: ${JSON.stringify(rawValue)}). http:// is only accepted for localhost.`,
    );
  }

  // A non-default port is fine for local development (e.g.
  // http://localhost:4000) but never for a real public origin: robots.ts's
  // canonical check compares HOSTNAME, which excludes the port, so
  // "https://hilitos.co:8443" would otherwise be treated as the canonical
  // production domain and emit a sitemap of unreachable :8443 URLs.
  if (parsed.port !== "" && !isLocal) {
    throw new Error(
      `${varName} must not specify a port for a public origin ` +
        `(value: ${JSON.stringify(rawValue)}, found port ${JSON.stringify(parsed.port)}).`,
    );
  }

  if (parsed.pathname !== "/" && parsed.pathname !== "") {
    throw new Error(
      `${varName} must be an origin only, with no path ` +
        `(value: ${JSON.stringify(rawValue)}, found path ${JSON.stringify(parsed.pathname)}).`,
    );
  }
  if (parsed.search !== "" || parsed.hash !== "") {
    throw new Error(
      `${varName} must be an origin only, with no query string or fragment ` +
        `(value: ${JSON.stringify(rawValue)}).`,
    );
  }

  // parsed.origin is normalized by the WHATWG parser: lowercased host, no
  // trailing slash, no path/query/fragment.
  return { origin: parsed.origin, hostname };
}

function resolveVercelOrigin(env: SiteUrlEnv): ResolvedSiteUrl | null {
  if (!env.VERCEL) return null;

  // VERCEL_PROJECT_PRODUCTION_URL is set even in previews (see the header
  // note) — the VERCEL_ENV conjunct is what keeps a preview from resolving
  // to the production origin.
  const useProductionUrl = env.VERCEL_ENV?.trim() === "production" && Boolean(env.VERCEL_PROJECT_PRODUCTION_URL?.trim());
  const varName = useProductionUrl ? "VERCEL_PROJECT_PRODUCTION_URL" : "VERCEL_URL";
  const host = (useProductionUrl ? env.VERCEL_PROJECT_PRODUCTION_URL : env.VERCEL_URL)?.trim();

  if (!host) {
    throw new Error(
      "Running on Vercel (VERCEL is set) but neither VERCEL_PROJECT_PRODUCTION_URL nor " +
        "VERCEL_URL is available to derive a deployment origin, and NEXT_PUBLIC_SITE_URL " +
        "is not configured. Refusing to fall back to localhost for a Vercel deployment.",
    );
  }

  // Vercel supplies a bare host (no scheme). Route it through the same
  // normalizer the configured branch uses so origin/hostname agree and any
  // malformed value fails loudly rather than producing a broken origin.
  const { origin, hostname } = normalizeSiteOrigin(`https://${host}`, varName);
  return { origin, hostname, source: "vercel" };
}

/**
 * Resolve the public site origin. Reads `process.env` by default; pass an
 * explicit `env` (tests do) to avoid mutating global process.env.
 */
export function resolveSiteUrl(env: SiteUrlEnv = process.env as SiteUrlEnv): ResolvedSiteUrl {
  const configured = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    const { origin, hostname } = normalizeSiteOrigin(configured, "NEXT_PUBLIC_SITE_URL");
    return { origin, hostname, source: "configured" };
  }

  const vercelOrigin = resolveVercelOrigin(env);
  if (vercelOrigin) return vercelOrigin;

  return {
    origin: LOCALHOST_FALLBACK_ORIGIN,
    hostname: "localhost",
    source: "localhost",
  };
}
