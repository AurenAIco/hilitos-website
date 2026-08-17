// tests/site-images/resolve.test.ts — IMG-S8B3. Proves
// lib/catalog/resolveSiteImage.ts's per-slot resolution contract: an
// empty/missing/malformed override always yields the caller's fallback
// UNCHANGED, a valid override replaces ONLY its own slot, and alt-text /
// image-path handling matches the mission's exact rules. Pure functions,
// no env setup, no fetch stub needed — same style as
// tests/storefront-v2/storefront-image-host.test.ts's pure-function block.
//
// PATH FIXTURES (corrected 2026-08-16 after independent review): the REAL
// backend contract for `SiteImageOverride.imagePath` is bucket-relative —
// `editorial/{company_id-uuid}/{slot_key}.{ext}` — never root-relative and
// never already containing the "/storage/v1/object/public/product-images/"
// prefix. resolveSiteImage prepends that prefix itself (see
// SITE_IMAGE_STORAGE_PREFIX in lib/catalog/resolveSiteImage.ts) before
// calling buildStorefrontImageUrl. Every fixture below uses editorialPath(),
// the real shape, with the reviewer's synthetic UUID
// 550e8400-e29b-41d4-a716-446655440000.
import test from "node:test";
import assert from "node:assert/strict";
import { resolveSiteImage } from "@/lib/catalog/resolveSiteImage";
import { SITE_IMAGE_SLOT_KEYS, type SiteImageOverrideMap } from "@/lib/catalog/siteImages";
// Statically imported (not dynamic — buildStorefrontImageUrl only reads
// process.env.STOREFRONT_IMAGE_HOST at CALL time, inside the function body,
// same as tests/storefront-v2/storefront-image-host.test.ts already relies
// on), used only as an independent reference for the canonical-host proof
// below — never re-implements resolveSiteImage's own logic.
import { buildStorefrontImageUrl } from "@/lib/catalog/storefront";

const SYNTHETIC_COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000";
function editorialPath(slot: string, ext: "jpg" | "png" | "webp" = "jpg"): string {
  return `editorial/${SYNTHETIC_COMPANY_ID}/${slot}.${ext}`;
}

// ── 1. empty map keeps every relevant fallback (all 16 slots) ──────────────

test("an empty override map returns every one of the 16 slots' fallback unchanged", () => {
  const overrides: SiteImageOverrideMap = {};
  for (const slot of SITE_IMAGE_SLOT_KEYS) {
    const fallbackSrc = `/brand/${slot}-fallback.jpg`;
    const fallbackAlt = `Texto alternativo de respaldo para ${slot}`;
    const resolved = resolveSiteImage(slot, fallbackSrc, fallbackAlt, overrides);
    assert.deepEqual(
      resolved,
      { src: fallbackSrc, alt: fallbackAlt },
      `slot "${slot}" must fall back unchanged for an empty override map`,
    );
  }
});

// ── end-to-end: real backend path resolves to the canonical public URL ─────

test("REQUIRED PROOF: a real backend image_path resolves to a public URL containing the exact canonical product-images path, on the canonical storefront host", () => {
  const realPath = "editorial/550e8400-e29b-41d4-a716-446655440000/home_hero.jpg";
  const overrides: SiteImageOverrideMap = {
    home_hero: { imagePath: realPath, altText: null, updatedAt: null },
  };

  const resolved = resolveSiteImage("home_hero", "/brand/hero-inicio.jpg", "Fallback alt", overrides);

  assert.match(resolved.src, /^https:\/\//, "expected an absolute URL");
  assert.ok(
    resolved.src.includes(
      "/storage/v1/object/public/product-images/editorial/550e8400-e29b-41d4-a716-446655440000/home_hero.jpg",
    ),
    `expected the canonical public product-images path in ${resolved.src}`,
  );

  // Host must be the SAME canonical storefront image host every other
  // product/collection image in this repo resolves to — proven by
  // comparing against buildStorefrontImageUrl's own output for an
  // unrelated, already-canonical product path, rather than hardcoding
  // the host value here (which would silently drift from
  // storefrontImageHost.ts's fallback/config resolution).
  const referenceUrl = buildStorefrontImageUrl("/storage/v1/object/public/product-images/products/x/1.jpg");
  assert.equal(new URL(resolved.src).host, new URL(referenceUrl).host, "expected the canonical storefront image host");
});

// ── 4. valid one-slot override replaces only that slot ─────────────────────

test("a valid override (real backend path shape) replaces src/alt for its own slot, resolved to an absolute managed URL", () => {
  const overrides: SiteImageOverrideMap = {
    home_hero: {
      imagePath: editorialPath("home_hero"),
      altText: "Nueva foto de temporada",
      updatedAt: null,
    },
  };
  const resolved = resolveSiteImage("home_hero", "/brand/hero-inicio.jpg", "Fallback alt", overrides);

  assert.equal(resolved.alt, "Nueva foto de temporada");
  assert.match(resolved.src, /^https:\/\//, "expected an absolute URL via buildStorefrontImageUrl");
  assert.ok(resolved.src.endsWith(`/storage/v1/object/public/product-images/${editorialPath("home_hero")}`));
  assert.notEqual(resolved.src, "/brand/hero-inicio.jpg");
});

// ── OLD (wrong) fixture shape is now rejected, falls back honestly ─────────

test("the OLD, incorrect root-relative path shape (/storage/v1/object/public/product-images/site/...) is rejected and falls back", () => {
  const overrides: SiteImageOverrideMap = {
    home_hero: {
      imagePath: "/storage/v1/object/public/product-images/site/home_hero.jpg",
      altText: "x",
      updatedAt: null,
    },
  };
  const resolved = resolveSiteImage("home_hero", "/brand/hero-inicio.jpg", "Fallback alt", overrides);
  assert.deepEqual(
    resolved,
    { src: "/brand/hero-inicio.jpg", alt: "Fallback alt" },
    "the pre-patch fixture shape must no longer be treated as a valid override",
  );
});

// ── 5. missing override leaves sibling fallback intact ─────────────────────

test("a slot with no override falls back even while sibling slots DO have valid overrides", () => {
  const overrides: SiteImageOverrideMap = {
    home_hero: {
      imagePath: editorialPath("home_hero"),
      altText: "Override de hero",
      updatedAt: null,
    },
    nosotros_hero: {
      imagePath: editorialPath("nosotros_hero"),
      altText: "Override de nosotros",
      updatedAt: null,
    },
  };

  const resolved = resolveSiteImage(
    "home_benefit_cotton",
    "/brand/icons/algodon.png",
    "Icono de un copo de algodón",
    overrides,
  );

  assert.deepEqual(resolved, { src: "/brand/icons/algodon.png", alt: "Icono de un copo de algodón" });
});

// ── 6/7. alt-text rules ─────────────────────────────────────────────────────

test("a non-empty override alt is used verbatim", () => {
  const overrides: SiteImageOverrideMap = {
    home_hero: {
      imagePath: editorialPath("home_hero"),
      altText: "Texto de temporada",
      updatedAt: null,
    },
  };
  const resolved = resolveSiteImage("home_hero", "/brand/hero-inicio.jpg", "Fallback alt", overrides);
  assert.equal(resolved.alt, "Texto de temporada");
});

test("a null override alt falls back to the fixed fallback alt", () => {
  const overrides: SiteImageOverrideMap = {
    home_hero: {
      imagePath: editorialPath("home_hero"),
      altText: null,
      updatedAt: null,
    },
  };
  const resolved = resolveSiteImage("home_hero", "/brand/hero-inicio.jpg", "Fallback alt", overrides);
  assert.equal(resolved.alt, "Fallback alt");
});

test("a blank/whitespace-only override alt falls back to the fixed fallback alt (defense in depth)", () => {
  const overrides: SiteImageOverrideMap = {
    home_hero: {
      imagePath: editorialPath("home_hero"),
      altText: "   ",
      updatedAt: null,
    },
  };
  const resolved = resolveSiteImage("home_hero", "/brand/hero-inicio.jpg", "Fallback alt", overrides);
  assert.equal(resolved.alt, "Fallback alt");
});

// ── 9. malformed/blank image path falls back (defense in depth) ────────────

test("an override with a blank imagePath is treated as absent — falls back entirely", () => {
  const overrides: SiteImageOverrideMap = {
    home_hero: { imagePath: "", altText: "x", updatedAt: null },
  };
  const resolved = resolveSiteImage("home_hero", "/brand/hero-inicio.jpg", "Fallback alt", overrides);
  assert.deepEqual(resolved, { src: "/brand/hero-inicio.jpg", alt: "Fallback alt" });
});

test("an override whose imagePath is an absolute URL to an arbitrary host is rejected and falls back (host-injection defense)", () => {
  const overrides: SiteImageOverrideMap = {
    home_hero: { imagePath: "https://evil.example.com/steal.jpg", altText: "x", updatedAt: null },
  };
  const resolved = resolveSiteImage("home_hero", "/brand/hero-inicio.jpg", "Fallback alt", overrides);
  assert.deepEqual(resolved, { src: "/brand/hero-inicio.jpg", alt: "Fallback alt" });
});

test("an override whose imagePath is protocol-relative is rejected and falls back (host-injection defense)", () => {
  const overrides: SiteImageOverrideMap = {
    home_hero: { imagePath: "//evil.example.com/steal.jpg", altText: "x", updatedAt: null },
  };
  const resolved = resolveSiteImage("home_hero", "/brand/hero-inicio.jpg", "Fallback alt", overrides);
  assert.deepEqual(resolved, { src: "/brand/hero-inicio.jpg", alt: "Fallback alt" });
});

test("an override whose imagePath attempts path traversal is rejected and falls back", () => {
  const overrides: SiteImageOverrideMap = {
    home_hero: { imagePath: "../editorial/550e8400-e29b-41d4-a716-446655440000/home_hero.jpg", altText: "x", updatedAt: null },
  };
  const resolved = resolveSiteImage("home_hero", "/brand/hero-inicio.jpg", "Fallback alt", overrides);
  assert.deepEqual(resolved, { src: "/brand/hero-inicio.jpg", alt: "Fallback alt" });
});

test("an override whose imagePath uses a javascript: or data: scheme is rejected and falls back", () => {
  for (const malicious of ["javascript:alert(1)", "data:image/png;base64,AAAA"]) {
    const overrides: SiteImageOverrideMap = {
      home_hero: { imagePath: malicious, altText: "x", updatedAt: null },
    };
    const resolved = resolveSiteImage("home_hero", "/brand/hero-inicio.jpg", "Fallback alt", overrides);
    assert.deepEqual(resolved, { src: "/brand/hero-inicio.jpg", alt: "Fallback alt" }, `expected "${malicious}" to be rejected`);
  }
});

// ── cache-busting token (applied AFTER canonical URL construction) ─────────

test("a present updatedAt is appended as a `?v=` cache-busting query token on the managed URL, after the canonical prefix is applied", () => {
  const overrides: SiteImageOverrideMap = {
    home_hero: {
      imagePath: editorialPath("home_hero"),
      altText: null,
      updatedAt: "2026-08-15T10:00:00Z",
    },
  };
  const resolved = resolveSiteImage("home_hero", "/brand/hero-inicio.jpg", "Fallback alt", overrides);
  const url = new URL(resolved.src);
  assert.equal(url.searchParams.get("v"), "2026-08-15T10:00:00Z");
  assert.ok(
    url.pathname.endsWith(`/storage/v1/object/public/product-images/${editorialPath("home_hero")}`),
    "expected the cache-buster to be appended to the full canonical path, not replace it",
  );
});

test("a missing updatedAt appends no cache-busting query token", () => {
  const overrides: SiteImageOverrideMap = {
    home_hero: {
      imagePath: editorialPath("home_hero"),
      altText: null,
      updatedAt: null,
    },
  };
  const resolved = resolveSiteImage("home_hero", "/brand/hero-inicio.jpg", "Fallback alt", overrides);
  assert.equal(resolved.src.includes("?"), false);
});

test("the fallback path never carries a cache-busting token, regardless of other slots' overrides", () => {
  const overrides: SiteImageOverrideMap = {
    nosotros_hero: {
      imagePath: editorialPath("nosotros_hero"),
      altText: null,
      updatedAt: "2026-08-15T10:00:00Z",
    },
  };
  const resolved = resolveSiteImage("home_hero", "/brand/hero-inicio.jpg", "Fallback alt", overrides);
  assert.deepEqual(resolved, { src: "/brand/hero-inicio.jpg", alt: "Fallback alt" });
});
