// tests/site-images/backend-url-unset.test.ts — IMG-S8B3.
//
// BACKEND_BASE_URL is a top-level `const` in lib/catalog/siteImages.ts,
// read once at module import time (same as lib/catalog/storefront.ts's
// BACKEND_BASE_URL) — so "unset" has to be its own file, deliberately
// never setting STOREFRONT_BACKEND_URL before the dynamic import, exactly
// like tests/integration/s7b-route-metadata.test.ts does for the sibling
// catalog fetcher. node:test runs each file in its own child process, so
// this never interacts with tests/site-images/fetcher.test.ts (which DOES
// set the env var in its own process).
import test, { before } from "node:test";
import assert from "node:assert/strict";

let getStorefrontSiteImages: typeof import("@/lib/catalog/siteImages").getStorefrontSiteImages;
let fetchCalled = false;

before(async () => {
  delete process.env.STOREFRONT_BACKEND_URL;
  // No network stub should ever fire — a call here means the fail-closed
  // guard below the missing-URL check regressed.
  globalThis.fetch = (async () => {
    fetchCalled = true;
    throw new Error("fetch must never be called when STOREFRONT_BACKEND_URL is unset");
  }) as typeof globalThis.fetch;

  ({ getStorefrontSiteImages } = await import("@/lib/catalog/siteImages"));
});

test("an unset STOREFRONT_BACKEND_URL fails closed to an empty map without ever calling fetch", async () => {
  const result = await getStorefrontSiteImages();
  assert.deepEqual(result, {});
  assert.equal(fetchCalled, false, "fetch must never be invoked when the backend URL is missing");
});
