// tests/errors/s3-notfound-composition.test.ts — HILITOS storefront Slice S3,
// COMPOSITION regression suite (independent Opus review, blocking finding
// S3-B1).
//
// WHY THIS FILE EXISTS, AND WHY IT IS NOT ANOTHER SUBSTRING SCAN.
// tests/errors/s3-branded-errors.test.ts asserts landmark uniqueness with
// countOccurrences(source, 'id="contenido"') === 1 — a scan of each file in
// ISOLATION. That can never observe how Next.js NESTS a boundary inside the
// layouts already active for a route, so it passed 93/93 while
// /productos/<slug-desconocido> was shipping two headers, two footers, two
// skip links and two MobileNav triggers. This suite closes that gap from two
// independent directions:
//
//   PART 1 — RENDERED HTML. Renders the real component trees through
//   react-dom/server and counts landmarks in the produced markup. Includes a
//   NEGATIVE CONTROL that reproduces the pre-fix composition and asserts it
//   is detected, so the suite is proven to have teeth rather than merely
//   passing.
//
//   PART 2 — HTTP-LEVEL PRODUCTION SMOKE. Boots the real production build
//   in-process (next({ dev: false }), no child process, no fixed port) behind
//   a loopback stub of GET /storefront/catalog, and asserts the actual
//   responses for both 404 paths.
//
// PART 1 vs PART 2, honestly stated. Next.js 16 serves a bubbled notFound()
// from a DYNAMIC route (/productos/[slug] is ƒ) as an error-recovery document
// — <html id="__next_error__"> with an empty body — and delivers the boundary
// through the RSC flight payload for the client to render. The canonical base
// f50ca41 behaves identically with Next's own built-in 404, so this is
// platform behaviour, not something S3 introduced. It does mean landmark
// counting on that route's raw HTML is not possible: Part 2 therefore asserts
// that route's status and branded content plus a shell-copy comparison
// against an ordinary public page, and Part 1 owns the exact landmark counts.
//
// Runner: node:test only, no jsdom / React Testing Library / new dependency
// (tests/adm1a §INV-23 — this repo runs exactly one test runner).
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import React from "react";

const ROOT = process.cwd();
const req = createRequire(__filename);

// The App Router files import .css, which bare Node cannot parse. tsx compiles
// this suite to CJS, so the CJS loader's extension table is the hook that
// actually runs. Stubbing it to an empty module is sound here: Part 1 asserts
// DOM STRUCTURE (landmarks, headings, links), never computed style.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(req as any).extensions[".css"] = () => {};

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function count(html: string, pattern: RegExp): number {
  return (html.match(pattern) || []).length;
}

/** Landmark/shell census of a rendered document fragment. */
function census(html: string) {
  return {
    header: count(html, /<header[\s>]/g),
    footer: count(html, /<footer[\s>]/g),
    main: count(html, /<main[\s>]/g),
    contenido: count(html, /id="contenido"/g),
    skipLink: count(html, /class="skip-link"/g),
    navPrincipal: count(html, /aria-label="Principal"/g),
    navPie: count(html, /aria-label="Pie de página"/g),
    mobileNavTrigger: count(html, /aria-controls="menu-movil"/g),
    menuMovilId: count(html, /id="menu-movil"/g),
    h1: count(html, /<h1[\s>]/g),
    html: count(html, /<html[\s>]/g),
    body: count(html, /<body[\s>]/g),
  };
}

/** Every landmark the public shell owns must appear exactly once. */
const EXACTLY_ONE_SHELL = {
  header: 1,
  footer: 1,
  main: 1,
  contenido: 1,
  skipLink: 1,
  navPrincipal: 1,
  navPie: 1,
  mobileNavTrigger: 1,
};

function assertExactlyOneShell(html: string, label: string) {
  const seen = census(html);
  for (const [key, expected] of Object.entries(EXACTLY_ONE_SHELL)) {
    assert.equal(
      seen[key as keyof typeof seen],
      expected,
      `${label}: expected exactly ${expected} ${key}, got ${seen[key as keyof typeof seen]}`,
    );
  }
  // A closed drawer renders no dialog; the id must never be duplicated when one opens,
  // which can only be guaranteed by there being exactly one MobileNav instance (above).
  assert.equal(seen.menuMovilId, 0, `${label}: no drawer should be open in server markup`);
}

async function render(node: React.ReactElement): Promise<string> {
  const { renderToStaticMarkup } = await import("react-dom/server");
  return renderToStaticMarkup(node);
}

// ---------------------------------------------------------------------------
// PART 1 — rendered-HTML composition
// ---------------------------------------------------------------------------

test("(public) layout + (public)/not-found renders EXACTLY ONE shell (bubbled notFound path)", async () => {
  const { default: PublicLayout } = await import("@/app/(public)/layout");
  const { default: PublicNotFound } = await import("@/app/(public)/not-found");

  const html = await render(React.createElement(PublicLayout, null, React.createElement(PublicNotFound)));
  assertExactlyOneShell(html, "(public)/layout + (public)/not-found");

  const seen = census(html);
  assert.equal(seen.h1, 1, "exactly one <h1>");
  assert.match(html, /No encontramos esta página/);
  assert.match(html, /href="\/"/);
  assert.match(html, /href="\/catalogo"/);
});

test("NEGATIVE CONTROL: composing the ROOT not-found inside the (public) layout is detected as a duplicate shell", async () => {
  // This is exactly what Next.js rendered for /productos/<slug-desconocido>
  // before app/(public)/not-found.tsx existed. If this ever stops failing the
  // shell assertions, the test above has lost its power and this suite is
  // worthless — so assert the duplication explicitly.
  const { default: PublicLayout } = await import("@/app/(public)/layout");
  const { default: RootNotFound } = await import("@/app/not-found");

  const html = await render(React.createElement(PublicLayout, null, React.createElement(RootNotFound)));
  const seen = census(html);

  assert.equal(seen.header, 2, "negative control must show the duplicated header");
  assert.equal(seen.footer, 2, "negative control must show the duplicated footer");
  assert.equal(seen.skipLink, 2, "negative control must show the duplicated skip link");
  assert.equal(seen.navPrincipal, 2);
  assert.equal(seen.navPie, 2);
  assert.equal(seen.mobileNavTrigger, 2, "two MobileNav triggers both target aria-controls=menu-movil");

  assert.throws(
    () => assertExactlyOneShell(html, "negative control"),
    /expected exactly 1 header, got 2/,
    "the shell assertion must reject the pre-fix composition",
  );
});

test("root not-found renders EXACTLY ONE shell on its own (unmatched-URL path)", async () => {
  // Outside every route group, only app/layout.tsx is active, so this boundary
  // legitimately brings its own shell.
  const { default: RootNotFound } = await import("@/app/not-found");

  const html = await render(React.createElement(RootNotFound));
  assertExactlyOneShell(html, "app/not-found");

  const seen = census(html);
  assert.equal(seen.h1, 1, "exactly one <h1>");
  assert.match(html, /No encontramos esta página/);
});

test("neither not-found boundary emits its own <html>/<body> (single-root invariant)", async () => {
  const { default: PublicLayout } = await import("@/app/(public)/layout");
  const { default: PublicNotFound } = await import("@/app/(public)/not-found");
  const { default: RootNotFound } = await import("@/app/not-found");

  for (const [label, node] of [
    ["app/(public)/not-found", React.createElement(PublicNotFound)],
    ["app/not-found", React.createElement(RootNotFound)],
    ["(public)/layout + (public)/not-found", React.createElement(PublicLayout, null, React.createElement(PublicNotFound))],
  ] as const) {
    const seen = census(await render(node));
    assert.equal(seen.html, 0, `${label} must not render <html>`);
    assert.equal(seen.body, 0, `${label} must not render <body>`);
  }
});

test("app/(public)/not-found.tsx renders content only — no shell, no amarillo.css", async () => {
  const { default: PublicNotFound } = await import("@/app/(public)/not-found");
  const html = await render(React.createElement(PublicNotFound));
  const seen = census(html);

  assert.equal(seen.header, 0, "the (public) layout is the sole Header provider");
  assert.equal(seen.footer, 0, "the (public) layout is the sole Footer provider");
  assert.equal(seen.skipLink, 0, "the (public) layout is the sole SkipLink provider");
  assert.equal(seen.mobileNavTrigger, 0, "no second MobileNav instance");
  assert.equal(seen.main, 1, "the boundary owns its <main id=\"contenido\">");
  assert.equal(seen.contenido, 1);

  const src = readFileSync(join(ROOT, "app", "(public)", "not-found.tsx"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
  for (const forbidden of ["amarillo.css", "SkipLink", "Header", "Footer"]) {
    assert.equal(src.includes(forbidden), false, `app/(public)/not-found.tsx must not reference ${forbidden}`);
  }
});

test("both 404 boundaries speak with one voice (drift guard)", async () => {
  const { default: PublicNotFound } = await import("@/app/(public)/not-found");
  const { default: RootNotFound } = await import("@/app/not-found");

  const heading = (html: string) => /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html)?.[1].replace(/<[^>]+>/g, "").trim();
  const publicHtml = await render(React.createElement(PublicNotFound));
  const rootHtml = await render(React.createElement(RootNotFound));

  assert.equal(heading(publicHtml), heading(rootHtml), "both 404 surfaces must show the same <h1>");
  assert.equal(heading(publicHtml), "No encontramos esta página");
  for (const copy of ["Error 404", "El enlace puede estar roto", "Ir a Inicio", "Ver Catálogo"]) {
    assert.ok(publicHtml.includes(copy), `(public) 404 missing: ${copy}`);
    assert.ok(rootHtml.includes(copy), `root 404 missing: ${copy}`);
  }
});

// ---------------------------------------------------------------------------
// PART 2 — HTTP-level production smoke against the real build
// ---------------------------------------------------------------------------

/** Newest mtime across the sources that affect the build output. */
function newestSourceMtime(): number {
  const roots = ["app", "components", "lib", "styles"].map((d) => join(ROOT, d));
  let newest = statSync(join(ROOT, "next.config.ts")).mtimeMs;
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else newest = Math.max(newest, statSync(full).mtimeMs);
    }
  };
  for (const r of roots) if (existsSync(r)) walk(r);
  return newest;
}

/** Ensure `.next` exists AND is not older than the sources it was built from —
 * a stale build would make this smoke assert against the wrong code. */
function ensureProductionBuild() {
  const buildId = join(ROOT, ".next", "BUILD_ID");
  if (existsSync(buildId) && statSync(buildId).mtimeMs >= newestSourceMtime()) return;
  console.log("[s3-notfound-composition] no usable production build — running `next build`…");
  const result = spawnSync(process.execPath, [req.resolve("next/dist/bin/next"), "build"], {
    cwd: ROOT,
    stdio: "inherit",
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  });
  assert.equal(result.status, 0, "next build must succeed before the HTTP smoke can run");
}

async function listen(server: Server): Promise<number> {
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
  return (server.address() as AddressInfo).port;
}

async function close(server: Server) {
  await new Promise<void>((resolve) => server.close(() => resolve()));
}

test("HTTP smoke: both 404 routes against the real production build", async (t) => {
  ensureProductionBuild();

  // Loopback stand-in for ai-agent-platform's GET /storefront/catalog. Without
  // it the catalog fetch fails closed to "unavailable" (HTTP 200) and
  // /productos/[slug] never reaches its notFound(). Serving the synthetic
  // fixture from a TEST is not the seam violation
  // tests/storefront-v2/seam-isolation.test.ts guards — that rule forbids
  // app/** and components/** from importing it, which stays true.
  const catalog = readFileSync(join(ROOT, "catalog.contract.v2.fixture.json"), "utf8");
  const stub = createServer((request, response) => {
    if (request.url?.startsWith("/storefront/catalog")) {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(catalog);
      return;
    }
    response.writeHead(404, { "content-type": "application/json" });
    response.end("{}");
  });
  const stubPort = await listen(stub);
  process.env.STOREFRONT_BACKEND_URL = `http://127.0.0.1:${stubPort}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const app = (req("next") as any)({ dev: false, dir: ROOT });
  await app.prepare();
  const handler = app.getRequestHandler();
  const server = createServer((request, response) => handler(request, response));
  const port = await listen(server);

  const get = async (path: string) => {
    const response = await fetch(`http://127.0.0.1:${port}${path}`);
    const body = await response.text();
    return { status: response.status, body, visible: body.replace(/<script[\s\S]*?<\/script>/g, "") };
  };

  try {
    // ---- B. genuinely unmatched URL: one complete shell, in the HTML itself
    await t.test("unmatched URL renders one complete branded shell", async () => {
      const { status, body, visible } = await get("/ruta-que-no-existe-xyz");
      assert.equal(status, 404, "unmatched URL must return HTTP 404");
      assertExactlyOneShell(visible, "GET /ruta-que-no-existe-xyz");
      assert.match(visible, /No encontramos esta página/);
      assert.equal(/This page could not be found/.test(body), false, "Next's default 404 must never surface");
    });

    // ---- A. bubbled notFound() from inside (public)
    await t.test("bubbled public notFound() returns 404 with branded Spanish content", async () => {
      const { status, body } = await get("/productos/slug-inexistente-xyz");
      assert.equal(status, 404, "unknown product slug must return HTTP 404");
      assert.match(body, /No encontramos esta página/);
      assert.equal(/This page could not be found/.test(body), false);
      // No error internals on a 404: it carries no error object at all.
      for (const leak of ["error.message", "error.stack", "\\nat ", "STOREFRONT_BACKEND_URL"]) {
        assert.equal(body.includes(leak), false, `404 response must not contain ${leak}`);
      }
    });

    await t.test("no route carries a second copy of the public shell", async () => {
      // Next 16 delivers this dynamic route's boundary through the flight
      // payload rather than the SSR shell (see this file's header), so exact
      // landmark counts for it live in Part 1. What IS decisive over HTTP is
      // how many COPIES of the shell each response carries, compared between
      // routes rendered by the same build. Two independent relations both
      // break the moment app/(public)/not-found.tsx composes the shell again;
      // both were verified to fail against a deliberately reintroduced
      // regression, so neither is decorative.
      const inGroup = await get("/productos/slug-inexistente-xyz"); // bubbled notFound() inside (public)
      const outOfGroup = await get("/ruta-que-no-existe-xyz"); // unmatched URL -> root not-found
      const ordinary = await get("/privacy"); // ordinary (public) page
      const copies = (body: string, marker: string) => body.split(marker).length - 1;

      for (const marker of ["Saltar al contenido", "Pie de página", "Ajuar artesanal para bebés"]) {
        const inG = copies(inGroup.body, marker);
        const outG = copies(outOfGroup.body, marker);
        const ord = copies(ordinary.body, marker);

        // 1. The in-group 404 inherits the shell from (public)/layout.tsx; the
        //    out-of-group 404 has to bring its own. The former must therefore
        //    ship strictly fewer copies. Duplicating the shell makes them equal.
        assert.ok(
          inG < outG,
          `"${marker}": in-group 404 carries ${inG} copies vs out-of-group ${outG} — the in-group boundary is composing its own shell`,
        );

        // 2. Next serializes a route group's not-found boundary into EVERY
        //    page in that group, so a shell-ful (public)/not-found.tsx also
        //    inflates ordinary pages. /privacy must never exceed the
        //    out-of-group 404, which carries exactly one shell by design.
        assert.ok(
          ord <= outG,
          `"${marker}": /privacy carries ${ord} copies vs ${outG} on the out-of-group 404 — the (public) not-found boundary is shipping an extra shell into every public page`,
        );
      }
    });
  } finally {
    await close(server);
    await close(stub);
    await app.close?.();
  }
});
