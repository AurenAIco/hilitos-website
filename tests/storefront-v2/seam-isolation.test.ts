// tests/storefront-v2/seam-isolation.test.ts — Gate G1a boundary proof.
//
// Proves the synthetic StorefrontCatalogV2 fixture/adapter are NOT wired
// into any runtime consumer (pages, routes, components) in this slice.
// Static substring scan only — deliberately does NOT import anything under
// app/** or components/** (avoids pulling Next.js/React runtime into the
// node:test process; mirrors the static-scan style of
// tests/adm1a/s2-route-boundary.test.ts).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = process.cwd();

// Everything a public/runtime request can reach. Deliberately excludes
// lib/**, tests/**, docs/**, supabase/** — those are allowed importers in
// this slice (fixture/lint/test files).
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

const runtimeFiles = RUNTIME_DIRS.flatMap((dir) => walk(join(ROOT, dir)));

const FORBIDDEN_REFERENCES = ["catalog.contract.v2.fixture", "lib/fixture.v2", "fixture.v2"];

test("no runtime page/route/component under app/** or components/** references the synthetic V2 fixture or adapter", () => {
  const offenders: string[] = [];
  for (const file of runtimeFiles) {
    const src = readFileSync(file, "utf8");
    for (const needle of FORBIDDEN_REFERENCES) {
      if (src.includes(needle)) {
        offenders.push(`${file} references "${needle}"`);
      }
    }
  }
  assert.deepEqual(offenders, [], `unexpected V2 fixture/adapter reference(s) in runtime code:\n${offenders.join("\n")}`);
});

test("StorefrontCatalogV2 types are additive: existing V1 contract exports are untouched", () => {
  const contractSrc = readFileSync(join(ROOT, "lib", "contract.ts"), "utf8");
  for (const v1Export of [
    "export interface ProductContract",
    "export interface CollectionContract",
    "export interface CatalogFixture",
    "export type Availability",
  ]) {
    assert.equal(contractSrc.includes(v1Export), true, `expected untouched V1 export "${v1Export}" missing from lib/contract.ts`);
  }
});

test("synthetic V2 fixture is schemaVersion 2 and is not named/treated as a runtime artifact", () => {
  const path = join(ROOT, "catalog.contract.v2.fixture.json");
  const parsed = JSON.parse(readFileSync(path, "utf8")) as { schemaVersion: number };
  assert.equal(parsed.schemaVersion, 2);
  for (const badWord of ["last-good", "last_good", "production", "live-catalog", "fallback", "cached"]) {
    assert.equal(path.toLowerCase().includes(badWord), false, `fixture path must not read as "${badWord}"`);
  }
});
