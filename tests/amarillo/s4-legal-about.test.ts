// tests/amarillo/s4-legal-about.test.ts — Slice S4 (Legal/About closure)
// assertion suite.
//
// Static source-tree checks only — no jsdom/React Testing Library (this repo
// runs exactly one test runner, node:test; see tests/adm1a §INV-23 and
// tests/amarillo/s5-mobile-drawer.test.ts's header for the same rationale).
//
// Scope: prove that /privacy and /nosotros no longer carry PendingBlock
// scaffolding, that the migrated content stays inside what the source
// hierarchy actually supports (legacy/privacy/index.html, confirmed
// live-identical to hilitos.co/privacy during S4), and that no invented
// legal/contact fact, self-reference to the old site, or unsupported claim
// (years-of-operation, family tradition, GDPR/certifications) slipped in.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

function readSrc(...segments: string[]): string {
  return readFileSync(join(ROOT, ...segments), "utf8");
}

const PRIVACY_PATH = ["app", "(public)", "privacy", "page.tsx"];
const NOSOTROS_PATH = ["app", "(public)", "nosotros", "page.tsx"];
const privacySrc = readSrc(...PRIVACY_PATH);
const nosotrosSrc = readSrc(...NOSOTROS_PATH);

// ---- zero PENDIENTE / PendingBlock scaffolding on either page --------------

test("/privacy contains no PENDIENTE marker and no PendingBlock usage", () => {
  assert.equal(privacySrc.includes("PENDIENTE"), false);
  assert.equal(privacySrc.includes("PendingBlock"), false);
  assert.equal(privacySrc.includes("revisión Mónica"), false);
});

test("/nosotros contains no PENDIENTE marker and no PendingBlock usage", () => {
  assert.equal(nosotrosSrc.includes("PENDIENTE"), false);
  assert.equal(nosotrosSrc.includes("PendingBlock"), false);
  assert.equal(nosotrosSrc.includes("revisión Mónica"), false);
});

test("neither page contains a stray TODO", () => {
  assert.equal(/TODO/.test(privacySrc), false);
  assert.equal(/TODO/.test(nosotrosSrc), false);
});

// ---- privacy page: visible Spanish h1 + section structure ------------------

test('privacy page renders exactly one visible <h1> (via EditorialHeading as="h1") in Spanish', () => {
  const h1Count = (privacySrc.match(/as="h1"/g) ?? []).length;
  assert.equal(h1Count, 1, `expected exactly one as="h1" occurrence, got ${h1Count}`);
  assert.match(privacySrc, /as="h1"[\s\S]{0,80}Política de privacidad/);
});

test("privacy page is organized into multiple labelled sections, not a single unstructured block", () => {
  const sectionCount = (privacySrc.match(/<section aria-labelledby="privacidad-/g) ?? []).length;
  assert.ok(sectionCount >= 4, `expected at least 4 labelled sections, got ${sectionCount}`);
});

test("privacy page states the effective/update year sourced from the live policy (2025), not a fabricated date", () => {
  assert.match(privacySrc, /Última actualización: 2025/);
});

// ---- no false self-reference to the old site --------------------------------

test("privacy page never claims the policy 'remains on the current site' or defers to an external source of truth", () => {
  assert.equal(privacySrc.toLowerCase().includes("sitio actual"), false);
  assert.equal(privacySrc.includes("sigue publicad"), false);
  assert.equal(privacySrc.toLowerCase().includes("política vigente"), false);
  assert.equal(privacySrc.toLowerCase().includes("pendiente de revisión"), false);
});

test("every occurrence of the brand domain in the privacy page is part of the real contact address, never a bare self-referential deferral", () => {
  const domainOccurrences = [...privacySrc.matchAll(/hilitos\.co/g)];
  assert.ok(domainOccurrences.length > 0, "expected at least one contacto@hilitos.co occurrence");
  const bareOccurrences = [...privacySrc.matchAll(/(?<!contacto@)hilitos\.co/g)];
  assert.deepEqual(bareOccurrences, [], `expected every "hilitos.co" occurrence to be preceded by "contacto@", found bare occurrence(s)`);
  assert.match(privacySrc, /mailto:contacto@hilitos\.co/);
});

// ---- no placeholder contact values; only the real, source-supported email --

test("privacy page's only contact channel is the real, source-supported contacto@hilitos.co mailto link", () => {
  assert.match(privacySrc, /mailto:contacto@hilitos\.co/);
  for (const placeholder of ["tu@email.com", "email@example.com", "correo@ejemplo", "[email]", "[EMAIL]", "placeholder"]) {
    assert.equal(privacySrc.toLowerCase().includes(placeholder.toLowerCase()), false, `unexpected placeholder "${placeholder}"`);
  }
});

test("privacy page does not assert an unsupported legal entity name, NIT, or physical address", () => {
  for (const needle of ["NIT", "S.A.S", "SAS", "Calle 113", "Barrio Provenza", "680001"]) {
    assert.equal(privacySrc.includes(needle), false, `unexpected unsupported identity/address fact "${needle}"`);
  }
});

test("privacy page makes no unsupported GDPR, certification, or formal-rights-regime claim", () => {
  for (const needle of ["GDPR", "RGPD", "ISO", "certificad", "Ley 1581", "Habeas Data", "derechos ARCO"]) {
    assert.equal(privacySrc.toLowerCase().includes(needle.toLowerCase()), false, `unexpected unsupported claim "${needle}"`);
  }
});

test("privacy page carries forward the source's core commitments: no sale/share with third parties, WhatsApp + website as the only channels", () => {
  assert.match(privacySrc, /no vende ni comparte información personal con terceros/);
  assert.match(privacySrc, /WhatsApp/);
});

// ---- nosotros page: no invented history/founding claims ---------------------

test("nosotros page asserts no years-of-operation, founding-date, headcount, award, or family-tradition claim", () => {
  for (const needle of ["+40 años", "más de 40 años", "+30 años", "más de 30 años", "década", "tradición familiar", "familia", "fundad", "premio", "certificad"]) {
    assert.equal(nosotrosSrc.toLowerCase().includes(needle.toLowerCase()), false, `unexpected unsupported claim "${needle}"`);
  }
});

test("nosotros page preserves the approved hero copy (location + hand-woven material claim already live before S4)", () => {
  assert.match(nosotrosSrc, /Bucaramanga,\s*\n?\s*Colombia/);
  assert.match(nosotrosSrc, /tejido a mano/);
});

test("nosotros page's history section was removed cleanly, not left as an empty heading", () => {
  assert.equal(nosotrosSrc.includes("historia-titulo"), false);
  assert.equal(nosotrosSrc.includes("Cada prenda, una historia"), false);
});

// ---- links resolve to approved destinations only ----------------------------

test("privacy page contains no <Link>/<a> to any route other than the approved mailto contact", () => {
  const hrefs = [...privacySrc.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(hrefs, ["mailto:contacto@hilitos.co"]);
});

test("nosotros page's remaining CTA link targets /catalogo (an existing approved NAV_ITEMS destination), not an invented route", () => {
  assert.match(nosotrosSrc, /href="\/catalogo"/);
});

// ---- PendingBlock: no remaining usage on either S4-owned page ---------------
//
// Wave 1 integration note: when this suite was written, S4 landed alone and
// the homepage (app/(public)/page.tsx, out of S4's scope) still imported
// PendingBlock — so the original version of this test pinned "exactly one
// remaining consumer: the homepage". Integrated together with S1 (which
// de-fixtures the homepage and drops that import as part of the same pass),
// that consumer no longer exists anywhere, so PendingBlock has zero
// remaining runtime consumers and was deleted outright rather than kept
// around unused. See tests/integration/pendingblock-deleted.test.ts for the
// integration-level proof.

test("PendingBlock is not imported anywhere under app/(public)/privacy or app/(public)/nosotros", () => {
  assert.equal(privacySrc.includes("PendingBlock"), false);
  assert.equal(nosotrosSrc.includes("PendingBlock"), false);
});
