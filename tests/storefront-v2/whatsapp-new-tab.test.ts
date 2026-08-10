// tests/storefront-v2/whatsapp-new-tab.test.ts — regression guard for the
// independent QA finding: on desktop, clicking a WhatsApp CTA replaced the
// storefront tab entirely (no way back except browser Back). Fix: every
// enabled WhatsApp link now opens in a new browsing context
// (target="_blank") with the standard safe rel attributes
// (rel="noopener noreferrer" — noopener prevents the new tab from getting a
// window.opener reference back into the storefront tab; noreferrer
// additionally suppresses the Referer header sent to wa.me).
//
// Preserves everything else: the disabled/unconfigured control still
// renders no <a> at all (untouched branch), the exact configured href is
// unchanged, and the click-tracking analytics callback still fires (see
// tests/storefront-v2/whatsapp-cta-failclosed.test.ts and
// whatsapp-number-configured.test.ts for those, unaffected by this file).
import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { WhatsAppCTA } from "@/components/layout/WhatsAppCTA";

const CONFIGURED_HREF = "https://wa.me/573053560882?text=Hola%2C%20me%20interesa%20el%20cat%C3%A1logo";

test("a configured WhatsApp link opens in a new browsing context with the standard safe rel attributes", () => {
  const html = renderToStaticMarkup(createElement(WhatsAppCTA, { href: CONFIGURED_HREF, label: "Escríbenos por WhatsApp" }));
  assert.match(html, /<a href="[^"]+" target="_blank" rel="noopener noreferrer"/);
});

test("target/rel do not alter the exact configured wa.me destination", () => {
  const html = renderToStaticMarkup(createElement(WhatsAppCTA, { href: CONFIGURED_HREF, label: "Escríbenos por WhatsApp" }));
  assert.match(html, new RegExp(`href="${CONFIGURED_HREF.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
});

test("the disabled/unconfigured control still renders no <a> at all — target/rel is only ever added to a real link", () => {
  const html = renderToStaticMarkup(createElement(WhatsAppCTA, { label: "Escríbenos por WhatsApp" }));
  assert.equal(html.includes("<a "), false);
  assert.equal(html.includes("target="), false);
  assert.match(html, /<button[^>]*disabled/);
});

test("rel is exactly \"noopener noreferrer\" — noopener alone is not enough (still leaks a Referer to wa.me)", () => {
  const html = renderToStaticMarkup(createElement(WhatsAppCTA, { href: CONFIGURED_HREF, label: "Escríbenos por WhatsApp" }));
  assert.match(html, /rel="noopener noreferrer"/);
});
