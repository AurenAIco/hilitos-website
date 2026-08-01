// tests/integration/pendingblock-deleted.test.ts — Wave 1 integration
// hardening.
//
// PendingBlock (components/editorial/PendingBlock.tsx) was S4-owned scaffold
// for content pending Mónica's approval. S4's own test suite
// (tests/amarillo/s4-legal-about.test.ts) correctly proved /privacy and
// /nosotros dropped it, but pinned that the homepage remained its one
// legitimate consumer — true when S4 was reviewed in isolation. Integrated
// together with S1 (fix/storefront-home-defixture-s1), which independently
// drops the homepage's PendingBlock import as part of its own de-fixture
// pass (see tests/homepage/defixture.test.ts), that consumer no longer
// exists anywhere in the tree. Per the integration mandate: with zero
// legitimate runtime or test consumers remaining, the component is deleted
// outright rather than kept around as dead code.
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = process.cwd();
const RUNTIME_DIRS = ["app", "components", "lib"];
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx"]);

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === ".next") continue;
      walk(full, files);
    } else if (SOURCE_EXTENSIONS.has(extname(entry))) {
      files.push(full);
    }
  }
  return files;
}

test("components/editorial/PendingBlock.tsx no longer exists", () => {
  assert.equal(existsSync(join(ROOT, "components", "editorial", "PendingBlock.tsx")), false);
});

test("no source file under app/**, components/**, or lib/** imports or references PendingBlock", () => {
  const files = RUNTIME_DIRS.flatMap((dir) => walk(join(ROOT, dir)));
  const offenders = files.filter((file) => readFileSync(file, "utf8").includes("PendingBlock"));
  assert.deepEqual(offenders, [], `unexpected PendingBlock reference(s):\n${offenders.join("\n")}`);
});

// ---- no public page carries PENDIENTE / fixture-placeholder scaffolding ----
//
// Broader than any single slice's suite: every route the (public) group
// actually serves, plus the root/global error boundaries S3 added, in one
// sweep.

const PUBLIC_PAGES = [
  ["app", "(public)", "page.tsx"],
  ["app", "(public)", "catalogo", "page.tsx"],
  ["app", "(public)", "colecciones", "[slug]", "page.tsx"],
  ["app", "(public)", "productos", "[slug]", "page.tsx"],
  ["app", "(public)", "nosotros", "page.tsx"],
  ["app", "(public)", "privacy", "page.tsx"],
  ["app", "(public)", "not-found.tsx"],
  ["app", "(public)", "error.tsx"],
  ["app", "not-found.tsx"],
  ["app", "global-error.tsx"],
];

const FORBIDDEN_MARKERS = [
  "PENDIENTE",
  "revisión Mónica",
  "no producto real",
  "catalog.fixture.json",
  "placeholder-a.jpg",
  "placeholder-b.jpg",
];

/** String-aware comment stripper — same implementation as
 * tests/seo/robots-sitemap.test.ts's stripComments (F17 regression: a naive
 * `//`/`/* *‍/` regex strip also truncates any "https://..." string literal
 * at the first `//`, which would silently blind a scan like this one if a
 * forbidden marker ever shared a line with a URL literal, e.g.
 * `"https://cdn/x/catalog.fixture.json"`). Tracks string/template/comment
 * state so a doc comment that legitimately *names* a forbidden marker while
 * explaining why it must never appear (e.g. app/(public)/page.tsx's own
 * header, which says exactly that about catalog.fixture.json) is stripped,
 * while any occurrence inside real string/JSX content survives intact. */
function stripComments(src: string): string {
  let out = "";
  let i = 0;
  let quote: '"' | "'" | "`" | null = null;

  while (i < src.length) {
    const ch = src[i];
    const next = src[i + 1];

    if (quote !== null) {
      out += ch;
      if (ch === "\\") {
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
      continue;
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

for (const segments of PUBLIC_PAGES) {
  const relPath = segments.join("/");
  test(`${relPath} contains none of the forbidden PENDIENTE/fixture-placeholder markers`, () => {
    const code = stripComments(readFileSync(join(ROOT, ...segments), "utf8"));
    for (const marker of FORBIDDEN_MARKERS) {
      assert.equal(code.includes(marker), false, `${relPath} must not contain "${marker}"`);
    }
  });
}
