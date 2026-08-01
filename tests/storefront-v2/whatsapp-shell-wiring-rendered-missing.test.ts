// tests/storefront-v2/whatsapp-shell-wiring-rendered-missing.test.ts — Wave 1
// integration hardening.
//
// Sibling of whatsapp-shell-wiring-rendered.test.ts, isolated in its own file
// (node:test runs each file in its own child process) so this file's deleted
// NEXT_PUBLIC_WHATSAPP_NUMBER never races with the other file's configured
// state. Proves Header and Footer render the native disabled control — never
// a clickable link, never a fabricated number, never #whatsapp-pendiente —
// when no WhatsApp number is configured.
import test, { before } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

let Header: typeof import("@/components/layout/Header").Header;
let Footer: typeof import("@/components/layout/Footer").Footer;

before(async () => {
  delete process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  ({ Header } = await import("@/components/layout/Header"));
  ({ Footer } = await import("@/components/layout/Footer"));
});

// Header/Footer render other real <a> tags (wordmark, nav links) besides the
// WhatsApp CTA, so the proof targets the WhatsApp affordance specifically:
// no anchor may point at wa.me, and the disabled control (identified by
// WhatsAppCTA's own "(no disponible por el momento)" aria-label suffix) must
// be present instead.
function assertWhatsAppDisabled(html: string) {
  assert.equal(/<a[^>]*wa\.me/.test(html), false, "no clickable WhatsApp link may render when unconfigured");
  assert.match(html, /<button[^>]*disabled[^>]*aria-label="[^"]*\(no disponible por el momento\)"/);
  assert.equal(html.includes("573053560882"), false);
  assert.equal(html.includes("#whatsapp-pendiente"), false);
}

test("Header renders the disabled WhatsApp control, never a fake link, when unconfigured", () => {
  assertWhatsAppDisabled(renderToStaticMarkup(createElement(Header)));
});

test("Footer renders the disabled WhatsApp control, never a fake link, when unconfigured", () => {
  assertWhatsAppDisabled(renderToStaticMarkup(createElement(Footer)));
});
