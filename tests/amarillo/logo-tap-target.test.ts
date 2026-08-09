// tests/amarillo/logo-tap-target.test.ts — regression guard for the
// independent QA finding: the Hilitos wordmark logo link measured ~24-30px
// tall on mobile (below the 44px accessible touch-target minimum every
// other interactive element in the header already meets). Fix: the logo
// <Link> itself grows to min-h-11 (flex + items-center), vertically
// centering the unchanged text-2xl wordmark — no visual size change.
//
// Header.tsx has no next/image dependency (MobileNav/WhatsAppCTA are both
// already proven renderable here — see tests/storefront-v2/
// whatsapp-shell-wiring-rendered.test.ts), so this is a real render proof,
// not a static scan.
import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Header } from "@/components/layout/Header";

test("the logo link's interactive box is at least 44px tall (min-h-11) on every viewport, not gated behind a breakpoint", () => {
  const html = renderToStaticMarkup(createElement(Header));
  // next/link's rendered attribute order does not match JSX source order
  // (href is not necessarily first) — anchor on aria-label, not href
  // position.
  const logoMatch = html.match(/<a[^>]*aria-label="Hilitos — inicio"[^>]*>/);
  assert.ok(logoMatch, "expected to find the logo link by its aria-label");
  const logoTag = logoMatch![0];
  assert.match(logoTag, /\bmin-h-11\b/, `expected min-h-11 on the logo link; got class list: ${logoTag}`);
  // Not qualified by a "md:" (or other) responsive prefix — the fix must
  // apply at every width, mobile included, not just desktop.
  assert.equal(/\bmd:min-h-11\b/.test(logoTag), false, "min-h-11 must be unconditional, not desktop-only");
});

test("the wordmark's own visual text size is unchanged (text-2xl) — only the interactive box grew, not the logo itself", () => {
  const html = renderToStaticMarkup(createElement(Header));
  // next/link's rendered attribute order does not match JSX source order
  // (href is not necessarily first) — anchor on aria-label, not href
  // position.
  const logoMatch = html.match(/<a[^>]*aria-label="Hilitos — inicio"[^>]*>/);
  assert.match(logoMatch![0], /\btext-2xl\b/);
});

test("the logo link still renders the accessible 'Hilitos — inicio' label and visible 'Hilitos' text", () => {
  const html = renderToStaticMarkup(createElement(Header));
  assert.match(html, /aria-label="Hilitos — inicio"/);
  assert.match(html, />Hilitos</);
});
