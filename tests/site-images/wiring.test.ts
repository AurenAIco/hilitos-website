// tests/site-images/wiring.test.ts — IMG-S8B3. Static source-text proof
// (same convention as tests/homepage/defixture.test.ts and
// tests/storefront-v2/storefront-image-host.test.ts — read source as text,
// do NOT import app/**/components/** into node:test) that all 16 frozen
// slot keys are wired into exactly the 8 files that own their bundled
// image today, each key appearing in exactly one file, exactly once, and
// that every one of those files imports the shared fetcher + resolver
// rather than reinventing the logic locally.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SITE_IMAGE_SLOT_KEYS } from "@/lib/catalog/siteImages";

const ROOT = process.cwd();

function readSrc(...segments: string[]): string {
  return readFileSync(join(ROOT, ...segments), "utf8");
}

/** Every file that owns one or more of the 16 slots, and exactly which
 * slots it is expected to own — this IS the "16 SLOT WIRING MAP" from the
 * mission report, expressed as an executable assertion instead of prose. */
const WIRING_MAP: Record<string, string[]> = {
  "app/(public)/page.tsx": ["home_hero"],
  "components/home/BenefitsStrip.tsx": [
    "home_benefit_cotton",
    "home_benefit_handmade",
    "home_benefit_made_in_colombia",
    "home_benefit_shipping",
  ],
  "components/home/HistoryTeaser.tsx": ["home_history_teaser"],
  "components/home/ProcessStrip.tsx": [
    "home_process_knitting",
    "home_process_hand_finishing",
    "home_process_quality_check",
    "home_process_arrival",
  ],
  "components/home/PersonalizadosBand.tsx": ["home_personalizados_band"],
  "components/home/RegalosBand.tsx": ["home_regalos_band"],
  "app/(public)/nosotros/page.tsx": ["nosotros_hero", "nosotros_process", "nosotros_material"],
  "app/(public)/personalizados/page.tsx": ["personalizados_hero"],
};

function pathSegments(relPath: string): string[] {
  // "app/(public)/page.tsx" -> ["app", "(public)", "page.tsx"]
  return relPath.split("/");
}

test("WIRING_MAP itself accounts for exactly the 16 frozen slot keys, each exactly once", () => {
  const flat = Object.values(WIRING_MAP).flat();
  assert.equal(flat.length, 16, "expected the wiring map to list exactly 16 slot occurrences");
  assert.deepEqual([...flat].sort(), [...SITE_IMAGE_SLOT_KEYS].sort());
  assert.equal(new Set(flat).size, 16, "expected no slot key to be claimed by more than one file");
});

// BenefitsStrip.tsx and ProcessStrip.tsx wire their slots through an array
// field (`slot: "home_benefit_cotton"`, consumed later as `benefit.slot`)
// rather than a direct resolveSiteImage("...") call argument — both are
// legitimate "wiring" shapes, so the occurrence check below looks for
// EITHER, not a single hardcoded shape.
const ARRAY_FIELD_FILES = new Set(["components/home/BenefitsStrip.tsx", "components/home/ProcessStrip.tsx"]);

function slotWiringOccurrences(relPath: string, src: string, slot: string): number {
  const pattern = ARRAY_FIELD_FILES.has(relPath)
    ? new RegExp(`slot:\\s*"${slot}"`, "g")
    : new RegExp(`resolveSiteImage\\(\\s*"${slot}"`, "g");
  return (src.match(pattern) ?? []).length;
}

test("every file in WIRING_MAP exists and wires each of its claimed slot keys exactly once", () => {
  for (const [relPath, slots] of Object.entries(WIRING_MAP)) {
    const src = readSrc(...pathSegments(relPath));
    for (const slot of slots) {
      const occurrences = slotWiringOccurrences(relPath, src, slot);
      assert.equal(occurrences, 1, `expected "${slot}" to be wired exactly once in ${relPath}, found ${occurrences}`);
    }
  }
});

test("no file in WIRING_MAP wires a slot key it does not own", () => {
  for (const [relPath, ownedSlots] of Object.entries(WIRING_MAP)) {
    const src = readSrc(...pathSegments(relPath));
    for (const slot of SITE_IMAGE_SLOT_KEYS) {
      if (ownedSlots.includes(slot)) continue;
      assert.equal(
        slotWiringOccurrences(relPath, src, slot),
        0,
        `${relPath} must not wire unowned slot "${slot}"`,
      );
    }
  }
});

test("no file in WIRING_MAP references brand_mascot as a slot key", () => {
  for (const relPath of Object.keys(WIRING_MAP)) {
    const src = readSrc(...pathSegments(relPath));
    assert.equal(src.includes("brand_mascot"), false, `${relPath} must not reference "brand_mascot"`);
  }
});

test("every file in WIRING_MAP imports the shared fetcher and resolver (no local reimplementation)", () => {
  for (const relPath of Object.keys(WIRING_MAP)) {
    const src = readSrc(...pathSegments(relPath));
    assert.match(
      src,
      /from\s+"@\/lib\/catalog\/siteImages"/,
      `${relPath} must import getStorefrontSiteImages from @/lib/catalog/siteImages`,
    );
    assert.match(
      src,
      /from\s+"@\/lib\/catalog\/resolveSiteImage"/,
      `${relPath} must import resolveSiteImage from @/lib/catalog/resolveSiteImage`,
    );
    assert.match(src, /getStorefrontSiteImages\(\)/, `${relPath} must call getStorefrontSiteImages()`);
    assert.match(src, /resolveSiteImage\(/, `${relPath} must call resolveSiteImage(...)`);
  }
});

test("every wired page-level file (not a components/home/* section) is declared async so it can await getStorefrontSiteImages()", () => {
  const pageFiles = Object.keys(WIRING_MAP).filter((p) => p.startsWith("app/"));
  for (const relPath of pageFiles) {
    const src = readSrc(...pathSegments(relPath));
    assert.match(src, /export default async function/, `${relPath} must be an async Server Component`);
  }
});

test("every wired components/home/* section is declared as an async function component", () => {
  const sectionFiles = Object.keys(WIRING_MAP).filter((p) => p.startsWith("components/"));
  for (const relPath of sectionFiles) {
    const src = readSrc(...pathSegments(relPath));
    assert.match(src, /export async function/, `${relPath} must be an async Server Component`);
  }
});
