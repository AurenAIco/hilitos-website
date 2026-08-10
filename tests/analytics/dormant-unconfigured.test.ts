// tests/analytics/dormant-unconfigured.test.ts — cleanup-pass audit:
// proves lib/analytics.ts's track() is a genuine no-op with no
// NEXT_PUBLIC_ANALYTICS_ENDPOINT configured (the default, real-repo state —
// no default value is set anywhere in this repo; see the sibling static
// scans below).
//
// This test process has no DOM (node:test, no jsdom) — window/navigator do
// not exist as real browser globals. That absence is exactly what makes
// "does not throw" a strong proof here: if track() ever executed past its
// early-return guard when unconfigured, it would immediately hit
// `window.location` and throw a ReferenceError in THIS process. A silent,
// no-network no-op is the only way these calls can succeed here.
//
// NEXT_PUBLIC_ANALYTICS_ENDPOINT must be unset BEFORE lib/analytics.ts is
// imported (module-level constant, same convention as every other
// NEXT_PUBLIC_*-reading module in this repo) — dynamic import inside
// before(), same as tests/storefront-v2/whatsapp-number-missing.test.ts.
import test, { before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

let track: typeof import("@/lib/analytics").track;

const SRC = readFileSync(join(process.cwd(), "lib", "analytics.ts"), "utf8");

before(async () => {
  delete process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;
  ({ track } = await import("@/lib/analytics"));
});

test("track() never throws and never touches window/navigator when no endpoint is configured (every approved event shape)", () => {
  assert.doesNotThrow(() => track({ name: "catalog_view", collection_ref: null }));
  assert.doesNotThrow(() => track({ name: "catalog_view", collection_ref: "batas" }));
  assert.doesNotThrow(() => track({ name: "product_view", product_ref: "4194", category: "ajuares-y-estuches" }));
  assert.doesNotThrow(() => track({ name: "whatsapp_click", product_ref: null, source: "header" }));
  assert.doesNotThrow(() => track({ name: "whatsapp_click", product_ref: "4194", variant_ref: "4194-BEIGE-CELESTE-T6", source: "product_detail" }));
});

// ── Static-scan: the guarantees this must hold even in the configured path ──

test("lib/analytics.ts imports no package — native browser APIs (sendBeacon/fetch/Blob) only, zero new dependency", () => {
  assert.equal(/^\s*import\s/m.test(SRC), false, "must not import anything — a new import here would mean a new dependency or a coupling this module must not have");
});

test("lib/analytics.ts never reads document.cookie", () => {
  assert.equal(SRC.includes("document.cookie"), false);
});

test("lib/analytics.ts never touches localStorage or sessionStorage", () => {
  assert.equal(SRC.includes("localStorage"), false);
  assert.equal(SRC.includes("sessionStorage"), false);
});

test("lib/analytics.ts never generates or reads a fingerprint/session/user/customer identifier", () => {
  for (const forbidden of ["fingerprint", "userId", "customerId", "sessionId", "anonymousId", "crypto.randomUUID", "uuid"]) {
    assert.equal(SRC.toLowerCase().includes(forbidden.toLowerCase()), false, `must not reference "${forbidden}"`);
  }
});

test("lib/analytics.ts never imports lib/whatsapp.ts's builders or reads a phone number/message/customer name", () => {
  // "whatsapp" itself is not banned outright — the module legitimately
  // names the "whatsapp_cta_click" EVENT and discusses the concept in its
  // own doc comment ("Never a customer name, phone number, or WhatsApp
  // message body...", "Mirrors ... lib/whatsapp.ts's WhatsApp number...").
  // What must never appear is a real IMPORT of lib/whatsapp.ts, a call to
  // its message/number builders, a literal phone number, or message copy —
  // checked precisely (an import statement, a function CALL with "("),
  // not a bare substring, so the module's own prose explaining this exact
  // constraint can never false-positive against itself.
  assert.equal(/from\s+["']@\/lib\/whatsapp["']/.test(SRC), false, "must not import lib/whatsapp.ts");
  for (const builderCall of ["buildGenericWhatsAppHref(", "buildVariantWhatsAppHref(", "buildDesignWhatsAppHref("]) {
    assert.equal(SRC.includes(builderCall), false, `must not call ${builderCall}...) — this module receives only the pre-built AnalyticsEvent, never wa.me content`);
  }
  assert.equal(SRC.includes("customerName"), false);
  assert.equal(/\+?57\d{9}/.test(SRC), false, "must not contain a literal Colombian phone number");
  assert.equal(/hola,?\s+(me interesa|quisiera)/i.test(SRC), false, "must not contain WhatsApp prefilled message copy");
});

test("lib/analytics.ts hardcodes no analytics endpoint URL anywhere — the only source is the env var", () => {
  assert.equal(/https?:\/\//.test(SRC), false, "no literal URL of any kind may appear in this file");
});

test("no default/fallback value is chained onto NEXT_PUBLIC_ANALYTICS_ENDPOINT — unset must resolve to empty, not a guessed endpoint", () => {
  assert.match(SRC, /process\.env\.NEXT_PUBLIC_ANALYTICS_ENDPOINT\?\.trim\(\)\s*\|\|\s*""/);
});

// ── Event contract corrections (Fix 8): Problem A (collection_ref, not a
//    bare `category`, and no separate collection_view) and Problem B
//    (product_ref always means the base design ref; a variant is a
//    separate variant_ref, never a product_ref substitute) ─────────────────

test("the event contract uses collection_ref for a collection slug — never the removed 'category' misnomer on catalog_view", () => {
  assert.match(SRC, /"catalog_view";\s*collection_ref:\s*string \| null/);
});

test("there is no separate collection_view event — /catalogo and /colecciones/[slug] are both catalog_view", () => {
  // Checked as the TS discriminated-union literal form (quoted, as it would
  // appear in the AnalyticsEvent type), not a bare substring — the module's
  // own doc comment legitimately explains, in prose, why no such event
  // exists ("no separate `collection_view` event..."), using markdown
  // backticks rather than the TS string-literal quoting a real type entry
  // would use.
  assert.equal(SRC.includes('"collection_view"'), false);
});

test("whatsapp_click (not the old whatsapp_cta_click name) carries product_ref/variant_ref/source", () => {
  assert.equal(SRC.includes("whatsapp_cta_click"), false, "the old event name must not remain anywhere");
  assert.match(SRC, /"whatsapp_click";\s*product_ref:\s*string \| null;\s*variant_ref\?:\s*string;\s*source:\s*string/);
});

test("product_view carries product_ref (base design ref) and category — never a bare 'ref'", () => {
  assert.match(SRC, /"product_view";\s*product_ref:\s*string;\s*category:\s*string/);
});

test("the outgoing payload field is 'pathname', matching the approved contract exactly (not the prior 'path')", () => {
  assert.match(SRC, /pathname:\s*window\.location\.pathname/);
  assert.equal(/[^a-zA-Z]path:\s*window/.test(SRC), false, "must not still emit the old 'path' field name");
});
