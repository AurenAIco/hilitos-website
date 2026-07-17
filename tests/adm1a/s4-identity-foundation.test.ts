// tests/adm1a/s4-identity-foundation.test.ts — ADM1a Slice S4 Layer A
// (static source checks, node:test via the S1 runner; no Docker).
//
// HONESTY BOUNDARY (dispatch §14, mandatory wording): this file proves
// SOURCE HYGIENE ONLY. Nothing in this file proves RLS behavior. RLS is
// proven only by the pgTAP suite (supabase/tests/adm1a/s4_identity_rls.sql,
// Layer B and Layer B-F1) run against the OD-1 disposable stack — and even
// that is a local rehearsal, never the G3 live proof. Cookie presence is
// not authentication or authorization; nothing in this slice implements
// authentication.
//
// Implements HILITOS-ADM1A-S4 dispatch §14 Layer A rows 17-21, 23-25.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const ROOT = process.cwd();
const BASELINE_SHA = "d74415c00c9bcb76fefd8e2485344861b8a94472";

function readSrc(...segments: string[]): string {
  return readFileSync(join(ROOT, ...segments), "utf8");
}

function stripSqlComments(src: string): string {
  return src.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
}

function stripTomlComments(src: string): string {
  return src.replace(/^\s*#.*$/gm, "");
}

const MIGRATIONS_DIR = join(ROOT, "supabase", "migrations");
const migrationFiles = readdirSync(MIGRATIONS_DIR)
  .filter((name) => name.endsWith(".sql"))
  .sort();
const migrationSources = migrationFiles.map((name) => ({
  name,
  raw: readSrc("supabase", "migrations", name),
  clean: stripSqlComments(readSrc("supabase", "migrations", name)),
}));
const allMigrationsClean = migrationSources.map((m) => m.clean).join("\n");
const allMigrationsRaw = migrationSources.map((m) => m.raw).join("\n");

const bootstrapRaw = readSrc("supabase", "scripts", "adm1a_s4_owner_bootstrap.sql");
const bootstrapClean = stripSqlComments(bootstrapRaw);
const configToml = readSrc("supabase", "config.toml");

// #17 — Migration hygiene.
test("every CREATE TABLE lives in the cms schema", () => {
  const tableMatches = [...allMigrationsClean.matchAll(/create table\s+([a-z0-9_."]+)/gi)];
  assert.ok(tableMatches.length > 0, "expected at least one CREATE TABLE across S4 migrations");
  for (const [, name] of tableMatches) {
    assert.match(name, /^cms\./i, `table "${name}" is not schema-qualified under cms`);
  }
});

test("every S4 table has both ENABLE and FORCE ROW LEVEL SECURITY", () => {
  const tableMatches = [...allMigrationsClean.matchAll(/create table\s+(cms\.[a-z0-9_]+)/gi)];
  const tableNames = tableMatches.map(([, name]) => name.toLowerCase());
  assert.ok(tableNames.length > 0);
  for (const table of tableNames) {
    const enableRe = new RegExp(
      `alter table\\s+${table.replace(".", "\\.")}\\s+enable row level security`,
      "i",
    );
    const forceRe = new RegExp(
      `alter table\\s+${table.replace(".", "\\.")}\\s+force row level security`,
      "i",
    );
    assert.match(allMigrationsClean, enableRe, `missing ENABLE RLS for ${table}`);
    assert.match(allMigrationsClean, forceRe, `missing FORCE RLS for ${table}`);
  }
});

test("no grant to anon anywhere in the S4 migrations", () => {
  assert.doesNotMatch(allMigrationsClean, /to\s+anon\b/i);
  assert.doesNotMatch(allMigrationsClean, /grant\s+[a-z, ]+\s+on\s+[a-z0-9_. ]+\s+to\s+anon/i);
});

test('no "USING (true)" policy anywhere in the S4 migrations', () => {
  assert.doesNotMatch(allMigrationsClean, /using\s*\(\s*true\s*\)/i);
});

test("every SECURITY DEFINER function pins an empty search_path", () => {
  // Each helper is authored as one CREATE OR REPLACE FUNCTION ... $$; block.
  // Split on that boundary and check DEFINER functions individually so a
  // pinned search_path on one function can't be miscounted as covering
  // another.
  const functionBlocks = allMigrationsClean.split(/(?=create or replace function)/gi);
  const definerBlocks = functionBlocks.filter((b) => /security definer/i.test(b));
  assert.ok(definerBlocks.length >= 3, "expected at least the 3 membership helpers");
  for (const block of definerBlocks) {
    assert.match(
      block,
      /set search_path\s*=\s*''/i,
      `SECURITY DEFINER function block missing pinned empty search_path:\n${block.slice(0, 120)}...`,
    );
  }
});

// Post-dispatch correction (Opus finding): the dispatch's §5.7
// last-active-owner guard was a non-atomic COUNT(*) trigger — unsafe under
// concurrent owner-removal transactions — and was struck with no
// replacement mechanism. These two checks prove the strike is real and
// durable: the objects cannot silently reappear in a migration, and no doc
// can silently re-claim the DB enforces this invariant.
test("last-active-owner guard function/trigger do not reappear in any S4 migration", () => {
  assert.doesNotMatch(allMigrationsClean, /prevent_last_active_owner_removal/i);
  assert.doesNotMatch(allMigrationsClean, /last[-_ ]active[-_ ]owner/i);
});

test("no documentation claims the database enforces a last-active-owner invariant", () => {
  const docs = [
    { name: "docs/OWNERSHIP.md", text: readSrc("docs", "OWNERSHIP.md") },
    { name: "docs/adm1a/S4_IDENTITY_CORE_NOTES.md", text: readSrc("docs", "adm1a", "S4_IDENTITY_CORE_NOTES.md") },
  ];
  for (const { name, text } of docs) {
    assert.doesNotMatch(
      text,
      /last-active-owner guard\s+(blocks|prevents|enforces)/i,
      `${name} still claims the last-active-owner guard is active`,
    );
    assert.doesNotMatch(
      text,
      /last\s+`?active`?\s+`?owner`?\s+row[^.]*cannot be (demoted|revoked|deleted)/i,
      `${name} still claims a last-active-owner invariant is enforced`,
    );
  }
});

// #18 — No secrets.
test("no service-role key, JWT-like literal, or secret-shaped value in any committed S4 file", () => {
  const allSql = allMigrationsRaw + bootstrapRaw;
  const allFiles = allSql + configToml;
  // JWT structure: three base64url segments separated by dots, each segment
  // long enough to be a real token part (not e.g. a semver-looking string).
  assert.doesNotMatch(allFiles, /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/);
  assert.doesNotMatch(allFiles, /service_role_key\s*[:=]\s*['"][^'"]+['"]/i);
  assert.doesNotMatch(allFiles, /sb_secret_/i);
  assert.doesNotMatch(allFiles, /supabase_service_role/i);
});

// #19 — No cloud reference.
test("no cloud project reference (*.supabase.co / dashboard link) anywhere in supabase/**", () => {
  const allSql = allMigrationsRaw + bootstrapRaw + configToml;
  // A real project-ref domain looks like "<ref>.supabase.co" — deliberately
  // NOT matching "supabase.com" (the CLI's own generated header comment
  // links to supabase.com/docs, which is expected, harmless boilerplate).
  assert.doesNotMatch(allSql, /[a-z0-9-]+\.supabase\.co(?!m)/i);
  assert.doesNotMatch(allSql, /supabase\.com\/dashboard/i);
});

test("config.toml keeps cms out of [api].schemas, keeps enable_signup=false, and pins a local-only project_id", () => {
  const apiSchemasMatch = configToml.match(/\[api\][\s\S]*?schemas\s*=\s*\[([^\]]*)\]/);
  assert.ok(apiSchemasMatch, "could not locate [api].schemas in config.toml");
  assert.doesNotMatch(apiSchemasMatch[1], /cms/i);

  const authSectionMatch = configToml.match(/\[auth\]\n([\s\S]*?)(?:\n\[|$)/);
  assert.ok(authSectionMatch, "could not locate [auth] section in config.toml");
  assert.match(authSectionMatch[1], /enable_signup\s*=\s*false/);

  assert.match(configToml, /project_id\s*=\s*"hilitos-website"/);
});

// #20 — No production/operational reference.
test("no operational Hilitos/Olivia reference anywhere in the S4 diff", () => {
  const allFiles = allMigrationsRaw + bootstrapRaw + configToml;
  const lower = allFiles.toLowerCase();
  for (const token of ["olivia", "crm", "whatsapp", "wa.me", "hilitos.co"]) {
    assert.equal(lower.includes(token), false, `unexpected "${token}" in S4 files`);
  }
});

// #21 — example.com-only identities; bootstrap script shape.
test("only example.com-class identities appear anywhere in S4 files; no real email", () => {
  // config.toml's CLI-generated boilerplate includes a commented-out
  // "admin_email = admin@email.com" default (inbucket section) — strip
  // TOML comment lines first so that inert CLI placeholder isn't scanned.
  const allFiles = allMigrationsRaw + bootstrapRaw + stripTomlComments(configToml);
  const emailMatches = [...allFiles.matchAll(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)];
  for (const [email] of emailMatches) {
    assert.match(email, /@example\.com$/i, `non-example.com email literal found: ${email}`);
  }
});

test("bootstrap script contains the gate literal, an existence check, and ON CONFLICT DO NOTHING", () => {
  assert.match(bootstrapClean, /I_UNDERSTAND_ONE_TIME_OWNER_BOOTSTRAP/);
  assert.match(bootstrapClean, /if exists\s*\(/i);
  assert.match(bootstrapClean, /on conflict do nothing/i);
});

// #23 — S1/S2 regression + no Supabase dependency.
test("S1/S2 route-boundary source files are untouched by S4 (no (admin) route added)", () => {
  const adminDir = readdirSync(join(ROOT, "app", "(admin)"));
  assert.deepEqual(
    adminDir.filter((n) => n !== "admin.css" && n !== "layout.tsx" && n !== "admin").sort(),
    [],
    "unexpected top-level entry under app/(admin)/ beyond S2's admin.css/layout.tsx/admin",
  );
  const adminSubdir = readdirSync(join(ROOT, "app", "(admin)", "admin"));
  assert.deepEqual(
    adminSubdir.filter((n) => n !== "page.tsx" && n !== "login").sort(),
    [],
    "unexpected entry under app/(admin)/admin/ beyond S2's page.tsx/login",
  );
});

test("no Supabase dependency in package.json (S1's INV-17 test remains the enforcement)", () => {
  const pkg = JSON.parse(readSrc("package.json")) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const supabaseDeps = Object.keys(deps).filter((name) => /supabase/i.test(name));
  assert.deepEqual(supabaseDeps, [], `unexpected Supabase dependency: ${supabaseDeps.join(", ")}`);
});

// #24 — git diff scope proof.
const S4_ALLOWED_FILES = new Set([
  "supabase/config.toml",
  ".gitignore",
  "supabase/.gitignore", // auto-generated companion of config.toml by `supabase init`
  "docs/OWNERSHIP.md",
  "docs/adm1a/S4_IDENTITY_CORE_NOTES.md",
  "supabase/scripts/adm1a_s4_owner_bootstrap.sql",
  "tests/adm1a/s4-identity-foundation.test.ts",
  ...migrationFiles.map((name) => `supabase/migrations/${name}`),
]);

function listChangedFilesSinceBaseline(): string[] {
  const out = execFileSync("git", ["diff", "--name-only", `${BASELINE_SHA}...HEAD`], {
    cwd: ROOT,
    encoding: "utf8",
  });
  return out.split("\n").map((l) => l.trim()).filter(Boolean);
}

test("git diff scope proof: every changed file so far is inside the closed §9 allowlist", () => {
  const changed = listChangedFilesSinceBaseline();
  const isPgtapFile = (f: string) => /^supabase\/tests\/adm1a\/s4_.*\.sql$/.test(f);
  const outside = changed.filter((f) => !S4_ALLOWED_FILES.has(f) && !isPgtapFile(f));
  assert.deepEqual(
    outside,
    [],
    `file(s) outside the S4 §9 allowlist entered the diff: ${outside.join(", ")}`,
  );
});

test("package.json / package-lock.json diff vs. baseline is 0 lines", () => {
  for (const file of ["package.json", "package-lock.json"]) {
    const diff = execFileSync("git", ["diff", `${BASELINE_SHA}...HEAD`, "--", file], {
      cwd: ROOT,
      encoding: "utf8",
    });
    assert.equal(diff.trim(), "", `unexpected diff in ${file}`);
  }
});

// #25 — no S3 Auth implementation enters the diff.
test("zero Auth UI/session/OTP/@supabase/ssr code anywhere in the S4 diff", () => {
  const allFiles = allMigrationsRaw + bootstrapRaw + configToml;
  for (const token of [
    "@supabase/ssr",
    "@supabase/supabase-js",
    "createClient(",
    "createServerClient(",
    "createBrowserClient(",
  ]) {
    assert.equal(allFiles.includes(token), false, `unexpected "${token}" in S4 files`);
  }
});
