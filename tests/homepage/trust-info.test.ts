// tests/homepage/trust-info.test.ts — owner-confirmed business-facts guard.
//
// Proves the homepage's "Información práctica" section (app/(public)/
// page.tsx §8) renders exactly the business facts Mónica confirmed
// (address, hours, phone, payment methods, shipping carrier, returns
// wording) and never invents anything beyond them — no Sunday hours, no
// shipping time/price/SLA claim, and no absolute "no devoluciones" wording
// that would override a customer's legal consumer rights. Static
// source-text scan only, same convention as tests/homepage/defixture.test.ts
// and tests/homepage/testimonials-placeholder.test.ts: deliberately does
// NOT import app/(public)/page.tsx (a React Server Component; this repo's
// node:test process never imports app/** or components/**, see
// tests/storefront-v2/seam-isolation.test.ts).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const HOMEPAGE_PATH = join(ROOT, "app", "(public)", "page.tsx");
const homepageSrc = readFileSync(HOMEPAGE_PATH, "utf8");

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

const homepageCode = stripComments(homepageSrc);
// JSX text content wraps across source lines for readability; React collapses
// that whitespace at render time, so prose assertions below match against a
// whitespace-normalized copy rather than requiring a single unbroken line.
const homepageProse = homepageCode.replace(/\s+/g, " ");

// ── 1. The section exists ───────────────────────────────────────────────────

test("homepage renders the info-practica section with its heading", () => {
  assert.match(homepageSrc, /id="info-practica-titulo"/, "expected an info-practica-titulo heading id");
  assert.equal(homepageSrc.includes("Información práctica"), true, "expected the section heading text");
});

// ── 2. Address, hours, phone — exactly as confirmed ─────────────────────────

test("address matches the owner-confirmed street address", () => {
  assert.equal(homepageCode.includes("Calle 113 #22-24, Piso 2"), true, "expected the confirmed street address");
});

test("hours match the owner-confirmed schedule exactly (Mon-Fri two ranges, Sat one range)", () => {
  assert.equal(homepageCode.includes("Lun") && homepageCode.includes("Vie"), true, "expected a Mon-Fri line");
  assert.equal(homepageCode.includes("9:30"), true, "expected the 9:30 a.m. opening time");
  assert.equal(homepageCode.includes("12:00 m."), true, "expected the 12:00 m. (noon) time");
  assert.equal(homepageCode.includes("3:00 p"), true, "expected the 3:00 p.m. afternoon opening time");
  assert.equal(homepageCode.includes("5:00 p"), true, "expected the 5:00 p.m. closing time");
  assert.equal(homepageCode.includes("Sáb"), true, "expected a Saturday line");
});

test("homepage never invents Sunday hours", () => {
  assert.equal(/domingo/i.test(homepageCode), false, "homepage must not mention Sunday hours — not confirmed by the owner");
});

test("phone renders as a tappable tel: link with the confirmed number", () => {
  assert.equal(homepageCode.includes('href="tel:+573016168730"'), true, "expected a tel: link with the confirmed number");
  assert.equal(homepageCode.includes("301 616 8730"), true, "expected the visible formatted phone number");
});

test("the new phone number never leaks into the WhatsApp CTA architecture", () => {
  // This branch intentionally does NOT touch lib/whatsapp.ts or the
  // NEXT_PUBLIC_WHATSAPP_NUMBER-driven wa.me links — the confirmed number
  // is exposed only as a plain tel: contact point.
  assert.equal(homepageCode.includes("3016168730"), true, "sanity: the digits should appear once, in the tel: href");
  assert.equal(
    /wa\.me\/3016168730/.test(homepageCode),
    false,
    "the new phone number must not be wired into a wa.me link on this branch",
  );
});

// ── 3. Payment methods — exactly the confirmed list ─────────────────────────

test("all five owner-confirmed payment methods are listed", () => {
  for (const method of [
    "Transferencia Bancolombia",
    "Bre-B",
    "Nequi",
    "Link de pago con tarjeta de crédito",
    "Contra entrega",
  ]) {
    assert.equal(homepageCode.includes(method), true, `expected payment method "${method}" to be listed`);
  }
});

// ── 4. Shipping — carrier name only, no invented time/price/SLA ─────────────

test("shipping states only the confirmed carrier, with the exact approved wording", () => {
  assert.equal(homepageCode.includes("Envíos por Inter Rapidísimo"), true, "expected the exact approved shipping line");
});

test("homepage never invents a shipping time, price, or SLA claim", () => {
  const FORBIDDEN_SHIPPING_CLAIMS = [
    "envío gratis",
    "envio gratis",
    "gratuito",
    "mismo día",
    "mismo dia",
    "24 horas",
    "48 horas",
    "horas hábiles",
    "días hábiles",
  ];
  const lowered = homepageCode.toLowerCase();
  for (const forbidden of FORBIDDEN_SHIPPING_CLAIMS) {
    assert.equal(lowered.includes(forbidden), false, `homepage must not contain invented shipping claim "${forbidden}"`);
  }
});

// ── 5. Returns/exchanges — restrained wording, never an absolute denial ─────

test("returns section uses the owner-approved restrained wording", () => {
  assert.equal(homepageCode.includes("Cambios y devoluciones"), true, "expected the returns section heading");
  assert.equal(
    homepageProse.includes("Los derechos legales del consumidor"),
    true,
    "expected the consumer-rights preservation clause",
  );
  assert.equal(
    homepageProse.includes("productos personalizados pueden estar sujetos a excepciones legales"),
    true,
    "expected the personalized-product exception clause",
  );
});

test("homepage never publishes an absolute no-returns claim", () => {
  const lowered = homepageCode.toLowerCase();
  for (const forbidden of ["no aceptamos devoluciones", "no hay devoluciones", "sin devoluciones"]) {
    assert.equal(lowered.includes(forbidden), false, `homepage must not contain absolute denial "${forbidden}"`);
  }
});
