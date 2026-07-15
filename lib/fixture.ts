// lib/fixture.ts
// SHARED (Violeta/foundation) — typed CONSUMPTION of the committed fixture.
// SERVER-SIDE ONLY (S-5): do NOT import this module (or fixture.schema.ts) into
// Client Components — the full fixture must never ship in the browser bundle.
// Amarillo/Verde pass already-selected, minimal props into client components.
import raw from "../catalog.fixture.json";
import type { CatalogFixture, ProductContract, CategoryContract, CollectionContract } from "./contract";

// ⚠️ VALIDATION CAVEAT (do NOT "fix" this into a tsc gate):
//   A JSON import widens literals ("available" -> string, 1 -> number), so
//   `const f: CatalogFixture = raw` FAILS typecheck even for a VALID fixture,
//   and `raw as CatalogFixture` SUPPRESSES all checking. tsc therefore does NOT
//   validate this fixture — it only gives typed CONSUMPTION below.
//   The AUTHORITATIVE conformance gate is the runtime fixture-lint (Zod) in
//   lib/fixture.schema.ts, wired as `npm run fixture-lint` (mission pack §10).
const fixture = raw as CatalogFixture;

export const products: ProductContract[] = fixture.products;
export const categories: CategoryContract[] = fixture.categories;
export const collections: CollectionContract[] = fixture.collections;
