// tests/storefront-v2/collections-route-source-hygiene.test.ts — Slice S2
// (/colecciones/[slug] live) static source proof.
//
// HONESTY BOUNDARY: this file proves source hygiene only — that the
// notFound()/fail-closed wiring, the skeleton removal, and the nav fix are
// actually present in the committed source. It does NOT prove HTTP status
// codes or rendered output (this repo's `node --test` harness has no
// server/DOM to render against — see collections-route.test.ts's header for
// the pure-logic proof of every branch this wiring calls into).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { NAV_ITEMS } from "../../components/layout/nav-items";

const ROOT = process.cwd();

function readSrc(...segments: string[]): string {
  return readFileSync(join(ROOT, ...segments), "utf8");
}

const PAGE_PATH = ["app", "(public)", "colecciones", "[slug]", "page.tsx"];
const pageSrc = readSrc(...PAGE_PATH);

// ---- zero ROUTE SKELETON markers -------------------------------------------

// Mirrors seam-isolation.test.ts's RUNTIME_DIRS walk: everything a public
// request can reach (app/**, components/**).
const RUNTIME_DIRS = ["app", "components"];
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

test("zero ROUTE SKELETON markers anywhere under app/** or components/**", () => {
  const runtimeFiles = RUNTIME_DIRS.flatMap((dir) => walk(join(ROOT, dir)));
  const offenders = runtimeFiles.filter((file) => readFileSync(file, "utf8").includes("ROUTE SKELETON"));
  assert.deepEqual(offenders, [], `unexpected ROUTE SKELETON marker(s):\n${offenders.join("\n")}`);
});

test("the collection page no longer contains the old skeleton's placeholder copy", () => {
  assert.equal(pageSrc.includes("se implementa en la misión"), false);
  assert.equal(pageSrc.includes("ColeccionSkeletonPage"), false);
});

// ---- notFound() fail-closed wiring -----------------------------------------

test('the collection page imports notFound from "next/navigation"', () => {
  assert.match(pageSrc, /import\s*\{\s*notFound\s*\}\s*from\s*"next\/navigation"/);
});

test("the collection page calls notFound() gated on the frozen-slug guard, never returns a design page for an invalid slug", () => {
  assert.match(pageSrc, /isCollectionSlug\(slug\)/);
  assert.match(pageSrc, /if\s*\(\s*!\s*isCollectionSlug\(slug\)\s*\)\s*\{\s*notFound\(\);?\s*\}/);
});

// ---- no fixture fallback ----------------------------------------------------

test("the collection page never imports the synthetic V2 fixture/adapter", () => {
  for (const needle of ["catalog.contract.v2.fixture", "lib/fixture.v2", "fixture.v2"]) {
    assert.equal(pageSrc.includes(needle), false, `unexpected "${needle}" reference in the collection page`);
  }
});

test("the collection page fetches the live catalog via getStorefrontCatalog, not a duplicate parser", () => {
  assert.match(pageSrc, /import\s*\{[^}]*getStorefrontCatalog[^}]*\}\s*from\s*"@\/lib\/catalog\/storefront"/);
});

// ---- route states are all wired --------------------------------------------

test("the collection page renders the unavailable, stale, and empty states honestly (no silent fallback)", () => {
  assert.match(pageSrc, /view\.kind === "unavailable"/);
  assert.match(pageSrc, /CatalogStatusBanner status="unavailable"/);
  assert.match(pageSrc, /CatalogStatusBanner status="stale"/);
  assert.match(pageSrc, /designs\.length === 0/);
});

// ---- Spanish h1 + description ----------------------------------------------

test('the collection page renders exactly one visible <h1> (via EditorialHeading as="h1") per branch, with a description paragraph', () => {
  const h1Count = (pageSrc.match(/as="h1"/g) ?? []).length;
  // One h1 per return branch (unavailable / ready) — never zero, never a
  // duplicate on the same render path.
  assert.equal(h1Count, 2, `expected exactly 2 as="h1" occurrences (one per branch), got ${h1Count}`);
  assert.match(pageSrc, /meta\.description/);
});

// ---- nav destination fix ----------------------------------------------------

test('NAV_ITEMS no longer points anything at the obsolete /colecciones/esenciales', () => {
  for (const item of NAV_ITEMS) {
    assert.notEqual(item.href, "/colecciones/esenciales", `unexpected obsolete href on "${item.label}"`);
  }
});

// Final pre-launch QA delta: the separate "Colecciones" overview item was
// removed entirely — it duplicated "Catálogo"'s exact /catalogo
// destination (two top-level nav items landing on the identical page reads
// as a broken link, not a real second destination), and there is no
// top-level /colecciones route for it to point at instead. This test now
// pins that removal rather than the old item's destination.
test('NAV_ITEMS has no separate top-level "Colecciones" item (removed — duplicated "Catálogo"\'s /catalogo destination, and no top-level /colecciones route exists)', () => {
  const labels: readonly string[] = NAV_ITEMS.map((item) => item.label);
  assert.equal(labels.includes("Colecciones"), false);
});

test("NAV_ITEMS has no two items sharing the same destination (the exact defect the 'Colecciones' removal fixes)", () => {
  const hrefs = NAV_ITEMS.map((item) => item.href);
  assert.equal(new Set(hrefs).size, hrefs.length, `expected unique destinations, got: ${hrefs.join(", ")}`);
});

test("NAV_ITEMS entries have unique labels (safe as a React list key)", () => {
  const labels = NAV_ITEMS.map((item) => item.label);
  assert.equal(new Set(labels).size, labels.length, `expected unique labels, got: ${labels.join(", ")}`);
});
