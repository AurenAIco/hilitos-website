// tests/storefront-v2/whatsapp-number-configured.test.ts — Slice S6 addendum.
//
// Authoritative number: +57 305 356 0882 / canonical digits 573053560882
// (mission addendum). This file sets NEXT_PUBLIC_WHATSAPP_NUMBER BEFORE
// importing lib/whatsapp.ts — that module reads the env var once, at module
// top level (Next.js NEXT_PUBLIC_ inlining convention). The import happens
// inside a `before()` hook via dynamic `import()` AFTER the assignment:
// static `import` declarations are hoisted in ESM and would run first
// (resolving against the wrong process.env snapshot), and this repo's tsx
// transform targets CJS output, where top-level `await` isn't available.
//
// node:test runs each matched test file in its own child process by
// default, so mutating process.env here does not leak into
// whatsapp-number-missing.test.ts (which needs the opposite state).
import test, { before } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { WhatsAppCTA } from "@/components/layout/WhatsAppCTA";

let buildGenericWhatsAppHref: typeof import("@/lib/whatsapp").buildGenericWhatsAppHref;
let buildDesignWhatsAppHref: typeof import("@/lib/whatsapp").buildDesignWhatsAppHref;
let buildVariantWhatsAppHref: typeof import("@/lib/whatsapp").buildVariantWhatsAppHref;

before(async () => {
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = "+57 305 356 0882";
  const whatsapp = await import("@/lib/whatsapp");
  buildGenericWhatsAppHref = whatsapp.buildGenericWhatsAppHref;
  buildDesignWhatsAppHref = whatsapp.buildDesignWhatsAppHref;
  buildVariantWhatsAppHref = whatsapp.buildVariantWhatsAppHref;
});

const CANONICAL_DIGITS = "573053560882";
const EXPECTED_PREFIX = `https://wa.me/${CANONICAL_DIGITS}`;

test("'+57 305 356 0882' (with +, spaces) normalizes to the canonical digits-only 573053560882", () => {
  const href = buildGenericWhatsAppHref();
  assert.notEqual(href, null);
  assert.equal(new URL(href!).hostname, "wa.me");
  assert.equal(new URL(href!).pathname, `/${CANONICAL_DIGITS}`);
});

test("buildGenericWhatsAppHref uses the wa.me/573053560882 prefix and no other number", () => {
  const href = buildGenericWhatsAppHref();
  assert.equal(href!.startsWith(EXPECTED_PREFIX), true, `expected prefix ${EXPECTED_PREFIX}, got ${href}`);
  const digitSequences = href!.match(/\d{6,}/g) ?? [];
  for (const seq of digitSequences) {
    assert.equal(seq, CANONICAL_DIGITS, `no alternate phone number may appear in the href (found ${seq})`);
  }
});

test("buildDesignWhatsAppHref uses the same canonical number and an encoded, design-specific message", () => {
  const href = buildDesignWhatsAppHref({ designRef: "4194", name: "Body bordado nube" });
  assert.notEqual(href, null);
  assert.equal(href!.startsWith(EXPECTED_PREFIX), true);
  const url = new URL(href!);
  assert.equal(url.pathname, `/${CANONICAL_DIGITS}`);
  const message = url.searchParams.get("text");
  assert.match(message ?? "", /4194/);
  assert.match(message ?? "", /Body bordado nube/);
});

test("buildVariantWhatsAppHref uses the same canonical number and an encoded, variant-specific message", () => {
  const href = buildVariantWhatsAppHref(
    { designRef: "4194", name: "Body bordado nube" },
    { ref: "4194-BLANCO-RN", color: { name: "Blanco" }, size: "RN" },
  );
  assert.notEqual(href, null);
  assert.equal(href!.startsWith(EXPECTED_PREFIX), true);
  const url = new URL(href!);
  assert.equal(url.pathname, `/${CANONICAL_DIGITS}`);
  const message = url.searchParams.get("text");
  assert.match(message ?? "", /4194-BLANCO-RN/);
  assert.match(message ?? "", /Blanco/);
  assert.match(message ?? "", /RN/);
});

test("a configured CTA renders a real <a href='https://wa.me/573053560882?...'> link, indistinguishable in structure from any other link", () => {
  const href = buildGenericWhatsAppHref();
  const html = renderToStaticMarkup(createElement(WhatsAppCTA, { href, label: "Escríbenos por WhatsApp" }));
  assert.match(html, /<a href="https:\/\/wa\.me\/573053560882\?text=/);
  assert.equal(html.includes("disabled"), false);
});
