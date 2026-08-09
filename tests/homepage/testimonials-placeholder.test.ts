// tests/homepage/testimonials-placeholder.test.ts — social-proof + Instagram
// slice regression guard.
//
// Proves the homepage's testimonios section (app/(public)/page.tsx §7) is
// unmistakably placeholder content — every card is marked "CAMBIAR" and no
// fabricated name, city, rating, or customer count (the legacy static
// site's exact traps) ever reappears here — and that the homepage's
// Instagram link points at the real canonical profile with safe
// attributes. Static source-text scan only, same convention as
// tests/homepage/defixture.test.ts: deliberately does NOT import
// app/(public)/page.tsx (a React Server Component; this repo's node:test
// process never imports app/** or components/**, see
// tests/storefront-v2/seam-isolation.test.ts).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const HOMEPAGE_PATH = join(ROOT, "app", "(public)", "page.tsx");
const homepageSrc = readFileSync(HOMEPAGE_PATH, "utf8");

/** Strip `//` line comments and block comments before scanning for
 * forbidden fabricated content, so a doc comment that legitimately *names*
 * a forbidden trap (like this page's own file-header comment, or the §7
 * section comment) never false-positives. Same helper as
 * tests/homepage/defixture.test.ts. */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

const homepageCode = stripComments(homepageSrc);

// ── 1. The section exists, with its non-fabricated heading ─────────────────

test("homepage renders the testimonios section with its approved heading", () => {
  assert.match(homepageSrc, /id="testimonios-titulo"/, "expected a testimonios-titulo heading id");
  assert.equal(
    homepageSrc.includes("Lo que dicen nuestras familias"),
    true,
    "expected the approved testimonios heading text",
  );
});

// ── 2. Placeholder cards are unmistakably marked, not fabricated ───────────

test("every testimonial quote and attribution is marked CAMBIAR (no real content shipped)", () => {
  const quoteMarkers = homepageSrc.match(/CAMBIAR — Testimonio real de cliente \d/g) ?? [];
  const nameMarkers = homepageSrc.match(/CAMBIAR — Nombre cliente \d/g) ?? [];
  assert.equal(quoteMarkers.length, 3, "expected exactly 3 placeholder testimonial quotes");
  assert.equal(nameMarkers.length, 3, "expected exactly 3 placeholder testimonial attributions");
});

test("the testimonios section carries a visible non-CAMBIAR placeholder disclosure", () => {
  // A second, independent placeholder signal (the "Ejemplo" badge) so the
  // cards read as placeholder even to a reader skimming only the visuals,
  // not just the CAMBIAR text.
  assert.equal(homepageSrc.includes("Ejemplo"), true, "expected a visible placeholder badge (e.g. \"Ejemplo\") on each card");
});

// ── 3. The legacy site's exact fabricated traps never reappear ─────────────

test("homepage never reintroduces the legacy fabricated testimonial claims", () => {
  const FORBIDDEN_FABRICATIONS = [
    "500 familias", // the invented customer-count claim
    "Sandra M.", // invented legacy names
    "Lorena C.",
    "Juliana P.",
    "★★★★★", // invented legacy star ratings
  ];
  for (const forbidden of FORBIDDEN_FABRICATIONS) {
    assert.equal(homepageCode.includes(forbidden), false, `homepage must not contain fabricated string "${forbidden}"`);
  }
});

// ── 4. Instagram: canonical link, present exactly where expected ───────────

test("homepage links to the canonical Instagram profile with safe external-link attributes", () => {
  assert.equal(
    homepageSrc.includes('href="https://www.instagram.com/hilitosoficial/"'),
    true,
    "expected the canonical Instagram profile URL (no ?hl=en, trailing slash)",
  );
  assert.equal(homepageSrc.includes("@hilitosoficial"), true, "expected the visible handle");
  assert.equal(homepageSrc.includes('target="_blank"'), true, "expected target=_blank on the Instagram link");
  assert.match(homepageSrc, /rel="noreferrer noopener"/, "expected safe rel attributes on the Instagram link");
});

test("homepage's Instagram integration stays a plain link — no feed embed, API, iframe, or tracking pixel", () => {
  const FORBIDDEN_INSTAGRAM_INTEGRATIONS = ["instagram.com/embed", "graph.instagram.com", "<iframe", "instagram-feed"];
  for (const forbidden of FORBIDDEN_INSTAGRAM_INTEGRATIONS) {
    assert.equal(
      homepageSrc.toLowerCase().includes(forbidden.toLowerCase()),
      false,
      `homepage must not contain "${forbidden}"`,
    );
  }
});
