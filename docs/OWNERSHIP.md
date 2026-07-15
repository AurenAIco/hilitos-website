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
│   ├── layout.tsx ..................... SHARED (Violeta/foundation) — shell seam, fonts, metadata
│   ├── globals.css .................... SHARED (Violeta/foundation) — Tailwind entry + token→theme mapping
│   ├── page.tsx  (/) .................. skeleton by Violeta → OWNED by AMARILLO
│   ├── nosotros/page.tsx .............. skeleton by Violeta → OWNED by AMARILLO
│   ├── privacy/page.tsx ............... skeleton by Violeta → OWNED by AMARILLO (content: Mónica/legal)
│   ├── catalogo/page.tsx .............. skeleton by Violeta → OWNED by VERDE
│   ├── productos/[slug]/page.tsx ...... skeleton by Violeta → OWNED by VERDE
│   ├── colecciones/[slug]/page.tsx .... skeleton by Violeta → OWNED by VERDE
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

**Explicitly shared (require Violeta approval to edit):** `app/layout.tsx`, `app/globals.css`,
`styles/tokens.css`, `lib/contract.ts`, `lib/components.ts`, `lib/fixture.ts`, `lib/fixture.schema.ts`,
`catalog.fixture.json`, root metadata, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`,
`tsconfig.json`, `package.json`/lockfile. Catalog route files and `app/robots.ts`/`app/sitemap.ts`
transfer to **Verde** (see §7).

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
