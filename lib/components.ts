// lib/components.ts
// SHARED (Violeta/foundation) — FROZEN component prop interfaces. TYPE ONLY.
// Consumers import via the fixed path alias:
//   import type { ProductCardProps } from "@/lib/components";
// Amarillo implements components/product/ProductCard.tsx AGAINST this interface
// and must NOT define a local alternative (S-6, docs/OWNERSHIP.md).

import type { ProductContract } from "./contract";

/** Frozen prop interface for the Amarillo-implemented ProductCard. Type only — no implementation here. */
export interface ProductCardProps {
  product: ProductContract;
  /** Optional link target; Amarillo links to the PLANNED /productos/[slug] route. */
  href?: string;
  /** Optional visual density/variant hook (presentational). */
  priority?: boolean; // for above-the-fold next/image on featured rails
}
