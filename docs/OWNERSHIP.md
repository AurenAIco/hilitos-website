# Hilitos.co Redesign — Ownership Map, Conventions & Preview Strategy

**Authoritative document.** Created by mission `HILITOS-F0-FOUNDATION` (Violeta terminal, 2026-07-15).
Every downstream terminal (Amarillo, Verde, Azul) edits **only** its own paths; **shared** paths
require the owning terminal's (Violeta's) approval. This document satisfies Amarillo precondition
**#10** (Branch & Worktree Conventions) per RE-4.

---

## 1 · Terminals

| Terminal | Role |
| --- | --- |
| **Violeta** | Creative Director & Architecture Owner — foundation, tokens, contracts, fixture, seams |
| **Amarillo** | Visual implementation — shell, homepage, `/nosotros`, presentational component library |
| **Verde** | Catalog data system — `/catalogo`, `/productos/[slug]`, `/colecciones/[slug]`, BFF, WhatsApp logic |
| **Azul** | Independent QA — design fidelity, mobile, accessibility, content honesty, performance, ownership |

## 2 · Ownership map (branch: `redesign/main`)

```
hilitos-website/  (branch: redesign/main)
├── app/
│   ├── layout.tsx ..................... SHARED (Violeta/SHELL0) — MINIMAL ROOT: html/body, lang,
│   │                                      fonts, globals.css, metadataBase, children. NO surface chrome.
│   ├── globals.css .................... SHARED (Violeta/foundation) — Tailwind entry + token→theme mapping
│   ├── (public)/
│   │   ├── layout.tsx ................. SHARED (Violeta/SHELL0) — PUBLIC STOREFRONT SHELL:
│   │   │                                  imports styles/amarillo.css; storefront metadata
│   │   │                                  (title/description/openGraph); composes SkipLink/
│   │   │                                  Header/{children}/Footer (Amarillo components,
│   │   │                                  moved verbatim, never redesigned here). NO <main>.
│   │   ├── page.tsx  (/) .............. OWNED by AMARILLO
│   │   ├── nosotros/page.tsx .......... OWNED by AMARILLO
│   │   ├── privacy/page.tsx ........... OWNED by AMARILLO (content: Mónica/legal)
│   │   ├── catalogo/page.tsx .......... OWNED by VERDE (skeleton; SHELL0 seam exception — see below)
│   │   ├── productos/[slug]/page.tsx .. OWNED by VERDE (skeleton; SHELL0 seam exception)
│   │   └── colecciones/[slug]/page.tsx  OWNED by VERDE (skeleton; SHELL0 seam exception)
│   ├── (admin)/
│   │   ├── layout.tsx ................. OWNED by ADM1a (Gate G1, since Slice S1 — see §9): pre-auth
│   │   │                                  structural & indexing boundary. force-dynamic + noindex robots
│   │   │                                  metadata + admin a11y foundation. NO session or authorization
│   │   │                                  guard exists in S1 — that arrives in Slice S3. No page.tsx
│   │   │                                  anywhere under (admin) yet → still no /admin route.
│   │   └── admin.css .................. OWNED by ADM1a (Gate G1, Slice S1) — admin-only :focus-visible +
│   │                                      prefers-reduced-motion foundation (§18); independent of the
│   │                                      public-only styles/amarillo.css, never extracted from it.
│   ├── robots.ts ...................... skeleton by Violeta → OWNED by VERDE (dynamic gen; FAIL-CLOSED until A6)
│   └── sitemap.ts ..................... skeleton by Violeta → OWNED by VERDE (dynamic gen)
├── components/ ........................ (created later)
│   ├── layout/** ...................... AMARILLO (Header, MobileNav, Footer, WhatsAppCTA)
│   ├── ui/** .......................... AMARILLO (Button, PriceTag, AvailabilityBadge, …)
│   ├── editorial/** ................... AMARILLO (EditorialHeading, ThreadMotif)
│   └── product/ProductCard.tsx ........ AMARILLO (visual impl) — prop INTERFACE is SHARED (frozen in lib/components.ts)
├── lib/
│   ├── contract.ts .................... SHARED (Violeta/foundation) — FROZEN
│   ├── components.ts .................. SHARED (Violeta/foundation) — ProductCardProps (frozen, type only)
│   ├── fixture.ts ..................... SHARED (Violeta/foundation) — typed CONSUMPTION only (server-side)
│   ├── fixture.schema.ts .............. SHARED (Violeta/foundation) — AUTHORITATIVE Zod fixture validator (RE-1)
│   ├── catalog/** ..................... VERDE (fetch/adapter/BFF — created later) — MUST return ProductContract[] (S-7)
│   └── whatsapp.ts .................... VERDE (wa.me builder — created later)
├── styles/
│   └── tokens.css ..................... SHARED (Violeta/foundation) — FROZEN names, tunable values
├── catalog.fixture.json ............... SHARED (Violeta/foundation) — FROZEN shape
├── public/
│   ├── fixtures/products/** ........... SHARED (Violeta) — neutral fixture stand-ins (NOT real photos)
│   └── (brand/editorial assets) ....... AMARILLO (logo, hero art — added later)
├── legacy/** .......................... FROZEN SNAPSHOT — the old static site (see §5). Nobody edits it here.
├── docs/** ............................ SHARED (Violeta/foundation)
├── next.config.ts ..................... SHARED (Violeta/foundation) — image domains; output:"export" FORBIDDEN (RE-2)
├── postcss.config.mjs ................. SHARED (Violeta/foundation)
├── eslint.config.mjs .................. SHARED (Violeta/foundation)
├── tsconfig.json ...................... SHARED (Violeta/foundation)
├── package.json / package-lock.json ... SHARED (Violeta/foundation)
└── vercel.json (inert preset) ......... SHARED (Violeta/foundation)

master branch ......................... PRODUCTION (GitHub Pages, hilitos.co) — NEVER TOUCHED by redesign missions
```

**Explicitly shared (require Violeta approval to edit):** `app/layout.tsx`, `app/(public)/layout.tsx`,
`app/globals.css`, `styles/tokens.css`, `lib/contract.ts`, `lib/components.ts`,
`lib/fixture.ts`, `lib/fixture.schema.ts`, `catalog.fixture.json`, root metadata, `next.config.ts`,
`postcss.config.mjs`, `eslint.config.mjs`, `tsconfig.json`. Catalog route files
and `app/robots.ts`/`app/sitemap.ts` transfer to **Verde** (see §7); `app/(admin)/layout.tsx` and
`app/(admin)/admin.css` transfer to **ADM1a** (see §9). `package.json`/lockfile remain Violeta-shared
in general, with a narrow, pack-authorized exception for ADM1a-S1's test-runner introduction (§9) —
`middleware.ts`, introduced in ADM1a-S2, stays explicitly SHARED and requires Violeta's sign-off
recorded in that slice's PR (OD-3), unlike the files above.

### 2.1 · SHELL0 layout topology (post HILITOS-SHELL0)

- **One root layout** (`app/layout.tsx`): html/body, `lang="es-CO"`, next/font Fraunces + Hanken
  Grotesk (variables for every surface), `globals.css` (Tailwind + tokens **unlayered** + `@theme`
  + body base), `metadataBase` only, `{children}`. Nested layouts must NEVER add a second
  `<html>`/`<body>` (single-root invariant).
- **`(public)` route group** = the storefront surface. `app/(public)/layout.tsx` owns the single
  `import "@/styles/amarillo.css"` (relocated from root by SHELL0 — file content untouched,
  Amarillo-owned; cascade order preserved: parent `globals.css` precedes it), the storefront brand
  metadata, and the SkipLink/Header/Footer composition. It renders no `<main>` — each public page
  owns its `<main id="contenido">` (the global SkipLink target).
- **`(admin)` route group** = the future admin surface. SHELL0 shipped ONLY the inert
  `app/(admin)/layout.tsx` (children passthrough; no page → no route). As of ADM1a-S1 (§9), the
  layout is a **pre-auth structural & indexing boundary** (force-dynamic, noindex, admin a11y
  foundation) — still no page.tsx under `(admin)`, so still no `/admin` route. Sibling route
  groups do not share layouts, so `(admin)` routes can never inherit the storefront shell. **No
  session or authorization guard exists in S1** — that arrives in Slice S3, once Slice S2 has
  introduced `middleware.ts` and the login/shell page skeleton. Not S1, and not SHELL0.
- **SHELL0 Verde seam exception (bounded, S0-approved):** SHELL0 (Violeta) added **only**
  `id="contenido"` to the existing `<main>` of the three Verde skeletons
  (`(public)/catalogo`, `(public)/productos/[slug]`, `(public)/colecciones/[slug]`) so the skip
  link works on all six public routes. No other change to Verde files. The Verde binding — every
  Verde route must render `<main id="contenido">` — remains in force for Verde's real
  implementation.
- **ADM1a carry-forward — RESOLVED (Slice S1):** `:focus-visible` and the reduced-motion reset
  lived only in storefront-owned `styles/amarillo.css`, which admin does not inherit. ADM1a-S1
  resolved this by authoring an independent `app/(admin)/admin.css` (§9) — no extraction from
  `amarillo.css` occurred or is planned.

## 3 · Branch & Worktree Conventions (RE-4 — Amarillo precondition #10)

- **Integration branch:** `redesign/main`.
- **Working branches:** `redesign/<terminal>/<slice>`
  (e.g. `redesign/violeta/f0-foundation`, `redesign/amarillo/p1a-visual-shell-homepage`).
- **Isolated worktrees** — never share a checkout across terminals.
- **No direct commits to `master`.**
- **No direct commits to `redesign/main`** — integrate only via PR.
- **PRs target `redesign/main`** (never `master`).
- **No force-push.**
- Ownership rules and shared seams: this document (§2, §4).

## 4 · Consumption seams (S-6, S-7)

- **`ProductCardProps` import path is FIXED:**
  `import type { ProductCardProps } from "@/lib/components";`
  (the `@/*` alias is configured in `tsconfig.json`). Amarillo must **not** define a local
  alternative prop type.
- **Verde adapter output type is FIXED:** any future Verde data layer under `lib/catalog/**`
  **must return `ProductContract[]`** (or the frozen `CatalogFixture` envelope) from
  `lib/contract.ts`. Verde must **not** define an alternative product type.
- **Availability labels:** consumers read Spanish labels from the single
  `AVAILABILITY_LABELS_ES` map in `lib/contract.ts` (seeded `Disponible / Sobre pedido / Agotado`,
  pending Mónica approval). No per-component label invention.
- **Fixture is server-side only (S-5):** never import `lib/fixture.ts` / `lib/fixture.schema.ts`
  into Client Components; pass minimal, already-selected props instead.
- **Fixture validation (RE-1):** `tsc` does **not** validate `catalog.fixture.json` (JSON literal
  widening + cast). The authoritative gate is `npm run fixture-lint` (Zod, strict). Never present
  `typecheck` as a fixture gate.

## 5 · Legacy-file decision (§6.3 of the mission pack)

On `redesign/main` (and only there), the old static GitHub Pages site — `index.html`, `css/`,
`js/`, `images/`, `data/products.js`, `privacy/index.html`, and the `CNAME` — was **moved into
`legacy/`** so the Next.js foundation lives at the repo root. This is a branch-local quarantine:

- `master` is untouched and GitHub Pages keeps serving the original files from `master` at
  `hilitos.co` (classic branch source, verified 2026-07-15).
- `legacy/CNAME` exists only as a moved file inside a folder; it is **not** at the branch root and
  is **not** referenced by any redesign config. The custom domain must never be attached to any
  redesign deployment before Gate A6.
- `legacy/**` is lint-ignored and frozen; it will be deleted at/after cutover (A6 decision).

## 6 · Vercel preview strategy (documented; NOT activated — §7.8)

- **Nothing is connected or deployed by the foundation.** No Vercel project exists for this repo
  yet; `vercel.json` is an inert framework preset only. **Authorization is Juanpa's.**
- When authorized, the Vercel project's **production branch = `redesign/main` ONLY** — never
  `master`, and never the real custom domain until Gate A6.
- Per-PR **preview deployments** for `redesign/*` branches.
- Every preview is **non-indexable**: `app/robots.ts` is **fail-closed (`Disallow: /`) until A6**
  (S-3), so no preview can leak into search while GitHub Pages/`master` is the canonical site.
- The real custom domain / CNAME stays on GitHub Pages + `master` until an explicit
  **Juanpa + Mónica** cutover (Gate A6).
- Until previews are authorized, downstream terminals deliver local screenshots as evidence.

## 7 · robots / sitemap ownership transfer (§7.7)

`app/robots.ts` and `app/sitemap.ts` were **created by the foundation as skeletons**; their
**ongoing ownership is Verde's** (dynamic product/collection generation). Rules:

- `robots.ts` is **FAIL-CLOSED** (`Disallow: /`). **Opening crawling is a Gate A6 / cutover
  action** (Juanpa + Mónica), executed by Verde as part of the A6 checklist — e.g. gated on a
  production env flag. Never before.
- `sitemap.ts` lists static routes only; Verde extends it with dynamic `/productos/[slug]` and
  `/colecciones/[slug]` entries from `lib/catalog/**`.

## 8 · Fixed architectural constraints

- **Next.js App Router + TypeScript (strict) + Tailwind** (tokens mapped into the theme).
- **Server Components by default**; client components only where interaction requires it.
- **`output: "export"` is FORBIDDEN** in `next.config.*` (RE-2) — target runtime is Vercel
  SSR/SSG/ISR. No `next export`.
- **Design tokens:** names/roles in `styles/tokens.css` are frozen; values are Violeta/Mónica
  tunable. Consumers never hardcode raw values.
- **Category cardinality (RE-5):** `ProductContract.category` is **singular by decision**
  (`string | null`). If the real catalog needs multiple categories per product, it must change
  **before** Amarillo/Verde consume the contract (see mission pack §17 OQ#7).

## 9 · ADM1a admin-boundary ownership transfer (Slice S1)

Per `JUANPA GO: HILITOS-ADM1A-SECURITY-FOUNDATION` (2026-07-16) authorizing Slice S1 of
`HILITOS_ADM1A_SECURITY_FOUNDATION_MISSION_PACK` (repo copy: `docs/mission-packs/`):

- `app/(admin)/layout.tsx` and the new `app/(admin)/admin.css` transfer from SHELL0/Violeta to
  **ADM1a** ownership. S1 scope only: `force-dynamic`, non-indexable robots metadata, and the
  admin a11y foundation (§18 of the pack). **No session or authorization guard exists in S1** —
  authorization arrives in Slice S3, once Slice S2 has introduced `middleware.ts` and the
  login/shell page skeleton. No page under `(admin)` in S1 either.
- **Test runner introduced (RD-8, INV-23):** a minimal `package.json` `"test"` script was added
  using Node's built-in `node:test` runner via the already-present `tsx` devDependency —
  **zero new dependencies, zero lockfile diff.** This is a narrow, pack-authorized exception to
  `package.json` being Violeta-shared; the dependency-audit evidence is simply "no new dependency
  was added." **Slice S1 introduced both the runner itself and the first S1-scoped assertion
  suite** (`tests/adm1a/s1-admin-boundary.test.ts` — checks only S1's own claims: no routable
  entrypoint under `(admin)`, no forbidden imports, admin.css contract present, no Supabase
  dependency, exactly one test runner). **Slice S6 completes the cross-cutting ADM1a harness**
  (route protection, session state, roles, RLS, etc. — the full §20 test matrix) under this same
  `tests/adm1a/**` directory; S6 does not introduce the runner or the first tests, both already
  exist from S1.
- `docs/mission-packs/HILITOS_ADM1A_SECURITY_FOUNDATION_2026-07-16.md` is the committed repo copy
  of the approved mission pack (frontmatter `recommended_repo_path`).
- Unaffected by this slice: every `(public)` route, `app/layout.tsx`, `styles/amarillo.css`,
  `styles/tokens.css`, and all frozen contracts (`lib/contract.ts`, `lib/components.ts`,
  `lib/fixture*.ts`, `catalog.fixture.json`).
