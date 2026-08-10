// tests/amarillo/skip-link-focus.test.ts — regression guard for the
// independent QA finding: "Saltar al contenido" correctly scrolls to
// #contenido but keyboard focus never actually moves there. Root cause:
// <main id="contenido"> is not natively focusable, so the browser's
// built-in same-page hash-navigation focus behavior (activating an
// in-page anchor link already asks the browser to focus the target
// element, when that element IS focusable) had nothing to focus. Fix:
// every <main id="contenido"> now carries tabIndex={-1} — programmatically
// focusable via that native hash-navigation path, but excluded from the
// normal sequential Tab order (a negative tabindex is never reachable by
// pressing Tab; it is only reachable via .focus() or, here, the browser's
// own fragment-focus behavior) — so "next Tab proceeds from content" (the
// content's own first focusable descendant) still holds.
//
// HONESTY BOUNDARY: real Tab/Enter/focus-shift keyboard behavior requires
// an actual browser (verified separately). What IS provable here in plain
// node:test:
//  1. SkipLink.tsx itself is UNCHANGED — a plain <a href="#contenido">, no
//     onClick/JS added ("do not rewrite the skip-link system").
//  2. A real render of one Client Component boundary (app/(public)/error.tsx
//     — no next/image, safe to render directly) proves tabIndex={-1}
//     actually reaches the rendered HTML as tabindex="-1", not just source
//     text.
//  3. A static-scan across every app/** file rendering <main id="contenido">
//     (Server Components using next/image can't be rendered directly here
//     — see tests/homepage/home-featured-gate.test.ts's established
//     precedent) proves every one of them carries tabIndex={-1}, and that
//     none accidentally uses a non-negative value (which would wrongly
//     re-enter the normal Tab order).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SkipLink } from "@/components/layout/SkipLink";
import RouteError from "@/app/(public)/error";

const ROOT = process.cwd();

/** Strip `//` and block comments before scanning — same rationale as
 * tests/seo/robots-sitemap.test.ts's stripComments: app/(public)/layout.tsx
 * PROSE-mentions `<main id="contenido">` in its own doc comment ("every
 * public page owns its <main id=\"contenido\"> landmark") without ever
 * rendering one itself; a naive substring scan would misidentify it as an
 * offending file. */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

test("SkipLink.tsx is unchanged: a plain <a href=\"#contenido\">, no onClick/JS focus hack added", () => {
  const html = renderToStaticMarkup(createElement(SkipLink));
  assert.match(html, /<a href="#contenido"/);
  assert.equal(html.includes("onClick") || html.includes("onclick"), false);
  assert.match(html, />Saltar al contenido</);
});

test("a real rendered boundary's <main id=\"contenido\"> carries tabindex=\"-1\" in the actual HTML output", () => {
  const html = renderToStaticMarkup(createElement(RouteError, { error: new Error("x"), reset: () => {} }));
  assert.match(html, /<main id="contenido" tabindex="-1"/);
});

// ── static-scan across every app/** occurrence ──────────────────────────────

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === ".next") continue;
      walk(full, files);
    } else if (extname(entry) === ".tsx") {
      files.push(full);
    }
  }
  return files;
}

const appFiles = walk(join(ROOT, "app"));
const filesWithContenido = appFiles
  .map((file) => ({ file, src: stripComments(readFileSync(file, "utf8")) }))
  .filter(({ src }) => src.includes('id="contenido"'));

test("at least the ten known route/boundary files still render <main id=\"contenido\">", () => {
  // Regression floor, not a ceiling — new routes are expected to add more.
  assert.ok(filesWithContenido.length >= 10, `expected >= 10 files with id="contenido", found ${filesWithContenido.length}`);
});

test("every <main id=\"contenido\"> in app/** carries tabIndex={-1} — the skip-link target must always be focusable", () => {
  const offenders: string[] = [];
  for (const { file, src } of filesWithContenido) {
    // One regex per <main id="contenido" ...> opening tag, checked for the
    // exact prop immediately alongside id="contenido" (handles either
    // attribute order, since some files add className after it).
    const mainTags = src.match(/<main id="contenido"[^>]*>/g) ?? [];
    for (const tag of mainTags) {
      if (!/\btabIndex=\{-1\}/.test(tag)) {
        offenders.push(`${file}: ${tag}`);
      }
    }
  }
  assert.deepEqual(offenders, [], `<main id="contenido"> missing tabIndex={-1}:\n${offenders.join("\n")}`);
});

test("no <main id=\"contenido\"> uses a non-negative tabIndex (that would wrongly re-enter the normal Tab order)", () => {
  const offenders: string[] = [];
  for (const { file, src } of filesWithContenido) {
    const mainTags = src.match(/<main id="contenido"[^>]*>/g) ?? [];
    for (const tag of mainTags) {
      const match = tag.match(/tabIndex=\{(-?\d+)\}/);
      if (match && match[1] !== "-1") {
        offenders.push(`${file}: ${tag}`);
      }
    }
  }
  assert.deepEqual(offenders, [], `<main id="contenido"> with a non -1 tabIndex:\n${offenders.join("\n")}`);
});
