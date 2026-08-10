// tests/analytics/configured-payload-safety.test.ts — cleanup-pass audit:
// proves that EVEN IF NEXT_PUBLIC_ANALYTICS_ENDPOINT were configured (a
// future, separate product decision — not made by this repo today; see
// tests/analytics/dormant-unconfigured.test.ts for proof no default exists
// anywhere), the payload sent is limited to the safe property set and a
// transport failure can never throw or block navigation.
//
// Fakes `window`/`navigator` (this node:test process has no real DOM) so
// track()'s browser-API calls can execute and be captured, instead of
// being unreachable behind the early-return this file's sibling exercises.
import test, { before } from "node:test";
import assert from "node:assert/strict";

let track: typeof import("@/lib/analytics").track;

const CAPTURED: unknown[] = [];
const FAKE_ENDPOINT = "https://analytics.example.com/collect";

/** Node 24 defines a real (getter-only) `navigator` global — plain
 * assignment throws "Cannot set property navigator... which has only a
 * getter". Redefining the property (configurable: true) is required to
 * install a fake per test. */
function setFakeNavigator(navigatorLike: unknown) {
  Object.defineProperty(globalThis, "navigator", {
    value: navigatorLike,
    configurable: true,
    writable: true,
  });
}

before(async () => {
  process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT = FAKE_ENDPOINT;

  (globalThis as { window?: unknown }).window = { location: { pathname: "/productos/design-4194" } };
  setFakeNavigator({
    sendBeacon(url: string, body: Blob) {
      CAPTURED.push({ url, body });
      return true;
    },
  });

  ({ track } = await import("@/lib/analytics"));
});

async function lastPayload(): Promise<Record<string, unknown>> {
  const entry = CAPTURED.at(-1) as { url: string; body: Blob };
  const text = await entry.body.text();
  return JSON.parse(text);
}

test("a configured endpoint receives a sendBeacon call at the exact configured URL", async () => {
  CAPTURED.length = 0;
  track({ name: "product_view", product_ref: "4194", category: "ajuares-y-estuches" });
  assert.equal(CAPTURED.length, 1);
  assert.equal((CAPTURED[0] as { url: string }).url, FAKE_ENDPOINT);
});

test("the payload for a variant-scoped whatsapp_click contains only the safe property set — no PII, no message text, no phone number", async () => {
  CAPTURED.length = 0;
  track({ name: "whatsapp_click", product_ref: "4194", variant_ref: "4194-BEIGE-CELESTE-T6", source: "product_detail" });
  const payload = await lastPayload();

  assert.deepEqual(new Set(Object.keys(payload)), new Set(["name", "product_ref", "variant_ref", "source", "pathname"]));
  assert.equal(payload.name, "whatsapp_click");
  assert.equal(payload.product_ref, "4194", "product_ref must be the BASE design ref, never the variant SKU");
  assert.equal(payload.variant_ref, "4194-BEIGE-CELESTE-T6");
  assert.equal(payload.source, "product_detail");
  assert.equal(payload.pathname, "/productos/design-4194");

  const serialized = JSON.stringify(payload);
  assert.equal(/\+?57\d{9}/.test(serialized), false, "must never contain a Colombian phone number");
  assert.equal(serialized.toLowerCase().includes("wa.me"), false);
  assert.equal(serialized.toLowerCase().includes("hola"), false, "must never contain the WhatsApp prefilled message text");
});

test("a generic (non-product) whatsapp_click carries product_ref: null and no variant_ref key at all", async () => {
  CAPTURED.length = 0;
  track({ name: "whatsapp_click", product_ref: null, source: "header" });
  const payload = await lastPayload();
  assert.deepEqual(new Set(Object.keys(payload)), new Set(["name", "product_ref", "source", "pathname"]));
  assert.equal(payload.product_ref, null);
  assert.equal("variant_ref" in payload, false, "variant_ref must be omitted entirely, not sent as undefined/null, when there is no selected variant");
});

test("the payload for a bare catalog_view (no collection) contains only name/collection_ref/pathname", async () => {
  CAPTURED.length = 0;
  track({ name: "catalog_view", collection_ref: null });
  const payload = await lastPayload();
  assert.deepEqual(new Set(Object.keys(payload)), new Set(["name", "collection_ref", "pathname"]));
  assert.equal(payload.collection_ref, null);
});

test("catalog_view for a /colecciones/[slug] view carries the real collection_ref slug", async () => {
  CAPTURED.length = 0;
  track({ name: "catalog_view", collection_ref: "batas" });
  const payload = await lastPayload();
  assert.equal(payload.collection_ref, "batas");
});

test("the payload for product_view contains only name/product_ref/category/pathname", async () => {
  CAPTURED.length = 0;
  track({ name: "product_view", product_ref: "4194", category: "ajuares-y-estuches" });
  const payload = await lastPayload();
  assert.deepEqual(new Set(Object.keys(payload)), new Set(["name", "product_ref", "category", "pathname"]));
});

test("a sendBeacon failure (throws) never propagates out of track() — never blocks navigation", () => {
  setFakeNavigator({
    sendBeacon() {
      throw new Error("simulated transport failure");
    },
  });
  assert.doesNotThrow(() => track({ name: "whatsapp_click", product_ref: null, source: "header" }));
});
