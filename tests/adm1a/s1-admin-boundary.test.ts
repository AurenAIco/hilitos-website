// tests/adm1a/s1-admin-boundary.test.ts — ADM1a Slice S1 assertion suite.
//
// Smallest deterministic checks for exactly what S1 claims and nothing more
// (mission pack §19 S1 row, §20 checks 12/13/16/20). No live build, no
// network, no cloud resource — static source-tree and package.json
// assertions only. This file introduces both the test runner itself and
// the first S1-scoped tests; Slice S6 completes the cross-cutting ADM1a
// harness (route protection, session state, roles, RLS, etc. — the full
// §20 matrix) under this same tests/adm1a/** directory, building on what's
// already here rather than starting it.
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

test("INV-16/INV-20: no routable page or route-handler entrypoint exists under app/(admin)", () => {
  // Static structural check only: an App Router segment needs a page.* or
  // route.* file to produce a routable path. This does not itself prove
  // the build's route manifest is clean (a stronger, live integration
  // proof — see the PR's `npm run build` evidence) — it proves the source
  // tree contains no entrypoint that could ever produce one.
  const files = listFilesRecursive(ADMIN_DIR);
  const routableEntrypoints = files.filter((f) =>
    /[\\/](page|route)\.(tsx|ts|jsx|js)$/.test(f),
  );
  assert.deepEqual(
    routableEntrypoints,
    [],
    `unexpected routable entrypoint(s) under app/(admin): ${routableEntrypoints.join(", ")}`,
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

test("§18: admin.css establishes a 44x44 tap-target floor with a dimensionable hook (static text check only)", () => {
  // This asserts against the CSS source text only — it does not launch a
  // browser, does not measure a rendered/computed box, and is not a
  // substitute for real visual/browser accessibility verification (which
  // remains deferred to S2/S3 once an interactive surface exists to test).
  const css = readFileSync(join(ADMIN_DIR, "admin.css"), "utf8");

  assert.match(css, /min-height:\s*44px/, "expected a 44px min-height rule");
  assert.match(css, /min-width:\s*44px/, "expected a 44px min-width rule");

  const tapTargetRule = css.match(/\.admin-tap-target\s*\{([^}]*)\}/);
  assert.ok(tapTargetRule, "expected an .admin-tap-target rule to exist");
  assert.match(
    tapTargetRule[1],
    /display:\s*(inline-flex|flex|grid|inline-grid|inline-block|block)/,
    ".admin-tap-target must establish a dimensionable display mode (e.g. inline-flex) or min-width/min-height have no effect",
  );
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
