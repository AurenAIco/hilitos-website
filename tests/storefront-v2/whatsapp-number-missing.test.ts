// tests/storefront-v2/whatsapp-number-missing.test.ts — Slice S6.
//
// Proves the fail-closed contract end to end when NEXT_PUBLIC_WHATSAPP_NUMBER
// is absent: lib/whatsapp.ts's builders return null (never a fabricated
// number, never the canonical number substituted "for convenience"), and a
// real caller pattern (`href={builder() ?? undefined}`, as used in
// components/catalog/CatalogStatusBanner.tsx and
// components/product/VariantSelector.tsx) ends up rendering WhatsAppCTA's
// disabled control — never a clickable dead end.
//
// process.env.NEXT_PUBLIC_WHATSAPP_NUMBER is deleted before the dynamic
// import (inside a `before()` hook — this repo's tsx transform targets CJS
// output, where top-level `await` isn't available) so lib/whatsapp.ts's
// module-top-level read sees "unset", exactly like a real deploy with no
// WhatsApp number configured. node:test isolates this file in its own
// process, so this never races with whatsapp-number-configured.test.ts's
// opposite env state.
import test, { before } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { WhatsAppCTA } from "@/components/layout/WhatsAppCTA";

let buildGenericWhatsAppHref: typeof import("@/lib/whatsapp").buildGenericWhatsAppHref;
let buildDesignWhatsAppHref: typeof import("@/lib/whatsapp").buildDesignWhatsAppHref;
let buildVariantWhatsAppHref: typeof import("@/lib/whatsapp").buildVariantWhatsAppHref;

before(async () => {
  delete process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const whatsapp = await import("@/lib/whatsapp");
  buildGenericWhatsAppHref = whatsapp.buildGenericWhatsAppHref;
  buildDesignWhatsAppHref = whatsapp.buildDesignWhatsAppHref;
  buildVariantWhatsAppHref = whatsapp.buildVariantWhatsAppHref;
});

test("buildGenericWhatsAppHref returns null when no number is configured", () => {
  assert.equal(buildGenericWhatsAppHref(), null);
});

test("buildDesignWhatsAppHref returns null when no number is configured", () => {
  assert.equal(buildDesignWhatsAppHref({ designRef: "4194", name: "Body bordado nube" }), null);
});

test("buildVariantWhatsAppHref returns null when no number is configured", () => {
  assert.equal(
    buildVariantWhatsAppHref(
      { designRef: "4194", name: "Body bordado nube" },
      { ref: "4194-BLANCO-RN", color: { name: "Blanco" }, size: "RN" },
    ),
    null,
  );
});

test("the real caller pattern (href={builder() ?? undefined}) renders WhatsAppCTA's disabled control, never a clickable link", () => {
  const href = buildGenericWhatsAppHref();
  const html = renderToStaticMarkup(createElement(WhatsAppCTA, { href: href ?? undefined, label: "Escríbenos por WhatsApp" }));
  assert.equal(html.includes("<a "), false);
  assert.match(html, /<button[^>]*disabled/);
  assert.equal(html.includes("573053560882"), false, "no number — canonical or otherwise — may appear when unconfigured");
  assert.equal(html.includes("#whatsapp-pendiente"), false);
});
