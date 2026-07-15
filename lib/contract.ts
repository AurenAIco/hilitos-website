// lib/contract.ts
// FROZEN PUBLIC CONTRACT — Hilitos.co redesign. Consumed verbatim by Amarillo & Verde.
// SHARED (Violeta/foundation) — do NOT edit without Violeta approval (see docs/OWNERSHIP.md).
// NEVER add any of these fields to any public type below:
//   company_id, stock (exact), agent_sales_copy, ai_visibility*, last_verified_at,
//   verified_by, deleted_at, internal ids.

/** ---- AvailabilityContract: neutral 3-state enum (never raw stock, never a bare boolean) ---- */
export type Availability = "available" | "made_to_order" | "unavailable";

/** Naming-parity alias (S-4): `AvailabilityContract` IS `Availability`. Either name is canonical. */
export type AvailabilityContract = Availability;

export const AVAILABILITY_VALUES = ["available", "made_to_order", "unavailable"] as const;

/**
 * Recommended Spanish labels — SEEDED, pending Mónica approval.
 * Consumers must read labels from THIS single map (do not invent per-component labels).
 * `made_to_order` is a NEUTRAL/POSITIVE state, not an error.
 */
export const AVAILABILITY_LABELS_ES: Record<Availability, string> = {
  available: "Disponible",
  made_to_order: "Sobre pedido",
  unavailable: "Agotado",
};

/** ---- ImageContract ---- */
export interface ImageContract {
  /** Durable public image URL (image bucket) OR a repo-local fixture path (fixtures only). */
  url: string;
  /** Accessible alt text. If null/absent, consumers fall back to the product name. */
  alt?: string | null;
  /** base64 LQIP for next/image placeholder="blur". If absent, consumers use a solid --crudo box. */
  placeholder?: string | null;
  /** Intrinsic px width — helps next/image avoid layout shift. Optional; 4:5 framing is enforced by CSS. */
  width?: number;
  /** Intrinsic px height. Optional. */
  height?: number;
}

/** ---- ColorContract (flat, descriptive; NOT a SKU matrix) ---- */
export interface ColorContract {
  /** Human color name — used as the swatch's accessible name. Required. */
  name: string;
  /** Optional hex (e.g. "#B07C57"). If absent, consumers render a name-only chip. */
  hex?: string | null;
}

/** ---- CategoryContract ---- */
export interface CategoryContract {
  /** Slug — the ONLY Phase-1 authoritative field (products reference it via `category`). */
  slug: string;
  /** Display name (es-CO). Mónica-owned; null/placeholder until approved. */
  name?: string | null;
  /** Optional short description. Mónica-owned. */
  description?: string | null;
  /** Optional representative image. Mónica-owned. */
  image?: ImageContract | null;
}

/** ---- CollectionContract ---- */
export interface CollectionContract {
  /** Slug — the ONLY Phase-1 authoritative field (products reference it via `collection`). */
  slug: string;
  /** Editorial title (es-CO). Mónica-owned; null/placeholder until approved. */
  title?: string | null;
  /** Editorial description. Mónica-owned. */
  description?: string | null;
  /** Editorial hero image. Mónica-owned. */
  image?: ImageContract | null;
}

/** ---- ProductContract (the public product seam) ---- */
export interface ProductContract {
  /** Public reference shown as "Ref. NNNN" (garment-hangtag). Stable public identity. */
  ref: string;
  /** URL slug for /productos/[slug]. Unique, lowercase, hyphenated. */
  slug: string;
  /** Display name (es-CO). */
  name: string;
  /** Optional short public description. Mónica-owned; null if unset. */
  description?: string | null;
  /** Neutral 3-state availability. */
  availability: Availability;
  /** Integer COP price, or null when not public. null => consumers render "Precio a consultar". Never 0-as-unknown. */
  price: number | null;
  /** Optional pre-formatted price label; if present, consumers PREFER it over `price`. */
  priceLabel?: string | null;
  /** Ordered images. MAY be empty => consumers render the branded 4:5 ImagePlaceholder. */
  images: ImageContract[];
  /** Flat color descriptors (independent of sizes). */
  colors: ColorContract[];
  /** Flat size labels, e.g. "0-3m" (independent of colors). */
  sizes: string[];
  /**
   * Category slug reference. Display name lives in CategoryContract (Mónica-owned), not here.
   * CARDINALITY FROZEN AS SINGULAR BY DECISION (RE-5) — this is deliberate, not a type accident.
   * If the real Hilitos catalog needs MULTIPLE categories per product, change to
   * `categories: string[]` NOW, before Amarillo/Verde consume this contract — a later
   * change is a BREAKING modification of the shared seam. See mission pack §17 OQ#7.
   */
  category: string | null;
  /** Collection slug reference. Editorial fields live in CollectionContract (Mónica-owned), not here. */
  collection: string | null;
  /** Editorial emphasis flag for the homepage featured rail. */
  featured?: boolean;
  /** Sale/promo VISUAL treatment flag. Presentational only; no pricing math implied. */
  sale?: boolean;
}

/** ---- Fixture envelope (shape of catalog.fixture.json) ---- */
export interface CatalogFixture {
  schema_version: 1;
  products: ProductContract[];
  categories: CategoryContract[];
  collections: CollectionContract[];
}
