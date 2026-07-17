// tests/adm1a/s2-route-boundary.test.ts — ADM1a Slice S2 assertion suite.
//
// Static/deterministic only (node:test via the S1 runner): no network, no
// DOM library, no cookie is ever set by any test. These tests prove
// routing UX and static hygiene only — nothing here proves, or could
// prove, authentication. Cookie presence is not authentication or
// authorization. The real matcher compilation and the live 307 hop are
// confirmed only at Preview smoke (dispatch §13), never here.
//
// Implements HILITOS-ADM1A-S2 dispatch §12 TEST_MATRIX rows 1-23.
// Rows 24-29 (S1 regression / diff / build-manifest / toolchain) are
// verified via the validation commands in the PR evidence, not embedded
// here as unit assertions.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { config } from "../../middleware";
import { decideAdminRouting } from "../../lib/admin/routing";

const ROOT = process.cwd();

function readSrc(...segments: string[]): string {
  return readFileSync(join(ROOT, ...segments), "utf8");
}

// Strips // line comments and /* */ block comments before running
// substring scans — this file's own required honesty comments (e.g.
// "nothing here evaluates identity, role, or permissions") legitimately
// *mention* the very terms these scans check for the absence of in real
// code; matching raw source text would false-positive on that prose (the
// same class of bug caught and fixed in the S1 suite).
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

const middlewareSrc = readSrc("middleware.ts");
const routingSrc = readSrc("lib", "admin", "routing.ts");
const adminPageSrc = readSrc("app", "(admin)", "admin", "page.tsx");
const loginPageSrc = readSrc("app", "(admin)", "admin", "login", "page.tsx");
const layoutSrc = readSrc("app", "(admin)", "layout.tsx");

// Scoped to middleware.ts + lib/admin/** only, per the dispatch's own
// per-row scoping (#16, #19).
const adminOnlyCode = stripComments(middlewareSrc) + stripComments(routingSrc);

// Scoped to every S2 production source file (#13-15, #17-18, #20, #22-23).
// Deliberately excludes this test file itself (whose assertions must
// contain these tokens as string literals to check for them) and
// docs/OWNERSHIP.md (a documentation file, not application code).
const allChangedCode =
  adminOnlyCode + stripComments(adminPageSrc) + stripComments(loginPageSrc);

function assertNoneOf(source: string, tokens: string[], label: string) {
  for (const token of tokens) {
    assert.equal(
      source.toLowerCase().includes(token.toLowerCase()),
      false,
      `unexpected "${token}" in ${label}`,
    );
  }
}

// #1
test("matcher is exactly /admin/:path*", () => {
  assert.deepEqual(config.matcher, ["/admin/:path*"]);
});

// #2
test("/admin without a cookie is matched and redirects", () => {
  assert.deepEqual(decideAdminRouting("/admin", false), {
    action: "redirect",
    location: "/admin/login",
  });
});

// #3
test("/admin/login is matched structurally but always continues (cookie or not)", () => {
  assert.deepEqual(decideAdminRouting("/admin/login", false), { action: "next" });
  assert.deepEqual(decideAdminRouting("/admin/login", true), { action: "next" });
});

// #4
test("nested /admin/** paths are matched without a cookie", () => {
  assert.deepEqual(decideAdminRouting("/admin/x", false), {
    action: "redirect",
    location: "/admin/login",
  });
  assert.deepEqual(decideAdminRouting("/admin/x/y", false), {
    action: "redirect",
    location: "/admin/login",
  });
});

// #5
test("public routes are excluded regardless of cookie state", () => {
  for (const pathname of [
    "/",
    "/catalogo",
    "/nosotros",
    "/privacy",
    "/productos/x",
    "/colecciones/x",
  ]) {
    assert.deepEqual(decideAdminRouting(pathname, false), { action: "next" });
    assert.deepEqual(decideAdminRouting(pathname, true), { action: "next" });
  }
});

// #6
test("_next and static asset paths are excluded", () => {
  for (const pathname of ["/_next/static/x", "/images/x"]) {
    assert.deepEqual(decideAdminRouting(pathname, false), { action: "next" });
  }
  // Static: the matcher itself contains no pattern that could reach these.
  assert.deepEqual(config.matcher, ["/admin/:path*"]);
});

// #7
test("robots, sitemap, and favicon are excluded", () => {
  for (const pathname of ["/robots.txt", "/sitemap.xml", "/favicon.ico"]) {
    assert.deepEqual(decideAdminRouting(pathname, false), { action: "next" });
  }
});

// #8
test("no-cookie /admin redirects to the constant /admin/login", () => {
  const decision = decideAdminRouting("/admin", false);
  assert.equal(decision.action, "redirect");
  assert.equal(decision.action === "redirect" ? decision.location : undefined, "/admin/login");
});

// #9
test("no-cookie /admin/login continues — never redirects", () => {
  assert.deepEqual(decideAdminRouting("/admin/login", false), { action: "next" });
});

// #10
test("no redirect loop: no decision ever redirects while already at /admin/login", () => {
  const table: Array<[string, boolean]> = [
    ["/admin", false],
    ["/admin", true],
    ["/admin/login", false],
    ["/admin/login", true],
    ["/admin/x", false],
    ["/admin/x", true],
  ];
  for (const [pathname, hasCookie] of table) {
    if (pathname === "/admin/login") {
      const decision = decideAdminRouting(pathname, hasCookie);
      assert.equal(
        decision.action,
        "next",
        `expected /admin/login (hasCookie=${hasCookie}) to continue, got ${decision.action}`,
      );
    }
  }
});

// #11
test("every redirect-producing decision targets the constant /admin/login", () => {
  const redirecting = [
    decideAdminRouting("/admin", false),
    decideAdminRouting("/admin/x", false),
    decideAdminRouting("/admin/x/y", false),
  ];
  for (const decision of redirecting) {
    assert.equal(decision.action, "redirect");
    assert.equal(decision.action === "redirect" ? decision.location : undefined, "/admin/login");
  }
});

// #12
test("no client-supplied redirect parameter is ever read", () => {
  assertNoneOf(
    allChangedCode,
    ["searchParams", "returnTo", "return_path", "referer", "referrer", "next="],
    "middleware.ts/lib/admin/**",
  );
});

// #13-14
test("no Supabase import or dependency anywhere in the S2 diff", () => {
  assertNoneOf(allChangedCode, ["@supabase"], "S2 production files");
  const pkg = JSON.parse(readSrc("package.json")) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const supabaseDeps = Object.keys(deps).filter((name) => /supabase/i.test(name));
  assert.deepEqual(supabaseDeps, [], `unexpected Supabase dependency: ${supabaseDeps.join(", ")}`);
});

// #15
test("no Supabase client is constructed anywhere in the S2 diff", () => {
  assertNoneOf(
    allChangedCode,
    ["createClient", "createServerClient", "createBrowserClient"],
    "S2 production files",
  );
});

// #16
test("no network request in middleware.ts or lib/admin/**", () => {
  assertNoneOf(
    adminOnlyCode,
    ["fetch(", "axios", "XMLHttpRequest", "WebSocket", "http.request"],
    "middleware.ts/lib/admin/**",
  );
});

// #17
test("no token/session validation logic anywhere in the S2 diff", () => {
  assertNoneOf(
    allChangedCode,
    ["jwt", "getUser(", "getSession(", "verifyToken(", "decodeToken(", ".decode(", ".verify("],
    "S2 production files",
  );
});

// #18
test("no database query anywhere in the S2 diff", () => {
  assertNoneOf(
    allChangedCode,
    ["select ", "insert into", "supabase.from(", "db.query(", "prisma."],
    "S2 production files",
  );
});

// #19
test("no role/authorization-decision logic in middleware.ts or lib/admin/**; decision function takes only (pathname, hasCookie)", () => {
  assertNoneOf(
    adminOnlyCode,
    ["role", "permission", "authorize", "isadmin"],
    "middleware.ts/lib/admin/**",
  );
  assert.equal(decideAdminRouting.length, 2);
});

// #20
test("no business/catalog logic imported or referenced anywhere in the S2 diff", () => {
  assertNoneOf(
    allChangedCode,
    ["lib/catalog", "lib/contract", "lib/fixture", "catalog", "fixture", "customer", "company"],
    "S2 production files",
  );
});

// #21
function countOccurrences(source: string, needle: string): number {
  return source.split(needle).length - 1;
}

test('exactly one <main id="admin-contenido"> per admin page; zero in the layout', () => {
  assert.equal(countOccurrences(adminPageSrc, 'id="admin-contenido"'), 1);
  assert.equal(countOccurrences(loginPageSrc, 'id="admin-contenido"'), 1);
  assert.equal(countOccurrences(stripComments(layoutSrc), 'id="admin-contenido"'), 0);
});

// #22
test("admin surfaces import nothing from components/** and never reference amarillo", () => {
  const combined = allChangedCode + stripComments(layoutSrc);
  assert.equal(combined.includes("components/"), false, 'unexpected "components/" import');
  assertNoneOf(combined, ["amarillo"], "S2 production files + S1 layout");
});

// #23
test("no operational Hilitos/Olivia references or real contact/WhatsApp values", () => {
  assertNoneOf(allChangedCode, ["olivia", "crm", "whatsapp", "wa.me"], "S2 production files");
});
