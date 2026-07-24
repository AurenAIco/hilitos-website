// lib/fixture.v2.ts
// SHARED (Violeta/foundation) — additive typed CONSUMPTION of the SYNTHETIC V2
// contract fixture (Gate G1a). This module is for tests/development only.
//
// NOT connected to runtime rendering: no public route, page, or component may
// import this module in this slice. The data behind it is synthetic test data
// (see catalog.contract.v2.fixture.json header/refs) — never last-good,
// cached, fallback, or production data.
//
// SERVER/CLI ONLY (S-5, mirrors lib/fixture.ts): do NOT import this module (or
// lib/fixture.schema.v2.ts) into a Client Component — nothing here should ship
// in the browser bundle in this slice.
//
// This module does NOT modify or repoint the existing lib/fixture.ts consumer
// seam, which continues to serve the flat V1 contract unchanged.
import raw from "../catalog.contract.v2.fixture.json";
import type { StorefrontCatalogV2, StorefrontDesign } from "./contract";
import type { CategoryContract } from "./contract";

// ⚠️ VALIDATION CAVEAT (mirrors lib/fixture.ts — do NOT "fix" into a tsc gate):
//   A JSON import widens literals ("available" -> string, 2 -> number), so a
//   direct `const c: StorefrontCatalogV2 = raw` assignment fails typecheck
//   even for a valid fixture, and `raw as StorefrontCatalogV2` suppresses
//   checking. tsc therefore does NOT structurally validate this fixture — it
//   only gives typed CONSUMPTION below. The AUTHORITATIVE conformance gate is
//   the runtime fixture-lint (Zod) in lib/fixture.schema.v2.ts, wired as
//   `npm run fixture-lint:v2`.
const catalog = raw as StorefrontCatalogV2;

export const designsV2: StorefrontDesign[] = catalog.designs;
export const categoriesV2: CategoryContract[] = catalog.categories;
export const catalogV2: StorefrontCatalogV2 = catalog;
