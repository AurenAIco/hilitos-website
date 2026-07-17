// tests/adm1a/s1-admin-boundary.test.ts — ADM1a Slice S1 assertion suite.
//
// Smallest deterministic checks for exactly what S1 claims and nothing more
// (mission pack §19 S1 row, §20 checks 12/13/16/20). No live build, no
// network, no cloud resource — static source-tree and package.json
// assertions only. The broader §20 harness (route protection, session
// state, RLS, etc.) arrives in Slice S6 under this same tests/adm1a/**
// directory; this file is scoped to S1's own invariants only.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const ADMIN_DIR = join(ROOT, "app", "(admin)");

function listFilesRecursive(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listFilesRecursive(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

test("INV-16/INV-20: no page.tsx exists under app/(admin) — no /admin route can exist", () => {
  const files = listFilesRecursive(ADMIN_DIR);
  const pageFiles = files.filter((f) => /[\\/]page\.(tsx|ts|jsx|js)$/.test(f));
  assert.deepEqual(
    pageFiles,
    [],
    `unexpected page file(s) under app/(admin): ${pageFiles.join(", ")}`,
  );
});

test("admin layout does not import the public shell or amarillo.css", () => {
  const source = readFileSync(join(ADMIN_DIR, "layout.tsx"), "utf8");
  // Check actual import statements only — the file's own documentation
  // comments legitimately *mention* amarillo.css to record that it must
  // never be imported here, which is not itself a violation.
  const importLines = source
    .split("\n")
    .filter((line) => /^\s*import\b/.test(line));
  for (const line of importLines) {
    assert.doesNotMatch(line, /amarillo\.css/);
    assert.doesNotMatch(line, /components\/layout/);
  }
});

test("§18: admin.css defines :focus-visible and prefers-reduced-motion", () => {
  const css = readFileSync(join(ADMIN_DIR, "admin.css"), "utf8");
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
});

test("INV-17: no Supabase dependency has been introduced", () => {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const supabaseDeps = Object.keys(deps).filter((name) => /supabase/i.test(name));
  assert.deepEqual(
    supabaseDeps,
    [],
    `unexpected Supabase dependency: ${supabaseDeps.join(", ")}`,
  );
});

test("INV-23: exactly one test runner is configured", () => {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  assert.equal(typeof pkg.scripts?.test, "string");
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const knownOtherRunners = ["jest", "vitest", "mocha", "ava", "tape", "jasmine"];
  const extraRunners = Object.keys(deps).filter((name) => knownOtherRunners.includes(name));
  assert.deepEqual(
    extraRunners,
    [],
    `unexpected additional test-runner dependency: ${extraRunners.join(", ")}`,
  );
});
