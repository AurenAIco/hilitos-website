---
mission_id: HILITOS-F0-FOUNDATION
mission_name: Foundation Architecture and Shared Contracts
terminal: Violeta (Creative Director & Architecture Owner)
status: REVIEWED — APPROVED_WITH_EDITS — EDITS APPLIED — NOT DISPATCHED — AWAITING JUANPA GO
author: Opus (TPM / architecture-pack author for Aurena AI)
authored: 2026-07-15
review_gate_f0_g0: APPROVED_WITH_EDITS — Opus independent architecture review, 2026-07-15
edits_applied: RE-1, RE-2, RE-3, RE-4, RE-5, S-1, S-2, S-3, S-4, S-5, S-6, S-7 (applied 2026-07-15)
mission_type: architecture foundation
risk_class: low-to-medium, production-isolated
repository: Jpperez09/hilitos-website
integration_branch: redesign/main  (DOES NOT EXIST YET — this mission creates it)
implementation_branch: redesign/violeta/f0-foundation  (branched from redesign/main once it exists)
worktree: isolated Violeta worktree
production_changes: forbidden
backend_changes: forbidden
database_changes: forbidden
dns_changes: forbidden
recommended_model: Sonnet 5 (normal execution); Fable 5 only if Juanpa deliberately selects it after review
source_of_truth: "Hilitos.co Redesign — Architecture and Creative Blueprint v1.0 (Violeta, 2026-07-15)" — see §4 (document not yet materialized in the vault; this pack seeds its structure)
consumes_nothing: true
produces_for: [Amarillo (HILITOS-P1A-AMARILLO), Verde (catalog mission), Azul (QA)]
recommended_repo_path: docs/mission-packs/HILITOS_F0_FOUNDATION_ARCHITECTURE_SHARED_CONTRACTS_2026-07-15.md
draft_vault_path: AUREN/Juanpa/Hilitos/07_Website_Redesign/Mission_Packs/HILITOS_F0_FOUNDATION_ARCHITECTURE_SHARED_CONTRACTS_MISSION_PACK_DRAFT_2026-07-15.md
mission_ends_at_gate: F0-G3 (independent foundation review). This pack does NOT authorize Amarillo/Verde/Azul builds, preview integration, or any production/DNS cutover.
unblocks: HILITOS-P1A-AMARILLO (currently BLOCKED at Gate A1 for exactly the artifacts this mission produces)
---

# HILITOS-F0-FOUNDATION — Foundation Architecture and Shared Contracts

**`REVIEWED — APPROVED_WITH_EDITS — EDITS APPLIED — NOT DISPATCHED — AWAITING JUANPA GO`**

> This is a Mission Pack (a build contract), not an authorization to build. Implementation may begin only after **Gate F0-G0** (Opus review of this pack) and an explicit **Juanpa GO**. Nothing in this document authorizes editing `master`, running a build, creating branches or worktrees, committing, pushing, deploying, connecting a Vercel project, touching GitHub Pages, DNS, the CNAME, `api.hilitos.com`, Supabase, the Aurena/Olivia backend, or any secret.

---

## 0 · Why this mission exists (context)

On **2026-07-15**, `HILITOS-P1A-AMARILLO` received an explicit `JUANPA GO` and was dispatched, then **STOPPED at Slice S0 / Gate A1** because the entire Violeta Phase-0 foundation it depends on **does not exist**. Verified via the GitHub API:

- `Jpperez09/hilitos-website` has exactly **one** branch: `master` @ `8ab791da59ad30171162b1651f6fae32800367f2`.
- **`redesign/main` does not exist.**
- `master` is the **live GitHub Pages production site** (static `index.html`, `css/`, `js/`, `images/`, `CNAME`, `data/products.js`), recently wired to fetch live products from `api.hilitos.com`. It contains **zero** foundation artifacts.
- No local clone exists in `C:\Users\juanp\dev`.

**This mission is the sanctioned unblock.** It creates `redesign/main` and the Violeta Phase-0 foundation — framework, structure, contracts, fixtures, tokens, ownership, preview strategy, and route skeletons — **without building the website**, so that Amarillo, Verde, and Azul can be (re-)dispatched onto a stable seam. It is deliberately production-isolated: GitHub Pages continues to serve `master`; this mission never touches it.

**Fidelity constraint:** the contracts, tokens, and fixture below are authored to **exactly match** the frozen seam already referenced by the Amarillo pack (3-state availability enum, `ref`/`slug`/`name`/`availability`, 4:5 imagery, flat variants, `{name,hex}` colors, the eight color tokens, Fraunces + Hanken Grotesk, the never-exposed field list). Amarillo/Verde will consume these verbatim — they must not drift.

---

## 1 · Mission Pack Front Matter

| Field | Value |
| --- | --- |
| **Mission ID** | `HILITOS-F0-FOUNDATION` |
| **Mission name** | `Foundation Architecture and Shared Contracts` |
| **Terminal** | **Violeta** (Creative Director & Architecture Owner) |
| **Recommended model** | **Sonnet 5** for normal execution; **Fable 5** only if Juanpa deliberately selects it |
| **Repository** | `Jpperez09/hilitos-website` |
| **Integration branch (to be created)** | `redesign/main` — created **from `master`**; this is the redesign's long-lived integration line |
| **Implementation branch** | `redesign/violeta/f0-foundation` (branched from `redesign/main`) |
| **Worktree** | Isolated Violeta worktree (never shared with another terminal) |
| **Mission type** | Architecture foundation |
| **Risk class** | Low-to-medium, **production-isolated** |
| **Production / backend / DB / DNS changes** | **Forbidden** |
| **Mission ends at** | **Gate F0-G3** (independent foundation review). Does NOT authorize Amarillo/Verde/Azul builds or any A4–A6 / cutover gate. |
| **Depends on** | Nothing in-repo (starts from `master`). Upstream creative-value confirmation (§4, §22) is desirable but **not** a hard stop — see §6.5. |
| **Blocks / unblocks** | **Unblocks** `HILITOS-P1A-AMARILLO` (Gate A1) and the Verde catalog mission by materializing every §5-of-Amarillo precondition. |

---

## 2 · Executive Summary

The Hilitos.co redesign has a build contract for its first visual slice (Amarillo) but **no ground to stand on**: the target repo is still the legacy static GitHub Pages site, and none of the Next.js/TypeScript foundation, shared contracts, tokens, or fixture that every downstream terminal consumes exist yet.

`HILITOS-F0-FOUNDATION` establishes that ground and **nothing more**. Executed by the **Violeta** terminal, it creates `redesign/main` from `master` and lays down: a **Next.js App Router** skeleton (TypeScript, mobile-first, Server Components by default), the **design-token contract** (`styles/tokens.css` — the eight frozen color tokens plus spacing/type/radii/elevation/motion scales), the **frozen public typed contracts** (`lib/contract.ts` — `ProductContract`, `CollectionContract`, `CategoryContract`, `AvailabilityContract`, `ImageContract`), a **committed fixture** (`catalog.fixture.json` covering the seven required product shapes), a **typed fixture loader** (`lib/fixture.ts`, for typed consumption only) backed by an **authoritative runtime fixture-lint (Zod)** as the real validation gate, **route skeletons** for all six public routes, an **app-shell + metadata + robots/sitemap skeleton**, the **Vercel preview strategy** (documented; not activated), and an authoritative **folder-ownership map** dividing Violeta / Amarillo / Verde / Shared.

Crucially, this mission **does not build the website**. No homepage, no catalog, no product page, no search, no filters, no WhatsApp logic, no backend or Supabase integration, no analytics. It freezes interfaces; it does not implement experiences. It is production-isolated: GitHub Pages keeps serving `master`, `api.hilitos.com` is untouched, and the mission ends at an independent review (Gate F0-G3) that certifies the seam and unblocks Amarillo/Verde.

The outcome is a **buildable, lint-clean, type-checked foundation branch** (`redesign/main`, via a reviewed PR) whose contracts match the already-approved Amarillo pack exactly — so Amarillo's blocked GO can be re-issued against a real foundation.

---

## 3 · Mission Objective

Produce, on a new `redesign/main` integration branch, a **frozen architectural foundation** that a downstream Sonnet 5 implementer can build against without inventing architecture. Concretely:

1. **Framework foundation** — Next.js App Router + TypeScript + Tailwind (tokens mapped into the theme), scaffolded so `build`, `lint`, and `typecheck` pass.
2. **Design-token contract** — `styles/tokens.css` defining every token *name/role* the visual system consumes, with seeded (tunable) values. Names/roles are frozen; values are creative-tunable without breaking consumers.
3. **Frozen public typed contracts** — `lib/contract.ts` exporting the five required interfaces/types, matching the Amarillo seam exactly, excluding every never-exposed field.
4. **Committed fixture** — `catalog.fixture.json` covering the seven required product shapes plus full 3-state availability coverage, with referential integrity to its categories/collections, plus a **typed loader** (`lib/fixture.ts`, typed consumption only) and an **authoritative runtime fixture-lint (Zod)** that is the real conformance gate. **`tsc` does NOT structurally validate the fixture** (JSON imports widen `"available"` to `string`, and a cast suppresses checking) — see §7.3.
5. **Route skeletons** — minimal, clearly-marked placeholder pages for `/`, `/catalogo`, `/productos/[slug]`, `/colecciones/[slug]`, `/nosotros`, `/privacy` so routing resolves and the build is green. **No real page implementation.**
6. **App shell / metadata / robots / sitemap skeletons** — root layout with fonts + tokens + a documented shell-composition seam; neutral metadata skeleton; static robots/sitemap skeletons with documented Verde extension points; **`robots.ts` fail-closed (`Disallow: /`) until A6** (S-3).
7. **Vercel preview strategy** — a written strategy plus safe in-repo config only; **no** project connection or deployment.
8. **Folder-ownership map** — authoritative Violeta / Amarillo / Verde / Shared boundaries, naming the specific files that are shared (`app/layout.tsx`, `tokens.css`, `contract.ts`, fixture, metadata, `next.config.*`, catalog routes).

**The objective is to freeze the architecture, not to build the catalog experience.** Every deliverable is a contract, a skeleton, or documentation. Nothing here renders a finished user experience.

---

## 4 · Source-of-Truth References

The single authoritative creative/architecture source is the **Violeta blueprint**:

> **"Hilitos.co Redesign — Architecture and Creative Blueprint v1.0"** (Violeta · Creative Director & Architecture Owner · 2026-07-15).

**Important reconciliation:** as of authoring, this blueprint document is **not materialized in the vault** (`07_Website_Redesign/` contains only `Mission_Packs/`). Its decisions are, however, **restated and frozen inside the already-approved Amarillo pack** (`HILITOS_P1A_AMARILLO_…_DRAFT_2026-07-15.md`), which this mission treats as the **operative transcription** of the blueprint. The following are **fixed and must not be reopened** by this mission:

- **[ARCHITECTURAL]** Rebuild in **Next.js (App Router)** on **Vercel**; **catalog-first**; SSG + ISR; a server-side BFF (Verde, later) consumes a public-safe catalog endpoint; a committed snapshot is last-known-good.
- **[ARCHITECTURAL]** Stack: App Router, **Server Components by default**, **TypeScript**, **Tailwind** (design tokens as CSS variables mapped into the Tailwind theme), `next/image`, route handlers for the BFF (Verde), `sitemap.ts` / `robots.ts`, Vercel Web Analytics.
- **[CREATIVE]** Concept: **"El archivo vivo de Hilitos"** — warm, editorial, textile-craft heritage still made today; **thread-motif** signature; mobile-first.
- **[SEAM]** The **Public Product Contract**: required `ref`, `slug`, `name`, `availability`; `availability` is the neutral **3-state enum** `available | made_to_order | unavailable`; missing price → `"Precio a consultar"` (never `$0`); missing images → branded **4:5** placeholder; variants are **flat** (`sizes[]` and `colors[]` independent; **not** a SKU matrix); colors are `{name, hex}`. **Never-exposed fields:** `company_id`, exact stock, `agent_sales_copy`, `ai_visibility*`, `last_verified_at`, `verified_by`, `deleted_at`, internal ids.
- **[SEAM]** Image architecture: product images live in a public bucket with durable URLs, optimized by `next/image`; **product images are not copied into the repo**; only rarely-changing brand/editorial assets live in `/public`; **4:5 portrait** framing; LQIP via a base64 placeholder carried on the image (else a solid `--crudo` box).
- **[PROCESS]** Four terminals (Violeta / Amarillo / Verde / Azul) and the review-gate model.
- **No production cutover without Juanpa and Mónica approval.**

**Creative-value resolution (this mission's one real judgment call).** The *frozen seam* is the set of **token names/roles**, the **contract types**, the **fixture shape**, and the **route structure** — all fully specified in this pack. The *creative values behind the tokens* (exact hex, exact type/space numbers) are seeded here with sensible defaults **derived from the named roles** and are explicitly **tunable by Violeta/Mónica without breaking any consumer** (a value change does not change a token's name or a type). Therefore the absence of a materialized blueprint **does not block** creating the foundation. **If** the blueprint later surfaces with different concrete values, adopt them; **if it surfaces with a structurally different contract, token set, or route model — STOP** (§9 stop conditions), because that is a seam conflict, not a value tweak.

**Secondary references (context only, not authority):** real product photography exists under `ai-agent-platform/Catalogo_Hilitos/` (filenames like `Ref.2257_*.jpeg`), confirming the `Ref. NNNN` identity model and warm palette. **Do not import these into the repo.** The fixture uses neutral, clearly-marked placeholder assets only.

---

## 5 · Scope

### 5.1 In scope (exactly)

1. Create `redesign/main` from `master`; do foundation work on `redesign/violeta/f0-foundation`; PR into `redesign/main`.
2. Scaffold a **Next.js App Router** project (TypeScript, mobile-first, Server Components by default) that builds green.
3. **TypeScript configuration** (`tsconfig.json`, strict).
4. **Tailwind configuration** with tokens mapped into the theme (v3 `tailwind.config.*` or v4 `@theme` in the global stylesheet — implementer chooses per the Tailwind version they scaffold; the **mapping requirement** is fixed, the mechanism is not).
5. **`styles/tokens.css`** — the authoritative token definitions (§7.1).
6. **`lib/contract.ts`** — the five frozen contracts (§7.2).
7. **`catalog.fixture.json`** + **`lib/fixture.ts`** typed loader (§7.3).
8. Shared **route skeleton** for the six routes (§7.4) — placeholders only.
9. **App shell skeleton** — root `app/layout.tsx` (fonts + tokens import + shell-composition seam) (§7.5).
10. **Metadata skeleton** — neutral root metadata (§7.6).
11. **robots / sitemap skeleton** — static routes + Verde extension points; **`robots.ts` fail-closed (`Disallow: /`) until A6** (§7.7, S-3).
12. **Vercel preview strategy** — documented + safe in-repo config only, no deployment (§7.8).
13. **Folder-ownership map** — authoritative (§8), committed as **`docs/OWNERSHIP.md`** (mandatory, exact path) in the branch, including the **"Branch & Worktree Conventions"** section (§7.9) that satisfies Amarillo precondition #10.
14. Wire `package.json` scripts (`dev`, `build`, `lint`, `typecheck`, `fixture-lint`) and run all of them.

### 5.1.b Fixed architectural constraints (RE-2 — do not deviate)

- **`next.config.*` MUST NOT set `output: "export"`.** The target runtime is **Vercel SSR/SSG/ISR** per the blueprint. Static export would break or cripple the dynamic routes (`/productos/[slug]`, `/colecciones/[slug]`), make Verde's future ISR/BFF architecture impossible, and would amount to converting Next.js into just another static GitHub Pages site — the exact thing this redesign moves away from. No `output: "export"`, no `next export`. (See §7.10, §9, §10.)

### 5.2 Out of scope (explicitly prohibited — doing any is a scope breach and a stop condition, §9)

- **Any homepage / catalog / product / collection page implementation** (beyond an inert placeholder skeleton).
- Search; filters; sorting; URL query synchronization; pagination.
- Backend integration; **Supabase**; API routes / BFF route handlers; the catalog endpoint; ISR/fallback/snapshot logic.
- **WhatsApp** logic, `wa.me` URL construction, phone numbers.
- Analytics implementation; payments; cart; checkout; accounts; CRM; inventory display.
- Any edit to **`master`**, `data/products.js`, the legacy static site *as served by GitHub Pages*, `CNAME`, DNS, or `api.hilitos.com`.
- Connecting/deploying a **Vercel** project; changing GitHub Pages source.
- Importing real product photography into the repo.
- Building the shared **Header/Footer/WhatsAppCTA/ProductCard** *visual implementations* (those are Amarillo's). This mission may freeze the **`ProductCard` prop interface** as a type in `lib/contract.ts` (or an adjacent `lib/components.ts`), but must **not** implement the component.

---

## 6 · Preconditions & Base-State Discipline (Gate F0-G1)

### 6.1 Repository discovery (must re-verify at execution — do not trust this pack's snapshot blindly)

Before any change, re-confirm via the GitHub API / a fresh read:

1. `Jpperez09/hilitos-website` exists and is reachable with push rights.
2. The **only** production-serving branch is `master`; record its **current** HEAD SHA (pack snapshot: `8ab791da…`; if it has moved, note the new SHA).
3. **GitHub Pages source** is `master` (confirm in repo settings if accessible; if not accessible, assume `master` and proceed — but never change the Pages source regardless).
4. **GitHub Pages deployment-mechanism discovery (RE-3 — MANDATORY read-only phase, BEFORE creating any branch).** Determine *how* Pages actually deploys:
   - Inspect **`.github/workflows/**`** in `master` (read-only) and the repo's Pages settings.
   - Identify whether Pages uses a **classic branch source** (serves `master` directly) **or** a **GitHub Actions** workflow.
   - Verify that **no** workflow could build/deploy Pages **from all branches**, **from `redesign/main`**, or **from `redesign/**`** (e.g. an `on: push` without a `branches:` filter, or one that includes the redesign branches; any `actions/deploy-pages` / `peaceiris/actions-gh-pages` step reachable on a non-`master` push).
   - **If a push to `redesign/main` (or the working branch) could trigger a Pages build/deploy → STOP** (§9): do **not** create the branch, do **not** push, do **not** modify or "fix" the workflow inside this mission — report it and request a decision. Record the finding (mechanism + verdict) in the handoff regardless.
5. `redesign/main` still does not exist (if it now exists with unexpected content → **STOP**, §9: "repository differs materially from discovery").
6. There is no unexpected foundation already present on `master`.

### 6.2 Branch creation (the only mutation to shared refs)

- Create `redesign/main` **from `master`** at the recorded base SHA (initially an identical tree — an administrative branch creation; GitHub Pages serves `master`, so this is production-inert).
- Create the working branch `redesign/violeta/f0-foundation` **from `redesign/main`** in an **isolated worktree**.
- Record both base SHAs for the handoff report.

### 6.3 Legacy-file handling on `redesign/main` (documented decision, not a silent one)

`redesign/main` is a **separate branch**; GitHub Pages does not serve it. The foundation Next.js app is created at the **repo root** of `redesign/main`. The legacy static files (`index.html`, `css/`, `js/`, `images/`, `data/products.js`) that live on `master`:

- **Recommended:** move them on `redesign/main` into a clearly-labeled `legacy/` folder (or remove them on this branch only) so the Next.js app root is clean. This affects **only** `redesign/main` — `master` and GitHub Pages are untouched.
- **`CNAME` must be preserved on `master` and must NOT be added to any Vercel/redesign config** in a way that would attach the custom domain to the redesign before Gate A6.
- Whichever choice is made, **document it** in the handoff and in `docs/OWNERSHIP.md`.

### 6.4 Toolchain

- Read/choose the package manager deliberately (npm/pnpm — record which; commit the matching lockfile). Do not assume.
- Node version pinned via `.nvmrc` / `engines` consistent with the Next.js version scaffolded.

### 6.5 Upstream creative-value dependency is NOT a hard stop

Per §4, missing concrete blueprint values do **not** block foundation creation (names/types/shape are frozen here; values are tunable defaults). Proceed and record, in the handoff, every seeded value that Violeta/Mónica should confirm. A *structural* conflict with a later-surfaced blueprint **is** a stop (§9).

---

## 7 · Deliverables (detailed specifications)

> All deliverables are **contracts, skeletons, or documentation**. None is a finished visual/functional implementation.

### 7.1 `styles/tokens.css` — the design-token contract

**Rule:** this file defines token **names/roles** (frozen) with **seeded values** (tunable). It contains **no component styling** — only custom-property definitions under `:root`. Consumers (Amarillo) read these; they must never hardcode raw values. Any *value* change is a Violeta request; any *name* change is a seam change requiring re-review.

Required token groups and exact names:

**Color (the 8 frozen names — roles fixed; values seeded/tunable; `--whatsapp` is a real brand value, keep exact):**

```css
:root {
  /* ---- Brand color tokens (NAMES FROZEN; values are creative defaults, tunable by Violeta/Mónica) ---- */
  --marfil:       #F5EFE2; /* primary warm background (ivory) */
  --crudo:        #E7DCC8; /* secondary raw-natural surface; the solid LQIP placeholder-box tone */
  --tinta:        #2B2622; /* primary text (ink) */
  --barro:        #B07C57; /* warm clay accent — DECORATIVE use only */
  --barro-hondo:  #8A5A38; /* deep clay — INTERACTIVE / AA-critical text & controls (use instead of --barro when AA contrast is required) */
  --hilo:         #9A8763; /* thread color — thread/stitch motif, hairlines, stitch underlines */
  --sage:         #A7B39A; /* secondary natural accent */
  --whatsapp:     #25D366; /* WhatsApp brand green — RESERVED exclusively for WhatsApp actions (exact brand value) */

  /* ---- Functional aliases (foundation-added; documented; keep the reserved semantics) ---- */
  --surface:      var(--marfil);
  --surface-raw:  var(--crudo);
  --text:         var(--tinta);
  --text-muted:   #6B635A;                 /* derived muted ink — tunable */
  --hairline:     rgba(43, 38, 34, 0.12);  /* subtle rule/border */
  --focus-ring:   var(--barro-hondo);      /* AA-critical focus color */

  /* ---- Typography ---- */
  --font-display: "Fraunces", Georgia, "Times New Roman", serif;
  --font-body:    "Hanken Grotesk", system-ui, -apple-system, Segoe UI, Roboto, sans-serif;

  --text-xs:      0.75rem;
  --text-sm:      0.875rem;
  --text-base:    1rem;
  --text-lg:      clamp(1.0625rem, 0.9rem + 0.6vw, 1.125rem);
  --text-xl:      clamp(1.25rem, 1rem + 1vw, 1.5rem);
  --text-2xl:     clamp(1.5rem, 1.1rem + 1.6vw, 2rem);
  --text-3xl:     clamp(2rem, 1.4rem + 2.6vw, 3rem);
  --text-display: clamp(2.5rem, 1.6rem + 4vw, 4.5rem);

  --leading-tight:   1.1;
  --leading-snug:    1.25;
  --leading-normal:  1.5;
  --leading-relaxed: 1.65;
  --tracking-tight:  -0.02em;
  --tracking-normal: 0em;
  --weight-regular:  400;
  --weight-medium:   500;
  --weight-semibold: 600;

  /* ---- Spacing (4px base) ---- */
  --space-0: 0; --space-1: 0.25rem; --space-2: 0.5rem; --space-3: 0.75rem;
  --space-4: 1rem; --space-5: 1.25rem; --space-6: 1.5rem; --space-8: 2rem;
  --space-10: 2.5rem; --space-12: 3rem; --space-16: 4rem; --space-20: 5rem; --space-24: 6rem;
  --container-max:    80rem;                       /* 1280px */
  --container-gutter: clamp(1rem, 4vw, 2rem);
  --section-y:        clamp(3rem, 8vw, 6rem);      /* vertical section rhythm */

  /* ---- Radii ---- */
  --radius-none: 0; --radius-sm: 0.25rem; --radius-md: 0.5rem; --radius-lg: 0.875rem; --radius-pill: 999px;

  /* ---- Elevation (soft, warm, restrained) ---- */
  --shadow-sm: 0 1px 2px rgba(43, 38, 34, 0.06);
  --shadow-md: 0 4px 16px rgba(43, 38, 34, 0.08);
  --shadow-lg: 0 12px 32px rgba(43, 38, 34, 0.10);

  /* ---- Motion (tokens only; the reduced-motion IMPLEMENTATION is Amarillo's) ---- */
  --duration-fast: 150ms; --duration-base: 250ms; --duration-slow: 400ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-entrance: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-exit:     cubic-bezier(0.4, 0, 1, 1);
  --hover-scale:   1.02; /* image hover scale, per blueprint */
}
```

- Tailwind mapping: expose these as theme values (e.g., `colors.marfil = "var(--marfil)"`, spacing/fontSize/radius/shadow families) so consumers get utilities **and** raw vars. Mechanism depends on Tailwind version; the mapping is required.
- Do **not** add component classes, resets beyond what the scaffold provides, or `@media`-driven visual behavior here.

### 7.2 `lib/contract.ts` — the frozen public typed contracts

Exports the **five required contracts**, matching the Amarillo seam exactly. Excludes **every** never-exposed field. This file is **shared and frozen**; downstream terminals import, never redefine, these types.

```ts
// lib/contract.ts
// FROZEN PUBLIC CONTRACT — Hilitos.co redesign. Consumed verbatim by Amarillo & Verde.
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
   * change is a BREAKING modification of the shared seam. See §17 OQ#7.
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
```

> **Frozen `ProductCard` prop interface.** Amarillo's precondition #7 requires a frozen `ProductCard` prop type. It lives in **`lib/components.ts`** (definitive location, S-6) and is imported as **`import type { ProductCardProps } from "@/lib/components";`** — configure the `@/*` alias in `tsconfig.json`. Amarillo must **not** define a local alternative. It is a **type only** — do **not** implement the component:
> ```ts
> // lib/components.ts
> import type { ProductContract } from "./contract";
> /** Frozen prop interface for the Amarillo-implemented ProductCard. Type only — no implementation here. */
> export interface ProductCardProps {
>   product: ProductContract;
>   /** Optional link target; Amarillo links to the PLANNED /productos/[slug] route. */
>   href?: string;
>   /** Optional visual density/variant hook (presentational). */
>   priority?: boolean; // for above-the-fold next/image on featured rails
> }
> ```

### 7.3 `catalog.fixture.json` + `lib/fixture.ts` (typed consumption) + `lib/fixture.schema.ts` (authoritative Zod validator)

The fixture is the **only** source of product content downstream and must exercise every fallback. It **must include** at least these seven product shapes (collectively covering all three availability states, `featured`, empty-images, and null-price), plus categories/collections with **referential integrity** (every `category`/`collection` slug used by a product appears in the respective array):

| # | Required shape | Encoded by (ref) | Key fields |
| --- | --- | --- | --- |
| 1 | **Normal product** | `2257` | image present, `price` set, 1 color, 1 size, `available` |
| 2 | **No-image product** | `2301` | `images: []`, `made_to_order` |
| 3 | **No-price product** | `2288` | `price: null`, `priceLabel: null` → "Precio a consultar" |
| 4 | **Featured product** | `2260` | `featured: true`, `available` |
| 5 | **Unavailable product** | `2199` | `availability: "unavailable"` |
| 6 | **Multiple-color product** | `2312` | `colors.length >= 2` |
| 7 | **Multiple-size product** | `2334` | `sizes.length >= 2`, `made_to_order` |

Availability coverage across the set: `available` (2257,2288,2260,2312), `made_to_order` (2301,2334), `unavailable` (2199) — all three present. **Featured coverage (S-1): at least three** — `2260`, `2312`, `2334` carry `featured: true` so a featured rail/grid renders with multiple cards. **priceLabel coverage (S-2):** `2257` carries a non-null `priceLabel` (`"Desde $48.000"` — a clearly-fictitious fixture value, **not** real commercial copy) so PriceTag's "prefer `priceLabel` over numeric `price`" branch is exercised. Image LQIP coverage: at least **one** image carries a valid base64 `placeholder` (`2288`, exercise the blur path); at least one omits it (exercise the solid `--crudo` box path).

> **S-5 — fixture is server-side only.** `lib/fixture.ts` (and `lib/fixture.schema.ts`) are consumed **server-side**. Do **not** import them directly into Client Components; the full fixture must **not** be shipped in the browser bundle. Amarillo/Verde pass already-selected, minimal props into client components.

**Image assets:** "has-image" cases point to a **small set (1–2) of neutral, brand-tone placeholder assets committed under `public/fixtures/products/`** — clearly labeled as fixture stand-ins, **NOT** real customer product photos, **NOT** copied from `Catalogo_Hilitos/`. Multiple products may reuse the same placeholder. This lets the UI render in preview with **no** external bucket and **no** real endpoint. (For a real base64 LQIP on product 3, generate a minimal valid data URI at build-authoring time; do not paste a fabricated/invalid string.)

Fixture skeleton (fill the two placeholder LQIP/asset spots per the notes; keep integer COP prices; keep slugs consistent):

```json
{
  "schema_version": 1,
  "products": [
    { "ref": "2257", "slug": "body-basico-crudo", "name": "Body básico en algodón crudo",
      "description": null, "availability": "available", "price": 48000, "priceLabel": "Desde $48.000",
      "images": [{ "url": "/fixtures/products/placeholder-a.jpg", "alt": "Body básico en algodón crudo", "placeholder": null }],
      "colors": [{ "name": "Crudo", "hex": "#E7DCC8" }], "sizes": ["0-3m"],
      "category": "bodies", "collection": "esenciales", "featured": false, "sale": false },

    { "ref": "2301", "slug": "gorro-tejido-a-mano", "name": "Gorro tejido a mano",
      "description": null, "availability": "made_to_order", "price": 32000, "priceLabel": null,
      "images": [],
      "colors": [{ "name": "Barro", "hex": "#B07C57" }], "sizes": ["única"],
      "category": "accesorios", "collection": "hechos-a-mano", "featured": false, "sale": false },

    { "ref": "2288", "slug": "manta-edicion-taller", "name": "Manta de edición del taller",
      "description": null, "availability": "available", "price": null, "priceLabel": null,
      "images": [{ "url": "/fixtures/products/placeholder-b.jpg", "alt": "Manta de edición del taller", "placeholder": "data:image/…(minimal valid LQIP)" }],
      "colors": [{ "name": "Marfil", "hex": "#F5EFE2" }], "sizes": ["única"],
      "category": "mantas", "collection": "esenciales", "featured": false, "sale": false },

    { "ref": "2260", "slug": "conjunto-editorial-sage", "name": "Conjunto editorial en sage",
      "description": null, "availability": "available", "price": 89000, "priceLabel": null,
      "images": [{ "url": "/fixtures/products/placeholder-a.jpg", "alt": "Conjunto editorial en sage", "placeholder": null }],
      "colors": [{ "name": "Sage", "hex": "#A7B39A" }], "sizes": ["0-3m", "3-6m"],
      "category": "conjuntos", "collection": "editorial", "featured": true, "sale": false },

    { "ref": "2199", "slug": "saco-en-lana", "name": "Saco en lana",
      "description": null, "availability": "unavailable", "price": 76000, "priceLabel": null,
      "images": [{ "url": "/fixtures/products/placeholder-b.jpg", "alt": "Saco en lana", "placeholder": null }],
      "colors": [{ "name": "Tinta", "hex": "#2B2622" }], "sizes": ["6-12m"],
      "category": "abrigo", "collection": "temporada", "featured": false, "sale": false },

    { "ref": "2312", "slug": "body-linea-de-color", "name": "Body línea de color",
      "description": null, "availability": "available", "price": 52000, "priceLabel": null,
      "images": [{ "url": "/fixtures/products/placeholder-a.jpg", "alt": "Body línea de color", "placeholder": null }],
      "colors": [{ "name": "Crudo", "hex": "#E7DCC8" }, { "name": "Barro", "hex": "#B07C57" }, { "name": "Sage", "hex": "#A7B39A" }],
      "sizes": ["0-3m"], "category": "bodies", "collection": "esenciales", "featured": true, "sale": false },

    { "ref": "2334", "slug": "pijama-en-algodon", "name": "Pijama en algodón",
      "description": null, "availability": "made_to_order", "price": 61000, "priceLabel": null,
      "images": [{ "url": "/fixtures/products/placeholder-b.jpg", "alt": "Pijama en algodón", "placeholder": null }],
      "colors": [{ "name": "Marfil", "hex": "#F5EFE2" }], "sizes": ["0-3m", "3-6m", "6-12m", "12-18m"],
      "category": "pijamas", "collection": "esenciales", "featured": true, "sale": false }
  ],
  "categories": [
    { "slug": "bodies", "name": null }, { "slug": "accesorios", "name": null },
    { "slug": "mantas", "name": null }, { "slug": "conjuntos", "name": null },
    { "slug": "abrigo", "name": null }, { "slug": "pijamas", "name": null }
  ],
  "collections": [
    { "slug": "esenciales", "title": null }, { "slug": "hechos-a-mano", "title": null },
    { "slug": "editorial", "title": null }, { "slug": "temporada", "title": null }
  ]
}
```

**Fixture validation — READ THIS CAREFULLY (RE-1).** `tsc --noEmit` does **NOT** structurally validate `catalog.fixture.json`. A JSON import **widens string literals** — `"available"` is typed `string`, not the `Availability` union, and `schema_version: 1` widens to `number` — so a bare `const f: CatalogFixture = raw` **fails typecheck on a perfectly valid fixture**, while a cast (`raw as CatalogFixture`) **suppresses all checking**. Either way `tsc` is not a real gate. **TypeScript here provides typed *consumption* only; the authoritative validation is a runtime fixture-lint.**

**Chosen option (primary — do this):** keep `catalog.fixture.json` (portable for Verde's future BFF) and add an **authoritative runtime validator built with Zod** that mirrors `lib/contract.ts`. Run it in the `fixture-lint` step (§10). (Do **not** treat the alternative below as equal — it is a fallback only if, later, JSON portability is explicitly dropped: author `catalog.fixture.ts` exporting `... satisfies CatalogFixture`, which preserves literal inference and gives genuine compile-time validation. For this mission, the JSON + Zod path is the decision.)

`lib/fixture.ts` — typed **consumption** loader. It must carry the caveat comment verbatim so no future implementer re-introduces a false `tsc` gate:

```ts
// lib/fixture.ts
import raw from "../catalog.fixture.json";
import type { CatalogFixture, ProductContract, CategoryContract, CollectionContract } from "./contract";

// ⚠️ VALIDATION CAVEAT (do NOT "fix" this into a tsc gate):
//   A JSON import widens literals ("available" -> string, 1 -> number), so
//   `const f: CatalogFixture = raw` FAILS typecheck even for a VALID fixture,
//   and `raw as CatalogFixture` SUPPRESSES all checking. tsc therefore does NOT
//   validate this fixture — it only gives typed CONSUMPTION below.
//   The AUTHORITATIVE conformance gate is the runtime fixture-lint (Zod) in lib/fixture.schema.ts (§10).
const fixture = raw as CatalogFixture;

export const products: ProductContract[] = fixture.products;
export const categories: CategoryContract[] = fixture.categories;
export const collections: CollectionContract[] = fixture.collections;
```

`lib/fixture.schema.ts` — the **authoritative** runtime validator (Zod), mirroring `lib/contract.ts`. It is executed by the `fixture-lint` script and must additionally assert: (a) all seven required shapes present; (b) all three availability states present; (c) ≥1 image with a base64 `placeholder` and ≥1 without; (d) **no never-exposed key** (`company_id|stock|agent_sales_copy|ai_visibility|last_verified_at|verified_by|deleted_at|deleted`) anywhere in the JSON; (e) **referential integrity** — every product `category`/`collection` slug exists in the respective array. On any violation it exits non-zero (fails CI). Sketch:

```ts
// lib/fixture.schema.ts (authoritative runtime validator — run by `pnpm fixture-lint`)
import { z } from "zod";
import raw from "../catalog.fixture.json";

const Availability = z.enum(["available", "made_to_order", "unavailable"]);
const Image = z.object({ url: z.string(), alt: z.string().nullish(),
  placeholder: z.string().nullish(), width: z.number().optional(), height: z.number().optional() }).strict();
const Color = z.object({ name: z.string(), hex: z.string().nullish() }).strict();
const Product = z.object({
  ref: z.string(), slug: z.string(), name: z.string(), description: z.string().nullish(),
  availability: Availability, price: z.number().nullable(), priceLabel: z.string().nullish(),
  images: z.array(Image), colors: z.array(Color), sizes: z.array(z.string()),
  category: z.string().nullable(), collection: z.string().nullable(),
  featured: z.boolean().optional(), sale: z.boolean().optional(),
}).strict(); // .strict() => any never-exposed/extra key FAILS
const Category = z.object({ slug: z.string(), name: z.string().nullish(),
  description: z.string().nullish(), image: Image.nullish() }).strict();
const Collection = z.object({ slug: z.string(), title: z.string().nullish(),
  description: z.string().nullish(), image: Image.nullish() }).strict();
const Fixture = z.object({ schema_version: z.literal(1),
  products: z.array(Product), categories: z.array(Category), collections: z.array(Collection) }).strict();

const f = Fixture.parse(raw); // throws on any contract violation
// extra assertions (fail non-zero): 7 shapes, 3 availability states, LQIP present+absent,
// referential integrity of category/collection slugs. (Implement as plain checks.)
```

> `tsconfig.json` must enable `resolveJsonModule` (and `esModuleInterop`) for the typed-consumption import. **The `.strict()` Zod schema — not `tsc` — is what rejects missing fields, wrong types, never-exposed keys, and extra keys.** Add `zod` as a dependency. Do not describe `tsc` as a fixture gate anywhere.

### 7.4 Route skeleton (six routes — placeholders only)

Create minimal, clearly-marked **inert** pages so routing resolves and the build is green. Each file carries a header comment naming its future owner and asserting it is a skeleton. **No real content, no data fetching, no components beyond a bare placeholder.**

| Route | File (App Router) | Skeleton owner note | Future implementer |
| --- | --- | --- | --- |
| `/` | `app/page.tsx` | `// ROUTE SKELETON — homepage — replace in HILITOS-P1A-AMARILLO` | Amarillo |
| `/catalogo` | `app/catalogo/page.tsx` | `// ROUTE SKELETON — catalog — replace in Verde catalog mission` | Verde |
| `/productos/[slug]` | `app/productos/[slug]/page.tsx` | `// ROUTE SKELETON — product detail — replace in Verde catalog mission` | Verde |
| `/colecciones/[slug]` | `app/colecciones/[slug]/page.tsx` | `// ROUTE SKELETON — collection — replace in Verde catalog mission` | Verde |
| `/nosotros` | `app/nosotros/page.tsx` | `// ROUTE SKELETON — heritage — replace in HILITOS-P1A-AMARILLO` | Amarillo |
| `/privacy` | `app/privacy/page.tsx` | `// ROUTE SKELETON — privacy — content pending Mónica/legal` | Shared (Amarillo-implemented) |

- Each skeleton renders a single visible marker (e.g. `<main><p>⟨ROUTE SKELETON — {route}⟩</p></main>`), no business copy.
- `app/productos/[slug]` and `app/colecciones/[slug]` skeletons must type-check the `params` shape but perform **no** lookup.
- Do **not** decide route-group structure (`app/(marketing)/…`) unilaterally beyond what the scaffold needs; if a marketing route group is introduced, document it in `docs/OWNERSHIP.md` so Amarillo's §8 paths are literal.

### 7.5 App shell skeleton — `app/layout.tsx`

Root layout is **shared/foundation-owned**. It must:

- Set `<html lang="es-CO">`, render `{children}`.
- Import `styles/tokens.css` (and the global stylesheet/Tailwind layer).
- Wire the two approved fonts via `next/font` (self-hosted **Fraunces** display + **Hanken Grotesk** body) **if** WOFF2 + licenses are available; otherwise wire a documented placeholder (`next/font/google` or a TODO) and record it as an open item. Two families max; no script fonts.
- Include a **documented shell-composition seam** where Amarillo's shared Header/Footer will later be composed — do **not** implement a real header/footer:
  ```tsx
  // app/layout.tsx (skeleton)
  // SHELL COMPOSITION SEAM:
  // Amarillo's shared <Header/> and <Footer/> are composed HERE post-HILITOS-P1A-AMARILLO,
  // per the Violeta seam decision (resolves Amarillo Open Question #5). Do not implement them now.
  return (
    <html lang="es-CO">
      <body>
        {/* <Header/> — Amarillo, later */}
        {children}
        {/* <Footer/> — Amarillo, later */}
      </body>
    </html>
  );
  ```
- This directly **resolves Amarillo Open Question #5** (shell composed in root layout) — record that in the handoff.

### 7.6 Metadata skeleton

Neutral, non-fabricating root metadata (Next.js `metadata` export in `app/layout.tsx`):

- `metadataBase` (the eventual production origin — use a documented placeholder/env until A6; do **not** attach the real custom domain to any deployment).
- `title` with a template, e.g. `{ default: "Hilitos", template: "%s · Hilitos" }`.
- A **neutral** `description` (no unverified claims — no "más de 40 años", no counts). Mark any copy field pending Mónica.
- Basic `openGraph` (siteName, locale `es_CO`, type `website`) with neutral defaults.
- **No** invented business facts, testimonials, or claims anywhere.

### 7.7 robots / sitemap skeleton

- `app/robots.ts` — **FAIL-CLOSED (S-3).** Until an authorized Gate A6 cutover, the skeleton must **`Disallow: /`** (block all crawling) for every preview and any future Vercel deployment, so the redesign can **never** be accidentally indexed while the live production site (GH Pages/`master`) is the canonical, indexed site. Do **not** open crawling in Foundation. Document clearly, in code and in `docs/OWNERSHIP.md`, that **opening crawling is a Verde/Cutover (A6) action**: at cutover, the owner flips robots to allow indexing (e.g. gated on a production env flag) as part of the A6 checklist — never before.
- `app/sitemap.ts` — list only the **static** routes (`/`, `/catalogo`, `/nosotros`, `/privacy`, and any static collection index) with a **documented extension point** where Verde adds dynamic `/productos/[slug]` and `/colecciones/[slug]` entries.
- **Ownership nuance (record in §8 / handoff):** the foundation *creates* these files as skeletons; **ongoing ownership transfers to Verde** (Amarillo pack §8 lists them as Verde-owned). Mark them so Verde does not experience a seam fight.

### 7.8 Vercel preview strategy (documented; NOT activated)

Deliver a written strategy (in `docs/OWNERSHIP.md` or a `docs/PREVIEW_STRATEGY.md`) and, at most, **safe in-repo config** (`vercel.json` framework preset) that does **not** connect or deploy anything:

- **Production branch (on Vercel, once authorized) = `redesign/main` ONLY.** Never `master`. Never the real custom domain until Gate A6.
- Per-PR **preview deployments** for `redesign/*` branches; every preview is **non-indexable** — the `robots.ts` skeleton is **fail-closed (`Disallow: /`) until A6** (§7.7, S-3), so no preview can leak into search while GH Pages is canonical.
- The **real custom domain / CNAME stays on GitHub Pages + `master`** until an explicit Juanpa+Mónica cutover (A6). No domain attachment to Vercel in this mission.
- **Authorization is Juanpa's.** This mission must **not** create/link a Vercel project, set env vars, or deploy. If previews are later authorized, downstream terminals attach evidence; otherwise they use local screenshots. Record this as an open item.

### 7.9 Folder-ownership map (`docs/OWNERSHIP.md`) — MANDATORY deliverable

`docs/OWNERSHIP.md` is a **required** deliverable (not "or equivalent"). Author the authoritative map from §8, including the legacy-file decision (§6.3), the shell seam (§7.5), the robots/sitemap ownership transfer (§7.7), and the preview strategy (§7.8). It must contain the following two explicit sections:

**(a) "Branch & Worktree Conventions" (RE-4 — satisfies Amarillo precondition #10).** Must state:
- Integration branch: **`redesign/main`**.
- Working branches: **`redesign/<terminal>/<slice>`** (e.g. `redesign/violeta/f0-foundation`, `redesign/amarillo/p1a-visual-shell-homepage`).
- **Isolated worktrees** — never share a checkout across terminals.
- **No direct commits to `master`.**
- **No direct commits to `redesign/main`** (integrate only via PR).
- **PRs target `redesign/main`.**
- **No force-push.**
- Ownership rules and shared seams (the §8 map).

**(b) Consumption seams (S-6, S-7).**
- **`ProductCardProps` import path is fixed:** consumers import `import type { ProductCardProps } from "@/lib/components";` (configure the `@/*` path alias in `tsconfig.json`). Amarillo must **not** define a local alternative prop type.
- **Verde adapter output type is fixed:** any future Verde data layer under `lib/catalog/**` **must return `ProductContract[]`** (or the frozen `CatalogFixture` envelope) from `lib/contract.ts`. Verde must **not** define an alternative product type.

### 7.10 `next.config.*` constraints (RE-2 — fixed)

The `next.config.*` deliverable **MUST NOT** enable static export:

```js
// next.config.* — FORBIDDEN:
//   output: "export"   ❌  (breaks dynamic routes + ISR; reduces Next.js to a static GH-Pages clone)
// Target runtime is Vercel SSR/SSG/ISR. Leave `output` unset (default) — do NOT set "export".
```

`images.remotePatterns` carries a **clearly-marked placeholder** for the durable bucket domain (unknown until §17 OQ#1); the fixture renders from local `public/fixtures/**` so the build needs no real remote domain.

> **Amarillo precondition #8 is SATISFIED by this (RE-4).** "Approved image-domain configuration" is met via: (1) a documented `next.config.*` with a clearly-marked placeholder `remotePatterns` entry + TODO; (2) fixture images served from local `public/fixtures/**`; (3) **zero dependency on the real bucket during Amarillo's fixture-only build.** The real bucket domain remains a later **ship-gate** (§17 OQ#1), not an Amarillo blocker. **Amarillo must treat #8 as satisfied and must NOT re-STOP at Gate A1 over a placeholder image domain.**

---

## 8 · Ownership Map (authoritative)

The foundation *creates* the shared files and *defines* these boundaries. Downstream terminals edit only their own paths; shared paths require the owning terminal's approval.

```
hilitos-website/  (branch: redesign/main)
├── app/
│   ├── layout.tsx ..................... SHARED (Violeta/foundation) — shell seam, fonts, metadata
│   ├── page.tsx  (/) ................... skeleton by Violeta → OWNED by AMARILLO
│   ├── nosotros/page.tsx ............... skeleton by Violeta → OWNED by AMARILLO
│   ├── privacy/page.tsx ................ skeleton by Violeta → OWNED by AMARILLO (content: Mónica/legal)
│   ├── catalogo/page.tsx ............... skeleton by Violeta → OWNED by VERDE
│   ├── productos/[slug]/page.tsx ....... skeleton by Violeta → OWNED by VERDE
│   ├── colecciones/[slug]/page.tsx ..... skeleton by Violeta → OWNED by VERDE
│   ├── robots.ts ....................... skeleton by Violeta → OWNED by VERDE (dynamic gen)
│   └── sitemap.ts ...................... skeleton by Violeta → OWNED by VERDE (dynamic gen)
├── components/ ........................ (created later)
│   ├── layout/** ....................... AMARILLO (Header, MobileNav, Footer, WhatsAppCTA)
│   ├── ui/** ........................... AMARILLO (Button, PriceTag, AvailabilityBadge, …)
│   ├── editorial/** .................... AMARILLO (EditorialHeading, ThreadMotif)
│   └── product/ProductCard.tsx ......... AMARILLO (visual impl) — prop INTERFACE is SHARED (frozen here)
├── lib/
│   ├── contract.ts ..................... SHARED (Violeta/foundation) — FROZEN
│   ├── components.ts ................... SHARED (Violeta/foundation) — ProductCardProps (frozen, type only); import via @/lib/components (S-6)
│   ├── fixture.ts ...................... SHARED (Violeta/foundation) — typed CONSUMPTION only (server-side)
│   ├── fixture.schema.ts .............. SHARED (Violeta/foundation) — AUTHORITATIVE Zod fixture validator (RE-1)
│   ├── catalog/** ...................... VERDE (fetch/adapter/BFF — created later) — MUST return ProductContract[] (S-7)
│   └── whatsapp.ts ..................... VERDE (wa.me builder — created later)
├── styles/
│   ├── tokens.css ...................... SHARED (Violeta/foundation) — FROZEN names, tunable values
│   └── globals.css (or @theme layer) ... SHARED (Violeta/foundation)
├── catalog.fixture.json ............... SHARED (Violeta/foundation) — FROZEN shape
├── public/
│   ├── fixtures/products/** ............ SHARED (Violeta) — neutral fixture stand-ins (NOT real photos)
│   └── (brand/editorial assets) ....... AMARILLO (logo, hero art — added later)
├── next.config.* ...................... SHARED (Violeta/foundation) — image domains
├── tailwind.config.* (if v3) .......... SHARED (Violeta/foundation)
├── tsconfig.json ...................... SHARED (Violeta/foundation)
├── package.json / lockfile ............ SHARED (Violeta/foundation)
├── vercel.json (optional, inert) ...... SHARED (Violeta/foundation)
└── docs/OWNERSHIP.md .................. SHARED (Violeta/foundation)

master branch ......................... PRODUCTION (GitHub Pages) — NEVER TOUCHED by this mission
```

**Explicitly shared (require the owning terminal's approval to edit):** `app/layout.tsx`, `styles/tokens.css`, `styles/globals.css`, `lib/contract.ts`, `lib/components.ts` (ProductCard prop interface), `lib/fixture.ts`, `lib/fixture.schema.ts`, `catalog.fixture.json`, root metadata, `next.config.*`, `tailwind.config.*`, `tsconfig.json`, catalog route files (Verde), `app/robots.ts` / `app/sitemap.ts` (Verde).

---

## 9 · Stop Conditions

Violeta must **stop and report** (no workaround via unauthorized scope expansion) if:

- **Repository differs materially from discovery** — `master` HEAD moved unexpectedly with conflicting foundation content, `redesign/main` already exists with unexpected content, or push access is missing.
- **Architecture conflicts with the Violeta blueprint** — a materialized blueprint (or Juanpa) specifies a *structurally different* contract, token set, route model, or framework than this pack froze (a mere *value* difference is not a stop — adopt it; §4/§6.5).
- **Ownership cannot be established** — a required file's owner is genuinely ambiguous and cannot be assigned without a decision.
- **Framework migration creates production risk** — any step would (or might) alter what GitHub Pages serves from `master`, change the `CNAME`/DNS, attach the custom domain to a new deployment, or otherwise touch production.
- **GitHub Pages could deploy from a non-`master` branch (RE-3)** — the Pages deployment discovery (§6.1) finds that Pages is (or could be) built by a GitHub Actions workflow that triggers on push to all branches, to `redesign/main`, or to `redesign/**`. **STOP**: do not create the branch, do not push, do not modify or "fix" the workflow inside this mission — report it.
- **`output: "export"` would be required or was introduced (RE-2)** — any situation where the scaffold or a step forces static export. Do not ship it; the target is Vercel SSR/SSG/ISR.
- **Required contracts are ambiguous** — a frozen field's type/semantics cannot be resolved from this pack + the Amarillo pack without invention.
- The mission would require editing **`master`**, `data/products.js` as served, `api.hilitos.com`, Supabase, the backend, or any secret.
- The mission would require **connecting/deploying Vercel** or changing GitHub Pages configuration.
- A required foundation step would force **out-of-scope implementation** (§5.2) to proceed.
- The fixture cannot be made to satisfy the contract without inventing a **never-exposed field** or a fabricated business fact.

When stopping, report what was reached, the exact blocker, and the minimal decision/input needed to unblock.

---

## 10 · Validation Plan

**First author `package.json` scripts, then run them** (this mission *creates* the scripts, so define them explicitly — do not invent commands that don't exist). Required scripts and checks:

- `build` — the framework production build (e.g. `next build`) — **must pass**.
- `lint` — the project lint (e.g. `next lint` / eslint) — **must pass**.
- `typecheck` — `tsc --noEmit` — **must pass**. **NOTE (RE-1):** `typecheck` validates typed *consumption* only; it does **NOT** structurally validate `catalog.fixture.json` (JSON literal-widening + cast — see §7.3). Do not treat it as a fixture gate.
- **Fixture-lint — the AUTHORITATIVE fixture-conformance gate** — a runtime **Zod** validator (`lib/fixture.schema.ts`, §7.3) that parses `catalog.fixture.json` and exits non-zero on any violation, asserting: (a) all seven required shapes present; (b) all three availability states present; (c) at least one image with a base64 `placeholder` and at least one without; (d) **no never-exposed key** anywhere in the JSON (`.strict()` schemas); (e) **referential integrity** — every product `category`/`collection` slug exists in the respective array; (f) **at least three `featured: true`** products; (g) **at least one product with a non-null `priceLabel`**. Wire it as a `package.json` script (e.g. `"fixture-lint": "tsx lib/fixture.schema.ts"`).
- `dev` — smoke that the dev server boots and all six routes resolve (skeleton markers render), no console errors.
- **No static export (RE-2)** — grep/confirm `next.config.*` does **not** set `output: "export"` and no `next export` script exists. The dynamic routes (`/productos/[slug]`, `/colecciones/[slug]`) build without `generateStaticParams`, proving SSR/ISR mode.
- **Ownership map documented** — `docs/OWNERSHIP.md` present and complete, including the **"Branch & Worktree Conventions"** section (RE-4).
- **Contracts documented** — `lib/contract.ts` compiles, exports all five contracts + envelope, contains the never-exposed guard comment.
- **Git hygiene** — `git status` clean except intended files; changed-file inventory (`git diff --name-only redesign/main...HEAD`); **no-secret scan** of changed files; confirm **`master` untouched** and no Vercel/GitHub-Pages/DNS action taken.

**Report the exact commands run and their results** in the handoff. Do not claim a check passed that was not run.

---

## 11 · Review Gates

| Gate | Name | Who | Condition |
| --- | --- | --- | --- |
| **F0-G0** | Mission Pack review | Opus, then Juanpa | Opus reviews this pack (§13); **Juanpa gives explicit GO**. Only then may Violeta run. |
| **F0-G1** | Base-state verified | Violeta | Discovery re-confirmed (§6.1); `redesign/main` created from `master`; isolated worktree; base SHAs recorded; `master`/Pages untouched. |
| **F0-G2** | Foundation self-QA | Violeta | `build`/`lint`/`typecheck`/fixture-lint/dev-route smoke all pass; ownership map + contracts documented; no-secret scan clean. |
| **F0-G3** | Independent foundation review | Azul (or Opus) | Seam matches the Amarillo pack exactly; contracts/tokens/fixture/routes correct; no production risk; no out-of-scope implementation. **Mission ends here.** PR merges to `redesign/main`, unblocking Amarillo/Verde. |
| — | *(downstream)* | Amarillo/Verde/Azul | A-gates belong to their own missions; **not authorized by this pack.** |

**The F0 mission ends at Gate F0-G3.** It does not authorize any Amarillo/Verde/Azul build, preview integration, Mónica approval, or production/DNS cutover.

---

## 12 · Definition of Done

The foundation is **done** when **all** hold:

- **F0-G1 recorded** — `redesign/main` created from `master`; base SHAs captured; isolated worktree; `master`/GitHub Pages/DNS/CNAME/backend untouched.
- **Framework foundation** builds: Next.js App Router + TypeScript (strict) + Tailwind (tokens mapped); `dev` boots; all six routes resolve to skeleton markers with **no** console errors.
- **`styles/tokens.css`** present with **all** required token groups and the eight frozen color names; no component styling; Tailwind mapping in place; `--whatsapp` reserved semantics documented.
- **`lib/contract.ts`** exports `ProductContract`, `CollectionContract`, `CategoryContract`, `Availability`(Contract), `ImageContract`, the fixture envelope, and the never-exposed guard comment — matching the Amarillo seam exactly. `ProductCardProps` frozen as a **type only** (no component).
- **`catalog.fixture.json`** covers the seven required shapes + all three availability states + LQIP-present and LQIP-absent images + ≥3 `featured` + ≥1 non-null `priceLabel`, with referential integrity; **`lib/fixture.ts`** provides typed consumption only; the **authoritative Zod fixture-lint (`lib/fixture.schema.ts`) passes** and confirms no never-exposed key.
- **Route / shell / metadata / robots / sitemap skeletons** present, inert, and clearly marked; shell-composition seam documented (resolves Amarillo OQ#5); **`robots.ts` is fail-closed (`Disallow: /`) until A6 (S-3)**; robots/sitemap ownership transfer to Verde documented.
- **Vercel preview strategy documented**; no project connected, no deployment, no domain attachment.
- **`docs/OWNERSHIP.md`** authoritative and complete (Violeta/Amarillo/Verde/Shared; legacy-file decision; seams).
- **Validation green** (§10): build, lint, typecheck, fixture-lint, dev-route smoke — all pass or are honestly reported; changed-file inventory produced; no-secret scan clean; **no out-of-scope implementation** shipped.
- **PR opened into `redesign/main`** with changed-file list and validation evidence; **F0-G3 independent review** confirms the seam.
- **Mission stops at F0-G3** — no Amarillo/Verde/Azul build attempted.

---

## 13 · Reviewer Checklist for Opus (Gate F0-G0 — reviewing THIS pack, before dispatch)

**Fidelity to the frozen seam (vs the Amarillo pack)**
- [ ] `ProductContract`/`ImageContract`/`ColorContract`/`Category`/`Collection` match the Amarillo seam (required fields; `availability` 3-state; `price: null` → "Precio a consultar"; flat variants; `{name,hex}` colors; 4:5).
- [ ] **Every** never-exposed field is excluded and named in the guard comment.
- [ ] The eight color tokens + fonts (Fraunces/Hanken Grotesk) match; token **names** frozen, **values** correctly framed as tunable.
- [ ] The fixture's seven shapes + 3-state coverage + LQIP-present/absent + referential integrity are all specified.

**Production isolation**
- [ ] Nothing touches `master`, `data/products.js` as served, GitHub Pages source, `CNAME`, DNS, `api.hilitos.com`, Supabase, or the backend.
- [ ] `redesign/main` is created **from `master`** and never merged back without A6; the legacy-file decision affects only `redesign/main`.
- [ ] No Vercel connect/deploy/domain-attach; `robots.ts` fail-closed (`Disallow: /`) until A6 (S-3).

**Scope**
- [ ] In-scope (§5.1) and out-of-scope (§5.2) are complete and consistent; no homepage/catalog/search/WhatsApp/backend implementation leaks in.
- [ ] Route/shell/metadata/robots/sitemap are **skeletons**, not implementations.

**Executability**
- [ ] `package.json` scripts are authored by the mission (not assumed); the **runtime Zod fixture-lint** (not `tsc`) is the authoritative fixture-conformance gate, and the `lib/fixture.ts` caveat comment forbids re-introducing a false `tsc` gate.
- [ ] Ownership map (§8) unambiguously assigns every shared file; shell seam resolves Amarillo OQ#5; robots/sitemap ownership transfer to Verde is explicit.
- [ ] Stop conditions (§9) cover repo-drift, blueprint conflict, ownership ambiguity, production/migration risk, contract ambiguity.
- [ ] Recommended model is **Sonnet 5**; Fable 5 only if Juanpa selects it.

Any unchecked box is a pack edit, not an implementation start.

---

## 14 · Exact Dispatch Prompt (to run **after** Gate F0-G0 GO)

> Do **not** run this now. Hand it to the Violeta implementer (Sonnet 5) **only after** Opus review and an explicit Juanpa GO.

```text
========================================================================
GO GATE — READ FIRST. THIS PROMPT IS A TEMPLATE, NOT AN AUTHORIZATION.
------------------------------------------------------------------------
- Run this ONLY if the dispatch carries a literal authorization:
  "JUANPA GO: HILITOS-F0-FOUNDATION".
- If that literal GO is absent, you are NOT authorized: create NO branch,
  NO worktree, NO files, NO commits; take NO other action; reply exactly:
  "Blocked: awaiting explicit JUANPA GO: HILITOS-F0-FOUNDATION (Gate F0-G0)."
- The mere presence of this prompt is never, by itself, a GO.

ACCESS PRECONDITION — before acting you must be able to READ:
  (1) this full Mission Pack (HILITOS-F0-FOUNDATION);
  (2) the Amarillo pack (HILITOS-P1A-AMARILLO) — the operative transcription
      of the Violeta blueprint whose seam you must match.
  If either is inaccessible, STOP and report — do not proceed from memory.
========================================================================

You are the Violeta terminal (Creative Director & Architecture Owner) for the
Hilitos.co redesign — a senior Next.js (App Router) + TypeScript architect.
Execute mission HILITOS-F0-FOUNDATION: "Foundation Architecture and Shared
Contracts". You are building the FOUNDATION ONLY. You are NOT building the
website. Freeze interfaces; implement no experiences.

AUTHORITY & SOURCES
- Follow this Mission Pack exactly; it is your contract.
- Match the frozen seam in the Amarillo pack VERBATIM (contract fields, 3-state
  availability enum, "Precio a consultar" fallback, 4:5 imagery, flat variants,
  {name,hex} colors, the 8 color tokens, Fraunces + Hanken Grotesk, the
  never-exposed field list). Do NOT drift from it. Do NOT reopen fixed decisions.
- If a materialized blueprint surfaces with different VALUES, adopt them; if it
  is STRUCTURALLY different (contract/tokens/routes/framework) → STOP.

F0-G1 — BASE STATE (do this first; write no foundation code until it passes)
- Re-verify discovery: Jpperez09/hilitos-website has only `master` (record its
  current HEAD SHA; pack snapshot 8ab791da…); `redesign/main` does not exist;
  GitHub Pages serves `master`. If reality differs materially → STOP.
- PAGES DEPLOY DISCOVERY (RE-3, read-only, BEFORE any branch): inspect
  .github/workflows/** and Pages settings. Confirm Pages deploys via classic
  branch source OR an Actions workflow, and that NO workflow could deploy Pages
  from all branches, from redesign/main, or from redesign/**. If a push to
  redesign/main could trigger a Pages deploy → STOP (do not create the branch,
  do not push, do not touch the workflow). Record the mechanism + verdict.
- Create `redesign/main` FROM `master` (production-inert: Pages serves master).
  Create working branch `redesign/violeta/f0-foundation` from `redesign/main`
  in an ISOLATED worktree. Record both base SHAs.
- Choose + record the package manager; commit the matching lockfile.
- NEVER touch `master`, `data/products.js` as served, `CNAME`, DNS,
  api.hilitos.com, Supabase, or the backend. NEVER connect/deploy Vercel or
  change GitHub Pages settings.

BUILD THE FOUNDATION (contracts/skeletons/docs only — NO experiences)
1. Scaffold Next.js App Router + TypeScript (strict) + Tailwind (tokens mapped
   into the theme). Mobile-first, Server Components by default. Build must be green.
2. styles/tokens.css — ALL token groups from §7.1: the 8 frozen color names
   (values seeded/tunable; --whatsapp reserved), typography (Fraunces display +
   Hanken Grotesk body), spacing (4px base), radii, elevation, motion. NO
   component styling. Map tokens into Tailwind.
3. lib/contract.ts — the 5 frozen contracts + CatalogFixture envelope + the
   never-exposed guard comment, per §7.2. lib/components.ts — ProductCardProps
   as a TYPE ONLY (do NOT implement ProductCard).
4. catalog.fixture.json — the 7 required shapes (§7.3) covering all 3
   availability states, featured, empty-images, null-price; ≥1 image with a valid
   base64 LQIP and ≥1 without; referential integrity. Commit 1–2 NEUTRAL fixture
   stand-in images under public/fixtures/products/ (NOT real photos, NOT copied
   from Catalogo_Hilitos). lib/fixture.ts = typed CONSUMPTION only (carry the
   caveat comment: tsc does NOT validate the fixture — JSON widening + cast).
   The AUTHORITATIVE gate is a runtime Zod validator lib/fixture.schema.ts with
   .strict() schemas (rejects never-exposed/extra keys) + asserts 7 shapes, 3
   availability states, LQIP present+absent, referential integrity, >=3 featured,
   >=1 non-null priceLabel. Add `zod`; wire a `fixture-lint` script.
5. Route skeletons for /, /catalogo, /productos/[slug], /colecciones/[slug],
   /nosotros, /privacy — inert placeholders with owner-note comments (§7.4). NO
   real content, NO data fetching.
6. app/layout.tsx — html lang="es-CO", import tokens + fonts, render {children},
   and a DOCUMENTED shell-composition seam for Amarillo's Header/Footer (resolves
   Amarillo OQ#5). Do NOT implement header/footer. Neutral metadata skeleton (no
   fabricated claims).
7. app/robots.ts + app/sitemap.ts skeletons. robots.ts is FAIL-CLOSED (S-3):
   Disallow: / for all previews/future deploys until Gate A6 — never index the
   redesign while GH Pages is canonical. Opening crawling is an A6/Verde action.
   sitemap.ts lists static routes only + a documented Verde extension point for
   dynamic /productos and /colecciones. Mark ongoing ownership of both as Verde.
8. Document the Vercel preview strategy (production branch = redesign/main ONLY;
   robots fail-closed so previews are non-indexable until A6; custom domain stays
   on master/Pages until A6). Commit at most an inert vercel.json. Do NOT connect
   or deploy.
9. docs/OWNERSHIP.md — the authoritative Violeta/Amarillo/Verde/Shared map (§8),
   the legacy-file decision (§6.3), the shell seam, robots/sitemap transfer, and
   the preview strategy.

HARD GUARDRAILS
- OUT OF SCOPE (do NOT implement): homepage/catalog/product/collection pages
  beyond inert skeletons; search/filters/sorting; backend/Supabase/API routes/BFF/
  ISR/fallback; WhatsApp logic or numbers; analytics/payments/cart/accounts/CRM;
  importing real product photos.
- Do NOT edit master or anything GitHub Pages serves. Do NOT change DNS/CNAME.
  Do NOT connect/deploy Vercel. Do NOT print or require secrets.
- STOP and report on any §9 stop condition (repo drift, blueprint STRUCTURAL
  conflict, ownership ambiguity, production/migration risk, contract ambiguity,
  needing out-of-scope impl or a never-exposed field).

VALIDATE (author the scripts, then run them; report exact commands + results)
- build (next build), lint, typecheck (tsc --noEmit), fixture-lint, dev-route
  smoke (all 6 routes resolve, no console errors), git status, changed-file
  inventory (git diff --name-only redesign/main...HEAD), no-secret scan, and an
  explicit confirmation that master/Pages/DNS/backend/Vercel were untouched.

COMMIT / PR
- Isolated branch + worktree. NO commits to master. NO force push. NO deploy.
- Scoped commits (suggested: chore(hilitos): scaffold next app router foundation /
  feat(hilitos): freeze tokens + public contract + fixture / chore(hilitos): route
  + shell + metadata + robots/sitemap skeletons / docs(hilitos): ownership map +
  preview strategy).
- Open a PR INTO redesign/main with the changed-file list and validation evidence.
  NO merge without F0-G3 independent review.

FINISH
- Your mission ends at Gate F0-G3. Do NOT start Amarillo/Verde/Azul work.
- Return the full Handoff Report (§15): base SHAs, branch/worktree, commits,
  changed files, what was created, exact validation results, the seeded token
  values Violeta/Mónica should confirm, the GitHub Pages deploy-mechanism finding
  (RE-3), open items (fonts/licenses, image bucket domain, WhatsApp number,
  preview authorization, catalog endpoint owner, category cardinality RE-5), the
  legacy-file decision made, the confirmation that Amarillo preconditions #8 and
  #10 are now satisfied, and the isolation confirmation (no master/Pages/DNS/
  backend/Vercel/secret changes).
```

---

## 15 · Required Handoff Report

Violeta must return, in order:

1. Executive result.
2. Mission status: `COMPLETE` · `PARTIAL` · `BLOCKED`.
3. Branch(es) + worktree; **base SHA of `master`** and **base SHA of `redesign/main`**.
4. Final commit SHA / commit list.
5. Changed files (full list).
6. What was created (foundation, tokens, contracts, fixture, skeletons, docs).
7. What was intentionally **not** created (the entire website).
8. Validation commands + results (build/lint/typecheck/fixture-lint/dev-smoke).
9. **Seed values Violeta/Mónica should confirm** (every tunable token value).
10. **Legacy-file decision** made on `redesign/main` (§6.3).
11. **GitHub Pages deployment-mechanism finding (RE-3)** — classic branch source vs Actions; and the explicit verdict that pushing `redesign/main`/`redesign/**` cannot trigger a Pages deploy (or the STOP that was raised).
12. Open items: font hosting/licenses; durable **image-bucket domain** (for `next.config` remotePatterns); **WhatsApp number**; **catalog-endpoint owner + date**; **Vercel preview authorization**; **product↔category cardinality confirmation** (RE-5).
13. Known limitations & risks.
14. **Amarillo/Verde re-dispatch readiness** — confirm every Amarillo §5 precondition (items 1–8, 10) is now satisfied on `redesign/main`, so `HILITOS-P1A-AMARILLO` can be re-dispatched (its GO may need re-issuing). **Precondition #8** is satisfied via documented placeholder `next.config` `remotePatterns` + local `public/fixtures/**` assets (RE-4); **precondition #10** is satisfied by the "Branch & Worktree Conventions" section in `docs/OWNERSHIP.md` (RE-4). Amarillo must treat both as sufficient and **not** re-STOP at Gate A1 over them.
15. **Isolation confirmation:** no `master`/GitHub-Pages/DNS/CNAME/backend/Supabase/Vercel changes; no secrets exposed; `redesign/main` not merged to `master`.

---

## 16 · Rollback Plan

**Before merge into `redesign/main`:**
- Close the PR; delete `redesign/violeta/f0-foundation`; remove the worktree.
- Optionally delete the freshly-created `redesign/main` (it is an empty-diff-from-`master` branch until the PR merges) — leaving `master`/GitHub Pages/production untouched.

**After merge into `redesign/main`:**
- Revert the foundation commit(s) on `redesign/main`, or delete/recreate `redesign/main` from `master`.
- **Never** modify `master`, GitHub Pages, the `CNAME`, DNS, or production.

Because the mission is production-isolated, rollback never touches `master`, GitHub Pages, the custom domain, or `api.hilitos.com`.

---

## 17 · Open Questions

These do **not** block foundation creation (the seam is frozen here; values/config are tunable), but must be resolved before Phase 1 can **ship**:

1. **Durable image-bucket domain** — needed for `next.config` `images.remotePatterns`. Until known, the fixture uses local `public/fixtures/…` assets and `next.config` carries a documented placeholder + TODO. *(Owner: Juanpa / backend.)*
2. **Font hosting & licensing** — are Fraunces + Hanken Grotesk WOFF2 + licenses available to self-host? If not, use a documented interim setup. *(Owner: Violeta/Juanpa.)*
3. **Materialized blueprint** — locate or produce "Architecture & Creative Blueprint v1.0" to confirm the seeded token **values** (§4). Structural conflicts are a stop. *(Owner: Violeta.)*
4. **Vercel preview authorization** — is per-PR preview approved for this repo? This mission does not connect/deploy. *(Owner: Juanpa.)*
5. **Catalog endpoint owner + date** and **WhatsApp number** — the redesign's true blockers; not needed by F0 (fixture decouples it) but required to ship. *(Owner: Juanpa/Mónica.)*
6. **Mónica content** — availability labels (seeded `Disponible/Sobre pedido/Agotado`), category/collection display names, homepage/`nosotros` copy. All Mónica-owned; null/placeholder in the fixture until approved. *(Owner: Mónica.)*
7. **Product↔category cardinality (RE-5).** The contract freezes `category: string | null` (SINGULAR). Confirm the real catalog does not require multiple categories per product. **If it does, switch to `categories: string[]` before Amarillo/Verde consume the contract** — changing it afterward is a breaking seam change. *(Owner: Violeta / Juanpa.)*

---

## 18 · Final Status

**`REVIEWED — APPROVED_WITH_EDITS — EDITS APPLIED — NOT DISPATCHED — AWAITING JUANPA GO`**

> **Gate F0-G0 (Opus independent architecture review) is complete: `APPROVED_WITH_EDITS`, and RE-1…RE-5 + S-1…S-7 have been applied.** Implementation is **not** authorized. The pack now awaits only an **explicit Juanpa GO** (`JUANPA GO: HILITOS-F0-FOUNDATION`). The Violeta terminal may **not** create `redesign/main`, branch, worktree, or write a single line until that GO is given. Once authorized, the mission ends at **Gate F0-G3** (independent foundation review) and authorizes no Amarillo/Verde/Azul build, no preview integration, and no production/DNS cutover. Its sole purpose is to materialize the foundation that currently blocks `HILITOS-P1A-AMARILLO` at Gate A1.
