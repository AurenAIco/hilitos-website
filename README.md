# Hilitos.co — Redesign Foundation (`redesign/main`)

> **⚠️ This branch line is the redesign. Production is `master`** (the legacy static site served
> by GitHub Pages at `hilitos.co`). Nothing here may touch `master`, the `CNAME`, DNS, GitHub
> Pages, or `api.hilitos.com`. No production cutover without Juanpa + Mónica approval (Gate A6).

Next.js (App Router) + TypeScript (strict) + Tailwind v4 foundation created by mission
**HILITOS-F0-FOUNDATION** (Violeta terminal). It freezes the architecture and shared contracts;
it does **not** implement the website (that is Amarillo's and Verde's work).

## Authoritative documents

- **`docs/OWNERSHIP.md`** — ownership map, branch/worktree conventions, consumption seams,
  legacy-file decision, Vercel preview strategy. **Read this before editing anything.**
- `docs/mission-packs/` — the mission packs governing each terminal's work.

## Key shared artifacts (Violeta-owned — do not edit unilaterally)

| Artifact | Purpose |
| --- | --- |
| `styles/tokens.css` | Design-token contract (names frozen, values tunable) |
| `lib/contract.ts` | Frozen public typed contracts (product/category/collection/availability/image) |
| `lib/components.ts` | Frozen `ProductCardProps` (type only) |
| `catalog.fixture.json` | Committed fixture — the only product-content source pre-endpoint |
| `lib/fixture.ts` | Typed consumption (server-side only) |
| `lib/fixture.schema.ts` | **Authoritative** runtime fixture validator (Zod) |

## Scripts

```bash
npm run dev           # dev server
npm run build         # production build (must stay green)
npm run lint          # eslint
npm run typecheck     # tsc --noEmit (does NOT validate the fixture — see below)
npm run fixture-lint  # AUTHORITATIVE fixture conformance gate (Zod)
```

`tsc` does **not** structurally validate `catalog.fixture.json` (JSON literal widening + cast);
`npm run fixture-lint` is the real gate.

## Conventions (summary — full rules in `docs/OWNERSHIP.md`)

- Integration branch: `redesign/main`. Working branches: `redesign/<terminal>/<slice>`.
- Isolated worktrees per terminal. PRs into `redesign/main`. No direct commits to `master` or
  `redesign/main`. No force-push. `output: "export"` is forbidden.
- `app/robots.ts` is fail-closed (`Disallow: /`) until Gate A6.
