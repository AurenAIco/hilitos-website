// tests/storefront-v2/storefront-image-host.test.ts — WAVE 3 surgical
// correction (Wave-1 review V-1/V-5/V-6, feeds Decision Log #4).
//
// Two things are proven here:
//  1. resolveStorefrontImageHost/isBareHostname (lib/catalog/
//     storefrontImageHost.ts) — the fail-closed hostname validation
//     contract itself: absent -> fallback, valid -> passthrough, malformed
//     -> throws with a clear message. Pure functions, safe to import
//     directly (no Next.js/React runtime pulled in), same style as this
//     repo's other node:test files.
//  2. A static-scan regression guard (mirrors seam-isolation.test.ts's
//     style: read source as text, do NOT import app/**/components/** into
//     node:test) proving the V-1 fix stays fixed — the Client Component
//     VariantSelector must never import lib/catalog/storefront.ts (or the
//     new lib/catalog/storefrontImageHost.ts) or read
//     process.env.STOREFRONT_IMAGE_HOST directly, and next.config.ts must
//     compute its hostname through the same shared helper the request-time
//     URL builder uses (closes V-6: no independent duplicated fallback
//     literal left in either file).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  isBareHostname,
  resolveStorefrontImageHost,
  STOREFRONT_IMAGE_HOST_FALLBACK,
} from "@/lib/catalog/storefrontImageHost";
import { buildStorefrontImageUrl } from "@/lib/catalog/storefront";

const ROOT = process.cwd();

/** Strip `//` line comments and `/* *\/` block comments before a substring
 * scan, so an explanatory comment that legitimately *names* something
 * forbidden (e.g. this file's own doc comments explaining what VariantSelector
 * must no longer do) doesn't false-positive as a real reference. Good enough
 * for this repo's source style; not a general-purpose tokenizer. */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

// ── resolveStorefrontImageHost / isBareHostname ─────────────────────────────

test("resolveStorefrontImageHost falls back to the placeholder when unset", () => {
  assert.equal(resolveStorefrontImageHost(undefined), STOREFRONT_IMAGE_HOST_FALLBACK);
});

test("resolveStorefrontImageHost falls back to the placeholder when empty/whitespace-only", () => {
  assert.equal(resolveStorefrontImageHost(""), STOREFRONT_IMAGE_HOST_FALLBACK);
  assert.equal(resolveStorefrontImageHost("   "), STOREFRONT_IMAGE_HOST_FALLBACK);
});

test("resolveStorefrontImageHost passes through a valid bare hostname (trimmed)", () => {
  assert.equal(resolveStorefrontImageHost("cdn.example.com"), "cdn.example.com");
  assert.equal(resolveStorefrontImageHost("  cdn.example.com  "), "cdn.example.com");
});

test("resolveStorefrontImageHost normalizes an uppercase or mixed-case hostname to lowercase (independent review finding B-1)", () => {
  // DNS hostnames are case-insensitive, but next/image's remotePatterns
  // hostname match (picomatch, no `nocase`) is case-SENSITIVE while WHATWG
  // URL.hostname lowercases every runtime image URL. Without this
  // normalization, an uppercase configured value passes validation and the
  // build succeeds, but every request-time image URL fails the allowlist
  // match and 400s — silent at build time, broken at runtime.
  assert.equal(resolveStorefrontImageHost("CDN.EXAMPLE.COM"), "cdn.example.com");
  assert.equal(resolveStorefrontImageHost("Cdn.Example.Com"), "cdn.example.com");
  assert.equal(resolveStorefrontImageHost("  CDN.EXAMPLE.COM  "), "cdn.example.com");
});

const MALFORMED_CASES: Array<[label: string, value: string]> = [
  ["scheme", "https://cdn.example.com"],
  ["port", "cdn.example.com:8443"],
  ["pathname", "cdn.example.com/images"],
  ["query", "cdn.example.com?x=1"],
  ["fragment", "cdn.example.com#x"],
  ["interior whitespace", "cdn example.com"],
];

for (const [label, value] of MALFORMED_CASES) {
  test(`resolveStorefrontImageHost throws a clear error for a malformed hostname (${label})`, () => {
    assert.throws(
      () => resolveStorefrontImageHost(value),
      (err: unknown) => err instanceof Error && err.message.includes("STOREFRONT_IMAGE_HOST"),
    );
  });

  test(`isBareHostname rejects the same malformed case (${label})`, () => {
    assert.equal(isBareHostname(value), false);
  });
}

test("isBareHostname accepts a plain multi-label hostname", () => {
  assert.equal(isBareHostname("cdn.example.com"), true);
});

// ── Static-scan regression guard (V-1 / V-6) ────────────────────────────────

test("VariantSelector (Client Component) does not import the server-only storefront image-host modules", () => {
  const src = readFileSync(
    join(ROOT, "components", "product", "VariantSelector.tsx"),
    "utf8",
  );
  assert.equal(src.includes('"use client"'), true, "expected this file to still be a Client Component");
  const code = stripComments(src);
  for (const forbidden of [
    "lib/catalog/storefront\"",
    "lib/catalog/storefrontImageHost",
    "buildStorefrontImageUrl",
    "STOREFRONT_IMAGE_HOST",
    "process.env",
  ]) {
    assert.equal(
      code.includes(forbidden),
      false,
      `VariantSelector.tsx must not reference "${forbidden}" outside of comments (V-1 regression)`,
    );
  }
});

test("next.config.ts and buildStorefrontImageUrl resolve STOREFRONT_IMAGE_HOST through the same shared helper", () => {
  const configSrc = readFileSync(join(ROOT, "next.config.ts"), "utf8");
  const storefrontSrc = readFileSync(join(ROOT, "lib", "catalog", "storefront.ts"), "utf8");

  assert.equal(
    configSrc.includes("resolveStorefrontImageHost"),
    true,
    "next.config.ts must compute the hostname via resolveStorefrontImageHost",
  );
  assert.equal(
    storefrontSrc.includes("resolveStorefrontImageHost"),
    true,
    "buildStorefrontImageUrl must compute the hostname via resolveStorefrontImageHost",
  );

  // V-6 regression guard: neither file may keep its own independent inline
  // fallback-literal-or expression — that duplication (with no proof the
  // two stay equal) was the drift risk in the first place.
  const duplicatedFallbackPattern = /process\.env\.STOREFRONT_IMAGE_HOST\?\.trim\(\)\s*\|\|/;
  assert.equal(duplicatedFallbackPattern.test(configSrc), false, "next.config.ts must not re-inline the fallback expression");
  assert.equal(duplicatedFallbackPattern.test(storefrontSrc), false, "storefront.ts must not re-inline the fallback expression");
});

test("an uppercase STOREFRONT_IMAGE_HOST resolves to the identical lowercase hostname in buildStorefrontImageUrl as in resolveStorefrontImageHost directly (independent review finding B-1)", () => {
  // Exercises the REAL production function (not a source-text scan). Since
  // next.config.ts's remotePatterns and buildStorefrontImageUrl are both
  // proven above to compute the hostname exclusively via
  // resolveStorefrontImageHost — no independent inline fallback/normalization
  // in either file — this one shared function's normalization is what
  // guarantees both call sites can never disagree on case. If a future edit
  // ever gives buildStorefrontImageUrl its own case handling that diverges
  // from resolveStorefrontImageHost, this assertion fails.
  const original = process.env.STOREFRONT_IMAGE_HOST;
  process.env.STOREFRONT_IMAGE_HOST = "CDN.EXAMPLE.COM";
  try {
    const expectedHost = resolveStorefrontImageHost(process.env.STOREFRONT_IMAGE_HOST);
    assert.equal(expectedHost, "cdn.example.com");

    const url = buildStorefrontImageUrl("/storage/v1/object/public/product-images/a.jpg");
    const emittedHost = new URL(url).hostname;

    assert.equal(emittedHost, expectedHost, "buildStorefrontImageUrl's emitted host must match resolveStorefrontImageHost's output exactly");
    assert.equal(emittedHost, "cdn.example.com", "an uppercase configured value must never survive uppercased into the emitted URL");
  } finally {
    if (original === undefined) delete process.env.STOREFRONT_IMAGE_HOST;
    else process.env.STOREFRONT_IMAGE_HOST = original;
  }
});
