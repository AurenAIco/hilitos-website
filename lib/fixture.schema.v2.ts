// lib/fixture.schema.v2.ts
// SHARED (Violeta/foundation) — additive AUTHORITATIVE runtime lint for the
// SYNTHETIC StorefrontCatalogV2 fixture (Gate G1a).
// Run via `npm run fixture-lint:v2`. Exits non-zero on ANY violation.
//
// Mirrors the structure and semantics of lib/fixture.schema.ts (the V1 gate):
// tsc does NOT structurally validate a JSON import (literal widening + the
// typed-consumption cast in lib/fixture.v2.ts suppresses checking), so THIS
// script — not tsc — is the real conformance gate for catalog.contract.v2.fixture.json.
//
// SERVER/CLI ONLY: never import this from a Client Component.
//
// Scope note: this validates ONLY the synthetic V2 fixture. It does not
// replace, repoint, or weaken `npm run fixture-lint` (the V1 gate), which
// continues to validate catalog.fixture.json unchanged.

import { z } from "zod";
import raw from "../catalog.contract.v2.fixture.json";

/* ---- Zod schemas mirroring lib/contract.ts V2 types (strict: extra keys FAIL) ---- */

const CATEGORY_SLUGS_FROZEN_ORDER = [
  "ajuares-y-estuches",
  "batas",
  "conjuntos",
  "mantas-y-cobijas",
  "mamelucos",
  "amigurumis",
] as const;

const CategorySlug = z.enum(CATEGORY_SLUGS_FROZEN_ORDER);
const StorefrontAvailability = z.enum(["available", "sold_out"]);
const FeaturedRank = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
]);

/* Reused exact ImageContract / ColorContract shapes — mirrors lib/fixture.schema.ts. */
const Image = z.strictObject({
  url: z.string().min(1),
  alt: z.string().nullish(),
  placeholder: z.string().nullish(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

const Color = z.strictObject({
  name: z.string().min(1),
  hex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .nullish(),
});

const Variant = z.strictObject({
  ref: z.string().min(1),
  color: Color,
  size: z.string().min(1),
  price: z.number().int().positive(), // integer COP, always > 0
  image: Image, // required, non-optional — no missing-image variant
  availability: StorefrontAvailability,
});

const Design = z.strictObject({
  designRef: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase-hyphenated"),
  name: z.string().min(1),
  description: z.string(), // never null in V2
  category: CategorySlug,
  primaryImage: Image, // required, non-null
  availability: StorefrontAvailability,
  priceFrom: z.number().int().positive(),
  colors: z.array(Color),
  sizes: z.array(z.string().min(1)),
  featuredRank: FeaturedRank.nullable(),
  variants: z.array(Variant).min(1),
});

const Category = z.strictObject({
  slug: CategorySlug,
  name: z.string().nullish(),
  description: z.string().nullish(),
  image: Image.nullish(),
});

const Catalog = z.strictObject({
  schemaVersion: z.literal(2),
  categories: z.array(Category),
  designs: z.array(Design).min(1),
});

/* ---- Runner ---- */

const errors: string[] = [];
function assert(cond: boolean, msg: string): void {
  if (!cond) errors.push(msg);
}
function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

const parsed = Catalog.safeParse(raw);
if (!parsed.success) {
  console.error("fixture-lint:v2 FAIL — schema violations:");
  console.error(z.prettifyError(parsed.error));
  process.exit(1);
}
const f = parsed.data;

/* (privacy) never-exposed keys — defense in depth beyond .strict(): scan every key name. */
const NEVER_EXPOSED = /^(company_id|stock|agent_sales_copy|ai_visibility|ai_visibility_reason|verified_by|last_verified_at|deleted_at|internal_id)$/;
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

/* (structural absence) no "collections"/"collection" key anywhere, no "made_to_order" value anywhere. */
const STRUCTURALLY_ABSENT_KEYS = /^(collections|collection)$/;
function scanAbsentKeys(node: unknown, path: string): void {
  if (Array.isArray(node)) {
    node.forEach((item, i) => scanAbsentKeys(item, `${path}[${i}]`));
  } else if (node !== null && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      assert(!STRUCTURALLY_ABSENT_KEYS.test(key), `structurally-absent key "${key}" found at ${path}.${key} (collections deferred)`);
      scanAbsentKeys(value, `${path}.${key}`);
    }
  }
}
scanAbsentKeys(raw, "$");

function scanForMadeToOrder(node: unknown, path: string): void {
  if (Array.isArray(node)) {
    node.forEach((item, i) => scanForMadeToOrder(item, `${path}[${i}]`));
  } else if (node !== null && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      assert(value !== "made_to_order", `forbidden value "made_to_order" found at ${path}.${key}`);
      scanForMadeToOrder(value, `${path}.${key}`);
    }
  }
}
scanForMadeToOrder(raw, "$");

/* (a) categories: exactly the six frozen slugs, in frozen order. */
assert(
  deepEqual(
    f.categories.map((c) => c.slug),
    CATEGORY_SLUGS_FROZEN_ORDER,
  ),
  `categories must be exactly [${CATEGORY_SLUGS_FROZEN_ORDER.join(", ")}] in that order; ` +
    `found [${f.categories.map((c) => c.slug).join(", ")}]`,
);

/* (b) referential integrity: every design.category exists in categories. */
const categorySlugs = new Set(f.categories.map((c) => c.slug));
for (const d of f.designs) {
  assert(categorySlugs.has(d.category), `design ${d.designRef} references unknown category "${d.category}"`);
}

/* (c) uniqueness: designRef, slug (per design); variant ref GLOBALLY unique. */
assert(new Set(f.designs.map((d) => d.designRef)).size === f.designs.length, "duplicate designRef");
assert(new Set(f.designs.map((d) => d.slug)).size === f.designs.length, "duplicate design slug");
const allVariantRefs = f.designs.flatMap((d) => d.variants.map((v) => v.ref));
assert(new Set(allVariantRefs).size === allVariantRefs.length, "duplicate variant ref (must be unique globally, across all designs)");

/* (d) every design has >= 1 variant (also enforced by z.array().min(1), asserted again for a clear message). */
for (const d of f.designs) {
  assert(d.variants.length >= 1, `design ${d.designRef} has zero variants (must be excluded upstream, not emitted empty)`);
}

/* (e) base-ref consistency: numeric segment before the first hyphen of variant.ref === design.designRef. */
for (const d of f.designs) {
  for (const v of d.variants) {
    const base = v.ref.split("-")[0];
    assert(base === d.designRef, `variant ${v.ref} base segment "${base}" does not equal design.designRef "${d.designRef}"`);
  }
}

/* (f) design availability derivation: sold_out iff every emitted variant is sold_out. */
for (const d of f.designs) {
  const expected: "available" | "sold_out" = d.variants.every((v) => v.availability === "sold_out") ? "sold_out" : "available";
  assert(
    d.availability === expected,
    `design ${d.designRef} availability is "${d.availability}", expected "${expected}" (derived from its ${d.variants.length} variant(s))`,
  );
}

/* (g) priceFrom === min(variant.price). */
for (const d of f.designs) {
  const min = Math.min(...d.variants.map((v) => v.price));
  assert(d.priceFrom === min, `design ${d.designRef} priceFrom is ${d.priceFrom}, expected min variant price ${min}`);
}

/* (h) colors === distinct, first-occurrence-ordered projection of variant.color.name. */
for (const d of f.designs) {
  const seen = new Set<string>();
  const expectedNames: string[] = [];
  for (const v of d.variants) {
    if (!seen.has(v.color.name)) {
      seen.add(v.color.name);
      expectedNames.push(v.color.name);
    }
  }
  assert(
    deepEqual(d.colors.map((c) => c.name), expectedNames),
    `design ${d.designRef} colors ${JSON.stringify(d.colors.map((c) => c.name))} do not equal the distinct ordered variant-color projection ${JSON.stringify(expectedNames)}`,
  );
}

/* (i) sizes === distinct, first-occurrence-ordered projection of variant.size. */
for (const d of f.designs) {
  const seen = new Set<string>();
  const expectedSizes: string[] = [];
  for (const v of d.variants) {
    if (!seen.has(v.size)) {
      seen.add(v.size);
      expectedSizes.push(v.size);
    }
  }
  assert(
    deepEqual(d.sizes, expectedSizes),
    `design ${d.designRef} sizes ${JSON.stringify(d.sizes)} do not equal the distinct ordered variant-size projection ${JSON.stringify(expectedSizes)}`,
  );
}

/* (j) primaryImage equals one of the design's variant images. */
for (const d of f.designs) {
  const matchesSomeVariant = d.variants.some((v) => deepEqual(v.image, d.primaryImage));
  assert(matchesSomeVariant, `design ${d.designRef} primaryImage does not deep-equal any of its variants' images`);
}

/* (k) featured: <=6 non-null ranks; unique; sold-out design must have null rank; fixture covers ranks 1..6 exactly. */
const rankedDesigns = f.designs.filter((d): d is typeof d & { featuredRank: 1 | 2 | 3 | 4 | 5 | 6 } => d.featuredRank !== null);
assert(rankedDesigns.length <= 6, `at most six featured designs allowed, found ${rankedDesigns.length}`);
assert(new Set(rankedDesigns.map((d) => d.featuredRank)).size === rankedDesigns.length, "duplicate featuredRank value");
for (const d of f.designs) {
  if (d.availability === "sold_out") {
    assert(d.featuredRank === null, `sold_out design ${d.designRef} must have featuredRank: null, found ${d.featuredRank}`);
  }
}
const rankSet = new Set(rankedDesigns.map((d) => d.featuredRank));
for (const r of [1, 2, 3, 4, 5, 6] as const) {
  assert(rankSet.has(r), `fixture coverage: no design carries featuredRank ${r} (initial fixture must use exactly ranks 1..6)`);
}

/* ---- Coverage assertions (fixture must exercise every required path) ---- */

assert(
  f.designs.some((d) => d.variants.some((v) => v.availability === "available") && d.variants.some((v) => v.availability === "sold_out")),
  "coverage: no design has a mix of available and sold_out variants",
);

assert(
  f.designs.some((d) => d.availability === "sold_out"),
  "coverage: no fully sold-out design present",
);

assert(
  f.designs.some((d) => d.variants.length === 1),
  "coverage: no single-variant design present",
);

assert(
  f.designs.some((d) => {
    const distinctColors = new Set(d.variants.map((v) => v.color.name)).size;
    const distinctSizes = new Set(d.variants.map((v) => v.size)).size;
    return distinctColors >= 2 && distinctSizes >= 2 && d.variants.length < distinctColors * distinctSizes;
  }),
  "coverage: no sparse multi-color/multi-size design present (variants must be fewer than the full color x size matrix)",
);

const allColorNames = f.designs.flatMap((d) => d.variants.map((v) => v.color.name));
assert(allColorNames.includes("Blanco/Rosado"), 'coverage: no variant carries color name "Blanco/Rosado"');
assert(allColorNames.includes("Rosado/Blanco"), 'coverage: no variant carries color name "Rosado/Blanco"');
assert(
  allColorNames.filter((n) => n === "Blanco/Rosado" || n === "Rosado/Blanco").length >= 2,
  '"Blanco/Rosado" and "Rosado/Blanco" must both be present as distinct, non-merged colorway labels',
);

const allImages = f.designs.flatMap((d) => d.variants.map((v) => v.image));
assert(
  allImages.some((i) => typeof i.placeholder === "string" && i.placeholder.startsWith("data:image/")),
  "coverage: no image carries a valid base64 LQIP placeholder (blur path unexercised)",
);
assert(
  allImages.some((i) => i.placeholder == null),
  "coverage: no image omits the LQIP placeholder (non-LQIP path unexercised)",
);

for (const slug of CATEGORY_SLUGS_FROZEN_ORDER) {
  assert(f.designs.some((d) => d.category === slug), `coverage: no design uses category "${slug}"`);
}

/* ---- Verdict ---- */
if (errors.length > 0) {
  console.error("fixture-lint:v2 FAIL:");
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}

console.log(
  `fixture-lint:v2 OK: ${f.designs.length} designs, ${f.categories.length} categories (frozen order); ` +
    `${rankedDesigns.length} featured (ranks ${[...rankSet].sort().join(",")}); mixed-stock, fully-sold-out, ` +
    `single-variant, and sparse multi-color/multi-size designs present; ordered colorway distinctness proven; ` +
    `LQIP present+absent; all six categories covered; no collections; no made_to_order; no never-exposed keys.`,
);
