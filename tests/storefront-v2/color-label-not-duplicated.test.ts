// tests/storefront-v2/color-label-not-duplicated.test.ts — regression guard
// for the independent QA finding: multi-color product pages visibly
// rendered each color name TWICE ("Beige Beige", "Celeste Celeste",
// "Rosado Rosado"). Root cause: components/ui/ColorSwatch.tsx already
// renders the name as VISIBLE text when a colorway has no hex (the
// name-only-chip branch), and components/product/VariantSelector.tsx's
// color button ALSO rendered `{color.name}` unconditionally right after it
// — duplicating the no-hex case while the hex case (ColorSwatch renders an
// icon-only dot there) stayed correct.
//
// HONESTY BOUNDARY: VariantSelector.tsx imports next/image, which this
// repo's node:test harness cannot render outside the Next runtime (see
// tests/homepage/home-featured-gate.test.ts's header for the established
// precedent). This file therefore combines two proofs:
//  1. A REAL render of ColorSwatch (no next/image — safe to render here)
//     proving its own two branches each surface the name exactly once,
//     through the right channel (visible text vs. accessible name only).
//  2. A static-scan of VariantSelector.tsx's color-button JSX proving the
//     trailing name is now conditional on `color.hex`, and that the old
//     unconditional-duplicate pattern cannot silently return.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ColorSwatch } from "@/components/ui/ColorSwatch";

const ROOT = process.cwd();
const VARIANT_SELECTOR_PATH = join(ROOT, "components", "product", "VariantSelector.tsx");

// ── 1. ColorSwatch itself: each branch surfaces the name through exactly
//    one channel ──────────────────────────────────────────────────────────

test("ColorSwatch (no hex) renders the color name as visible text exactly once, with no aria-label duplicating it", () => {
  const html = renderToStaticMarkup(createElement(ColorSwatch, { color: { name: "Beige" } }));
  const visibleOccurrences = html.match(/>Beige</g) ?? [];
  assert.equal(visibleOccurrences.length, 1, `expected exactly one visible "Beige" text node, got: ${html}`);
  assert.equal(html.includes("aria-label"), false, "the name-only chip's text IS its accessible name — no separate aria-label needed");
});

test("ColorSwatch (with hex) renders the color name only as an accessible name (aria-label/title), never as visible text", () => {
  const html = renderToStaticMarkup(createElement(ColorSwatch, { color: { name: "Celeste", hex: "#BFE3EF" } }));
  const visibleOccurrences = html.match(/>Celeste</g) ?? [];
  assert.equal(visibleOccurrences.length, 0, `expected zero visible "Celeste" text nodes (icon-only swatch), got: ${html}`);
  assert.match(html, /aria-label="Celeste"/);
});

// ── 2. VariantSelector's color button: static-scan proof (next/image blocks
//    real rendering here) ───────────────────────────────────────────────────

const variantSelectorSrc = readFileSync(VARIANT_SELECTOR_PATH, "utf8");

test("VariantSelector's color button only adds trailing visible text for the hex branch — the branch where ColorSwatch itself renders none", () => {
  const swatchCallIndex = variantSelectorSrc.indexOf("<ColorSwatch color={color} />");
  assert.notEqual(swatchCallIndex, -1, "expected to find the ColorSwatch render call in the color button");
  const after = variantSelectorSrc.slice(swatchCallIndex, swatchCallIndex + 800);
  assert.match(
    after,
    /\{color\.hex\s*\?\s*color\.name\s*:\s*null\}/,
    `expected the trailing name to be conditional on color.hex right after ColorSwatch; got: ${JSON.stringify(after)}`,
  );
});

test("REGRESSION — the old unconditional duplicate pattern (ColorSwatch immediately followed by a bare {color.name}) never comes back", () => {
  assert.equal(
    /<ColorSwatch color=\{color\} \/>\s*\{color\.name\}\s*<\/button>/.test(variantSelectorSrc),
    false,
    "the color button must never render {color.name} unconditionally right after <ColorSwatch/> — that is exactly the reported 'Beige Beige' duplication",
  );
});
