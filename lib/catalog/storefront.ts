// lib/catalog/storefront.ts
// VERDE (Gate G5 — storefront catalog connect) — server-side ONLY fetch/
// adapter layer for the live GET /storefront/catalog endpoint (ai-agent-
// platform, app/routers/storefront.py). This is the storefront's sole data
// path into the backend's StorefrontCatalogV2 contract (lib/contract.ts,
// PR #7) — no Supabase URL, key, or client of any kind lives in this file or
// anywhere downstream of it. Never import lib/fixture.v2 / the synthetic
// catalog.contract.v2.fixture.json from here — that fixture is dev/Storybook
// only (see lib/fixture.v2.ts header) and must never be served as if it were
// live data (see docs note below and tests/storefront-v2/seam-isolation.test.ts).
//
// SERVER-SIDE ONLY (mirrors lib/fixture.ts's S-5 rule): do NOT import this
// module into a Client Component. Pages call it and pass already-selected
// props into client components (e.g. components/product/VariantSelector.tsx).
//
// FALLBACK CONTRACT (mission requirement — never silently serve stale data):
//   1. "ok"          — this request's fetch succeeded and passed shape
//                       validation. `catalog` is live (well, ISR-cache-fresh
//                       within CATALOG_REVALIDATE_SECONDS).
//   2. "stale"        — this request's fetch failed (network error, non-2xx,
//                       invalid JSON, or failed shape validation), but an
//                       EARLIER successful fetch from this same server
//                       instance is available. Callers MUST show a visible
//                       "last-good" indicator (see components/catalog/
//                       CatalogStatusBanner.tsx) — this status must never be
//                       rendered as if it were fresh.
//   3. "unavailable"  — this request's fetch failed and no earlier success
//                       exists in this instance. Callers MUST show an honest
//                       unavailable state — never the synthetic fixture,
//                       never a silent empty catalog indistinguishable from
//                       "genuinely zero published designs".
//
// LIMITATION (documented, not hidden): the "stale"/last-good cache below is
// a plain in-process module variable — best-effort, resets on cold start,
// and is NOT shared across concurrent serverless instances. It is NOT the
// durable cross-instance last-good snapshot described in
// app/services/storefront_snapshot_writer.py (backend Gate G2b) — that
// writer's READER is explicitly out of scope for this slice ("DP-FALLBACK-1
// / G5's job" per its own docstring) because reading it would require a
// Supabase Storage client/key in this Next.js app, which is forbidden here.
// A durable, cross-instance last-good reader is future backend-mediated work
// (e.g. a dedicated `/storefront/catalog/last-good` endpoint), not this file.
import type { StorefrontCatalogV2, StorefrontDesign } from "@/lib/contract";
import { resolveStorefrontImageHost } from "./storefrontImageHost";

/** Backend base URL for the ai-agent-platform FastAPI service.
 * Server-side only — never NEXT_PUBLIC_*, never sent to the browser. No
 * default: an unset value fails closed to "unavailable" rather than
 * guessing a production origin. Set in Vercel project env (not committed);
 * see .env.example for local dev. */
const BACKEND_BASE_URL = process.env.STOREFRONT_BACKEND_URL?.trim() || "";

/** ISR window, in seconds, for both the page-level `revalidate` export and
 * this module's own `fetch(..., { next: { revalidate } })` call. Kept as a
 * single exported constant so page and fetch settings can never drift. */
export const CATALOG_REVALIDATE_SECONDS = 300;

export type CatalogFetchStatus = "ok" | "stale" | "unavailable";

export interface CatalogResult {
  status: CatalogFetchStatus;
  /** Non-null for "ok" and "stale"; always null for "unavailable". */
  catalog: StorefrontCatalogV2 | null;
  /** Epoch ms of the successful fetch this data came from; null when status is "unavailable". */
  fetchedAt: number | null;
}

// ── In-process, best-effort last-good cache (see LIMITATION note above) ────
let lastGood: { catalog: StorefrontCatalogV2; fetchedAt: number } | null = null;

// ── Structural runtime validation (hand-rolled, deliberately NOT importing
// lib/fixture.schema.v2.ts — that Zod gate is scoped to the synthetic
// fixture file only; this is a separate, lighter shape guard for the live
// HTTP response so a misbehaving/misconfigured backend deploy can never
// reach a page as if it were a valid StorefrontCatalogV2). ──────────────────
function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isValidImage(v: unknown): boolean {
  return isPlainObject(v) && typeof v.url === "string" && v.url.length > 0;
}

function isValidColor(v: unknown): boolean {
  return isPlainObject(v) && typeof v.name === "string" && v.name.length > 0;
}

function isValidVariant(v: unknown): boolean {
  return (
    isPlainObject(v) &&
    typeof v.ref === "string" &&
    isValidColor(v.color) &&
    typeof v.size === "string" &&
    typeof v.price === "number" &&
    isValidImage(v.image) &&
    (v.availability === "available" || v.availability === "sold_out")
  );
}

function isValidDesign(v: unknown): v is StorefrontDesign {
  return (
    isPlainObject(v) &&
    typeof v.designRef === "string" &&
    typeof v.slug === "string" &&
    typeof v.name === "string" &&
    typeof v.description === "string" &&
    typeof v.category === "string" &&
    isValidImage(v.primaryImage) &&
    (v.availability === "available" || v.availability === "sold_out") &&
    typeof v.priceFrom === "number" &&
    Array.isArray(v.colors) &&
    Array.isArray(v.sizes) &&
    (v.featuredRank === null || (typeof v.featuredRank === "number" && v.featuredRank >= 1 && v.featuredRank <= 6)) &&
    Array.isArray(v.variants) &&
    v.variants.length >= 1 &&
    v.variants.every(isValidVariant)
  );
}

function isStorefrontCatalogV2(v: unknown): v is StorefrontCatalogV2 {
  return (
    isPlainObject(v) &&
    v.schemaVersion === 2 &&
    Array.isArray(v.categories) &&
    Array.isArray(v.designs) &&
    v.designs.every(isValidDesign)
  );
}

/** Fetch the live storefront catalog with ISR caching and the fallback
 * contract documented at the top of this file. Never throws. */
export async function getStorefrontCatalog(): Promise<CatalogResult> {
  if (!BACKEND_BASE_URL) {
    console.warn("event=storefront_catalog_backend_url_unset | fail_closed");
    return fallbackResult();
  }

  try {
    const res = await fetch(`${BACKEND_BASE_URL.replace(/\/+$/, "")}/storefront/catalog`, {
      headers: { Accept: "application/json" },
      next: { revalidate: CATALOG_REVALIDATE_SECONDS },
    });

    if (!res.ok) {
      throw new Error(`storefront catalog fetch failed with status ${res.status}`);
    }

    const data: unknown = await res.json();

    if (!isStorefrontCatalogV2(data)) {
      throw new Error("storefront catalog response failed shape validation");
    }

    lastGood = { catalog: data, fetchedAt: Date.now() };
    return { status: "ok", catalog: data, fetchedAt: lastGood.fetchedAt };
  } catch (err) {
    console.warn(`event=storefront_catalog_fetch_failed | error=${String(err)}`);
    return fallbackResult();
  }
}

function fallbackResult(): CatalogResult {
  if (lastGood) {
    return { status: "stale", catalog: lastGood.catalog, fetchedAt: lastGood.fetchedAt };
  }
  return { status: "unavailable", catalog: null, fetchedAt: null };
}

/** Find one design by its /productos/[slug] slug. */
export function getDesignBySlug(catalog: StorefrontCatalogV2, slug: string): StorefrontDesign | undefined {
  return catalog.designs.find((d) => d.slug === slug);
}

/** Featured rail: featuredRank !== null, ascending. Never includes sold_out
 * designs (the resolver already guarantees this — see storefront_catalog_
 * service.py's "(k)" invariant — this is defense-in-depth only). */
export function getFeaturedDesigns(catalog: StorefrontCatalogV2): StorefrontDesign[] {
  return catalog.designs
    .filter((d) => d.featuredRank !== null && d.availability === "available")
    .sort((a, b) => (a.featuredRank ?? 0) - (b.featuredRank ?? 0));
}

/** Group designs by the frozen category order in the envelope's own
 * `categories[]` list (never a locally-invented order). Empty categories are
 * omitted by callers, not here — this just projects the grouping. */
export function groupDesignsByCategory(catalog: StorefrontCatalogV2): Array<{ category: StorefrontCatalogV2["categories"][number]; designs: StorefrontDesign[] }> {
  return catalog.categories.map((category) => ({
    category,
    designs: catalog.designs.filter((d) => d.category === category.slug),
  }));
}

/** Turn the backend's path-only StorefrontVariant/StorefrontDesign
 * image.url (e.g. "/storage/v1/object/public/product-images/products/{id}/
 * {ref}.jpg" — see storefront_catalog_service.py's _validate_public_image_
 * path, which strips scheme+host by design) into an absolute URL next/image
 * can fetch. STOREFRONT_IMAGE_HOST is a plain public object-storage
 * hostname — never a Supabase client, key, or authenticated API call.
 *
 * SERVER-SIDE ONLY, same as this whole module (see header): every caller
 * must be a Server Component or a function that itself only ever runs
 * server-side (Wave-1 review V-1 — a prior version of this function was
 * called directly from the Client Component VariantSelector, where
 * STOREFRONT_IMAGE_HOST is always undefined; the fix moved that call into
 * app/(public)/productos/[slug]/page.tsx, resolving URLs server-side and
 * passing them into VariantSelector via props instead).
 *
 * Hostname resolution (including the fallback and fail-closed validation)
 * is delegated to resolveStorefrontImageHost, the SAME function
 * next.config.ts's remotePatterns calls at config-eval time — so the
 * allowlist and this URL builder can never disagree (Wave-1 review V-6). */
export function buildStorefrontImageUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl; // already absolute (defensive; live contract never sends this today)
  }
  const host = resolveStorefrontImageHost(process.env.STOREFRONT_IMAGE_HOST);
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `https://${host}${path}`;
}
