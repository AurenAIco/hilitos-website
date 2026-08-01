// tests/storefront-v2/whatsapp-cta-failclosed.test.ts — Slice S6.
//
// Proves WhatsAppCTA (components/layout/WhatsAppCTA.tsx) can never produce a
// believable dead link when no WhatsApp configuration is available:
//  1. A static-scan regression guard (mirrors storefront-image-host.test.ts's
//     style) proving the removed "#whatsapp-pendiente" placeholder fragment
//     never comes back anywhere under app/**, components/**, lib/** — and
//     that the component itself never reads process.env or imports
//     lib/whatsapp (it must only ever receive an href as a prop, never build
//     or guess one).
//  2. Real render tests via react-dom/server's renderToStaticMarkup (no
//     jsdom needed — this repo has none) proving the actual two branches:
//     missing href -> disabled, non-clickable, non-focusable control with no
//     "#..." fragment anywhere in the markup; configured href -> the exact
//     link is preserved with normal `<a href>` behavior.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { WhatsAppCTA } from "@/components/layout/WhatsAppCTA";

const ROOT = process.cwd();
const SCAN_DIRS = ["app", "components", "lib"];
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx"]);

/** Strip `//` and block comments before a substring scan, so an explanatory
 * comment that legitimately *names* something forbidden (e.g. WhatsAppCTA's
 * own doc comment explaining what it must never do) doesn't false-positive
 * as a real reference. Mirrors storefront-image-host.test.ts's helper. */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

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

const sourceFiles = SCAN_DIRS.flatMap((dir) => walk(join(ROOT, dir)));

// ── Static-scan regression guard ────────────────────────────────────────────

test("no source file under app/**, components/**, or lib/** contains the removed #whatsapp-pendiente placeholder", () => {
  for (const file of sourceFiles) {
    const src = readFileSync(file, "utf8");
    assert.equal(
      src.includes("whatsapp-pendiente"),
      false,
      `${file} must not reference the removed placeholder fragment`,
    );
  }
});

test("WhatsAppCTA.tsx never reads process.env and never imports lib/whatsapp (it only ever receives an href prop)", () => {
  const src = readFileSync(join(ROOT, "components", "layout", "WhatsAppCTA.tsx"), "utf8");
  const code = stripComments(src);
  assert.equal(code.includes("process.env"), false, "component must never read env directly, outside of comments");
  assert.equal(code.includes("lib/whatsapp"), false, "component must never import the href builder itself, outside of comments");
  assert.equal(/573\d{9}|57\d{9}/.test(code), false, "component must never contain a hardcoded phone number, outside of comments");
});

// ── Render tests ─────────────────────────────────────────────────────────────

const CONFIGURED_HREF = "https://wa.me/573053560882?text=Hola%2C%20me%20interesa%20el%20cat%C3%A1logo";

test("missing href (undefined) renders a disabled, non-clickable control — no <a> tag at all", () => {
  const html = renderToStaticMarkup(createElement(WhatsAppCTA, { label: "Escríbenos por WhatsApp" }));
  assert.equal(html.includes("<a "), false, "must not render an anchor when no href is available");
  assert.equal(html.includes("<a>"), false, "must not render an anchor when no href is available");
  assert.match(html, /<button[^>]*disabled/, "must render a native disabled button");
  assert.equal(html.includes("href="), false, "no href attribute should be present anywhere");
  assert.equal(html.includes("#whatsapp-pendiente"), false, "no fake fragment anywhere in the output");
});

test("missing href (null) renders the same disabled control as undefined", () => {
  const html = renderToStaticMarkup(createElement(WhatsAppCTA, { href: null, label: "Escríbenos por WhatsApp" }));
  assert.match(html, /<button[^>]*disabled/);
  assert.equal(html.includes("<a "), false);
});

test("missing href (empty string) also renders the disabled control, never a real-looking but empty link", () => {
  const html = renderToStaticMarkup(createElement(WhatsAppCTA, { href: "", label: "Escríbenos por WhatsApp" }));
  assert.match(html, /<button[^>]*disabled/);
  assert.equal(html.includes("<a "), false);
});

test("disabled control is excluded from the tab order and correctly announced (keyboard + aria)", () => {
  const html = renderToStaticMarkup(createElement(WhatsAppCTA, { label: "Escríbenos por WhatsApp" }));
  // A native `disabled` button is unfocusable/unclickable by the browser and
  // correctly announced as unavailable — no separate role/tabindex hack
  // needed, and none should be added (would be redundant with `disabled`).
  assert.match(html, /<button[^>]*\bdisabled=""/);
  assert.match(html, /aria-label="[^"]*no disponible[^"]*"/i);
  assert.equal(html.includes('tabindex="-1"'), false, "native disabled already removes focusability; no ad-hoc tabindex hack");
});

test("configured href is preserved exactly as a real clickable link, with normal visual/link behavior", () => {
  const html = renderToStaticMarkup(createElement(WhatsAppCTA, { href: CONFIGURED_HREF, label: "Escríbenos por WhatsApp" }));
  assert.match(html, new RegExp(`<a href="${CONFIGURED_HREF.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
  assert.equal(html.includes("disabled"), false, "a configured link must not carry the disabled styling/attribute");
  assert.equal(html.includes("#whatsapp-pendiente"), false);
});

test("label text renders identically whether the CTA is enabled or disabled (visual continuity)", () => {
  const enabled = renderToStaticMarkup(createElement(WhatsAppCTA, { href: CONFIGURED_HREF, label: "Confirmar por WhatsApp" }));
  const disabled = renderToStaticMarkup(createElement(WhatsAppCTA, { label: "Confirmar por WhatsApp" }));
  assert.equal(enabled.includes("Confirmar por WhatsApp"), true);
  assert.equal(disabled.includes("Confirmar por WhatsApp"), true);
});
