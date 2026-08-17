// tests/site-images/catalog-isolation.test.ts — IMG-S8B3.
//
// Proves the mission's DO-NOT-TOUCH boundary held: no product/catalog
// image path, next.config.ts's remote-image allowlist, or checkout/cart
// surface was touched by this slice. Static source-text scans only (same
// convention as tests/storefront-v2/storefront-image-host.test.ts) — this
// never imports app/**/components/** into node:test.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

function readSrc(...segments: string[]): string {
  return readFileSync(join(ROOT, ...segments), "utf8");
}

test("next.config.ts is untouched by IMG-S8B3: no siteImages/resolveSiteImage reference, exactly one remotePatterns host entry", () => {
  const src = readSrc("next.config.ts");
  assert.equal(src.includes("siteImages"), false, "next.config.ts must not reference lib/catalog/siteImages");
  assert.equal(src.includes("resolveSiteImage"), false, "next.config.ts must not reference resolveSiteImage");

  const hostnameEntries = (src.match(/hostname:/g) ?? []).length;
  assert.equal(
    hostnameEntries,
    1,
    "expected exactly one remotePatterns hostname entry (STOREFRONT_IMAGE_HOST) — no new host added for managed images",
  );
  assert.match(src, /resolveStorefrontImageHost/, "expected the existing shared hostname resolver to still be in sole control of the allowlist");
});

test("product/catalog-rendering surfaces are untouched by IMG-S8B3 (no siteImages/resolveSiteImage reference)", () => {
  const untouched: string[][] = [
    ["components", "product", "ProductCard.tsx"],
    ["components", "product", "DesignCard.tsx"],
    ["components", "product", "FeaturedDesigns.tsx"],
    ["components", "product", "RelatedDesigns.tsx"],
    ["components", "product", "VariantSelector.tsx"],
    ["components", "home", "CategoryDiscover.tsx"],
    ["lib", "catalog", "storefront.ts"],
    ["lib", "catalog", "collectionRoute.ts"],
    ["lib", "catalog", "storefrontImageHost.ts"],
  ];
  for (const segments of untouched) {
    const src = readSrc(...segments);
    const label = segments.join("/");
    assert.equal(src.includes("lib/catalog/siteImages"), false, `${label} must not import lib/catalog/siteImages`);
    assert.equal(src.includes("resolveSiteImage"), false, `${label} must not reference resolveSiteImage`);
  }
});

test("checkout/cart, WhatsApp, and analytics surfaces are untouched by IMG-S8B3", () => {
  const untouched: string[][] = [
    ["lib", "whatsapp.ts"],
    ["lib", "analytics.ts"],
    ["components", "layout", "WhatsAppCTA.tsx"],
    ["components", "layout", "FloatingWhatsApp.tsx"],
    ["components", "analytics", "ViewTracker.tsx"],
  ];
  for (const segments of untouched) {
    const src = readSrc(...segments);
    const label = segments.join("/");
    assert.equal(src.includes("lib/catalog/siteImages"), false, `${label} must not import lib/catalog/siteImages`);
    assert.equal(src.includes("resolveSiteImage"), false, `${label} must not reference resolveSiteImage`);
  }
});

test("lib/catalog/siteImages.ts and lib/catalog/resolveSiteImage.ts are server-side only (no \"use client\")", () => {
  for (const segments of [
    ["lib", "catalog", "siteImages.ts"],
    ["lib", "catalog", "resolveSiteImage.ts"],
  ]) {
    const src = readSrc(...segments);
    assert.equal(src.includes('"use client"'), false, `${segments.join("/")} must remain server-side only`);
  }
});

test("lib/catalog/resolveSiteImage.ts reuses buildStorefrontImageUrl rather than building URLs independently", () => {
  const src = readSrc("lib", "catalog", "resolveSiteImage.ts");
  assert.match(src, /import\s*\{\s*buildStorefrontImageUrl\s*\}\s*from\s*"\.\/storefront"/);
  assert.match(src, /buildStorefrontImageUrl\(/);
});
