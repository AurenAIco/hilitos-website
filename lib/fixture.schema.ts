// lib/fixture.schema.ts
// SHARED (Violeta/foundation) — the AUTHORITATIVE runtime fixture validator (RE-1).
// Run via `npm run fixture-lint`. Exits non-zero on ANY violation.
//
// WHY THIS EXISTS: tsc does NOT structurally validate catalog.fixture.json
// (JSON imports widen literals; the typed-consumption cast in lib/fixture.ts
// suppresses checking). THIS script — not tsc — is the real conformance gate
// (mission pack HILITOS-F0-FOUNDATION §7.3 / §10).
//
// SERVER/CLI ONLY (S-5): never import this from a Client Component.

import { z } from "zod";
import raw from "../catalog.fixture.json";

/* ---- Zod schemas mirroring lib/contract.ts (strict: extra keys FAIL) ---- */

const Availability = z.enum(["available", "made_to_order", "unavailable"]);

const Image = z.strictObject({
  url: z.string().min(1),
  alt: z.string().nullish(),
  placeholder: z.string().nullish(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

const Color = z.strictObject({
  name: z.string().min(1),
  hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullish(),
});

const Product = z.strictObject({
  ref: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase-hyphenated"),
  name: z.string().min(1),
  description: z.string().nullish(),
  availability: Availability,
  price: z.number().int().positive().nullable(), // integer COP or null; never 0-as-unknown
  priceLabel: z.string().nullish(),
  images: z.array(Image),
  colors: z.array(Color),
  sizes: z.array(z.string().min(1)),
  category: z.string().nullable(),
  collection: z.string().nullable(),
  featured: z.boolean().optional(),
  sale: z.boolean().optional(),
});

const Category = z.strictObject({
  slug: z.string().min(1),
  name: z.string().nullish(),
  description: z.string().nullish(),
  image: Image.nullish(),
});

const Collection = z.strictObject({
  slug: z.string().min(1),
  title: z.string().nullish(),
  description: z.string().nullish(),
  image: Image.nullish(),
});

const Fixture = z.strictObject({
  schema_version: z.literal(1),
  products: z.array(Product).min(1),
  categories: z.array(Category),
  collections: z.array(Collection),
});

/* ---- Runner ---- */

const errors: string[] = [];
function assert(cond: boolean, msg: string): void {
  if (!cond) errors.push(msg);
}

const parsed = Fixture.safeParse(raw);
if (!parsed.success) {
  console.error("fixture-lint FAIL — schema violations:");
  console.error(z.prettifyError(parsed.error));
  process.exit(1);
}
const f = parsed.data;

/* (d) never-exposed keys — defense in depth beyond .strict(): scan every key name */
const NEVER_EXPOSED = /^(company_id|stock|agent_sales_copy|ai_visibility.*|last_verified_at|verified_by|deleted_at|deleted|id|internal_id)$/;
function scanKeys(node: unknown, path: string): void {
  if (Array.isArray(node)) {
    node.forEach((item, i) => scanKeys(item, `${path}[${i}]`));
  } else if (node !== null && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      assert(!NEVER_EXPOSED.test(key), `never-exposed key "${key}" found at ${path}.${key}`);
      scanKeys(value, `${path}.${key}`);
    }
  }
}
scanKeys(raw, "$");

/* (a) the seven required shapes (mission pack §7.3) */
const byRef = new Map(f.products.map((p) => [p.ref, p]));
const shape = (ref: string) => byRef.get(ref);

const p2257 = shape("2257");
assert(!!p2257, "required shape ref 2257 (normal product) missing");
if (p2257) {
  assert(p2257.images.length >= 1, "2257 must have >=1 image");
  assert(p2257.price !== null, "2257 must have a price");
  assert(p2257.colors.length >= 1 && p2257.sizes.length >= 1, "2257 must have >=1 color and >=1 size");
  assert(p2257.availability === "available", "2257 must be available");
  assert(typeof p2257.priceLabel === "string" && p2257.priceLabel.length > 0, "2257 must carry a non-null priceLabel (S-2)");
}

const p2301 = shape("2301");
assert(!!p2301, "required shape ref 2301 (no-image product) missing");
if (p2301) {
  assert(p2301.images.length === 0, "2301 must have images: []");
  assert(p2301.availability === "made_to_order", "2301 must be made_to_order");
}

const p2288 = shape("2288");
assert(!!p2288, "required shape ref 2288 (no-price product) missing");
if (p2288) {
  assert(p2288.price === null, "2288 must have price: null");
  assert(p2288.priceLabel == null, "2288 must have priceLabel: null (=> 'Precio a consultar')");
}

const p2260 = shape("2260");
assert(!!p2260, "required shape ref 2260 (featured product) missing");
if (p2260) {
  assert(p2260.featured === true, "2260 must be featured");
  assert(p2260.availability === "available", "2260 must be available");
}

const p2199 = shape("2199");
assert(!!p2199, "required shape ref 2199 (unavailable product) missing");
if (p2199) {
  assert(p2199.availability === "unavailable", "2199 must be unavailable");
}

const p2312 = shape("2312");
assert(!!p2312, "required shape ref 2312 (multi-color product) missing");
if (p2312) {
  assert(p2312.colors.length >= 2, "2312 must have >=2 colors");
}

const p2334 = shape("2334");
assert(!!p2334, "required shape ref 2334 (multi-size product) missing");
if (p2334) {
  assert(p2334.sizes.length >= 2, "2334 must have >=2 sizes");
  assert(p2334.availability === "made_to_order", "2334 must be made_to_order");
}

/* (b) all three availability states present */
const states = new Set(f.products.map((p) => p.availability));
for (const s of ["available", "made_to_order", "unavailable"] as const) {
  assert(states.has(s), `availability state "${s}" not covered by any product`);
}

/* (c) LQIP coverage: >=1 image WITH a base64 placeholder and >=1 image WITHOUT */
const allImages = f.products.flatMap((p) => p.images);
assert(
  allImages.some((i) => typeof i.placeholder === "string" && i.placeholder.startsWith("data:image/")),
  "no image carries a valid base64 LQIP placeholder (blur path unexercised)",
);
assert(
  allImages.some((i) => i.placeholder == null),
  "no image omits the LQIP placeholder (solid --crudo box path unexercised)",
);

/* (e) referential integrity: every product category/collection slug exists */
const categorySlugs = new Set(f.categories.map((c) => c.slug));
const collectionSlugs = new Set(f.collections.map((c) => c.slug));
for (const p of f.products) {
  if (p.category !== null) {
    assert(categorySlugs.has(p.category), `product ${p.ref} references unknown category "${p.category}"`);
  }
  if (p.collection !== null) {
    assert(collectionSlugs.has(p.collection), `product ${p.ref} references unknown collection "${p.collection}"`);
  }
}

/* (f) at least three featured products (S-1) */
const featuredCount = f.products.filter((p) => p.featured === true).length;
assert(featuredCount >= 3, `need >=3 featured products, found ${featuredCount}`);

/* (g) at least one product with a non-null priceLabel (S-2) */
assert(
  f.products.some((p) => typeof p.priceLabel === "string" && p.priceLabel.length > 0),
  "no product carries a non-null priceLabel",
);

/* uniqueness (per contract: ref and slug are stable/unique identities) */
assert(new Set(f.products.map((p) => p.ref)).size === f.products.length, "duplicate product refs");
assert(new Set(f.products.map((p) => p.slug)).size === f.products.length, "duplicate product slugs");
assert(categorySlugs.size === f.categories.length, "duplicate category slugs");
assert(collectionSlugs.size === f.collections.length, "duplicate collection slugs");

/* ---- Verdict ---- */
if (errors.length > 0) {
  console.error("fixture-lint FAIL:");
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}

console.log(
  `fixture-lint OK: ${f.products.length} products, ${f.categories.length} categories, ` +
    `${f.collections.length} collections; 7 required shapes, 3 availability states, ` +
    `LQIP present+absent, referential integrity, ${featuredCount} featured, priceLabel covered; ` +
    `no never-exposed keys.`,
);
