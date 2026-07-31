// tests/seo/robots-sitemap.test.ts — S7A (SEO foundation).
//
// app/robots.ts and app/sitemap.ts are plain, non-JSX metadata route files
// (only a type-only `import type { MetadataRoute } from "next"`, erased at
// compile time, plus lib/seo/siteUrl.ts) — unlike components/pages, they
// pull in no React/Next runtime, so — unlike
// tests/storefront-v2/seam-isolation.test.ts's app/** blanket avoidance —
// importing and calling them directly here is safe and gives real
// behavioral proof instead of a text-pattern guess. app/layout.tsx (JSX +
// next/font/google) is NOT imported for the same reason seam-isolation.ts
// avoids app/**: it is covered by static-scan below instead.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

const ROOT = process.cwd();

/** Strip `//` line comments and `/* *\/` block comments before a substring
 * scan, so an explanatory comment that legitimately names something (e.g.
 * "hilitos.co" while explaining the Gate A6 cutover) doesn't false-positive
 * as a real code-level duplication. Same helper as
 * tests/storefront-v2/storefront-image-host.test.ts. */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

function withEnv<T>(vars: Record<string, string | undefined>, fn: () => T): T {
  const original: Record<string, string | undefined> = {};
  for (const key of Object.keys(vars)) {
    original[key] = process.env[key];
    if (vars[key] === undefined) delete process.env[key];
    else process.env[key] = vars[key];
  }
  try {
    return fn();
  } finally {
    for (const key of Object.keys(original)) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
  }
}

// Every env var either module reads, always reset together so one test can
// never leak state into the next.
const SEO_ENV_KEYS = [
  "NEXT_PUBLIC_SITE_URL",
  "VERCEL",
  "VERCEL_ENV",
  "VERCEL_URL",
  "VERCEL_PROJECT_PRODUCTION_URL",
] as const;

function withSeoEnv<T>(vars: Partial<Record<(typeof SEO_ENV_KEYS)[number], string>>, fn: () => T): T {
  const full: Record<string, string | undefined> = {};
  for (const key of SEO_ENV_KEYS) full[key] = vars[key];
  return withEnv(full, fn);
}

// ── robots: allow on canonical Hilitos domain ────────────────────────────────

test("robots() allows crawling and references the sitemap on the canonical hilitos.co domain", () => {
  const result = withSeoEnv({ NEXT_PUBLIC_SITE_URL: "https://hilitos.co" }, () => robots());
  assert.equal(result.sitemap, "https://hilitos.co/sitemap.xml");
  const rule = Array.isArray(result.rules) ? result.rules[0] : result.rules;
  assert.equal(rule.allow, "/");
  assert.equal(rule.disallow, "/admin");
});

test("robots() allows crawling on the www subdomain too", () => {
  const result = withSeoEnv({ NEXT_PUBLIC_SITE_URL: "https://www.hilitos.co" }, () => robots());
  const rule = Array.isArray(result.rules) ? result.rules[0] : result.rules;
  assert.equal(rule.allow, "/");
});

// ── robots: disallow on preview/local origins ────────────────────────────────

test("robots() disallows everything on a Vercel preview deployment", () => {
  const result = withSeoEnv(
    { VERCEL: "1", VERCEL_ENV: "preview", VERCEL_URL: "hilitos-website-git-x.vercel.app" },
    () => robots(),
  );
  const rule = Array.isArray(result.rules) ? result.rules[0] : result.rules;
  assert.equal(rule.disallow, "/");
  assert.equal("allow" in rule, false);
  assert.equal("sitemap" in result, false);
});

test("robots() disallows everything on this project's own Vercel production alias (not the real custom domain)", () => {
  const result = withSeoEnv(
    { VERCEL: "1", VERCEL_ENV: "production", VERCEL_PROJECT_PRODUCTION_URL: "hilitos-website.vercel.app" },
    () => robots(),
  );
  const rule = Array.isArray(result.rules) ? result.rules[0] : result.rules;
  assert.equal(rule.disallow, "/");
});

test("robots() disallows everything in local development (no env configured)", () => {
  const result = withSeoEnv({}, () => robots());
  const rule = Array.isArray(result.rules) ? result.rules[0] : result.rules;
  assert.equal(rule.disallow, "/");
});

// ── sitemap: no admin route, no localhost in production-like config ────────

test("sitemap() contains no /admin route", () => {
  const entries = withSeoEnv({ NEXT_PUBLIC_SITE_URL: "https://hilitos.co" }, () => sitemap());
  for (const entry of entries) {
    assert.equal(entry.url.includes("/admin"), false, `sitemap entry must not reference /admin: ${entry.url}`);
  }
});

test("sitemap() contains no localhost URL when NEXT_PUBLIC_SITE_URL is configured (production-like)", () => {
  const entries = withSeoEnv({ NEXT_PUBLIC_SITE_URL: "https://hilitos.co" }, () => sitemap());
  assert.ok(entries.length > 0);
  for (const entry of entries) {
    assert.equal(entry.url.startsWith("https://hilitos.co"), true, `unexpected origin in sitemap entry: ${entry.url}`);
    assert.equal(entry.url.includes("localhost"), false);
  }
});

test("sitemap() contains no localhost URL on a Vercel deployment either", () => {
  const entries = withSeoEnv(
    { VERCEL: "1", VERCEL_ENV: "preview", VERCEL_URL: "hilitos-website-git-x.vercel.app" },
    () => sitemap(),
  );
  for (const entry of entries) {
    assert.equal(entry.url.includes("localhost"), false);
    assert.equal(entry.url.startsWith("https://hilitos-website-git-x.vercel.app"), true);
  }
});

test("sitemap() only lists localhost URLs in the explicit local-development fallback", () => {
  const entries = withSeoEnv({}, () => sitemap());
  for (const entry of entries) {
    assert.equal(entry.url.startsWith("http://localhost:3000"), true);
  }
});

test("sitemap() never invents a /productos or /colecciones detail URL", () => {
  const entries = withSeoEnv({ NEXT_PUBLIC_SITE_URL: "https://hilitos.co" }, () => sitemap());
  for (const entry of entries) {
    assert.equal(/\/productos\/.+/.test(entry.url), false, `sitemap must not invent a product URL: ${entry.url}`);
    assert.equal(/\/colecciones\/.+/.test(entry.url), false, `sitemap must not invent a collection URL: ${entry.url}`);
  }
});

// ── Static-scan: app/robots.ts routes its decision through the single ──────
// shared canonical-hostname primitive, no duplicated inline domain list.

test("app/robots.ts computes crawlability exclusively via isCanonicalProductionHostname from lib/seo/siteUrl", () => {
  const src = readFileSync(join(ROOT, "app", "robots.ts"), "utf8");
  assert.equal(src.includes("isCanonicalProductionHostname"), true);
  assert.equal(src.includes("@/lib/seo/siteUrl"), true);
  const code = stripComments(src);
  assert.equal(code.includes("hilitos.co"), false, "robots.ts must not hardcode its own copy of the domain outside comments — single source of truth is lib/seo/siteUrl.ts");
});

// ── Static-scan: app/layout.tsx wiring (JSX/next-font file — not imported) ──

test("app/layout.tsx resolves metadataBase via lib/seo/siteUrl, not a raw process.env fallback literal", () => {
  const src = readFileSync(join(ROOT, "app", "layout.tsx"), "utf8");
  assert.equal(src.includes("resolveSiteUrl"), true);
  assert.equal(src.includes("@/lib/seo/siteUrl"), true);
  assert.equal(
    /process\.env\.NEXT_PUBLIC_SITE_URL\s*\?\?\s*["']http:\/\/localhost:3000["']/.test(src),
    false,
    "must not reintroduce the old inline localhost-fallback literal",
  );
});

test("app/layout.tsx declares Open Graph and Twitter defaults with locale es_CO", () => {
  const src = readFileSync(join(ROOT, "app", "layout.tsx"), "utf8");
  assert.equal(src.includes("es_CO"), true);
  assert.equal(src.includes("openGraph"), true);
  assert.equal(src.includes("twitter"), true);
});

test("app/layout.tsx declares a viewport export with themeColor", () => {
  const src = readFileSync(join(ROOT, "app", "layout.tsx"), "utf8");
  assert.equal(/export const viewport/.test(src), true);
  assert.equal(/themeColor/.test(src), true);
});

test("app/layout.tsx does not use a fixture or product photo as a social-preview image", () => {
  const src = readFileSync(join(ROOT, "app", "layout.tsx"), "utf8");
  for (const forbidden of ["fixtures/products", "placeholder-a", "placeholder-b", "/brand/craft", "/brand/hero", "/brand/nosotros"]) {
    assert.equal(src.includes(forbidden), false, `app/layout.tsx must not reference "${forbidden}" as a social-preview image`);
  }
});

// ── Static-scan: no route file in the S7A boundary re-implements its own ───
// site-origin fallback instead of importing the shared resolver.

test("app/sitemap.ts resolves its origin exclusively via lib/seo/siteUrl (no independent localhost literal)", () => {
  const src = readFileSync(join(ROOT, "app", "sitemap.ts"), "utf8");
  assert.equal(src.includes("resolveSiteUrl"), true);
  const code = stripComments(src);
  assert.equal(code.includes("localhost"), false, "sitemap.ts must not keep its own inline localhost fallback outside comments");
});
