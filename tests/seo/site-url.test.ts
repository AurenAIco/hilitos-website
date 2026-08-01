// tests/seo/site-url.test.ts — S7A (SEO foundation).
//
// Direct behavioral unit tests of lib/seo/siteUrl.ts — the resolver every
// SEO surface (app/layout.tsx, app/robots.ts, app/sitemap.ts) depends on.
// Pure functions, no Next.js/React runtime import, same style as
// tests/storefront-v2/storefront-image-host.test.ts's tests for
// resolveStorefrontImageHost.
import test from "node:test";
import assert from "node:assert/strict";
import {
  CANONICAL_PRODUCTION_HOSTNAMES,
  isCanonicalProductionHostname,
  isNonProductionVercelEnv,
  resolveSiteUrl,
  type SiteUrlEnv,
} from "@/lib/seo/siteUrl";

// ── Canonical Hilitos URL normalization ─────────────────────────────────────

test("resolveSiteUrl normalizes a configured canonical Hilitos URL", () => {
  const result = resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://hilitos.co" });
  assert.equal(result.origin, "https://hilitos.co");
  assert.equal(result.hostname, "hilitos.co");
  assert.equal(result.source, "configured");
});

test("resolveSiteUrl lowercases an uppercase/mixed-case configured hostname", () => {
  const result = resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://HILITOS.CO" });
  assert.equal(result.origin, "https://hilitos.co");
  assert.equal(result.hostname, "hilitos.co");
});

test("resolveSiteUrl accepts www.hilitos.co as a distinct valid configured origin", () => {
  const result = resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://www.hilitos.co" });
  assert.equal(result.origin, "https://www.hilitos.co");
  assert.equal(result.hostname, "www.hilitos.co");
});

// ── Trailing slash removal ───────────────────────────────────────────────────

test("resolveSiteUrl strips a trailing slash from a configured origin", () => {
  const result = resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://hilitos.co/" });
  assert.equal(result.origin, "https://hilitos.co");
  assert.equal(result.origin.endsWith("/"), false);
});

// ── Malformed URL rejection ──────────────────────────────────────────────────

const MALFORMED_CONFIGURED_URLS: Array<[label: string, value: string]> = [
  ["no scheme", "hilitos.co"],
  ["non-http(s) scheme", "ftp://hilitos.co"],
  ["http on a real public host", "http://hilitos.co"],
  ["path", "https://hilitos.co/tienda"],
  ["query string", "https://hilitos.co?utm=1"],
  ["fragment", "https://hilitos.co#top"],
  ["not a URL at all", "not a url"],
];

for (const [label, value] of MALFORMED_CONFIGURED_URLS) {
  test(`resolveSiteUrl throws a clear error for a malformed NEXT_PUBLIC_SITE_URL (${label})`, () => {
    assert.throws(
      () => resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: value }),
      (err: unknown) => err instanceof Error && err.message.includes("NEXT_PUBLIC_SITE_URL"),
    );
  });
}

test("resolveSiteUrl treats an empty/whitespace-only NEXT_PUBLIC_SITE_URL as unset, not malformed", () => {
  assert.doesNotThrow(() => resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "" }));
  assert.doesNotThrow(() => resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "   " }));
  assert.equal(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "" }).source, "localhost");
});

// ── Vercel preview/production origin fallback ────────────────────────────────

test("resolveSiteUrl falls back to VERCEL_URL on a Vercel preview deployment", () => {
  const env: SiteUrlEnv = {
    VERCEL: "1",
    VERCEL_ENV: "preview",
    VERCEL_URL: "hilitos-website-git-fix-seo-abc123.vercel.app",
  };
  const result = resolveSiteUrl(env);
  assert.equal(result.origin, "https://hilitos-website-git-fix-seo-abc123.vercel.app");
  assert.equal(result.hostname, "hilitos-website-git-fix-seo-abc123.vercel.app");
  assert.equal(result.source, "vercel");
});

test("resolveSiteUrl prefers VERCEL_PROJECT_PRODUCTION_URL over VERCEL_URL on a Vercel production deployment", () => {
  const env: SiteUrlEnv = {
    VERCEL: "1",
    VERCEL_ENV: "production",
    VERCEL_URL: "hilitos-website-abc123.vercel.app",
    VERCEL_PROJECT_PRODUCTION_URL: "hilitos-website.vercel.app",
  };
  const result = resolveSiteUrl(env);
  assert.equal(result.origin, "https://hilitos-website.vercel.app");
  assert.equal(result.source, "vercel");
});

test("resolveSiteUrl uses VERCEL_URL when VERCEL_ENV is production but VERCEL_PROJECT_PRODUCTION_URL is absent", () => {
  const env: SiteUrlEnv = {
    VERCEL: "1",
    VERCEL_ENV: "production",
    VERCEL_URL: "hilitos-website-abc123.vercel.app",
  };
  assert.equal(resolveSiteUrl(env).origin, "https://hilitos-website-abc123.vercel.app");
});

test("NEXT_PUBLIC_SITE_URL overrides Vercel-derived origins when both are present", () => {
  const env: SiteUrlEnv = {
    NEXT_PUBLIC_SITE_URL: "https://hilitos.co",
    VERCEL: "1",
    VERCEL_ENV: "production",
    VERCEL_PROJECT_PRODUCTION_URL: "hilitos-website.vercel.app",
  };
  const result = resolveSiteUrl(env);
  assert.equal(result.origin, "https://hilitos.co");
  assert.equal(result.source, "configured");
});

test("resolveSiteUrl throws rather than falling back to localhost when on Vercel with no usable origin var", () => {
  assert.throws(
    () => resolveSiteUrl({ VERCEL: "1" }),
    (err: unknown) => err instanceof Error && err.message.includes("VERCEL"),
  );
});

// ── Localhost restricted to (explicit) local development ────────────────────

test("resolveSiteUrl falls back to localhost when nothing is configured and not running on Vercel", () => {
  const result = resolveSiteUrl({});
  assert.equal(result.origin, "http://localhost:3000");
  assert.equal(result.hostname, "localhost");
  assert.equal(result.source, "localhost");
});

test("resolveSiteUrl never returns localhost when VERCEL is set, even without NEXT_PUBLIC_SITE_URL", () => {
  assert.throws(() => resolveSiteUrl({ VERCEL: "1" }));
  // Confirms the only way to reach the localhost branch is the total
  // absence of VERCEL — never a silent fallback while actually deployed.
});

test("resolveSiteUrl accepts an explicit http://localhost override", () => {
  const result = resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "http://localhost:4000" });
  assert.equal(result.origin, "http://localhost:4000");
  assert.equal(result.source, "configured");
});

// ── resolveSiteUrl output is always a valid absolute origin (metadataBase) ──

test("resolveSiteUrl's origin is always usable directly with `new URL()` (what app/layout.tsx's metadataBase does)", () => {
  const cases: SiteUrlEnv[] = [
    { NEXT_PUBLIC_SITE_URL: "https://hilitos.co" },
    { VERCEL: "1", VERCEL_ENV: "preview", VERCEL_URL: "preview-x.vercel.app" },
    {},
  ];
  for (const env of cases) {
    const { origin } = resolveSiteUrl(env);
    assert.doesNotThrow(() => new URL(origin));
  }
});

// ── isCanonicalProductionHostname ────────────────────────────────────────────

test("isCanonicalProductionHostname is true only for hilitos.co and www.hilitos.co", () => {
  assert.equal(isCanonicalProductionHostname("hilitos.co"), true);
  assert.equal(isCanonicalProductionHostname("www.hilitos.co"), true);
  assert.equal(isCanonicalProductionHostname("HILITOS.CO"), true, "must be case-insensitive");
  assert.equal(isCanonicalProductionHostname("hilitos-website.vercel.app"), false);
  assert.equal(isCanonicalProductionHostname("hilitos-website-git-preview.vercel.app"), false);
  assert.equal(isCanonicalProductionHostname("localhost"), false);
  assert.equal(isCanonicalProductionHostname("nothilitos.co"), false);
  assert.equal(isCanonicalProductionHostname("evil-hilitos.co"), false);
});

test("CANONICAL_PRODUCTION_HOSTNAMES contains exactly the two real Hilitos domains", () => {
  assert.deepEqual([...CANONICAL_PRODUCTION_HOSTNAMES].sort(), ["hilitos.co", "www.hilitos.co"]);
});

// ── isNonProductionVercelEnv (the crawl-safety guard, F18) ──────────────────

test("isNonProductionVercelEnv is true for preview, development, and any custom environment", () => {
  assert.equal(isNonProductionVercelEnv({ VERCEL_ENV: "preview" }), true);
  assert.equal(isNonProductionVercelEnv({ VERCEL_ENV: "development" }), true);
  assert.equal(isNonProductionVercelEnv({ VERCEL_ENV: "staging" }), true, "unknown environments must fail closed");
});

test("isNonProductionVercelEnv is false for production and when off-Vercel", () => {
  assert.equal(isNonProductionVercelEnv({ VERCEL_ENV: "production" }), false);
  assert.equal(isNonProductionVercelEnv({}), false, "off-Vercel is handled by the hostname check, not this guard");
  assert.equal(isNonProductionVercelEnv({ VERCEL_ENV: "  " }), false, "whitespace-only is treated as unset");
});

// ── Origin normalization hardening (F3 / F5) ────────────────────────────────

test("a mixed-case configured hostname normalizes to a lowercase origin", () => {
  for (const value of ["https://HILITOS.CO", "https://HiLiToS.Co", "https://WWW.HILITOS.CO"]) {
    const { origin, hostname } = resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: value });
    assert.equal(origin, origin.toLowerCase(), `origin must be lowercase for ${value}`);
    assert.equal(hostname, hostname.toLowerCase());
    assert.equal(origin.endsWith(hostname), true, `origin (${origin}) and hostname (${hostname}) must agree`);
  }
  assert.equal(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://HILITOS.CO" }).origin, "https://hilitos.co");
});

test("a mixed-case Vercel-supplied host normalizes too — origin and hostname can never disagree (F5)", () => {
  const { origin, hostname } = resolveSiteUrl({
    VERCEL: "1",
    VERCEL_ENV: "production",
    VERCEL_PROJECT_PRODUCTION_URL: "HILITOS.CO",
  });
  assert.equal(origin, "https://hilitos.co");
  assert.equal(hostname, "hilitos.co");
  assert.equal(origin.endsWith(hostname), true);
});

test("a Vercel host arriving with a trailing slash or surrounding whitespace is normalized, not concatenated blindly (F5)", () => {
  assert.equal(
    resolveSiteUrl({ VERCEL: "1", VERCEL_ENV: "preview", VERCEL_URL: "preview-x.vercel.app/" }).origin,
    "https://preview-x.vercel.app",
  );
  assert.equal(
    resolveSiteUrl({ VERCEL: "1", VERCEL_ENV: "preview", VERCEL_URL: "  preview-x.vercel.app  " }).origin,
    "https://preview-x.vercel.app",
  );
});

test("a port on a public origin is rejected, so it can never masquerade as the canonical domain (F3)", () => {
  assert.throws(
    () => resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://hilitos.co:8443" }),
    (err: unknown) => err instanceof Error && err.message.includes("port"),
  );
});

test("a port on localhost is still allowed (local development convenience)", () => {
  assert.equal(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "http://localhost:4000" }).origin, "http://localhost:4000");
});

test("every resolvable origin is free of path, query, fragment and trailing slash", () => {
  const cases: SiteUrlEnv[] = [
    { NEXT_PUBLIC_SITE_URL: "https://hilitos.co/" },
    { NEXT_PUBLIC_SITE_URL: "https://HILITOS.CO" },
    { VERCEL: "1", VERCEL_ENV: "preview", VERCEL_URL: "preview-x.vercel.app" },
    { VERCEL: "1", VERCEL_ENV: "production", VERCEL_PROJECT_PRODUCTION_URL: "hilitos.co" },
    {},
  ];
  for (const env of cases) {
    const { origin } = resolveSiteUrl(env);
    assert.equal(origin.endsWith("/"), false, `trailing slash in ${origin}`);
    assert.equal(origin.includes("?"), false);
    assert.equal(origin.includes("#"), false);
    // exactly one "//" — the scheme separator; no stray path segment
    assert.equal(origin.split("/").length, 3, `unexpected path segment in ${origin}`);
    assert.equal(new URL(origin).origin, origin, "origin must be its own normalized form");
  }
});

test("VERCEL_PROJECT_PRODUCTION_URL is ignored on a preview deployment even though Vercel sets it there (F2/F18)", () => {
  // Vercel sets this variable on EVERY deployment, previews included. If the
  // production guard in resolveVercelOrigin were dropped, this would resolve
  // to https://hilitos.co and light up the canonical check.
  const { origin, hostname } = resolveSiteUrl({
    VERCEL: "1",
    VERCEL_ENV: "preview",
    VERCEL_URL: "hilitos-website-git-test.vercel.app",
    VERCEL_PROJECT_PRODUCTION_URL: "hilitos.co",
  });
  assert.equal(origin, "https://hilitos-website-git-test.vercel.app");
  assert.equal(isCanonicalProductionHostname(hostname), false);
});
