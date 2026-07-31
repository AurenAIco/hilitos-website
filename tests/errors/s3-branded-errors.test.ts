// tests/errors/s3-branded-errors.test.ts — HILITOS storefront Slice S3
// (branded Spanish error surfaces) assertion suite.
//
// Static/deterministic only (node:test via the ADM1a-introduced runner, see
// docs/OWNERSHIP.md §9): no rendering, no DOM library — mirrors the
// substring-scan style of tests/adm1a/s2-route-boundary.test.ts and
// tests/storefront-v2/seam-isolation.test.ts. Proves: Spanish branded 404
// content, a visible <h1> on every surface, Inicio/Catálogo navigation, no
// leaked Next.js default copy, no stack/digest/env/backend detail exposure,
// working reset() wiring, no fixture/product data imports, and no
// dark-mode/hardcoded-color regressions.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

function readSrc(...segments: string[]): string {
  return readFileSync(join(ROOT, ...segments), "utf8");
}

// Strips comments before substring scans, same rationale as the ADM1a S2
// suite: this file's own explanatory comments legitimately mention terms
// (e.g. "digest") that must be absent from the checked *rendered* code.
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

function countOccurrences(source: string, needle: string): number {
  return source.split(needle).length - 1;
}

function assertNoneOf(source: string, tokens: string[], label: string) {
  for (const token of tokens) {
    assert.equal(
      source.toLowerCase().includes(token.toLowerCase()),
      false,
      `unexpected "${token}" in ${label}`,
    );
  }
}

const notFoundSrc = stripComments(readSrc("app", "not-found.tsx"));
const routeErrorSrc = stripComments(readSrc("app", "(public)", "error.tsx"));
const globalErrorSrc = stripComments(readSrc("app", "global-error.tsx"));
const productPageSrc = stripComments(readSrc("app", "(public)", "productos", "[slug]", "page.tsx"));

const ALL_THREE: Array<[string, string]> = [
  ["app/not-found.tsx", notFoundSrc],
  ["app/(public)/error.tsx", routeErrorSrc],
  ["app/global-error.tsx", globalErrorSrc],
];

// ---- 1. Branded Spanish 404 ----

test("app/not-found.tsx exists and renders Spanish copy", () => {
  assert.equal(existsSync(join(ROOT, "app", "not-found.tsx")), true);
  assert.match(notFoundSrc, /No encontramos esta página/);
});

test("app/not-found.tsx renders a visible (non sr-only) <h1>", () => {
  assert.match(notFoundSrc, /as="h1"/);
  assert.equal(notFoundSrc.includes("sr-only"), false, "404 heading must not be screen-reader-only");
});

test("app/not-found.tsx links back to Inicio (/) and Catálogo (/catalogo)", () => {
  assert.match(notFoundSrc, /href="\/"/);
  assert.match(notFoundSrc, /href="\/catalogo"/);
});

test("app/not-found.tsx never renders Next.js's default not-found copy", () => {
  assertNoneOf(
    notFoundSrc,
    ["This page could not be found", "could not be found"],
    "app/not-found.tsx",
  );
});

test("app/not-found.tsx does not import fixture/product/catalog data", () => {
  assertNoneOf(
    notFoundSrc,
    ["lib/fixture", "lib/catalog", "lib/contract", "catalog.fixture"],
    "app/not-found.tsx",
  );
});

test("nonexistent product and collection routes have no index page, so they resolve to the branded 404", () => {
  // /productos and /colecciones (no slug) don't match any file route at all
  // — Next.js falls back straight to app/not-found.tsx for these. Explicit
  // slugs (/productos/x) go through the pre-existing notFound() call below.
  assert.equal(existsSync(join(ROOT, "app", "(public)", "productos", "page.tsx")), false);
  assert.equal(existsSync(join(ROOT, "app", "(public)", "colecciones", "page.tsx")), false);
});

test("productos/[slug] still calls the real notFound() for an unknown slug (unmodified S3 precondition)", () => {
  assert.match(productPageSrc, /import\s*{\s*notFound\s*}\s*from\s*"next\/navigation"/);
  assert.match(productPageSrc, /\bnotFound\(\)/);
});

// ---- 2. Runtime error surface ----

test("app/(public)/error.tsx exists, is a Client Component, and renders Spanish copy", () => {
  assert.equal(existsSync(join(ROOT, "app", "(public)", "error.tsx")), true);
  assert.match(routeErrorSrc.trimStart(), /^"use client";/);
  assert.match(routeErrorSrc, /No pudimos cargar esta página/);
});

test("app/(public)/error.tsx renders a visible (non sr-only) <h1>", () => {
  assert.match(routeErrorSrc, /as="h1"/);
  assert.equal(routeErrorSrc.includes("sr-only"), false);
});

test("app/(public)/error.tsx offers a reset()/retry action and safe home/catalog navigation", () => {
  assert.match(routeErrorSrc, /reset\(\)/);
  assert.match(routeErrorSrc, /onClick/);
  assert.match(routeErrorSrc, /href="\/"/);
  assert.match(routeErrorSrc, /href="\/catalogo"/);
});

test("app/global-error.tsx exists, is a Client Component with its own <html>/<body>, and offers reset()", () => {
  assert.equal(existsSync(join(ROOT, "app", "global-error.tsx")), true);
  assert.match(globalErrorSrc.trimStart(), /^"use client";/);
  assert.match(globalErrorSrc, /<html[\s>]/);
  assert.match(globalErrorSrc, /<body[\s>]/);
  assert.match(globalErrorSrc, /reset\(\)/);
  assert.match(globalErrorSrc, /href="\/"/);
});

for (const [label, src] of [
  ["app/(public)/error.tsx", routeErrorSrc],
  ["app/global-error.tsx", globalErrorSrc],
] as const) {
  test(`${label} never leaks Next.js's default error boilerplate`, () => {
    assertNoneOf(src, ["Something went wrong!", "Try again"], label);
  });
}

// ---- 3. No stack / digest / env / backend detail exposure (both error surfaces) ----

for (const [label, src] of [
  ["app/(public)/error.tsx", routeErrorSrc],
  ["app/global-error.tsx", globalErrorSrc],
] as const) {
  test(`${label} never renders error.message/stack/digest or reads env/backend values`, () => {
    assertNoneOf(
      src,
      [
        "error.message",
        "error.stack",
        "error.digest",
        "{error}",
        "{error.",
        "String(error)",
        "error.toString",
        "process.env",
        "supabase",
        "storefront_image_host",
      ],
      label,
    );
  });
}

// ---- 4. Landmarks, single-root invariant, focus visibility ----

test('each error/not-found surface renders exactly one <main id="contenido">', () => {
  for (const [label, src] of ALL_THREE) {
    assert.equal(countOccurrences(src, 'id="contenido"'), 1, `${label} must render <main id="contenido"> exactly once`);
  }
});

test("app/not-found.tsx and app/(public)/error.tsx never add a second <html>/<body> (single-root invariant)", () => {
  for (const [label, src] of [
    ["app/not-found.tsx", notFoundSrc],
    ["app/(public)/error.tsx", routeErrorSrc],
  ] as const) {
    assert.equal(/<html[\s>]/.test(src), false, `${label} must not render its own <html>`);
    assert.equal(/<body[\s>]/.test(src), false, `${label} must not render its own <body>`);
  }
});

test("app/not-found.tsx re-imports styles/amarillo.css and the public shell for focus-visible/skip-link parity", () => {
  // Outside the (public) route group, so it cannot inherit that layout's
  // amarillo.css import — it must bring its own, plus the same
  // SkipLink/Header/Footer composition every other public page gets.
  assert.match(notFoundSrc, /@\/styles\/amarillo\.css/);
  assert.match(notFoundSrc, /<SkipLink\s*\/>/);
  assert.match(notFoundSrc, /<Header\s*\/>/);
  assert.match(notFoundSrc, /<Footer\s*\/>/);
});

test("app/global-error.tsx re-imports amarillo.css since it replaces the whole document", () => {
  assert.match(globalErrorSrc, /@\/styles\/amarillo\.css/);
});

// ---- 5. No dark-mode inversion, no hardcoded raw color values ----

const HEX_COLOR = /#[0-9a-fA-F]{3,8}\b/;

for (const [label, src] of ALL_THREE) {
  test(`${label} adds no dark-mode variant and no hardcoded hex color`, () => {
    assert.equal(src.includes("dark:"), false, `${label} must not introduce a dark-mode variant`);
    assert.equal(HEX_COLOR.test(src), false, `${label} must reference design tokens, not raw hex colors`);
  });
}

// ---- 6. Nothing in-scope for S3 touches out-of-scope surfaces ----

test("S3 error surfaces do not modify nav-items, WhatsApp CTA, or mobile drawer files", () => {
  // Existence/identity check only (git history is authoritative for "not
  // modified"); this guards against a future edit accidentally landing in
  // one of these forbidden-by-mission files from within this same slice.
  for (const forbidden of [
    join(ROOT, "components", "layout", "nav-items.ts"),
    join(ROOT, "components", "layout", "WhatsAppCTA.tsx"),
    join(ROOT, "components", "layout", "MobileNav.tsx"),
  ]) {
    assert.equal(existsSync(forbidden), true, `${forbidden} should still exist, untouched`);
  }
  for (const [label, src] of ALL_THREE) {
    assertNoneOf(src, ["nav-items", "MobileNav", "WhatsAppCTA"], label);
  }
});
