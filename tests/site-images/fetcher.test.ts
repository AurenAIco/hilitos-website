// tests/site-images/fetcher.test.ts — IMG-S8B3 (Public Editorial Image
// Resolution). Proves lib/catalog/siteImages.ts's fetch/parse contract:
// getStorefrontSiteImages() NEVER throws, ALWAYS degrades to `{}` on any
// backend failure mode, and parseSiteImageResponse validates/normalizes a
// response body one slot at a time (partial-map survival) rather than
// all-or-nothing.
//
// PATH FIXTURES (corrected 2026-08-16 after independent review): the REAL
// backend contract is bucket-relative — `editorial/{company_id-uuid}/
// {slot_key}.{ext}` — never root-relative and never already containing the
// "/storage/v1/object/public/product-images/" prefix. Every fixture below
// uses editorialPath(), which emits exactly that shape with the synthetic
// UUID the reviewer specified (550e8400-e29b-41d4-a716-446655440000).
//
// NO NETWORK: globalThis.fetch is replaced with a local, in-process stub
// BEFORE the module under test is imported (mirrors
// tests/homepage/home-featured-gate.test.ts's pattern) — nothing here ever
// contacts a real backend, live or otherwise. STOREFRONT_BACKEND_URL is set
// only inside this test process (node:test runs each file in its own child
// process, so it never leaks to another file — see
// tests/site-images/backend-url-unset.test.ts for the complementary "unset"
// case, which needs its own file for exactly that reason).
import test, { before } from "node:test";
import assert from "node:assert/strict";

let getStorefrontSiteImages: typeof import("@/lib/catalog/siteImages").getStorefrontSiteImages;
let parseSiteImageResponse: typeof import("@/lib/catalog/siteImages").parseSiteImageResponse;
let isValidSiteImagePath: typeof import("@/lib/catalog/siteImages").isValidSiteImagePath;
let SITE_IMAGE_SLOT_KEYS: typeof import("@/lib/catalog/siteImages").SITE_IMAGE_SLOT_KEYS;
let SITE_IMAGES_REVALIDATE_SECONDS: typeof import("@/lib/catalog/siteImages").SITE_IMAGES_REVALIDATE_SECONDS;
let STOREFRONT_SITE_IMAGES_SLUG: typeof import("@/lib/catalog/siteImages").STOREFRONT_SITE_IMAGES_SLUG;
let isSiteImageSlotKey: typeof import("@/lib/catalog/siteImages").isSiteImageSlotKey;

type FetchArgs = { input: unknown; init?: RequestInit };
let lastFetchArgs: FetchArgs | null = null;
/** Reassigned per-test; the globalThis.fetch stub below always calls
 * whatever this currently points to, via closure — never captured by value. */
let fetchImpl: (input: unknown, init?: RequestInit) => Promise<Response> = async () => {
  throw new Error("fetchImpl not configured for this test");
};

/** Both helpers exist so tests never assign to/narrow `lastFetchArgs`
 * directly in their own function body — TypeScript's control-flow analysis
 * has no way to know that `await getStorefrontSiteImages()` (an imported
 * call) is what reassigns this module-scope variable via the monkey-patched
 * globalThis.fetch closure above, so a direct `lastFetchArgs = null;`
 * followed later by a truthy-check in the SAME function body gets narrowed
 * to the literal `null` and stays there — these wrapper functions give each
 * concern (reset vs. read) its own fresh, un-tainted analysis scope. */
function resetLastFetchArgs(): void {
  lastFetchArgs = null;
}
function requireLastFetchArgs(): FetchArgs {
  if (!lastFetchArgs) throw new Error("expected fetch to have been called");
  return lastFetchArgs;
}

before(async () => {
  process.env.STOREFRONT_BACKEND_URL = "https://backend.invalid";
  globalThis.fetch = (async (input: unknown, init?: RequestInit) => {
    lastFetchArgs = { input, init };
    return fetchImpl(input, init);
  }) as typeof globalThis.fetch;

  const mod = await import("@/lib/catalog/siteImages");
  getStorefrontSiteImages = mod.getStorefrontSiteImages;
  parseSiteImageResponse = mod.parseSiteImageResponse;
  isValidSiteImagePath = mod.isValidSiteImagePath;
  SITE_IMAGE_SLOT_KEYS = mod.SITE_IMAGE_SLOT_KEYS;
  SITE_IMAGES_REVALIDATE_SECONDS = mod.SITE_IMAGES_REVALIDATE_SECONDS;
  STOREFRONT_SITE_IMAGES_SLUG = mod.STOREFRONT_SITE_IMAGES_SLUG;
  isSiteImageSlotKey = mod.isSiteImageSlotKey;
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

// ── REAL backend path fixture helper ────────────────────────────────────────
// Real contract: editorial/{company_id-as-uuid}/{slot_key}.{ext} — bucket-
// relative, no leading slash, no Storage object prefix baked in.
const SYNTHETIC_COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000";
function editorialPath(slot: string, ext: "jpg" | "png" | "webp" = "jpg"): string {
  return `editorial/${SYNTHETIC_COMPANY_ID}/${slot}.${ext}`;
}

// ── 10/11. Frozen 16 slot keys, brand_mascot absent ─────────────────────────

test("SITE_IMAGE_SLOT_KEYS contains exactly the 16 frozen slot keys, each exactly once", () => {
  const expected = [
    "home_hero",
    "home_benefit_cotton",
    "home_benefit_handmade",
    "home_benefit_made_in_colombia",
    "home_benefit_shipping",
    "home_history_teaser",
    "home_process_knitting",
    "home_process_hand_finishing",
    "home_process_quality_check",
    "home_process_arrival",
    "home_personalizados_band",
    "home_regalos_band",
    "nosotros_hero",
    "nosotros_process",
    "nosotros_material",
    "personalizados_hero",
  ];
  assert.equal(SITE_IMAGE_SLOT_KEYS.length, 16, "expected exactly 16 slot keys");
  assert.deepEqual([...SITE_IMAGE_SLOT_KEYS].sort(), [...expected].sort());
  assert.equal(new Set(SITE_IMAGE_SLOT_KEYS).size, 16, "expected no duplicate slot keys");
});

test("brand_mascot is not a recognized slot key", () => {
  assert.equal(isSiteImageSlotKey("brand_mascot"), false);
  assert.equal((SITE_IMAGE_SLOT_KEYS as readonly string[]).includes("brand_mascot"), false);
});

// ── 3. malformed top-level response shapes fail safely ─────────────────────

test("malformed top-level response shapes (not a plain object) fail safely to {}", () => {
  for (const bad of [null, undefined, "a string", 42, true, [], ["not", "an", "object"]]) {
    assert.deepEqual(parseSiteImageResponse(bad), {}, `expected {} for ${JSON.stringify(bad)}`);
  }
});

// ── 8. unknown slot ignored (never an error) ────────────────────────────────

test("unknown slot keys (including a hypothetical brand_mascot) are ignored, not an error", () => {
  const result = parseSiteImageResponse({
    brand_mascot: { image_path: editorialPath("brand_mascot", "png") },
    not_a_real_slot: { image_path: editorialPath("not_a_real_slot") },
    home_hero: { image_path: editorialPath("home_hero") },
  });
  assert.deepEqual(Object.keys(result), ["home_hero"]);
});

// ── 9. malformed image_path rejected per-slot, partial map survives ────────

test("a malformed image_path is rejected for that slot only — other valid slots in the same map survive", () => {
  const result = parseSiteImageResponse({
    home_hero: { image_path: "https://evil.example.com/steal.jpg" }, // absolute URL rejected
    nosotros_hero: { image_path: "//evil.example.com/steal.jpg" }, // protocol-relative rejected
    personalizados_hero: { image_path: "" }, // empty rejected
    home_history_teaser: { image_path: 12345 }, // non-string rejected
    home_regalos_band: {}, // missing image_path rejected
    nosotros_process: { image_path: `/${editorialPath("nosotros_process")}` }, // leading-slash (root-relative, wrong shape) rejected
    nosotros_material: null, // not even an object
    home_process_arrival: { image_path: `editorial/${SYNTHETIC_COMPANY_ID}/home_process_arrival.gif` }, // unknown extension rejected
    home_benefit_cotton: { image_path: editorialPath("home_benefit_cotton") }, // valid
  });
  assert.deepEqual(Object.keys(result), ["home_benefit_cotton"]);
});

// ── 4. valid one-slot override / partial map ────────────────────────────────

test("a single valid override (real backend shape) produces a map with exactly that one slot, fully normalized", () => {
  const path = editorialPath("home_hero");
  const result = parseSiteImageResponse({
    home_hero: {
      image_path: path,
      alt_text: "Nueva foto de temporada",
      updated_at: "2026-08-15T10:00:00Z",
    },
  });
  assert.deepEqual(result, {
    home_hero: {
      imagePath: path,
      altText: "Nueva foto de temporada",
      updatedAt: "2026-08-15T10:00:00Z",
    },
  });
});

// ── OLD (wrong) fixture shape is now rejected ───────────────────────────────

test("the OLD, incorrect root-relative fixture shape (/storage/v1/object/public/product-images/site/...) is now rejected", () => {
  const result = parseSiteImageResponse({
    home_hero: { image_path: "/storage/v1/object/public/product-images/site/home_hero.jpg" },
  });
  assert.deepEqual(result, {}, "the pre-patch fixture shape must no longer validate against the real backend contract");
  assert.equal(isValidSiteImagePath("/storage/v1/object/public/product-images/site/home_hero.jpg"), false);
});

// ── 6/7. alt_text normalization ─────────────────────────────────────────────

test("blank/whitespace-only alt_text normalizes to null", () => {
  const result = parseSiteImageResponse({
    home_hero: { image_path: editorialPath("home_hero"), alt_text: "   " },
  });
  assert.equal(result.home_hero?.altText, null);
});

test("missing alt_text normalizes to null", () => {
  const result = parseSiteImageResponse({
    home_hero: { image_path: editorialPath("home_hero") },
  });
  assert.equal(result.home_hero?.altText, null);
});

test("non-empty alt_text is preserved verbatim", () => {
  const result = parseSiteImageResponse({
    home_hero: {
      image_path: editorialPath("home_hero"),
      alt_text: "Texto real de temporada",
    },
  });
  assert.equal(result.home_hero?.altText, "Texto real de temporada");
});

// ── isValidSiteImagePath: real path accepted, extension/shape variants ─────

test("isValidSiteImagePath accepts the exact real backend shape for each allowed extension", () => {
  for (const ext of ["jpg", "png", "webp"] as const) {
    assert.equal(isValidSiteImagePath(editorialPath("home_hero", ext)), true, `expected .${ext} to be accepted`);
  }
});

// ── SECURITY: malicious/malformed path shapes are all rejected ─────────────

test("isValidSiteImagePath rejects every malicious/malformed shape from the reviewer's checklist", () => {
  const valid = editorialPath("home_hero");
  const malformed: Array<[label: string, value: string]> = [
    ["leading slash", `/${valid}`],
    ["path traversal prefix", `../${valid}`],
    ["path traversal inside company segment", `editorial/../${SYNTHETIC_COMPANY_ID}/home_hero.jpg`],
    ["http scheme", `http://evil.example.com/${valid}`],
    ["https scheme", `https://evil.example.com/${valid}`],
    ["protocol-relative", `//evil.example.com/${valid}`],
    ["javascript scheme", "javascript:alert(1)"],
    ["data URI", "data:image/png;base64,AAAA"],
    ["wrong company-id shape (too short)", "editorial/550e8400-e29b-41d4/home_hero.jpg"],
    ["wrong company-id shape (not hex/hyphen)", "editorial/not-a-uuid-not-a-uuid-not-a-uuid-000/home_hero.jpg"],
    ["unknown extension", "editorial/550e8400-e29b-41d4-a716-446655440000/home_hero.gif"],
    ["no extension", "editorial/550e8400-e29b-41d4-a716-446655440000/home_hero"],
    ["query string", `${valid}?x=1`],
    ["extra nested segments", "editorial/550e8400-e29b-41d4-a716-446655440000/nested/home_hero.jpg"],
    ["slot key containing a path separator", "editorial/550e8400-e29b-41d4-a716-446655440000/home/hero.jpg"],
    ["missing editorial/ prefix", "550e8400-e29b-41d4-a716-446655440000/home_hero.jpg"],
    ["uppercase slot key (not [a-z0-9_])", "editorial/550e8400-e29b-41d4-a716-446655440000/HOME_HERO.jpg"],
    ["backslash", "editorial\\550e8400-e29b-41d4-a716-446655440000\\home_hero.jpg"],
    ["whitespace", "editorial/550e8400-e29b-41d4-a716-446655440000/home hero.jpg"],
    ["empty string", ""],
  ];
  for (const [label, value] of malformed) {
    assert.equal(isValidSiteImagePath(value), false, `expected "${label}" (${JSON.stringify(value)}) to be rejected`);
  }
});

test("isValidSiteImagePath rejects non-string values", () => {
  for (const bad of [null, undefined, 42, true, {}, [], Symbol("x")]) {
    assert.equal(isValidSiteImagePath(bad), false);
  }
});

// ── 2. backend failure (network error) returns empty map ───────────────────

test("network failure (fetch rejects) returns an empty map, never throws", async () => {
  fetchImpl = async () => {
    throw new Error("simulated network failure — no real network reached");
  };
  const result = await getStorefrontSiteImages();
  assert.deepEqual(result, {});
});

test("an aborted/timed-out fetch (AbortError) returns an empty map", async () => {
  fetchImpl = async () => {
    throw new DOMException("The operation was aborted.", "AbortError");
  };
  const result = await getStorefrontSiteImages();
  assert.deepEqual(result, {});
});

test("non-2xx (e.g. HTTP 500, should one ever occur) returns an empty map", async () => {
  fetchImpl = async () => jsonResponse({ error: "unexpected server error" }, 500);
  const result = await getStorefrontSiteImages();
  assert.deepEqual(result, {});
});

test("a 200 response with an empty body (the real contract's shape for a missing/unreadable table) returns an empty map", async () => {
  fetchImpl = async () => jsonResponse({});
  const result = await getStorefrontSiteImages();
  assert.deepEqual(result, {});
});

test("invalid JSON body returns an empty map", async () => {
  fetchImpl = async () => new Response("not json{{{", { status: 200, headers: { "content-type": "application/json" } });
  const result = await getStorefrontSiteImages();
  assert.deepEqual(result, {});
});

test("a malformed top-level 2xx response (e.g. a bare array) returns an empty map end-to-end", async () => {
  fetchImpl = async () => jsonResponse([1, 2, 3]);
  const result = await getStorefrontSiteImages();
  assert.deepEqual(result, {});
});

// ── end-to-end success ───────────────────────────────────────────────────────

test("end-to-end: a fresh 2xx JSON response with one valid slot (real backend path shape) resolves through getStorefrontSiteImages", async () => {
  const path = editorialPath("home_hero");
  fetchImpl = async () =>
    jsonResponse({
      home_hero: {
        image_path: path,
        alt_text: "Foto nueva",
        updated_at: "2026-08-15T10:00:00Z",
      },
    });
  const result = await getStorefrontSiteImages();
  assert.deepEqual(Object.keys(result), ["home_hero"]);
  assert.equal(result.home_hero?.imagePath, path);
});

// ── 12. canonical slug, no company_id in the REQUEST (company_id is inside
//        the resolved image_path value, never the request URL/headers) ─────

test("the request targets the frozen canonical slug endpoint, never a company_id", async () => {
  fetchImpl = async () => jsonResponse({});
  resetLastFetchArgs();
  await getStorefrontSiteImages();

  const captured = requireLastFetchArgs();
  const url = String(captured.input);
  assert.equal(STOREFRONT_SITE_IMAGES_SLUG, "hilitos");
  assert.equal(url, `https://backend.invalid/storefront/${STOREFRONT_SITE_IMAGES_SLUG}/site-images`);
  assert.equal(url.toLowerCase().includes("company_id"), false, "the request URL must never carry a company_id");
});

// ── 13. no secrets/internal auth required ───────────────────────────────────

test("the request carries no Authorization header or secret — only a plain Accept header", async () => {
  fetchImpl = async () => jsonResponse({});
  resetLastFetchArgs();
  await getStorefrontSiteImages();

  const captured = requireLastFetchArgs();
  const headers = captured.init?.headers as Record<string, string> | undefined;
  assert.deepEqual(headers, { Accept: "application/json" }, "expected no auth/secret headers of any kind");
});

// ── bounded fetch (must not hang forever) ───────────────────────────────────

test("the fetch is bounded by an AbortSignal", async () => {
  fetchImpl = async () => jsonResponse({});
  resetLastFetchArgs();
  await getStorefrontSiteImages();

  const captured = requireLastFetchArgs();
  assert.ok(captured.init?.signal instanceof AbortSignal, "expected a bounded fetch via AbortSignal");
});

// ── 15. ~5 minute (300s) revalidation contract ──────────────────────────────

test("the fetch is configured with the ~5 minute (300s) revalidate window", async () => {
  fetchImpl = async () => jsonResponse({});
  resetLastFetchArgs();
  await getStorefrontSiteImages();

  const captured = requireLastFetchArgs();
  assert.equal(SITE_IMAGES_REVALIDATE_SECONDS, 300);
  const nextOpt = (captured.init as { next?: { revalidate?: number } } | undefined)?.next;
  assert.equal(nextOpt?.revalidate, 300);
});

// ── no throw, ever (blanket regression guard) ───────────────────────────────

test("getStorefrontSiteImages never rejects/throws across every failure mode exercised above", async () => {
  const scenarios: Array<() => Promise<Response>> = [
    async () => {
      throw new Error("network error");
    },
    async () => jsonResponse({}, 500),
    async () => new Response("{{{not json", { status: 200 }),
    async () => jsonResponse(null),
    async () => jsonResponse("a string"),
    async () => jsonResponse({}), // real contract's "missing table" shape: 200 + {}
  ];
  for (const scenario of scenarios) {
    fetchImpl = scenario;
    await assert.doesNotReject(async () => {
      const result = await getStorefrontSiteImages();
      assert.equal(typeof result, "object");
      assert.ok(result !== null);
    });
  }
});
