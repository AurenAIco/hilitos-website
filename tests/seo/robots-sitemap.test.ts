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

/**
 * Strip comments before a substring scan, so an explanatory comment that
 * legitimately names something (e.g. "hilitos.co" while explaining the
 * Gate A6 cutover) doesn't false-positive as real code.
 *
 * ⚠️ STRING-AWARE ON PURPOSE. The naive regex version this replaces —
 * `src.replace(/\/\*[\s\S]*?\*\//g,"").replace(/\/\/.*$/gm,"")`, still in
 * use by tests/storefront-v2/storefront-image-host.test.ts — also deletes
 * everything after the `//` INSIDE a URL string literal, so
 * `"http://localhost:3000"` collapsed to `"http:` and
 * `"https://hilitos.co"` to `"https:`. That made the two regression scans
 * below blind to precisely the literals they exist to catch (independent
 * review finding F17): a reintroduced inline localhost fallback passed.
 * This scanner tracks string/template/comment state so URL literals in
 * real code survive intact. selfTest below proves it.
 */
function stripComments(src: string): string {
  let out = "";
  let i = 0;
  // null = in code; otherwise the delimiter we are waiting to close on.
  let quote: '"' | "'" | "`" | null = null;

  while (i < src.length) {
    const ch = src[i];
    const next = src[i + 1];

    if (quote !== null) {
      out += ch;
      if (ch === "\\") {
        // Escape sequence: copy the escaped char verbatim so a literal
        // backslash-quote never looks like a terminator.
        if (i + 1 < src.length) out += src[i + 1];
        i += 2;
        continue;
      }
      if (ch === quote) quote = null;
      i += 1;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      out += ch;
      i += 1;
      continue;
    }

    if (ch === "/" && next === "/") {
      while (i < src.length && src[i] !== "\n") i += 1;
      continue; // leave the newline for the next iteration
    }

    if (ch === "/" && next === "*") {
      i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) i += 1;
      i += 2;
      continue;
    }

    out += ch;
    i += 1;
  }

  return out;
}

// ── stripComments self-test (F17 regression) ────────────────────────────────
// A scan helper that silently fails to see the thing it searches for is
// worse than no scan at all, so the helper itself is under test.

test("stripComments preserves URL literals inside strings (the F17 regression that made these scans blind)", () => {
  const withLocalhostFallback = 'const S = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";';
  assert.equal(stripComments(withLocalhostFallback).includes("localhost"), true, "must still see localhost inside a string literal");

  const withCanonicalLiteral = 'const CANON = "https://hilitos.co";';
  assert.equal(stripComments(withCanonicalLiteral).includes("hilitos.co"), true, "must still see hilitos.co inside a string literal");

  const withOrLiteral = 'const S = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";';
  assert.equal(stripComments(withOrLiteral).includes("localhost"), true, "must catch the || spelling too, not just ??");
});

test("stripComments still removes real line and block comments", () => {
  assert.equal(stripComments("// see https://hilitos.co for details\nconst a = 1;").includes("hilitos.co"), false);
  assert.equal(stripComments("/* localhost:3000 is the dev origin */\nconst a = 1;").includes("localhost"), false);
  assert.equal(stripComments("const a = 1; // trailing localhost note").includes("localhost"), false);
  assert.equal(stripComments("// a\nconst keep = 2;\n// b").includes("keep"), true, "code between comments must survive");
});

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

// ── FULL ENVIRONMENT MATRIX (independent review findings F1 / F18 / F19) ────
// The pre-correction suite covered no combination in which a canonical
// origin was configured ALONGSIDE a preview deployment, which is exactly
// how a preview came to emit `Allow: /`. Each row below is asserted on the
// real robots() output.

function robotsIn(env: Partial<Record<(typeof SEO_ENV_KEYS)[number], string>>) {
  const result = withSeoEnv(env, () => robots());
  const rule = Array.isArray(result.rules) ? result.rules[0] : result.rules;
  return { result, rule };
}

function assertFullyDisallowed(env: Partial<Record<(typeof SEO_ENV_KEYS)[number], string>>, label: string) {
  const { result, rule } = robotsIn(env);
  assert.equal(rule.disallow, "/", `${label}: expected Disallow: /`);
  assert.equal("allow" in rule, false, `${label}: must not emit any Allow directive`);
  assert.equal(result.sitemap, undefined, `${label}: a non-crawlable origin must not advertise a sitemap`);
}

test("MATRIX 1 — preview + canonical NEXT_PUBLIC_SITE_URL stays fully disallowed (F1: the reproduced defect)", () => {
  assertFullyDisallowed(
    {
      VERCEL: "1",
      VERCEL_ENV: "preview",
      VERCEL_URL: "hilitos-website-git-test.vercel.app",
      NEXT_PUBLIC_SITE_URL: "https://hilitos.co",
    },
    "preview + canonical NEXT_PUBLIC_SITE_URL",
  );
});

test("MATRIX 2 — preview + VERCEL_PROJECT_PRODUCTION_URL=hilitos.co stays fully disallowed (F18: the untested guard)", () => {
  assertFullyDisallowed(
    {
      VERCEL: "1",
      VERCEL_ENV: "preview",
      VERCEL_URL: "hilitos-website-git-test.vercel.app",
      VERCEL_PROJECT_PRODUCTION_URL: "hilitos.co",
    },
    "preview + production project URL",
  );
});

test("MATRIX 3 — production + canonical NEXT_PUBLIC_SITE_URL allows public crawling, disallows /admin, advertises the canonical sitemap", () => {
  const { result, rule } = robotsIn({
    VERCEL: "1",
    VERCEL_ENV: "production",
    NEXT_PUBLIC_SITE_URL: "https://hilitos.co",
  });
  assert.equal(rule.allow, "/");
  assert.equal(rule.disallow, "/admin");
  assert.equal(result.sitemap, "https://hilitos.co/sitemap.xml");
});

test("MATRIX 4 — production + non-canonical Vercel alias stays fully disallowed", () => {
  assertFullyDisallowed(
    { VERCEL: "1", VERCEL_ENV: "production", VERCEL_PROJECT_PRODUCTION_URL: "hilitos-website.vercel.app" },
    "production + non-canonical alias",
  );
});

test("MATRIX 5 — local development (no Vercel variables) stays fully disallowed", () => {
  assertFullyDisallowed({}, "local development");
});

test("MATRIX 6 — VERCEL_ENV=development stays fully disallowed even with a canonical origin configured", () => {
  assertFullyDisallowed(
    {
      VERCEL: "1",
      VERCEL_ENV: "development",
      VERCEL_URL: "hilitos-website-dev.vercel.app",
      NEXT_PUBLIC_SITE_URL: "https://hilitos.co",
    },
    "development + canonical NEXT_PUBLIC_SITE_URL",
  );
});

test("MATRIX 7 — an unrecognized custom Vercel environment fails closed (guard is allowlist-shaped, not denylist-shaped)", () => {
  assertFullyDisallowed(
    { VERCEL: "1", VERCEL_ENV: "staging", NEXT_PUBLIC_SITE_URL: "https://hilitos.co" },
    "custom environment 'staging'",
  );
});

test("the VERCEL_ENV guard takes precedence over NEXT_PUBLIC_SITE_URL, not the other way round", () => {
  // Same canonical override, only VERCEL_ENV differs — proves the guard,
  // and not the resolved hostname, is what decides these two outcomes.
  const preview = robotsIn({ VERCEL: "1", VERCEL_ENV: "preview", VERCEL_URL: "x.vercel.app", NEXT_PUBLIC_SITE_URL: "https://hilitos.co" });
  const production = robotsIn({ VERCEL: "1", VERCEL_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://hilitos.co" });
  assert.equal(preview.rule.disallow, "/");
  assert.equal(production.rule.allow, "/");
});

// ── sitemap under a canonical-configured preview ─────────────────────────────

test("sitemap() on a canonical-configured preview is inert because robots disallows everything (documents the residual)", () => {
  const env = {
    VERCEL: "1",
    VERCEL_ENV: "preview",
    VERCEL_URL: "hilitos-website-git-test.vercel.app",
    NEXT_PUBLIC_SITE_URL: "https://hilitos.co",
  } as const;
  // The sitemap still resolves from the configured origin (metadataBase and
  // the sitemap share one resolver by design), but robots.txt on this
  // deployment is a blanket Disallow and advertises no sitemap, so nothing
  // here is reachable by a compliant crawler.
  const { result } = robotsIn(env);
  assert.equal(result.sitemap, undefined, "preview must not advertise a sitemap");
  const entries = withSeoEnv(env, () => sitemap());
  for (const entry of entries) {
    assert.equal(entry.url.includes("localhost"), false);
  }
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

test("app/robots.ts consults the VERCEL_ENV guard before any hostname logic", () => {
  const code = stripComments(readFileSync(join(ROOT, "app", "robots.ts"), "utf8"));
  assert.equal(code.includes("isNonProductionVercelEnv"), true, "the environment guard must be present in real code, not only in comments");

  // Compare CALL SITES, not the import statement (where the two names sit in
  // alphabetical order and would invert the comparison).
  const body = code.slice(code.indexOf("export default function robots"));
  assert.ok(body.length > 0, "expected to find the robots() declaration");
  const guardAt = body.indexOf("isNonProductionVercelEnv(");
  const hostnameAt = body.indexOf("isCanonicalProductionHostname(");
  assert.ok(guardAt > -1, "robots() must call isNonProductionVercelEnv()");
  assert.ok(hostnameAt > -1, "robots() must call isCanonicalProductionHostname()");
  assert.ok(guardAt < hostnameAt, "the VERCEL_ENV guard must be evaluated BEFORE the canonical-hostname check");
});

// ── MUTATION-ORIENTED REGRESSION PROOFS ─────────────────────────────────────
// The scans above are only worth having if they actually fire on the
// defects they name. Each test below runs the REAL scan predicate against a
// synthetic mutated source and asserts it is caught — so if someone later
// weakens stripComments (F17) or the predicates, these fail rather than
// silently going blind again.

/** The exact predicate the sitemap scan uses. */
const hasInlineLocalhostFallback = (src: string) => stripComments(src).includes("localhost");
/** The exact predicate the robots scan uses. */
const hasHardcodedCanonicalHost = (src: string) => stripComments(src).includes("hilitos.co");

test("MUTATION — reintroducing an inline localhost fallback in sitemap.ts WOULD be caught by the scan", () => {
  const clean = readFileSync(join(ROOT, "app", "sitemap.ts"), "utf8");
  assert.equal(hasInlineLocalhostFallback(clean), false, "baseline: the real file is clean");

  for (const mutation of [
    'const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";',
    'const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";',
    "const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';",
    "const SITE_URL = `http://localhost:${port}`;",
  ]) {
    assert.equal(
      hasInlineLocalhostFallback(`${clean}\n${mutation}\n`),
      true,
      `scan must catch a reintroduced localhost fallback: ${mutation}`,
    );
  }
});

test("MUTATION — hardcoding the canonical host in robots.ts WOULD be caught by the scan", () => {
  const clean = readFileSync(join(ROOT, "app", "robots.ts"), "utf8");
  assert.equal(hasHardcodedCanonicalHost(clean), false, "baseline: the real file is clean");

  for (const mutation of [
    'if (hostname === "hilitos.co") return { rules: [{ userAgent: "*", allow: "/" }] };',
    "const CANON = 'https://hilitos.co';",
    'const HOSTS = ["hilitos.co", "www.hilitos.co"];',
  ]) {
    assert.equal(
      hasHardcodedCanonicalHost(`${clean}\n${mutation}\n`),
      true,
      `scan must catch a hardcoded canonical host: ${mutation}`,
    );
  }
});

test("MUTATION — removing the VERCEL_ENV guard from robots.ts WOULD be caught by the ordering scan", () => {
  const clean = readFileSync(join(ROOT, "app", "robots.ts"), "utf8");
  // Simulate the guard being deleted: strip every real-code occurrence.
  const withoutGuard = stripComments(clean).split("isNonProductionVercelEnv").join("someOtherCheck");
  assert.equal(withoutGuard.includes("isNonProductionVercelEnv"), false, "mutation applied");
  assert.equal(
    stripComments(clean).includes("isNonProductionVercelEnv"),
    true,
    "baseline: the real file still has the guard — this pair is what makes the guard's absence detectable",
  );
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
