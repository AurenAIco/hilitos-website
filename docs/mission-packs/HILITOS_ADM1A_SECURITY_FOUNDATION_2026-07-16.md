---
mission_id: HILITOS-ADM1A-SECURITY-FOUNDATION
mission_name: Hilitos Admin Security Foundation — invite-only identity, server-side sessions, protected routes, RLS/grants architecture, owner bootstrap, audit boundaries (NO writable admin UI)
gate_register_id: G1   # canonical roadmap ../HILITOS_WEBSITE_REDESIGN_PRODUCTION_GATES_CHECKLIST_2026-07-16.md
terminal: ADM (future implementer — dispatched only after the §26 authorization chain completes)
status: DRAFT — REVIEWED — APPROVE_WITH_EDITS — EDITS APPLIED — CONFIRMED — AWAITING JUANPA GO — NOT AUTHORIZED
author: Fable (senior systems planner / documentation engineer — first complete draft for Opus independent review); documentary edits applied by Morado (documentation owner) 2026-07-16 per the Opus review verdict and confirmation pass
authored: 2026-07-16
opus_review_verdict: APPROVE_WITH_EDITS (2026-07-16) — required documentary edits applied same day
opus_confirmation_pass: CONFIRMED_WITH_MINOR_DOC_EDITS (2026-07-16) — four minor documentary edits applied same day; ELIGIBLE FOR JUANPA GO DECISION (eligibility does not issue or imply a GO); no GO requested or issued
mission_type: security-foundation planning pack (AUTHORING ONLY — no implementation performed or authorized by this document)
risk_class: medium-high when implemented (introduces the first authenticated surface); zero at authoring time (docs-only)
repository: AurenAIco/hilitos-website
integration_branch: redesign/main
base_sha: 4c49e019fc950aa3027e7a726cd43a9aa41ecef2   # current redesign/main head = SHELL0 merge commit (PR #3)
legacy_production_branch: master
legacy_production_sha: 8ab791da59ad30171162b1651f6fae32800367f2   # untouched; still serves hilitos.co via GitHub Pages
branch_model: redesign/adm/adm1a-<slice> off redesign/main; PRs into redesign/main only; no direct commits to master or redesign/main; no force-push; isolated worktree per slice
depends_on: [HILITOS-F0-FOUNDATION (MERGED/GREEN, 4a932ce4), HILITOS-P1A-AMARILLO (MERGED/GREEN, 2285e997), HILITOS-SHELL0 (MERGED/GREEN, 4c49e019), HILITOS-ADM0 (REVIEWED — APPROVED_WITH_EDITS — architecture only)]
must_not_conflict_with: [Verde catalog mission (lib/catalog/**, public catalog routes, robots.ts, sitemap.ts, lib/whatsapp.ts), Amarillo ownership (app/(public)/**, components/**, styles/amarillo.css)]
frozen_do_not_touch: [lib/contract.ts, lib/components.ts, lib/fixture.ts, lib/fixture.schema.ts, catalog.fixture.json, styles/tokens.css, app/(public)/**, legacy/**]
supabase_cms_project: DOES NOT EXIST — creation is Gate G2, separately authorized; this pack does not create it and its GO does not create it
mission_ends_at: Gate ADM1a-G (independent security review of the implementation). This pack authorizes NOTHING; see §26 authorization chain.
implementation_authorization_literal: "JUANPA GO: HILITOS-ADM1A-SECURITY-FOUNDATION"
draft_vault_path: AUREN/Juanpa/Hilitos/07_Website_Redesign/Mission_Packs/HILITOS_ADM1A_SECURITY_FOUNDATION_MISSION_PACK_DRAFT_2026-07-16.md
recommended_repo_path: docs/mission-packs/HILITOS_ADM1A_SECURITY_FOUNDATION_2026-07-16.md   # committed only by the authorized implementation slice
---

# HILITOS-ADM1A — Security Foundation Mission Pack

**`DRAFT — REVIEWED — APPROVE_WITH_EDITS — EDITS APPLIED — CONFIRMED — AWAITING JUANPA GO — NOT AUTHORIZED`**

> **Post-review status update (documentary edit, 2026-07-16):** the independent Opus review of this pack returned **`APPROVE_WITH_EDITS`**. The architecture is approved; nothing below reopens a settled ADM0/ADM1a decision or introduces a new finding. The required documentary edits (assumption resolution, OD-1–OD-4 resolutions, three new invariants, slice/test-matrix corrections) have been applied throughout this document by Morado (documentation owner) on 2026-07-16.
>
> **Post-confirmation status update (documentary edit, 2026-07-16):** the Opus independent confirmation pass returned **`CONFIRMED_WITH_MINOR_DOC_EDITS`**, with eligibility recorded as **`ELIGIBLE FOR JUANPA GO DECISION`**. This eligibility does **not** issue or imply a GO. The four minor documentary edits it identified (§5 dangling OD-2 conditional, §7 INV-8 verification-boundary clarification, gate-register next-step wording, README index row) have been applied in this same closeout and require no further Opus review. This pack now awaits only the **literal Juanpa GO decision** (§26 step 5). No implementation of any kind has occurred as a result of this or any prior documentary pass.
>
> This is a **planning Mission Pack (a future build contract), not an authorization to build.** Nothing in this document authorizes editing the website repository, creating a branch or worktree, committing, pushing, opening a PR, deploying, changing Vercel/GitHub Pages/DNS/CNAME, creating or modifying any Supabase project, configuring Auth, creating users or buckets, applying migrations or RLS policies, creating environment variables, or implementing any part of `/admin`. Implementation may begin **only** after the full §26 authorization chain, ending in the explicit literal `JUANPA GO: HILITOS-ADM1A-SECURITY-FOUNDATION` — and even that GO does **not** create Supabase resources (see §26.1).
>
> This pack **implements the architecture approved in ADM0** (`HILITOS_ADM0_ADMIN_PORTAL_ARCHITECTURE_MISSION_PACK_DRAFT_2026-07-15.md`, status `REVIEWED — APPROVED_WITH_EDITS — EDITS APPLIED — AWAITING JUANPA GO`). No ADM0 decision is replaced here. Where ADM0 or the gate register left a choice open, §24 now records the Opus-reviewed resolution — never a silent decision.

---

## 1 · Document Control

| Field | Value |
|---|---|
| Title | HILITOS-ADM1A — Security Foundation Mission Pack |
| Mission ID | `HILITOS-ADM1A-SECURITY-FOUNDATION` (= Gate **G1** in the canonical gate register) |
| Date | 2026-07-16 |
| Status | `DRAFT — REVIEWED — APPROVE_WITH_EDITS — EDITS APPLIED — CONFIRMED — AWAITING JUANPA GO — NOT AUTHORIZED` |
| Owner | Juanpa (authorization owner); ADM terminal (future implementer); Opus (independent reviewer, §25 — review verdict `APPROVE_WITH_EDITS`, confirmation pass `CONFIRMED_WITH_MINOR_DOC_EDITS`, both 2026-07-16) |
| Author of this draft | Fable (planning/documentation only; performed no implementation); documentary edits applied by Morado 2026-07-16 (post-review and post-confirmation) |
| Repository | `AurenAIco/hilitos-website` |
| Allowed branch model | Work branches `redesign/adm/adm1a-<slice>` off `redesign/main @ 4c49e019…`; isolated worktree per slice; PRs into `redesign/main` only; never `master`; no direct commits to `master`/`redesign/main`; no force-push (per `docs/OWNERSHIP.md` §3) |
| Dependencies | Gate **G0** `CLOSED — GREEN` (F0 PR #1 `4a932ce4`, P1A PR #2 `2285e997`, SHELL0 PR #3 `4c49e019`); ADM0 architecture `APPROVED_WITH_EDITS`; SHELL0 §34 follow-up **F1** assigned here |
| Downstream gates | **G2** (CMS project creation — separate GO, `LOCKED — DEPENDS ON G1`), **G3** (schema/RLS/audit against the live project), ADM1b (product editorial MVP) |
| Explicit authorization state | **NOT AUTHORIZED. NOT STARTED. No implementation of any kind has been performed for this mission.** Independent review is complete (`APPROVE_WITH_EDITS`), the required edits are applied, and the confirmation pass is complete (`CONFIRMED_WITH_MINOR_DOC_EDITS`, eligibility `ELIGIBLE FOR JUANPA GO DECISION` — eligibility does not issue or imply a GO). Only the literal Juanpa GO decision remains. No Juanpa GO has been requested or issued. |

### 1.1 Sources of truth reconciled by this draft

| # | Source | Status |
|---|---|---|
| 1 | Canonical current-state record | **RESOLVED (`A1a-HANDOFF`, 2026-07-16, Opus independent review).** No file named `HILITOS_WEBSITE_REDESIGN_HANDOFF_2026-07-16` (or any canonical "handoff" document) exists inside the vault — this is a confirmed absence, not a claim that such a document never existed at all; no such vault file has ever been located. The vault's **canonical current-state record is formally designated as `../HILITOS_WEBSITE_REDESIGN_PRODUCTION_GATES_CHECKLIST_2026-07-16.md §0`** (the "Authoritative Current State" table). During this Opus review, its baseline was **independently re-verified against the remote on 2026-07-16**: `redesign/main = 4c49e019fc950aa3027e7a726cd43a9aa41ecef2`, `master = 8ab791da59ad30171162b1651f6fae32800367f2` — both match the values already recorded in §3 below and in the gate register. This local assumption identifier is renamed from the originally-drafted `A-1` to **`A1a-HANDOFF`** specifically so it never collides with ADM0's own, distinct `A-1` identifier (ADM0 §7 "A-3" etc. use a separate numbering space local to that pack). **`A1a-HANDOFF` status: RESOLVED — no canonical handoff file exists in the vault; canonical current state is the production-gates register §0, independently verified during Opus review.** *(Formerly labeled assumption A-1 in the first draft — renamed here to avoid ambiguity with ADM0's own identifier.)* |
| 2 | `Mission_Packs/HILITOS_ADM0_ADMIN_PORTAL_ARCHITECTURE_MISSION_PACK_DRAFT_2026-07-15.md` | Read in full. Architecture authority for this pack. |
| 3 | `Mission_Packs/HILITOS_SHELL0_PUBLIC_ADMIN_LAYOUT_SEPARATION_MISSION_PACK_DRAFT_2026-07-16.md` | Read in full, incl. §34 follow-ups (F1 assigned to ADM1a). |
| 4 | Canonical current-state records: Hilitos vault `README.md` (§07_Website_Redesign index) + repo `README.md` + `docs/OWNERSHIP.md` (post-SHELL0 §2.1 topology) | Read. |
| 5 | `../HILITOS_WEBSITE_REDESIGN_PRODUCTION_GATES_CHECKLIST_2026-07-16.md` (Morado gate register — exists) | Read in full. G1 entry/exit criteria and the G1/G2/G3 split are honored here (§4.2, §24 OD-2). |
| 6 | `AUREN_PROMPTING_PLAYBOOK_FABLE5_SAFEGUARDS_2026-06-10.md` (redeploy-safe prompting playbook) | Read. Applied to the §26.2 protected dispatch template (defensive framing, structure, do-not-touch lists, evidence rules). |

---

## 2 · Executive Objective

ADM1a delivers the **smallest secure foundation** on which any functional Hilitos CMS/admin work can later be built — and nothing else. Concretely, when (and only when) it is authorized and implemented, it establishes a defensible, testable contract for:

- the `/admin` security boundary (server-enforced, fail-closed, non-indexable);
- invite-only identity (no public registration, ever);
- authenticated server-side sessions (cookie-based, verified on every admin request);
- protected routes (pages, server actions, and route handlers alike);
- a minimal role model (Owner / Editor / Reviewer, per ADM0 Decision 4);
- secrets and environment separation (Preview ≠ Production; nothing secret in the browser);
- the Supabase CMS separation contract (dedicated project, physically separate from the Hilitos/Olivia operational plane — project **creation** deferred to Gate G2);
- the RLS and grants architecture (deny-by-default, authored as reviewed migration files);
- a safe, one-time owner bootstrap;
- audit boundaries (what must be recorded, before any recordable action exists);
- an admin accessibility foundation (closing SHELL0 follow-up **F1**);
- Preview-based verification, rollback, and strict production isolation.

**Why this precedes all catalog/admin functionality:** the gate register fixes the delivery order — *security and identity first* (G1), then database/data integrity (G2–G3), then catalog/media (G4–G5), then admin usability (G6), and so on to cutover (G11). Building any writable admin surface before the security boundary exists would invert that order: every later feature would be built on an unverified trust model and would have to be re-audited. ADM1a intentionally ships **no product CRUD, no content editing, no media** — only the boundary, the identity model, and the proofs that they fail closed. ADM0 §22 fixed this sequencing (`SHELL0 → ADM1a → ADM1b → ADM2 → ADM3 → Ship`) and it is preserved verbatim.

---

## 3 · Current-State Baseline (authoritative, as of 2026-07-16)

| Fact | Value |
|---|---|
| Repository | `AurenAIco/hilitos-website` |
| Integration branch | `redesign/main` |
| Current integration SHA | `4c49e019fc950aa3027e7a726cd43a9aa41ecef2` (SHELL0 merge commit, PR #3 — current head) |
| Legacy production branch | `master` |
| Current legacy SHA | `8ab791da59ad30171162b1651f6fae32800367f2` |
| Real production | `hilitos.co` on **GitHub Pages**, served from `master` — **unchanged** |
| Vercel | **Integration-only** (hilitos-website.vercel.app); not the real production site; no custom domain attached |
| `robots.txt` | **Fail-closed** (`Disallow: /`) on the redesign line until Gate G11/A6 |
| DNS / CNAME | **No cutover has occurred** |
| Supabase CMS project | **Does not exist** (creation = Gate G2, separately authorized) |
| Auth | **Does not exist** — no Supabase Auth configuration, no users |
| `/admin` | **No functional `/admin` exists.** `app/(admin)/layout.tsx` is an inert children-passthrough boundary (SHELL0); no page under it → no route in the manifest |
| `middleware.ts` | **Does not exist** in the repo (confirmed by SHELL0 §3 discovery) — creating it is an ADM1a concern (§24 OD-3) |
| Route topology (post-SHELL0) | Minimal root `app/layout.tsx` (html/body/fonts/globals.css/`metadataBase`/children); `app/(public)/layout.tsx` owns the storefront shell + `styles/amarillo.css` + storefront metadata; six public routes under `(public)`; `<main id="contenido">` on all six |
| ADM1a implementation | **Unauthorized.** Architecture (ADM0) is approved; implementation is not |

Baseline drift rule: if `redesign/main` is no longer at `4c49e019…` when implementation is dispatched, the implementer must re-verify this section against the newer head and **STOP** on any material difference (§23).

---

## 4 · Scope (what ADM1a may eventually implement)

### 4.1 In scope (upon full authorization, and only then)

1. **Admin boundary hardening** — expand `app/(admin)/layout.tsx` from the inert SHELL0 seam into a server-side authorization boundary: `export const dynamic = 'force-dynamic'`, `<meta name="robots" content="noindex,nofollow">`, semantic admin landmarks, and a server-verified session guard that **fails closed** (ADM0 Decision 1, §6.2).
2. **Admin accessibility foundation** — an admin-owned focus/motion/landmark/label baseline independent of public-only `styles/amarillo.css` (closes SHELL0 §34 **F1**; §18).
3. **Protected route plumbing** — creation of `middleware.ts` with **only** a `/admin/:path*` matcher for redirect UX (authoritative checks remain server-side; ADM0 §6.2), a `/admin/login` page, and a minimal read-only `/admin` shell page proving the protection contract (§12). This is the **maximum UI**: “a login + read-only shell” (ADM0 §22 ADM1a), nothing writable.
4. **Auth code** — invite-only Supabase Auth (email OTP primary, per ADM0 Decision 3) via `@supabase/ssr` cookie sessions; server-side `getUser()` verification on every admin request; logout with refresh-token revocation. Code is authored fail-closed: with no CMS project/env configured, every admin request is denied (never permitted).
5. **Identity & role model** — `admin_users` (id/company_id/email/role/status/invited_by, per ADM0 §10.1), `SECURITY DEFINER` helper functions with pinned `search_path` (S-H2), no-self-escalation rules — authored as **migration files** in the repo, not applied (§24 OD-2 governs how much schema ADM1a authors vs. G3).
6. **RLS & grants architecture** — deny-by-default policies, company-scoped `USING/WITH CHECK`, the §11.3 ADM0 Public Read Security Model (non-API-exposed `cms` schema, allowlisted `public_site_*` views over `published_snapshot`) — authored as **migration files or documented specification per §24 OD-2** (under OD-2(a), the `public_site_*` view DDL is authored at G3 with the editorial tables it projects), never applied in ADM1a.
7. **Owner bootstrap** — the one-time, idempotent, logged, non-browser-invokable ceremony (ADM0 S-H1), authored as a migration/controlled server-side script **file**; execution requires the environment gate of §16.
8. **Audit boundary definition** — `site_change_log` / `site_publications` append-only design (ADM0 S-M1) as migration files, plus the §17 catalog of future actions that must audit.
9. **Frozen published-read interface** — `lib/cms/read.ts` with **all seven** ADM0 §20.1 signatures (`listPublishedProducts`, `getPublishedProductBySlug`, `listPublishedCategories`, `listPublishedCollections`, `getPublishedHomepage`, `getPublishedPage`, `getPublicSiteSettings`), including definition of the three **CMS-owned contracts** (`PublishedHomepage`, `PublishedPage`, `PublicSiteSettings`) that ADM0 §20.1 assigns to ADM1a. The four catalog functions are implemented against the committed fixture as last-known-good. **(Opus review correction, 2026-07-16):** the three content functions (which have no fixture data) return **typed empty or null-valued objects, never invented or placeholder content** — never a fabricated WhatsApp number, never fabricated contact data, never invented copy, and never placeholder content presented as if it were real. Concretely, `PublicSiteSettings` returns **no non-null contact or WhatsApp value at all** during ADM1a. This state is named **`not-yet-backed`**, and it is explicitly **distinct** from ADM0 §11.4's "degraded / last-known-good fallback": ADM1a's content functions use `not-yet-backed` and must **not** permanently activate the degraded/staleness alarm that §11.4 defines for a real backing source that has gone stale — there is no backing source yet to go stale. Degraded/fallback behavior only becomes meaningful once a real backing source exists (Gate G7+); until then, `not-yet-backed` is simply the honest, structurally-empty starting state. Nothing consumes `lib/cms/read.ts` until Gate G7 (§19 S5). Never `undefined`, never a throw to the public path. Live store reads activate only after G2/G3; all functions carry the §11.4 ADM0 observability signal, applied correctly starting from G7 once a real source exists. RD-9 (§24.2) is **CONFIRMED** with these content-honesty constraints; the ADM0 §20.1-vs-§29 internal inconsistency noted in the first draft is resolved by adopting §20.1 (author all seven signatures).
10. **Verification & evidence harness** — the §20 test matrix: route-protection, session-state, role, bundle-leak, env fail-closed, Preview/Production isolation, accessibility, and public-route-parity checks.

### 4.2 Relationship to Gates G2/G3 (reconciliation with the gate register)

The gate register splits ADM0’s original ADM1a scope across three gates: **G1** (this mission: security/identity foundation, no live Supabase resources), **G2** (`HILITOS-CMS0-PROJECT-FOUNDATION`: creation of the dedicated CMS Supabase project, its own literal GO), and **G3** (`HILITOS-CMS1-SCHEMA-RLS-AUDIT`: schema/RLS/audit built and proven against the live project). This pack honors that split: **ADM1a authors code and migration files and proves fail-closed behavior; it applies nothing to any live Supabase project and creates no Supabase resource.**

**Third ADM0 inconsistency, recorded explicitly (Opus review finding, resolved via OD-2 below):** ADM0 itself is not internally consistent on where the editorial schema/RLS/audit/Storage migration-file *authorship* belongs. ADM0's own 2026-07-16 cross-link (added to the ADM0 pack when the gate register was created) explicitly assigns "schema/RLS/audit" to **G3**. ADM0 §22's older text — written before the gate register existed — instead assigns the full schema/RLS/Storage migration-file authorship to **ADM1a**. These two statements inside ADM0 disagree, and that disagreement is the direct source of what this pack labels **OD-2**. The newer production-gates register, and ADM0's own newer cross-link, both resolve the inconsistency **toward G3** — i.e., toward the narrower ADM1a scope. OD-2's resolution below (§24.1) is therefore not a neutral pick between two equally-valid ADM0 readings; it is a deliberate choice of the newer, gate-register-aligned reading over the older §22 text, recorded as an **authorized departure from ADM0 §22** rather than a fresh architectural decision.

The exact boundary of *how much* schema ADM1a authors as files (identity/audit core only vs. the full ADM0 §10 editorial schema) was a **blocking open decision** (§24 OD-2) at draft time; it is now **RESOLVED** per the Opus review — see §24.1.

---

## 5 · Explicit Non-Goals

ADM1a must **not** include (each is a STOP if attempted, §23):

- **No product CRUD** (create/edit/archive of products — ADM1b).
- **No category/collection CRUD.**
- **No media pipeline** — no uploads, no buckets, no Storage policies applied, no quarantine/promotion flow (ADM2 / Gate G5). Storage policy files are authored at Gate G3, never in ADM1a, under resolved decision OD-2(a). *(Corrected 2026-07-16, Opus confirmation pass — removes a dangling conditional left over from before OD-2 was resolved.)*
- **No public catalog data changes** — the public site continues to read the committed fixture; no Verde file is edited.
- **No real CMS data** — no real product/content rows are created anywhere; fixture-derived seed material is authored as files only (M0 apply belongs to G3+).
- **No design overhaul** — no public visual change of any kind; the admin surface gets only the minimal a11y/boundary foundation of §18, not a designed admin UI.
- **No production cutover**, no `master` change, no GitHub Pages change.
- **No DNS/CNAME change.**
- **No public indexation change** — `robots.ts` stays fail-closed; admin adds `noindex` on top.
- **No Olivia operational integration** — no operational Supabase credential, query, or bridge (the M1 read-only seed remains a separate, unapproved backend mission — ADM0 D7).
- **No service-role browser access** — no code path that could deliver a service-role or management credential to a client bundle.
- **No public signup** — no self-service registration surface may even exist in disabled form.
- **No creation of Supabase resources** — no project, no Auth config, no users, no buckets, no applied migrations, no applied RLS policies, no environment variables on any live system — **unless a separately authorized execution slice (Gate G2 territory) explicitly permits that specific action** (§26.1).
- **Security headers and CSP are owned by G10 and are explicitly out of ADM1a scope.** (Opus review addition.) ADM1a does not author, configure, or verify `Content-Security-Policy`, `X-Frame-Options`, HSTS, or any other security-header posture — that review lives entirely in Gate G10's "Security headers and CSP" checklist item. ADM1a's own security surface (INV-1–INV-24) does not depend on CSP being configured yet.

---

## 6 · High-Level Defensive Threat Model

Defensive risk register only: each row names a risk category, why it matters for this system, and the planned control (cross-referenced to the §7 invariants). This section deliberately contains **no reproduction or attack instructions**.

| # | Risk category | Why it matters here | Planned control (invariant) |
|---|---|---|---|
| T1 | Unauthenticated access to admin surfaces | `/admin` is the first authenticated surface in this repo; any gap exposes the future CMS write path | Server-verified session on every admin request; middleware is UX-only; fail-closed default (INV-1, INV-3) |
| T2 | Horizontal privilege misuse (acting on another tenant’s rows) | Schema is multi-tenant-ready (`company_id`) even with one tenant | Company scoping from server-verified membership, RLS `USING/WITH CHECK` both directions (INV-6, INV-8) |
| T3 | Vertical privilege misuse (Editor/Reviewer acquiring Owner capabilities) | Role model is the basis of every later write gate | Roles server-derived from `admin_users`; no self-escalation; Owner-only role management (INV-6, INV-7) |
| T4 | Stale or forged sessions | Cookie sessions persist across requests; revocation must actually take effect | `getUser()` re-verification each request; refresh revocation on logout; revoked membership denies on next request (INV-3, INV-13) |
| T5 | Browser secret exposure | A service-role key in a client bundle would void RLS entirely | `import 'server-only'` modules; no secret in `NEXT_PUBLIC_*`; bundle-leak scan (INV-5) |
| T6 | Preview/Production environment confusion | Preview must never hold or fall back to Production credentials/callbacks | Distinct env sets per environment; missing config denies; callback URLs environment-pinned (INV-15) |
| T7 | Misconfigured RLS or grants | A single permissive default grant would expose editorial base tables | Deny-by-default on every table; no anon grant on base tables; PostgREST exposure check (INV-8, INV-9, INV-10) |
| T8 | Accidental access to drafts | Draft content must be structurally absent from every anonymous path | Snapshot-only allowlisted views; drafts never in the anon path (INV-9) |
| T9 | Unsafe owner bootstrap | The first Owner cannot be invited; a careless bootstrap is a standing back door | One-time, idempotent, identity-pinned, logged, non-browser-invokable ceremony, disabled after use (INV-12) |
| T10 | Sensitive logging | Auth flows touch codes, tokens, and emails | No token/OTP/cookie values in logs; structured logs carry event + actor id only (INV-19) |
| T11 | Dependency/configuration failure | New deps (`@supabase/ssr`) and env vars enter the build | Pinned lockfile + audit in CI; absent/invalid config → deny, never a permissive fallback (INV-1, INV-15; ADM0 S-L4) |
| T12 | Accidental coupling to operational data | The Hilitos/Olivia operational Supabase is PITR-off and out of scope | Physical separation; zero operational credentials in this repo/Vercel project; isolation check in every slice (INV-17) |
| T13 | Session fixation / CSRF-class request forgery | First state-changing authenticated surface | Cookie flags (httpOnly/Secure/SameSite=Lax), Server-Actions origin behavior, token rotation on login (INV-4; ADM0 §17.3–4) |
| T14 | Account/user enumeration | Invite-only makes “who has an account” itself sensitive | Uniform generic responses on login/OTP request regardless of account existence (INV-18) |
| T15 | Admin surface discoverability/indexation | Admin URLs must never enter crawlers or sitemaps | `noindex,nofollow` + force-dynamic + fail-closed robots + never in sitemap (INV-16) |
| T16 | Repeated credential/OTP guessing against the login surface | The login page is the one unauthenticated admin surface; unthrottled code entry weakens the OTP model | Invite-only allowlist + provider OTP rate limits (verified as configured at G2) + attempt logging + lockout/backoff on the app path (INV-21; ADM0 §8 / §17 #13) |

---

## 7 · Security Invariants (numbered, testable)

Format per invariant — **S:** statement · **R:** reason · **E:** enforcement layer · **V:** verification method · **F:** failure behavior.

- **INV-1 — Fail-closed boundary.**
  **S:** Any request to any `/admin` path (page, server action, or route handler) with missing, invalid, or unverifiable security configuration (absent env, unreachable auth backend, malformed session) is denied.
  **R:** Missing configuration must never widen access (mandatory principle 1).
  **E:** Server-side guard in `app/(admin)/layout.tsx` + per-action assertions in `lib/admin/**`.
  **V:** Automated test: unset each required env var in turn → every admin route returns deny (redirect to login for pages; 401/403 for actions); no test may show content on config absence.
  **F:** Deny + structured log; never a permissive fallback, never a default credential.

- **INV-2 — Invite-only identity.**
  **S:** No public registration or self-service account creation exists; only an email present as an active/invited `admin_users` row can ever result in an authorized admin session.
  **R:** Mandatory principle 2; ADM0 Decision 3.
  **E:** Supabase Auth sign-ups disabled (config, applied only at G2+) + `admin_users` membership check in the server guard (code, ADM1a).
  **V:** Test: a session for an email with no `admin_users` row is treated as unauthorized even if the auth provider issued it.
  **F:** Deny with generic response (see INV-18); no account is created.

- **INV-3 — Server-side authorization on every admin request.**
  **S:** Every admin page render, server action, and route handler re-verifies the session server-side (`supabase.auth.getUser()` or equivalent) and re-derives role/membership; client-side state and the middleware redirect are never authorization.
  **R:** Mandatory principle 3; hiding UI is not a control (ADM0 §8).
  **E:** Server components / server actions in `app/(admin)/**` + `lib/admin/**`.
  **V:** Test: direct request with a fabricated/absent cookie to each admin route and action → denied; grep-level check that no admin authorization decision reads client-supplied fields.
  **F:** Deny; log event without token material.

- **INV-4 — Cookie discipline.**
  **S:** Session cookies are `httpOnly`, `Secure`, `SameSite=Lax` (or stricter); no session or refresh token is ever placed in `localStorage`, `sessionStorage`, URL parameters, or non-httpOnly cookies.
  **R:** Limits script-readable credential surface; ADM0 Decision 3.
  **E:** `@supabase/ssr` cookie configuration in `lib/admin/**`.
  **V:** Automated inspection of `Set-Cookie` headers in tests; code review checklist item.
  **F:** A slice that cannot satisfy this is not mergeable (review-blocking).

- **INV-5 — No browser secrets.**
  **S:** Service-role keys, management credentials, bootstrap secrets, and any privileged key never appear in client bundles, `NEXT_PUBLIC_*` variables, browser-readable responses, or client-reachable code paths.
  **R:** Mandatory principle 5; a leaked service key voids RLS.
  **E:** `import 'server-only'` on `lib/cms/**` and `lib/admin/**`; env naming discipline (§13).
  **V:** Build-output scan of `.next` client chunks for secret env names and server-only module identifiers (must be absent); CI grep for `NEXT_PUBLIC_` misuse.
  **F:** Merge-blocking; if discovered post-merge → §21.7 secret-exposure response.

- **INV-6 — Identity-derived authorization.**
  **S:** Role and `company_id` are always derived server-side from the `admin_users` row for the verified `auth.uid()`; no request body, header, or cookie field chosen by the client participates in an authorization decision.
  **R:** Prevents horizontal/vertical misuse (T2/T3); ADM0 §9.1.
  **E:** `lib/admin` guards + RLS helper functions (files).
  **V:** RLS test suite (§20) with two-tenant fixtures; code review of every assertion path.
  **F:** Deny + audit-visible log event.

- **INV-7 — No self-escalation.**
  **S:** `role`, `company_id`, and `status` on `admin_users` are never editable by the row’s own subject and never client-settable; role assignment is an Owner-only server action with an explicit field allowlist.
  **R:** ADM0 §9.1; the role table must not be its own escalation vector.
  **E:** RLS policies (files) + server-action field allowlists (code).
  **V:** Escalation test cases in the RLS suite (executed at the OD-1 verification environment).
  **F:** Write rejected; attempt logged.

- **INV-8 — RLS deny-by-default.**
  **S:** Every CMS table has RLS enabled (FORCE RLS where applicable per G3 register language); absence of a policy means no access; **anon** holds no grant on base editorial tables, and authenticated roles hold no grant on them **for public reading** — Editor/Owner reach base editorial tables only through the ADM0 §9.2 RLS-scoped policies (company-scoped `USING/WITH CHECK`, allowlisted columns) or the server-only post-authZ service path, never through a broad default grant (this preserves ADM0 §11.3 #3 exactly; it does not remove the approved Editor draft-editing model).
  **R:** Mandatory principles 1, 4; ADM0 §9.
  **E:** Migration files (ADM1a) → applied/proven live at G3.
  **V:** RLS suite: anon/editor/reviewer/owner/cross-tenant matrices, scoped to the identity-core tables ADM1a actually authors under OD-2(a) (`admin_users`, helpers, audit). *(Clarified 2026-07-16, Opus confirmation pass:)* **Identity-core scope may be rehearsed in the OD-1 local environment. ADM0 §11.3 #10 PostgREST exposure verification belongs to Gate G3; see INV-10.** INV-8 does not itself prove that editorial or public-view exposure is closed — that proof is INV-10's, owned by G3.
  **F:** Query returns nothing/error; never partial rows.

- **INV-9 — Snapshot-only public projection.** *(Opus review relabel: **specified at G1 — proven at G3**, per OD-2's authorized departure from ADM0 §22.)*
  **S:** Anonymous/public reads can only ever reach `public_site_*` views that enumerate exact allowlisted columns derived from `published_snapshot`, gated `is_published AND is_visible AND archived_at IS NULL`; draft columns are structurally absent from every anon path.
  **R:** ADM0 R1+R2 (frozen); prevents draft leakage (T8).
  **E:** At G1: documented specification only (allowlist model, gating predicate) per OD-2(a) — no view DDL is authored here. At G3: view definitions (migration files) + server-side-only read path (`lib/cms/read.ts`).
  **V:** At G1: specification review only (no `SELECT *` planned, no draft/internal columns in the allowlist design). At G3: view-definition review against the actual DDL; contract Zod `.strict()` validation of projection output; draft-leak negative test (G3/G7).
  **F:** Malformed/failing projection → serve last-known-good (fixture) with the §11.4 ADM0 staleness signal; never serve draft data. (Meaningful once the view exists at G3.)

- **INV-10 — Non-exposed CMS schema.** *(Opus review relabel: **specified at G1 — proven at G3**, per OD-2's authorized departure from ADM0 §22.)*
  **S:** CMS editorial tables live in a non-`public`, non-API-exposed schema (e.g. `cms`) where practical; anon/authenticated API keys cannot read any editorial base table or non-allowlisted view over PostgREST.
  **R:** ADM0 §11.3 (frozen preference order).
  **E:** At G1: schema-placement specification only (identity-core tables under OD-2(a) may exist as files, but the ADM0 §11.3 #10 exposure verification itself is G3's). At G3: full schema placement + exposure configuration, verified against the live project.
  **V:** At G1: specification review only. At G3: PostgREST exposure check as an automated test against the live project (BLOCKED at G1 — cannot be proven against a project that does not exist).
  **F:** If the schema cannot be non-exposed on the chosen platform tier, STOP and surface to review (§23) — do not fall back silently to an exposed schema.

- **INV-11 — Safe RLS helpers.**
  **S:** Membership helpers (`is_member()`, `role()`, `company()`) are `SECURITY DEFINER` only where necessary, with pinned safe `search_path` and fully-qualified references, and are covered by recursive-RLS and escalation tests.
  **R:** ADM0 S-H2.
  **E:** Migration files.
  **V:** Dedicated helper tests in the RLS suite; static review of every helper definition.
  **F:** A helper that cannot be pinned/tested is a STOP.

- **INV-12 — One-time owner bootstrap.**
  **S:** The first Owner row is created only by the §16 ceremony: tied to Juanpa’s verified identity, idempotent (re-run = no-op), executed server-side with environment gating, never invokable from a browser, logged, and disabled/removed after use. No committed default password, no reusable bootstrap token, no plaintext credential storage.
  **R:** ADM0 S-H1; T9.
  **E:** Migration/one-time script file (ADM1a) + execution gate (G2+).
  **V:** Idempotency test (double-run) at the OD-1 environment; static review that no browser route can reach it.
  **F:** Any second-run effect, or any browser-reachable path, is merge-blocking.

- **INV-13 — Revocation is immediate-on-next-request.**
  **S:** Setting `status='revoked'` (or removing the membership row) causes every subsequent request by that subject to be denied, regardless of remaining cookie/session lifetime.
  **R:** Role removal must not wait for token expiry (mandatory principle 3).
  **E:** Membership re-check in the server guard on every request (INV-3).
  **V:** Session-state test: authenticate, revoke, assert next request denies.
  **F:** Deny + log.

- **INV-14 — Append-only audit substrate.**
  **S:** `site_change_log` denies UPDATE/DELETE to all application roles including Owner (service-role/DB-superuser access remains an out-of-band, minimized, documented operational capability); corrections are new rows.
  **R:** ADM0 S-M1 — tamper-resistant history for application roles; honestly scoped (not “absolute immutability”).
  **E:** RLS policies (migration files); proven live at G3.
  **V:** RLS suite: UPDATE/DELETE attempts by every app role are rejected.
  **F:** Write rejected.

- **INV-15 — Preview ≠ Production.**
  **S:** Preview and Production use distinct environment variable sets, distinct secrets, and distinct auth callback/redirect URLs; a Production value is never present in, nor a fallback for, Preview (and vice versa); any missing environment value denies (INV-1).
  **R:** Mandatory principle 7; T6.
  **E:** Env naming + wiring contract (§13); Vercel env scoping (configured only when a slice with env authorization runs).
  **V:** Env fail-closed test matrix (§20); documented per-environment variable inventory (names only).
  **F:** Deny + operator-visible configuration error; never cross-environment fallback.

- **INV-16 — Non-indexable, non-static admin.**
  **S:** Every admin route is `force-dynamic`, carries `noindex,nofollow` robots metadata, never appears in `sitemap.ts`, and is never statically exported.
  **R:** ADM0 §6.2; T15.
  **E:** `app/(admin)/layout.tsx` exports + build behavior.
  **V:** Build-manifest inspection (admin routes dynamic); response-header/metadata test; sitemap content test.
  **F:** Merge-blocking.

- **INV-17 — Operational-plane isolation.**
  **S:** No Hilitos/Olivia operational Supabase credential, URL, client, or query exists anywhere in this repository or its Vercel project; the CMS is a physically separate project (once G2 creates it).
  **R:** Mandatory principle 6; two-plane no-bridge doctrine; ADM0 Decision 2.
  **E:** Code review + env inventory + repo-wide scan.
  **V:** Isolation confirmation in every slice’s evidence (scan for operational project refs/keys → must be absent).
  **F:** STOP (§23) — this is never “fixable inline.”

- **INV-18 — No user enumeration.**
  **S:** Login/OTP-request/recovery responses are uniform and generic whether or not the email is known, invited, active, or revoked.
  **R:** T14; invite-only membership is itself sensitive.
  **E:** Auth flow code (`lib/admin/**`, login page).
  **V:** Response-equivalence test across account states.
  **F:** Uniform generic response; detailed cause goes to server logs only (without secrets).

- **INV-19 — No secrets in logs.**
  **S:** Logs never contain OTP codes, tokens, cookie values, password material, service keys, or full session objects; auth events log event type, subject id, timestamp, and outcome only.
  **R:** T10; mandatory principle 5 extended to observability.
  **E:** Logging discipline in `lib/admin/**`/`lib/cms/**`.
  **V:** Log-output review in tests; static grep for token-bearing log calls.
  **F:** Merge-blocking; if discovered post-merge → §21.7.

- **INV-20 — Public-surface parity.**
  **S:** No ADM1a slice changes any public URL, DOM output, metadata value, robots output, or visual rendering of the six `(public)` routes.
  **R:** Preserve the current public website (quality requirement); SHELL0 parity precedent.
  **E:** Slice scope (net-new `(admin)`/`lib` paths only) + parity gate.
  **V:** Route-manifest diff + public-route DOM/metadata parity checks per slice (§20).
  **F:** STOP; revert the offending change.

- **INV-21 — Throttled authentication attempts.**
  **S:** OTP request and verification attempts are rate-limited (provider OTP rate limits, confirmed as configured when live Auth exists at G2+) and every failed attempt is logged (event/subject/outcome only — INV-19 discipline); repeated failures trigger backoff/lockout behavior on the app path; limits never widen on configuration absence.
  **R:** ADM0 §8 and §17 #13 assign brute-force/OTP-guessing a concrete control in this phase (T16).
  **E:** Auth flow code in `lib/admin/**` (attempt logging + backoff UX) + provider rate-limit configuration (G2+).
  **V:** Deterministic small-N test: a handful of consecutive failed attempts produce logged events and the backoff/lockout response (no high-volume testing); provider rate-limit configuration checked as part of the G2+ live matrix (BLOCKED until then).
  **F:** Attempts denied with the same generic response (INV-18); never a bypass path.

- **INV-22 — Safe redirect targets.** *(Added by Opus review, 2026-07-16.)*
  **S:** Any post-authentication or post-session-expiry redirect target must be server-validated, relative, same-origin, and matched against `^/admin(/|$)` before use. Absolute URLs, protocol-relative `//host` forms, backslash variants (e.g. `/\evil.com`), encoded-traversal forms, and any other malformed input are rejected outright.
  **R:** A "preserve the intended path" redirect (as described in §10 and §12) is a classic open-redirect vector if the destination is trusted from client input; this invariant makes that impossible by construction.
  **E:** Redirect-target validation in `lib/admin/**` (login/session-guard code), applied at every point in this pack that redirects "preserving the intended path" (§10 Expiration; §12 protected-route contract).
  **V:** Negative test suite: absolute URL rejected, protocol-relative `//host` rejected, backslash variant rejected, encoded-traversal variant rejected, malformed input rejected — each falls back to the default `/admin` destination. Implementation ownership: **Slice S3** (§19).
  **F:** Discard the untrusted input; redirect to `/admin` (the safe default); never log the raw unsafe value (INV-19 discipline extends here).

- **INV-23 — Dependency integrity.** *(Added by Opus review, 2026-07-16.)*
  **S:** Every new dependency this pack's slices introduce (`@supabase/ssr`, its companion Supabase client package, and the minimal test runner) is added with exact version pinning consistent with the repository's existing convention, a scoped lockfile diff limited to the approved additions, and reviewed as a direct addition; any unexplained transitive dependency addition is merge-blocking, not a warning.
  **R:** ADM0/SHELL0 precedent treats the dependency surface as reviewed, not incidental; T11 (dependency/configuration failure) needs a concrete, testable control, not just a threat-model mention.
  **E:** `package.json`/lockfile review as part of each slice's PR (S1 introduces the test runner and its review discipline; S2/S3 introduce `@supabase/ssr` and its client dependency under the same discipline).
  **V:** Dependency-audit evidence attached to the introducing PR; exact-pin verification (no unpinned ranges); lockfile diff contains only the approved package(s) and their required transitive set, with anything extra flagged and explained or removed.
  **F:** An unexplained or unpinned addition blocks the merge; the slice is not mergeable until the lockfile diff is scoped to exactly what was approved.

- **INV-24 — Origin-checked mutations.** *(Added by Opus review, 2026-07-16.)*
  **S:** Every state-changing admin request — OTP request, OTP verification, logout, and any future server action or route handler — rejects cross-origin requests; no admin mutation is reachable through a simple cross-site form POST.
  **R:** The OTP request/verify/logout flows are this pack's first state-changing authenticated surface; T13 (session fixation/CSRF-class forgery) names cookie flags as a control, but origin-checking on the mutation itself is a distinct, independently necessary control — hence its own invariant rather than folding silently into INV-4.
  **E:** Origin/Referer validation (or Server Actions' built-in origin check, confirmed rather than assumed) in `lib/admin/**` for OTP request, OTP verify, and logout; the same check applies to any server action or route handler added by later slices.
  **V:** Cross-origin state-changing POST test against OTP request, OTP verify, and logout — each must be rejected. Implementation ownership: **Slice S3** (§19).
  **F:** Reject with a generic error (INV-18 discipline); log the outcome without token/secret material (INV-19); never process the mutation.

---

## 8 · Architecture Boundary

Post-SHELL0 topology (confirmed against the repo tree and `docs/OWNERSHIP.md` §2.1), and what ADM1a adds:

```text
app/layout.tsx              MINIMAL ROOT (SHELL0) — html/body, lang, fonts, globals.css, metadataBase, children.
                            ADM1a NEVER edits this file.
app/(public)/layout.tsx     PUBLIC STOREFRONT SHELL — SkipLink/Header/Footer + amarillo.css + storefront metadata.
                            ADM1a NEVER edits this file or anything under (public).
app/(admin)/layout.tsx      TODAY: inert children passthrough (SHELL0 seam).
                            ADM1a (authorized): becomes the server-side protection boundary —
                            force-dynamic, noindex, session guard, admin a11y foundation, minimal landmarks.
app/(admin)/admin/login/page.tsx   ADM1a (authorized): serves URL /admin/login — the only
                            unauthenticated admin surface (login).
app/(admin)/admin/page.tsx  ADM1a (authorized): serves URL /admin — minimal read-only authenticated
                            shell, the placeholder proving route/session protection. Nothing writable.
middleware.ts               DOES NOT EXIST TODAY. ADM1a (authorized) CREATES it with only the
                            /admin/:path* matcher, for redirect UX only (OD-3: Violeta approval required —
                            middleware.ts is a SHARED file per ADM0 §21).
lib/admin/**                ADM1a (authorized): auth, session, role guards — import 'server-only'.
lib/cms/**                  ADM1a (authorized): frozen read interface (read.ts §20.1 ADM0) — import 'server-only'.
supabase/migrations/**      ADM1a (authorized): migration FILES only (scope per OD-2); nothing applied.
```

**Route-group URL note (documentary correction of ADM0 §21 — flagged for Opus reconciliation).** Route groups are **URL-invisible** (SHELL0 §6; ADM0 §6.3): a `page.tsx` directly under `app/(admin)/` would serve `/` — a duplicate-route collision with `app/(public)/page.tsx` that fails `next build` — and `app/(admin)/login/page.tsx` would serve top-level `/login`, not `/admin/login`. A real `admin/` URL segment must therefore exist **inside** the group (as shown above): `app/(admin)/admin/page.tsx → /admin`, `app/(admin)/admin/login/page.tsx → /admin/login`, all still composing through the SHELL0 `app/(admin)/layout.tsx` seam. ADM0 §21’s file tree (`(admin)/login/page.tsx`, `(admin)/page.tsx` alongside a `/admin/:path*` matcher) contains this same path↔URL mismatch; this pack corrects it rather than re-inheriting it, and Opus review must confirm the correction (it changes no ADM0 *decision* — only the file paths that realize the ADM0 §16.1 URL map).

Boundary rules (all inherited from ADM0/SHELL0 and preserved):

- **Minimal root stays minimal.** The root layout is SHARED (Violeta); ADM1a does not touch it. Sibling route groups do not share layouts, so `(admin)` can never inherit the public shell — this is the structural guarantee SHELL0 shipped and ADM1a builds on.
- **No public-shell inheritance.** `(admin)` imports neither `styles/amarillo.css` nor any `components/layout/**` storefront component. Admin inherits only the true global foundation (tokens + Tailwind + body base + fonts) from root.
- **Server-side protection boundary.** The authorization decision lives in the `(admin)` layout and per-action guards (server components/actions), not in the middleware, not in client state (INV-3).
- **Separation from the operational system.** The admin/CMS code paths hold zero operational Olivia/CRM credentials or clients (INV-17). The CMS store, when it exists (G2), is a physically separate Supabase project (ADM0 Decision 2 / D1 conditions).
- **Single seam outward.** `lib/cms/read.ts` (ADM-owned, frozen signatures per ADM0 §20.1) is the only cross-terminal seam Verde will later consume; ADM1a defines it and does not modify anything Verde owns.

---

## 9 · Identity and Invitation Model (proposed lifecycle — no users created by this pack)

Invite-only lifecycle per ADM0 §8, made explicit end-to-end. All state lives in `admin_users` (`status ∈ {'invited','active','revoked'}`); no state transition is client-decidable.

1. **Owner bootstrap** — the first Owner row is created by the §16 ceremony (never by invitation, never from a browser). Until it runs (at G2+), no admin account exists at all and every admin request denies (INV-1).
2. **Invitation issuance** — Owner-only server action creates an `admin_users` row (`status='invited'`, role, `company_id`, `invited_by`) for an explicit email. No email outside `admin_users` can ever authenticate into an authorized session (INV-2).
3. **Invitation expiry** — an `invited` row that is not activated within a fixed window (recommended default: 7 days — §24 RD-4) is treated as expired: activation denies until the Owner re-issues. Expiry is evaluated server-side from the invited row’s existing `created_at` (ADM0 §10.1 column — no schema addition); if review prefers a dedicated `invited_at timestamptz`, that is an explicit, reviewer-approved delta to the ADM0 §10.1 schema recorded under RD-4, never silent drift.
4. **One-time acceptance** — the invitee signs in via email OTP; on first successful verified sign-in matching the invited email, the server transitions `invited → active` exactly once and records the transition. Re-acceptance attempts are no-ops.
5. **Account activation** — `active` status + verified session = member (`is_member()` true). All role capabilities derive from this row (INV-6).
6. **Disabled-account handling** — Owner sets `status='revoked'`. The subject’s next request is denied regardless of session validity (INV-13); UI shows a generic “sin acceso” state, not a reason (INV-18).
7. **Recovery path** — email OTP *is* the recovery path (nothing to reset); recovery works only for `active` allowlisted emails. If optional passwords are ever enabled (ADM0 allows), standard reset is limited to allowlisted emails and remains non-enumerating.
8. **Invitation revocation** — Owner revokes an un-accepted invitation (row → `revoked` or deleted); a later OTP sign-in by that email yields no authorized session.
9. **No user enumeration** — every request in this lifecycle (invite acceptance, OTP request, recovery) returns uniform generic responses regardless of row existence/state (INV-18).

**This pack creates no user, sends no invitation, and configures no Auth.** The lifecycle above is a contract for the authorized implementation, with all live steps blocked on Gate G2.

---

## 10 · Session Architecture

Per ADM0 Decision 3 / §8, no secret values anywhere in this section (or this document):

- **Server-side session validation.** Cookie-based sessions via `@supabase/ssr`. Every admin page render, server action, and route handler calls the server-side verification (`getUser()`-equivalent) and re-derives membership — never trusts a decoded cookie or client assertion (INV-3).
- **Cookie requirements.** `httpOnly`, `Secure`, `SameSite=Lax` (or stricter) on all session cookies; no token in `localStorage`/URL (INV-4). Cookie names must not collide with any public-surface cookie (none exist today).
- **Rotation/refresh.** Tokens rotate on login per the auth provider’s standard behavior; silent refresh only while the refresh token is valid and the membership row is active. Refresh never bypasses the membership re-check.
- **Expiration.** Recommended defaults (§24 RD-5): provider-default access-token lifetime; absolute session cap ≈ 7 days without re-authentication. Expired session → redirect to `/admin/login` preserving the intended path **subject to INV-22** (the preserved path must be server-validated, relative, same-origin, and match `^/admin(/|$)`, or the redirect falls back to `/admin`); server actions return an auth error rather than redirecting (§12).
- **Invalidation & logout.** Logout is a server action: clears session cookies and revokes the refresh token, then redirects to `/admin/login`. Server-side revocation, not just cookie deletion.
- **Behavior after role removal / disablement.** A revoked or role-changed user is re-evaluated on every request (INV-13); a role downgrade takes effect on the next request without waiting for expiry.
- **Preview/Production separation.** Auth callback/redirect URLs, cookie domains, and every secret are environment-specific; Preview sessions can never validate against Production config or vice versa (INV-15). The per-environment callback URL list is part of the §13 env contract (names/URLs recorded at implementation time; no secrets).
- **No hardcoded secrets.** No secret value appears in code, tests, fixtures, docs, or this pack; configuration is by environment variable names only (§13).

---

## 11 · Authorization and Roles

Minimum roles justified by ADM0 Decision 4 — exactly three, no invented enterprise RBAC:

| Role | Capabilities (ADM1a horizon) | Prohibited (always, until a later gate grants otherwise) | Server-side enforcement point | Future audit expectation |
|---|---|---|---|---|
| **Owner** (Juanpa) | Authenticate; view the read-only admin shell; (post-G2/G3) invite/revoke users, assign roles, run/verify bootstrap | Editing content (ADM1b+); touching operational systems (never); self-demotion safeguards per review | `(admin)` layout guard + Owner-only server actions with field allowlists + RLS (files) | Every user-management action (invite/role change/revoke) emits an audit event (§17) |
| **Editor** (Mónica) | Authenticate; view the read-only admin shell | All user management; all content writes (ADM1b+); publish (ADM1b+, D4 default: Editor may publish **when that surface exists**) | Same guard; role assertion denies Owner-only actions | Every future content/publish action audits (§17) |
| **Reviewer** (future) | Authenticate; view the read-only admin shell | Any write of any kind; publish; user management | Same guard; write actions assert role ∈ {owner, editor} | Read access itself is not audited; any attempted write is |

Rules: fail-closed — any capability not explicitly granted is denied (ADM0 §4). Role checks happen server-side per request (INV-3/INV-6); UI hiding is presentation only. ADM1a ships **no writable capability for any role** — the matrix above exists so the guard code and RLS files encode the correct shape from day one, and so ADM1b inherits an already-reviewed model. D4 (Editor publish autonomy) stays an ADM0 open decision with its recommended default; nothing in ADM1a forecloses it (§24).

---

## 12 · Protected Route Contract

Expected behavior once ADM1a is implemented (testable matrix — §20 executes it):

| Request state | Admin **page** (e.g. `/admin`) | Admin **server action / API** | Notes |
|---|---|---|---|
| Unauthenticated | Redirect to `/admin/login` (via middleware UX + server guard) | 401/403 JSON error; **no redirect**, no HTML | Never render any admin data pre-verification |
| Invalid session (malformed/unverifiable cookie) | Treated exactly as unauthenticated; invalid cookie cleared | 401/403 | No distinction leaked between “invalid” and “absent” |
| Expired session | Redirect to `/admin/login` (intended path preserved **subject to INV-22** — validated relative same-origin `/admin/**` only, else default `/admin`) | 401/403 with an auth-expired code | Silent refresh first if refresh token valid **and** membership active |
| Disabled/revoked user | Deny (generic); session invalidated server-side | 403 | INV-13; no reason disclosed (INV-18) |
| Wrong role for the action | Page renders only role-appropriate content; role-gated action denied | 403 | Server-side role assertion; UI hiding is never the control |
| Authorized user | 200; read-only shell renders | Action executes (ADM1a: read-only/no-op surface only) | Every render/action re-verified (INV-3) |
| Direct URL navigation to a deep admin path | Same as the matching row above — protection is per-request, not per-entry-point | — | No “already past login” bypass |
| Missing security configuration (env absent) | Deny (INV-1) with operator-visible config error | Deny | Fail closed, never fail open |
| Static asset / public route | **Unaffected** — no auth check applied to `(public)` routes, `robots.txt`, `sitemap.xml`, favicon, `_next` assets | — | INV-20 parity; middleware matcher scoped to `/admin/:path*` only |
| `/admin/login` | Reachable unauthenticated (the only such admin surface); non-enumerating; `noindex` | — | INV-16, INV-18 |

---

## 13 · Secrets and Environment Contract

Secret **categories and placement rules only — no values, and no values may ever be added to this document or any Obsidian note** (gate-register global rule). Names below are proposed conventions (§24 RD-6).

| Category (example env name) | Server-only | Public/non-secret | Preview-only | Production-only | Forbidden in browser | Forbidden in Obsidian (value) | Forbidden in logs |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| CMS Supabase URL (`CMS_SUPABASE_URL`) | ✅ (server env; not `NEXT_PUBLIC_*` unless Opus review explicitly reclassifies for Auth) | ⚠️ URL itself is low-sensitivity but kept server-side by default | per-env value | per-env value | ✅ default | value: ✅ (record name only) | — |
| CMS anon/publishable key (`CMS_SUPABASE_ANON_KEY`) | ✅ by default — ADM0 §11.3 #9: if browser Auth requires it, that exception is documented as **Auth-only** (no content reads from the browser, ever) | ⚠️ designed-public class, but exposure is a deliberate reviewed decision, not a default | per-env | per-env | default ✅ (exception only via documented Auth-only decision) | value: ✅ | ✅ |
| CMS service-role key (`CMS_SUPABASE_SERVICE_ROLE_KEY`) | ✅ strictly | ❌ never | per-env | per-env | ✅ **absolute** | ✅ **absolute** | ✅ **absolute** |
| Least-privilege published-read credential (`CMS_READ_KEY` — ADM0 §11.3 #6) | ✅ strictly | ❌ | per-env | per-env | ✅ | ✅ | ✅ |
| Owner-bootstrap gate value (`ADM_BOOTSTRAP_TOKEN` or equivalent one-time env) | ✅ strictly; exists only for the single bootstrap execution window, then removed | ❌ | set only in the environment where bootstrap is authorized to run | see §16 | ✅ | ✅ | ✅ |
| Auth callback/redirect URLs (config, not secret) | server config | ✅ non-secret | Preview URLs only in Preview | Production URLs only in Production | n/a | names/URLs OK | OK |
| `NEXT_PUBLIC_SITE_URL` (existing, F0) | — | ✅ non-secret | per-env | per-env | intended for browser | OK | OK |
| Session cookies | issued to browser as httpOnly | — | env-scoped | env-scoped | script-read ✅ forbidden (httpOnly) | ✅ | values ✅ |
| **Operational Olivia/CRM Supabase credentials (any)** | ❌ **forbidden in this repo and its Vercel project entirely** | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |

Rules: (1) nothing secret in `NEXT_PUBLIC_*` (INV-5); (2) missing env → deny (INV-1), never a baked-in fallback; (3) Preview and Production sets are disjoint (INV-15); (4) the implementation records an **inventory of variable names per environment** as evidence — names only, never values; (5) no env var is actually created on any live system by this pack, and none may be created by a slice unless that slice’s scope explicitly includes env wiring (§19).

---

## 14 · Supabase CMS Separation Contract

Preserving ADM0 Decision 2 and D1 (`D1_RECOMMEND_APPROVE_WITH_CONDITIONS`) verbatim, reconciled with Gate G2:

- **Dedicated CMS project.** Website editorial content, admin identity, audit, and (later) media live in a **new, dedicated “Hilitos Site CMS” Supabase project**. It does not exist today and **is not created by ADM1a or by the ADM1a GO** — creation is **Gate G2** (`HILITOS-CMS0-PROJECT-FOUNDATION`), with its own Mission Pack, review, and its own explicit literal Juanpa GO.
- **No reuse of the operational Supabase.** The Hilitos/Olivia operational project is never the CMS store, never queried live from admin/public pages, and its credentials never enter this repo or its Vercel project (INV-17; two-plane no-bridge doctrine; operational DB is PITR-off/read-only by standing rule).
- **Project ownership.** The CMS project is owned by Juanpa’s organization account; ownership, billing, and region are recorded at G2 (register requirement) — documented by reference, never with secret values.
- **Recovery ownership.** Account-recovery capability for the CMS project (org owner access) is Juanpa’s; documented at G2 alongside a decommission procedure.
- **Environment model.** One project serving Preview + (much later) Production is the ADM0-era assumption, but the Preview/Production environment model is an explicit G2 deliverable — ADM1a only *requires* that whatever model G2 picks satisfies INV-15 (disjoint secrets/callbacks) and provides a non-production verification surface (§24 OD-1).
- **Migration source of truth.** All future schema, grants, policies, and Storage configuration exist as versioned, reviewed migration files in the repository; the live project state must be reproducible from migrations alone (G3 exit criterion). **No dashboard-only schema** — any manual dashboard change is a defect to be reconciled back into migrations (mandatory principle 8).
- **Creation is a separately authorized gate.** Restating ADM0 D1 conditions: separate credentials from operational; no shared service-role key; no browser access to operational; migrations authored as files before apply; project creation and migration apply each require a separate explicit Owner-authorized action; backup/PITR posture documented before real content enters.

---

## 15 · RLS and Grants Architecture (planning only — no SQL written or applied by this pack)

- **Default-deny posture.** Every CMS table: RLS enabled, deny-by-default, no policy = no access (INV-8). Apply **FORCE RLS** (table owner also constrained) where applicable — the G3 register lists FORCE RLS verification as evidence; ADM1a’s migration files must be written with that target.
- **Role-to-table access expectations.** The ADM0 §9.2 policy matrix is adopted verbatim as the target (anon: only `public_site_*` published views, and only via the server-side read path; Editor: company-scoped S/I/U on editorial drafts; Reviewer: SELECT only; Owner: full within own company; service role: server-only, post-authZ, minimized). ADM1a implements the **identity subset** (`admin_users` + helpers + audit) per OD-2; content-table policies follow the same construction rules whenever they are authored.
- **Server/service boundaries.** The service role bypasses RLS by design, so it is confined to `import 'server-only'` modules and used only after explicit `assertRole()/assertCompany()` app-layer checks (ADM0 §9.1). RLS is the backstop for anon/authenticated keys; the app layer is the gate for the privileged path.
- **Direct browser access assumptions.** None. Browser code never reads CMS content with any key (ADM0 §11.3 #2); if browser Auth needs the anon key, that key is documented as Auth-only with no readable content surface (§13).
- **Drafts vs. published.** Draft columns and base tables: no anon path, ever. Published data: exposed only as `published_snapshot`-derived allowlisted view columns (INV-9). The distinction is structural (separate views/columns), not conditional logic in app code.
- **Service-role constraints.** Minimized on the audit path (prefer a dedicated inserts-only role for audit appends — ADM0 S-M1); never in the browser; never the operational project’s key (INV-5, INV-17).
- **`security_invoker` discipline.** Every `public_site_*` view states explicitly whether `security_invoker` is true or false and why (ADM0 §11.3 #5 recommends `true` + a least-privilege read role granted only the view).
- **Parameterized queries only.** All database access in `lib/admin/**` and `lib/cms/**` uses parameterized Supabase client calls / prepared statements; no raw, string-interpolated SQL in application code (ADM0 §9.1, §17 #23 — verified by §20 check 18).
- **Required future tests** (authored in ADM1a as the §20 harness; fully executed against live infra at G3): anon/editor/reviewer/owner/cross-tenant matrices; no-self-escalation; recursive-RLS on `admin_users`; PostgREST exposure; audit UPDATE/DELETE denial; never-exposed-column absence via contract Zod `.strict()`; two-user isolation (G3 register).

---

## 16 · Owner Bootstrap (safe, one-time, auditable ceremony)

The invitation flow presupposes an Owner, so the first Owner cannot be invited (ADM0 S-H1). **OD-4 is RESOLVED** (Opus review, 2026-07-16): **one-time env-gated server-side bootstrap artifact plus migration-backed constraints; no routine dashboard-manual fallback.** The ceremony is split into two explicitly separate parts so that "proving it works" and "actually creating the real Owner" are never conflated:

### 16.A · Design-time rehearsal (ADM1a scope, under OD-1's disposable local stack)

Everything ADM1a itself is authorized to do:

1. **Artifact:** author the migration or controlled server-side script, committed as a reviewed file, that would insert a single Owner `admin_users` row bound to a verified auth identity (auth user id/email verified at execution time — no placeholder identity in the design).
2. **Rehearsal environment:** exercised **only** against the OD-1 disposable local Supabase stack (§24 OD-1) — never a cloud project. A **throwaway `example.com`-class identity** stands in for the real Owner during rehearsal; no real Juanpa or Mónica email is used, and no real invitation is sent.
3. **Idempotency proof:** re-running the artifact against the local stack is a provable no-op (unique constraint on the Owner identity + explicit existence check), verified by a double-run test.
4. **Non-browser-invokability proof:** static review confirms no route, server action reachable by HTTP, or public endpoint can trigger the artifact.
5. **No cloud state:** the rehearsal creates nothing on any live/cloud system; the local disposable stack is destroyed after evidence capture (per OD-1).
6. **No real Owner created:** §16.A produces evidence that the mechanism is safe — it does not, and cannot, create the actual first Owner.

**§16.A is what "owner-bootstrap idempotency proof" means everywhere this pack references it (§20 check 8, Gate G1's evidence, INV-12's verification method).** Gate G1's exit criteria are satisfied by §16.A alone; §16.B is explicitly out of G1's scope.

### 16.B · Live execution (Gate G2+ territory — not authorized by this pack or its GO)

1. **Preconditions:** a real CMS project exists (**Gate G2 has passed**, with its own literal GO), and the executing identity is Juanpa's actually-verified auth identity — not a rehearsal stand-in.
2. **One-time environment gate:** an explicit gate value (e.g. a one-time `ADM_BOOTSTRAP_TOKEN`-class env var) is set **only** for the execution window of the real ceremony, then **removed immediately afterward**; the script refuses to run when the gate is absent, and a follow-up check confirms no re-execution path remains.
3. **Authorization:** live execution requires **G2's own separate literal GO** — the ADM1a GO (`JUANPA GO: HILITOS-ADM1A-SECURITY-FOUNDATION`) does not authorize this step (§26.1).
4. **Durable audit:** execution writes a durable record (audit row and/or migration history) with actor, timestamp, and outcome — no secrets.
5. **Explicitly avoided, always:** committed default passwords (none — OTP model has no password); public signup (disabled); reusable bootstrap tokens (single-window env gate only); plaintext credential storage (nothing to store); undocumented manual access (any dashboard-manual fallback must itself be documented, logged, and reconciled — and is discouraged; OD-4 explicitly rejects a *routine* dashboard-manual path).

**This pack performs neither §16.A nor §16.B by itself. §16.A is authored and rehearsed only if and when the §26 authorization chain issues the ADM1a GO (Slice S4, §19); §16.B never happens under this pack's GO at all — it is Gate G2+'s own action.**

---

## 17 · Audit Boundary (defined now, implemented at their own gates)

Actions that **must** create a durable audit event (actor id, action, entity, timestamp; before/after values where applicable — field values and media ids only, never file bytes, never secrets — ADM0 S-L2) when their implementing gate arrives:

| Action class | Examples | Gate where it becomes recordable |
|---|---|---|
| Identity/user management | owner bootstrap execution; invitation issued/revoked; role assigned/changed; status change (activate/revoke) | G2/G3 (live `admin_users` + `site_change_log`) |
| Session-security events | login success; logout; denied privileged action (role mismatch) | G3 (structured log at minimum; audit-table linkage reviewed at G3) |
| Content lifecycle (future) | create/update/archive/revert of any editorial entity; media upload/promotion/deletion | ADM1b/ADM2 (G3–G6) |
| Publication (future) | publish/republish/batch publish; rollback re-publish; revalidation re-sync | ADM1b/ADM2 (G7) |
| Out-of-band operations | any service-role/dashboard intervention on CMS data | Always documented manually + reconciled (S-M1 trust boundary) |

The substrate (`site_change_log` append-only for app roles + `site_publications`) is authored as migration files in ADM1a (per OD-2 scope) and proven live at G3. ADM1a itself creates **no recordable actions** beyond (eventually) bootstrap/login events — but the boundary above is frozen now so no later gate ships a security-sensitive action without its audit event.

---

## 18 · Admin Accessibility Foundation (resolves SHELL0 follow-up F1)

**Problem (from SHELL0 §9/§14/§34-F1):** `:focus-visible` styling and the `prefers-reduced-motion` reset live in public-only `styles/amarillo.css`, which `(admin)` deliberately does not inherit. Without action, the admin surface would ship with no focus indicator and no reduced-motion handling.

**Resolution (proposed):** an **independent admin accessibility foundation** — a small admin-owned stylesheet (e.g. `app/(admin)/admin.css` or `styles/admin.css`, imported only by `app/(admin)/layout.tsx`) plus layout semantics. **No extraction or refactor of `amarillo.css`** — a shared-a11y-base extraction would touch Amarillo-owned files and requires its own separately reviewed proposal (per F1’s own wording); ADM1a does not do it (§24 RD-3).

Foundation requirements (all verifiable in §20):

- **Visible focus:** a clear `:focus-visible` indicator on every interactive element, meeting contrast expectations, on the login page and read-only shell.
- **Keyboard operation:** every ADM1a surface (login form, shell navigation, logout) fully operable by keyboard alone; logical tab order; no traps.
- **Reduced motion:** a `prefers-reduced-motion` block covering any admin transition/animation (ADM1a should ship essentially none).
- **Semantic landmarks:** admin pages render proper landmarks (`<main>`, `<nav>` where applicable, one `<h1>` per page). The admin `<main>` does **not** reuse the public `id="contenido"` contract — that id belongs to the public SkipLink seam; admin defines its own skip target if/when admin chrome grows (recommended: `id="admin-contenido"` decided at implementation review).
- **Labels and error association:** every input labeled (`<label for>`/`aria-labelledby`); auth errors programmatically associated (`aria-describedby`); status changes announced (`aria-live="polite"` on login state).
- **Accessible auth states:** loading, error, denied, and expired-session states are perceivable without color alone and announced to assistive tech; generic wording (INV-18) still applies.
- **Mobile behavior:** login and shell usable at 360–390 px, single column, ≥44 px tap targets (Mónica arrives from WhatsApp on mobile — ADM0 A-3).

---

## 19 · Proposed Implementation Slices (none authorized; prefer small and reversible)

Common to every slice: isolated worktree; branch off `redesign/main` (verify head; STOP on unexpected baseline); PR into `redesign/main`; no force-push; no deploy beyond the automatic PR Preview; evidence attached to the PR; public-parity check (INV-20); isolation confirmation (INV-17). **A slice may not begin before the one it depends on has merged**, except where noted as parallel-safe.

| Slice | Purpose | Proposed branch | Allowed files | Prohibited files | Tests / evidence | Rollback | Depends on | Separate infra GO? |
|---|---|---|---|---|---|---|---|---|
| **ADM1a-S1 — Admin boundary + a11y foundation + verification-runner introduction** | Harden `app/(admin)/layout.tsx` (force-dynamic, noindex, semantic shell) + admin a11y base (§18). Still no page → no route. **(Opus review addition)** This slice also introduces the minimal test runner (moved here from S6 — the runner is scaffolding the whole ADM1a effort depends on, not a late-stage add-on), performs the exact-pin dependency and lockfile review for it (INV-23), and takes ownership of committing this Mission Pack's own repository copy at `docs/mission-packs/HILITOS_ADM1A_SECURITY_FOUNDATION_2026-07-16.md` (the `recommended_repo_path`, §1 frontmatter). | `redesign/adm/adm1a-s1-admin-boundary-a11y` | `app/(admin)/layout.tsx`, new `app/(admin)/admin.css` (or `styles/admin.css`), `docs/OWNERSHIP.md` (ownership note), new minimal test-runner config + `package.json`/lockfile diff scoped to it, `docs/mission-packs/HILITOS_ADM1A_SECURITY_FOUNDATION_2026-07-16.md` (repo copy of this approved pack) | Everything under `app/(public)`, root layout, `components/**`, `styles/amarillo.css`, `styles/tokens.css`, frozen contracts | Build/lint/typecheck/fixture-lint green; route manifest still shows no `(admin)` route; public parity; **dependency-audit evidence for the test runner (INV-23): exact pin, scoped lockfile diff, no unexplained transitive additions** | Revert the slice PR merge commit | — | No |
| **ADM1a-S2 — Protected route skeleton (fail-closed)** | Create `middleware.ts` and the login/shell page skeleton behind the guard. **(Opus review: all OD-3 middleware limits recorded explicitly.)** Exact matcher: `/admin/:path*` only — implementation must confirm this matches `/admin` itself, not only its subpaths. The middleware performs **cookie-presence redirect UX only**: no token validation, no session decoding, no database query, and no role or authorization decision of any kind (those remain server-side per INV-3). It has zero effect on `(public)` routes, `_next` assets, static assets, `robots.txt`, `sitemap.xml`, or the favicon. **Any redirect destination the middleware or the guard computes must comply with INV-22** (server-validated, relative, same-origin, `^/admin(/|$)` only). Because `middleware.ts` is a SHARED file (ADM0 §21), **Violeta's approval of this file must be recorded in the future S2 PR before merge** — this is a merge precondition, not optional. | `redesign/adm/adm1a-s2-protected-routes` | `middleware.ts` (new), `lib/admin/**` (new), `app/(admin)/admin/login/page.tsx` (→ `/admin/login`), `app/(admin)/admin/page.tsx` (→ `/admin`) | All frozen/public/Verde paths; `package.json` **only** for `@supabase/ssr`+client dep addition if approved in-slice (explicit reviewer sign-off; lockfile change scoped to it; INV-23 dependency-audit evidence required) | §12 matrix subset: unauthenticated/config-absent paths all deny; middleware scope test (public routes, `_next`, static assets, `robots.txt`, `sitemap.xml`, favicon all unaffected); matcher-includes-`/admin`-itself test; bundle-leak scan; **Violeta/shared-file approval recorded in the PR** | Revert PR; deleting `middleware.ts` restores today’s topology | S1 | No |
| **ADM1a-S3 — Auth wiring (invite-only OTP, sessions, logout) + redirect and origin safety** | Implement the §9/§10 flows in code: OTP request/verify, cookie sessions, `getUser()` guard integration, logout+revocation, non-enumeration. Fail-closed without env. **This slice owns INV-22 and INV-24**: the open-redirect negative tests (absolute/protocol-relative/backslash/encoded-traversal rejection, default-`/admin` fallback) and the cross-origin mutation tests (OTP request, OTP verify, logout each reject cross-origin state-changing POSTs), in addition to the session/auth tests already in scope. | `redesign/adm/adm1a-s3-auth-sessions` | `lib/admin/**`, `app/(admin)/admin/login/**`, `app/(admin)/admin/page.tsx` | Same prohibitions as S2 | Session-state tests (§20) — executed against the OD-1 verification environment; cookie-flag assertions; enumeration-equivalence test; **INV-22 open-redirect negative-test suite**; **INV-24 cross-origin state-changing-POST rejection tests** | Revert PR; guard falls back to S2 deny-all | S2 + **OD-1 resolved (RESOLVED: disposable local Supabase stack — §24 OD-1)** | No cloud resource — OD-1 is resolved to a local disposable stack only; no separate infra GO needed for S3 itself |
| **ADM1a-S4 — Identity/security-core migration files + bootstrap rehearsal** | **(Opus review: scope narrowed under OD-2(a), authorized departure from ADM0 §22.)** Author migration **files** scoped to the **identity/security core only**: `admin_users`, SECURITY DEFINER helpers (pinned `search_path`), deny-by-default identity-core RLS posture, `site_change_log`/`site_publications` append-only audit contract. This slice also **owns the §16.A owner-bootstrap design-time rehearsal** (local disposable stack only, throwaway identity, idempotency + non-browser-invokability proof). **Explicitly stated:** the editorial-table schema, the actual `public_site_*` view DDL, Storage policies, and M0 seed authoring **all defer to Gate G3** (they are not authored here, not even as files); **live bootstrap execution is §16.B, Gate G2+ territory** (not this slice); **no SQL is applied to any cloud resource** by this slice under any circumstance. | `redesign/adm/adm1a-s4-migration-files` | `supabase/migrations/**` (identity/security-core files only — `admin_users`, helpers, identity-core RLS, `site_change_log`/`site_publications`, owner-bootstrap artifact), `docs/**` (schema notes) | Editorial-table migration files; `public_site_*` view DDL; Storage policy files; M0 seed files (all deferred to G3); any live application of SQL; any Supabase MCP/CLI action against a cloud project | Static SQL review checklist; migrations apply cleanly on the OD-1 disposable stack; identity-core RLS suite green there; **§16.A bootstrap double-run no-op proof** | Delete/revert files (nothing applied anywhere) | Parallel-safe after S1 | **Files: No.** Applying to any cloud project: **YES — G2/G3 gates.** Live bootstrap (§16.B): **YES — G2's own literal GO, never this pack's GO** |
| **ADM1a-S5 — Public-read security model (specification only) + frozen read interface** | **(Opus review: allowed files now conditional on OD-2(a).)** Author the public-read security *specification* only (allowlist model, publication predicate, `security_invoker` stance, grant/revoke model, least-privilege public-read role — documentation, not DDL) and implement `lib/cms/read.ts` with **all seven** frozen ADM0 §20.1 signatures + the three CMS-owned contracts (§4.1 item 9 / RD-9 — **CONFIRMED**): catalog functions fixture-backed; the three content functions return **typed empty or null-valued objects, never invented or placeholder content** (§4.1 item 9, corrected) — this is the **`not-yet-backed`** state (§24.2 RD-9; distinct from ADM0 §11.4's degraded/last-known-good fallback). No Verde file changes. Nothing consumes `lib/cms/read.ts` until Gate G7. | `redesign/adm/adm1a-s5-read-interface` | **Under OD-2(a): `lib/cms/**` (new) and `docs/**` security-model specification only.** | **View DDL and any editorial-schema migration file are NOT allowed in this slice** (moved to G3 per OD-2(a)); `lib/catalog/**`, `lib/fixture*.ts` (consumed, not edited), all Verde/Amarillo paths | Contract Zod `.strict()` validates read.ts output; signature-freeze check; **content-honesty test: `getPublicSiteSettings()` and every content function return no fabricated/non-null WhatsApp or contact value, ever**; not-yet-backed-vs-degraded-fallback distinction test; server-only import check | Revert PR; nothing consumes read.ts yet | S4 (identity shapes only, per OD-2(a)) | No |
| **ADM1a-S6 — Verification & evidence harness (completion, not introduction)** | **(Opus review: redefined — the runner itself now starts in S1.)** This slice **completes and assembles** the §20 test matrix as a runnable, cross-cutting harness: route protection, session states, roles, env fail-closed, bundle-leak, Preview isolation, accessibility smoke, public-route parity — plus the new INV-22/INV-23/INV-24 and content-honesty rows (§20/§7-G below). Produces an **explicit `BLOCKED — G2+` evidence register** for every check that cannot run without the live CMS project — never silently assumed passing. | `redesign/adm/adm1a-s6-verification-harness` | test/config files under `tests/adm1a/**` (runner itself already introduced in S1; this slice only adds test files) | Prod-facing config; any live-system mutation; introducing a *second* test runner (there is exactly one, from S1) | The harness itself runs green on everything runnable without cloud infra; explicit “blocked on G2” evidence register for the rest | Revert PR | S2–S5 | No |
| **ADM1a-S7 — Live verification (CONDITIONAL — not part of the base ADM1a GO)** | Execute migrations + bootstrap + full live test matrix against the real CMS project. **This is Gate G2/G3 territory** and is listed only to make the boundary explicit. Unchanged by this review pass — explicitly outside the base ADM1a GO. | (defined by the G2/G3 packs) | (G2/G3 scope) | — | (G2/G3 evidence) | Project pause/decommission per G2 rollback | G2 `CLOSED — GREEN` | **YES — always.** Requires the separate G2 literal GO |

---

## 20 · Test and Evidence Matrix

No offensive testing, no live-production testing, no high-volume testing — deterministic, authorized, scoped checks only. “Env” column: **local** = repo-only (no infra), **OD-1** = the §24 verification environment (recommended: disposable local Supabase stack), **G2+** = blocked until the CMS project exists.

| # | Check | What it proves | Env |
|---|---|---|---|
| 1 | Route-protection matrix (§12, every row) | Fail-closed boundary; middleware scope; deny semantics for pages vs. actions | local (config-absent rows) + OD-1 (session rows) |
| 2 | Session-state tests: valid, expired, refreshed, logged-out, revoked-mid-session | INV-3, INV-4, INV-13 | OD-1 |
| 3 | Role tests: Owner/Editor/Reviewer capability + prohibition matrix (§11); no-self-escalation | INV-6, INV-7 | OD-1 |
| 4 | Browser-secret checks: client-bundle scan for secret env names, server-only module identifiers, service-key material | INV-5 | local |
| 5 | Environment fail-closed checks: each required env var absent → deny; no cross-env fallback values | INV-1, INV-15 | local |
| 6 | Preview/Production isolation: per-env variable-name inventory (names only); callback URL separation documented; no Production value in Preview | INV-15 | local (documentary) + G2+ (live) |
| 7 | RLS suite (identity/security-core scope only, per OD-2(a)): admin_users/editor/reviewer/owner/cross-tenant on identity-core tables; recursive-RLS helpers; audit UPDATE/DELETE denial. **INV-9/INV-10 are specification-reviewed here, not proven** (no view DDL or editorial base tables exist yet under OD-2(a)) | INV-8, INV-11, INV-14 (identity-core); INV-9/INV-10 spec-review only | OD-1 (files applied to disposable stack) |
| 8 | Owner-bootstrap idempotency (double-run no-op) + non-browser-invokability review | INV-12 | OD-1 |
| 9 | Accessibility checks: keyboard-only login/logout walk; focus visibility; labels/error association; reduced-motion; 360–390 px | §18 foundation | local |
| 10 | Build/lint/unit: `npm run build`, `lint`, `typecheck`, `fixture-lint` green per slice | Baseline hygiene | local |
| 11 | Manual smoke: login page renders; deny states render; read-only shell renders for an authorized session | End-to-end sanity | OD-1 |
| 12 | No public route regression: route-manifest URL-set diff + DOM/metadata parity for the six `(public)` routes + `robots.txt` still `Disallow: /` + sitemap unchanged | INV-20 | local |
| 13 | No operational-system access: repo/env scan for operational Supabase refs/credentials → absent | INV-17 | local |
| 14 | Non-enumeration: response-equivalence across unknown/invited/active/revoked emails | INV-18 | OD-1 |
| 15 | Log hygiene: auth-flow logs contain no token/OTP/cookie values | INV-19 | OD-1 |
| 16 | Admin non-indexability: noindex metadata present; admin absent from sitemap; force-dynamic in build output | INV-16 | local |
| 17 | Auth-attempt throttling: small-N deterministic failed-attempt test → logged events + backoff/lockout response; provider OTP rate-limit configuration verified | INV-21 | OD-1 (app path) + **G2+ (provider config — BLOCKED until then)** |
| 18 | Parameterized-access check: static review/grep — no raw string-interpolated SQL anywhere in `lib/admin/**` or `lib/cms/**`; all DB access via parameterized client calls | ADM0 §9.1 / §17 #23 | local |
| 19 | **(Opus review addition) Open-redirect negative-test suite:** absolute URL rejected; protocol-relative `//host` rejected; backslash-variant (`/\evil.com`) rejected; encoded-traversal variant rejected; each falls back to the default `/admin` destination | INV-22 | OD-1 |
| 20 | **(Opus review addition) Dependency-integrity check:** dependency-audit evidence for every new dependency (test runner, `@supabase/ssr`, its client package); exact-pin verification (no unpinned ranges); lockfile diff limited to the approved additions, with any unexplained transitive addition flagged as merge-blocking | INV-23 | local |
| 21 | **(Opus review addition) Cross-origin mutation rejection:** a cross-origin state-changing POST against OTP request, OTP verification, and logout is rejected in every case | INV-24 | OD-1 |
| 22 | **(Opus review addition) Content-honesty check:** `getPublicSiteSettings()` (and every other content function in `lib/cms/read.ts`) returns no fabricated/non-null WhatsApp or contact value under ADM1a; no placeholder value is ever interpreted or logged as published content | §4.1 item 9 / RD-9 | local |
| 23 | **(Opus review addition) Role-scope check (G1 horizon):** Owner/Editor/Reviewer differences are proven **only at the policy/RLS-file level** (§11, §15) — no application capability distinguishes them yet, because ADM1a ships no writable UI; this is a specification-level check, not a live-capability test | §11 | local |
| 24 | **(Opus review addition) INV-9/INV-10 specification-vs-proof split:** confirm the review-level check for INV-9 (snapshot-only public projection) and INV-10 (non-exposed CMS schema) occurs at **G1** as a specification review only; confirm the actual editorial/view/PostgREST proof is explicitly deferred to and owned by **G3** | INV-9, INV-10 | local (G1 spec review); **BLOCKED — G3** (live proof) |

Evidence rule (per playbook + ADM0 §23): report exact commands and outputs; never claim an unrun check passed; checks blocked on G2 are listed as **BLOCKED**, not assumed.

---

## 21 · Rollback and Abort Conditions

1. **Per-slice rollback:** every slice merges via a normal PR merge commit; rollback = `git revert -m 1 <merge_sha>` of that slice, restoring the prior topology. Slices are ordered so reverting any suffix (S6→S1) leaves a coherent tree; S2’s revert (deleting `middleware.ts` + guard) restores today’s inert boundary exactly.
2. **Full ADM1a abort:** revert all merged ADM1a slice merge commits in reverse order; the repo returns to `4c49e019…` topology-equivalent state. No data rollback exists because ADM1a applies nothing to any live store.
3. **Loss-of-access recovery:** if the Owner is ever locked out post-bootstrap (G2+ scenario), recovery is via the CMS project’s org-owner capability (documented at G2) — an out-of-band, logged, reconciled intervention; never a hidden backdoor route in the app.
4. **Configuration mismatch:** if Preview env config is wrong/missing, the surface denies (INV-1) — the response is to fix env wiring, never to weaken the guard; a persistent mismatch is a STOP for the affected slice.
5. **Preview failure:** a failing PR Preview blocks that slice’s gate; no “verify on production instead” path exists (there is no production admin, and creating one is out of scope until far later gates).
6. **Accidental production interaction:** any accidental touch of `master`, GitHub Pages, DNS/CNAME, the operational Supabase, or a production env is an immediate **full stop**: freeze work, report to Juanpa with exact commands/outputs, and revert before anything else proceeds.
7. **Secret exposure response:** if any secret value is found in a bundle, log, commit, PR, or document: treat as compromised — stop, report immediately, remove from the artifact, and rotate the exposed credential via its owning platform (rotation is an owner-authorized action; the implementer reports and requests it, never silently rotates). Record the incident in the closeout.

---

## 22 · Production Isolation (restated, non-negotiable)

- `master` (@ `8ab791da…`) and `hilitos.co` (GitHub Pages) remain **untouched** by every ADM1a slice.
- **No DNS/CNAME changes** of any kind.
- **No robots/indexing changes:** public `robots.ts` stays fail-closed (`Disallow: /`); ADM1a only *adds* `noindex` on admin surfaces.
- **No Production secrets:** ADM1a creates no Production environment variables and holds no Production credentials; everything live-verifiable is Preview/disposable-stack scoped (per OD-1/G2).
- **No Supabase Production apply:** no migration, policy, user, bucket, or config is applied to any production system — and (until G2) there is no CMS project to apply anything to at all.
- **No production admin activation:** no admin surface is reachable on any production host; the Vercel line remains integration-only.

---

## 23 · Stop Conditions (for the future implementation agent)

STOP — cease work, revert to a clean tree, report to Juanpa with the specific condition — if any of the following holds:

1. **ADM0 conflict discovered** — implementing any part of this pack would contradict an ADM0 approved decision (Decisions 1–10, R1–R5, S-H/S-M items) — the pack must be corrected first, never worked around.
2. **Required architecture decision unresolved** — any §24 **blocking** decision (OD-1…OD-4) lacks an explicit Opus/Juanpa resolution at dispatch time.
3. **Repository baseline changed unexpectedly** — `redesign/main` head ≠ the SHA in the dispatch, working tree dirty, or the §3/§8 topology differs materially (e.g. `middleware.ts` already exists, `(admin)` routes exist).
4. **Secret values become visible** — any secret value appears anywhere (code, env dump, log, document): trigger §21.7 and stop the slice.
5. **Scope would require operational Supabase access** — any step needing an Olivia/CRM credential, query, or bridge.
6. **Work requires DNS or production changes** — anything touching `master`, Pages, DNS/CNAME, robots opening, or a production environment.
7. **Migration/project creation lacks explicit authorization** — any step would create a Supabase project/resource or apply SQL to a cloud project without the separate G2-class literal GO.
8. **A security invariant cannot be tested** — any INV-1…INV-24 has no executable or reviewable verification path in the current environment (and is not on the explicit BLOCKED-on-G2 list).
9. **Implementation exceeds the Mission Pack** — any file outside the slice’s allowed list enters the diff; any capability beyond “login + read-only shell” appears; any dependency beyond the explicitly approved ones is added.
10. **Frozen-contract pressure** — any step would require editing `lib/contract.ts`, the fixture, tokens, `(public)` files, or Verde-owned files.

---

## 24 · Open Decisions for Opus/Juanpa

### 24.1 Decisions — RESOLVED by independent Opus review, 2026-07-16

All four decisions below were **blocking/open** in the first draft. Each is now **RESOLVED**, dated, and attributed to the independent Opus review that returned `APPROVE_WITH_EDITS`. None reopens an ADM0 decision; each picks a specific, previously-open reading and records why.

| ID | Decision | Resolution (RESOLVED, Opus review, 2026-07-16) |
|---|---|---|
| **OD-1** | **Verification environment** for auth/session/RLS proofs, given the CMS project does not exist until G2 | **RESOLVED — adopt (a): disposable local Supabase stack, zero cloud resources.** Constraints: local CLI/Docker only; no `supabase link`; no `db push`; no remote project ref; **no Supabase MCP calls of any kind**; no cloud project created. Throwaway `example.com`-class identities only — no real Juanpa or Mónica email, no real invitation sent. The local stack is destroyed after evidence capture. Any check that cannot be proven this way (provider-level rate limits, live PostgREST exposure against a real project, etc.) stays **`BLOCKED — G2+`** and is never assumed to pass. **The future literal `JUANPA GO: HILITOS-ADM1A-SECURITY-FOUNDATION` must explicitly authorize local-stack verification; absent that, the implementer stops rather than assuming permission.** |
| **OD-2** | **G1 vs. G3 schema-authoring boundary** — ADM0 §22's older text put the full CMS schema/RLS/Storage migration *files* in ADM1a; the gate register (and ADM0's own newer cross-link) places "versioned migrations … draft/published-state model" authoring in **G3** (§4.2 records this as the third ADM0 inconsistency) | **RESOLVED — adopt option (a), classified as an `AUTHORIZED DEPARTURE FROM ADM0 §22`** (not a fresh architectural decision — see §4.2). Exact boundary: **ADM1a authors as files** — `admin_users`; identity/security-core constraints; `SECURITY DEFINER` helpers with pinned `search_path`; deny-by-default identity-core RLS posture; `site_change_log`; `site_publications`; the append-only audit contract; the owner-bootstrap artifact (§16.A). **ADM1a authors as documentation/specification only** — the `public_site_*` view model; the published-column allowlist; publication predicates; the `security_invoker` stance; the grant/revoke model; the least-privilege public-read role. **Moved to G3**: editorial tables; the actual `public_site_*` view DDL; Storage policies; M0 seed authoring; ADM0 §11.3 #10 PostgREST exposure verification; the ADM0 §22 proof that anon reads only allowlisted published views and cannot read base tables. **INV-9 and INV-10 are relabeled accordingly: specified at G1 — proven at G3.** |
| **OD-3** | **`middleware.ts` creation** — ADM0 assumed the file existed and ADM would "add only the `/admin` matcher"; SHELL0 confirmed it does not exist, so ADM1a must **create** a SHARED file | **RESOLVED — adopt creation of a minimal `middleware.ts`.** Constraints: exact matcher `/admin/:path*`; implementation must confirm the matcher includes `/admin` itself, not only its subpaths; **cookie-presence redirect UX only** — no token validation, no session decoding, no database query, no role or authorization decision of any kind; zero effect on public routes, `_next`, static assets, `robots.txt`, `sitemap.xml`, or favicon; **Violeta/shared-file approval must be recorded in the future S2 PR before merge**; every redirect destination it (or the guard) computes must comply with **INV-22**. |
| **OD-4** | **Owner-bootstrap mechanics** (§16): migration-seeded vs. one-time env-gated script; gate variable handling; whether a documented dashboard-manual fallback is acceptable | **RESOLVED — adopt: one-time env-gated server-side bootstrap artifact plus migration-backed constraints; no routine dashboard-manual fallback.** §16 is split into **§16.A** (design-time rehearsal — ADM1a scope, under OD-1's disposable local stack: author the artifact, rehearse against the local stack only, throwaway identity, prove double-run no-op, prove non-browser-invokability, no route or public server action, no cloud state, no real Owner created) and **§16.B** (live execution — Gate G2+ only: real CMS project, Juanpa's verified identity, one-time environment gate active only for the ceremony and removed immediately afterward, requires G2's own separate literal GO, writes a durable audit event without secrets, confirms no reusable execution path remains). **Gate G1's bootstrap-idempotency evidence refers only to §16.A.** |

**D10 (§24.2 RD-2) — CONFIRMED:** singular category contract preserved; ADM1a consumes types only, no schema change proposed or implied.

**RD-9 (§24.2) — CONFIRMED with content-honesty constraints:** see §4.1 item 9 for the full corrected text (typed empty-or-null objects, never invented content, the `not-yet-backed` state distinct from ADM0 §11.4's degraded fallback).

### 24.2 Recommended defaults (adopt unless review objects)

| ID | Item | Recommended default |
|---|---|---|
| RD-1 | ADM0 **D4** (Editor publish autonomy) | Carry ADM0’s default (Editor may publish) — irrelevant to ADM1a surfaces, encoded in the role matrix shape only |
| RD-2 | ADM0 **D10** (singular category) | **CONFIRMED** — remains confirmed-singular (frozen contract); ADM1a consumes types only. See §24.1. |
| RD-3 | Admin a11y approach (F1) | Independent admin-owned foundation; **no** `amarillo.css` extraction (§18) |
| RD-4 | Invitation expiry window | 7 days, server-evaluated (§9.3) |
| RD-5 | Session lifetimes | Provider-default access token; ~7-day absolute cap; re-auth after cap (§10) |
| RD-6 | Env naming | `CMS_`-prefixed server vars as in §13; nothing new under `NEXT_PUBLIC_*` |
| RD-7 | Admin skip-target id | `id="admin-contenido"` (never reuse public `#contenido`) (§18) |
| RD-8 | Test-runner introduction | **Corrected (Opus review):** yes, minimal (repo has none) — introduced in **Slice S1** (not S6, which only completes/assembles the harness); reviewer-approved dependency change with exact-pin/lockfile review (INV-23) |
| RD-9 | `lib/cms/read.ts` breadth | **CONFIRMED** — author **all seven** ADM0 §20.1 signatures + the three CMS-owned contracts (`PublishedHomepage`/`PublishedPage`/`PublicSiteSettings`). **Corrected content-honesty constraint (§4.1 item 9):** content functions return **typed empty-or-null-valued objects, never invented or placeholder content** — no fabricated WhatsApp number, no fabricated contact data, no invented copy; `PublicSiteSettings` returns no non-null contact/WhatsApp value during ADM1a. This state is the **`not-yet-backed`** state, distinct from ADM0 §11.4's degraded/last-known-good fallback (which applies once a real backing source exists, from G7 on). Nothing consumes `lib/cms/read.ts` until G7. The ADM0 §20.1-vs-§29 internal inconsistency is resolved by adopting §20.1 (author all seven). |

### 24.3 Non-blocking / future decisions (carried, not decided here)

ADM0 **D2** (WhatsApp number — ADM2/Ship), **D3** (approved copy — ADM2), **D5** (rich text — deferred/no), **D6** (price-editing exposure — ADM1b), **D7** (operational read-only bridge — separate mission), **D8** (Client-#2 model), **D9** (`admin.hilitos.co` — Ship gate), **D11** (media licensing — ADM2/M2), **D12** (CMS backup/PITR policy — G2/ADM3).

**Resolved during this Opus review (not "carried"; recorded here for completeness):** assumption **`A1a-HANDOFF`** (§1.1) — **RESOLVED**: no canonical handoff file exists in the vault; canonical current state is `../HILITOS_WEBSITE_REDESIGN_PRODUCTION_GATES_CHECKLIST_2026-07-16.md §0`, independently baseline-verified against the remote 2026-07-16 (`redesign/main = 4c49e019…`, `master = 8ab791da…`).

---

## 25 · Independent Review Contract

Opus must independently review this pack (and later, the implementation at Gate ADM1a-G) across, at minimum:

1. **Architecture** — boundary correctness vs. ADM0/SHELL0; no silent replacement of an approved decision; G1/G2/G3 split coherence (§4.2, OD-2).
2. **Auth/session model** — §9/§10 vs. ADM0 Decision 3; fail-closed completeness; non-enumeration.
3. **RLS/grants model** — §15 vs. ADM0 §9/§11.3; deny-by-default provability; helper safety.
4. **Secret boundaries** — §13 completeness; env classification; the anon-key Auth-only exception handling.
5. **Owner bootstrap** — §16 ceremony safety; OD-4 resolution.
6. **Route protection** — §12 contract completeness, incl. server-action vs. page semantics and the config-absent row.
7. **Implementation slicing** — §19 slice boundaries, dependency order, prohibited-file lists, and the S7/G2 exclusion.
8. **Rollback** — §21 realism, incl. the secret-exposure response.
9. **Blast radius** — INV-20 public parity; production isolation (§22); operational-plane isolation (INV-17).

Valid review verdicts (exactly one): `APPROVE_AS_DRAFTED` · `APPROVE_WITH_EDITS` · `REQUEST_CHANGES` · `REJECT_ARCHITECTURE`.

Any verdict other than `APPROVE_AS_DRAFTED` returns this pack to documentary editing; no verdict authorizes implementation (see §26).

**Verdict recorded, 2026-07-16: `APPROVE_WITH_EDITS`.** The architecture is approved; no finding reopened a settled ADM0/ADM1a decision or required new architecture. The required documentary edits (§1.1/§24.3 assumption resolution, §24.1 OD-1–OD-4 resolutions, §7 INV-22–INV-24, §16 §16.A/§16.B split, §19 slice corrections, §20 test-matrix additions, §4.1/§24.2 read.ts content-honesty fix, §5/§8/§26.2 miscellaneous corrections) have been applied to this document.

**Confirmation pass recorded, 2026-07-16:**
- **Result:** `CONFIRMED_WITH_MINOR_DOC_EDITS`
- **Reviewer:** Opus independent confirmation pass
- **Date:** 2026-07-16
- **Eligibility:** `ELIGIBLE FOR JUANPA GO DECISION`
- **Clarification:** eligibility does not issue or imply a GO. No Juanpa GO has been requested or issued as a result of this confirmation.

The four minor documentary edits identified by the confirmation pass (U-1 gate-register next-step wording, U-2 the dangling OD-2 Storage-policy conditional in §5, U-3 the INV-8 verification-boundary clarification, U-4 the README Mission Pack index row) were applied during this same documentary closeout, by Morado, on 2026-07-16, and require **no further Opus review** — they are minor and non-architectural.

---

## 26 · Authorization Chain

Implementation may occur only through this exact chain — no step may be skipped, merged, or assumed:

1. **Fable draft** — this document (done; performs nothing).
2. **Opus independent review** — §25 contract; **done — verdict `APPROVE_WITH_EDITS`, 2026-07-16.**
3. **Documentary edits** — **done** — required edits applied to this pack (documentation only, by Morado, 2026-07-16).
4. **Short confirmation pass** — **done — result `CONFIRMED_WITH_MINOR_DOC_EDITS`, Opus independent confirmation pass, 2026-07-16.** Eligibility: `ELIGIBLE FOR JUANPA GO DECISION` — this eligibility does not itself issue or imply a GO. All §24.1 decisions are recorded RESOLVED; the four minor documentary edits the confirmation pass identified have been applied (§25) and require no further Opus review.
5. **Literal authorization** — **next step, not yet performed.** Juanpa issues, verbatim: `JUANPA GO: HILITOS-ADM1A-SECURITY-FOUNDATION`. Absent that exact literal, the implementation agent does nothing (see §26.2 template behavior). No GO has been requested or issued.
6. **Isolated implementation** — per §19 slices: isolated worktrees, slice branches off the verified base, PRs into `redesign/main`, no merges without review.
7. **Independent code review** — per-slice PR review plus the mission-level **Gate ADM1a-G** security review (ADM0 §22).
8. **Preview smoke** — §20 matrix evidence on the PR Preview (and the OD-1 environment for live-auth items), with BLOCKED items listed explicitly.
9. **Documentation closeout** — Obsidian closeout: pack status update, gate register G1 checkbox updates with dated evidence, memory/README index updates.

### 26.1 What the GO does and does not authorize

`JUANPA GO: HILITOS-ADM1A-SECURITY-FOUNDATION` authorizes **only** the §19 base slices **S1–S6** within this pack’s scope. **It never covers S7** (§19 — live verification is explicit Gate G2/G3 territory with its own literal GO). It does **not** authorize: creating the Supabase CMS project or any Supabase resource; configuring live Auth; creating real users or sending real invitations; creating buckets; applying any migration or RLS policy to any cloud project; using any Supabase MCP tool for any purpose; setting Production secrets or Production env vars; deploying to Production; touching DNS/CNAME; touching `master`; touching the Hilitos/Olivia operational system; or anything else in §5/§22 — **unless the final approved version of this pack explicitly includes a specific such action with its own separate gate, and the GO references it.** CMS project creation remains **Gate G2** with its own Mission Pack and its own distinct literal GO, per ADM0 D1 and the gate register. **The GO must also explicitly state whether OD-1 local-stack (disposable Supabase CLI/Docker) verification is authorized for this dispatch; absent that statement, the implementer treats local-stack steps as unauthorized and stops before running them.** (Confirmed unchanged by the 2026-07-16 Opus confirmation pass — this scope is not altered by `CONFIRMED_WITH_MINOR_DOC_EDITS`.)

### 26.2 Protected dispatch template (DO NOT RUN — template only)

Authored per the redeploy-safe prompting playbook (defensive framing; role/mode/repo/branch/scope/restrictions/evidence structure):

```text
========================================================================
GO GATE — THIS PROMPT IS A TEMPLATE, NOT AN AUTHORIZATION.
- Run ONLY if the dispatch carries the literal:
      JUANPA GO: HILITOS-ADM1A-SECURITY-FOUNDATION
- Absent that exact literal: create NO branch/worktree/file, run NO command
  that mutates anything, and reply exactly:
  "Blocked: awaiting explicit JUANPA GO: HILITOS-ADM1A-SECURITY-FOUNDATION."
- Confirm every §24.1 decision (OD-1..OD-4) is recorded RESOLVED — none may
  be reopened by the implementer.
- Confirm the GO does NOT include Supabase resource creation (it never does
  by default — that is Gate G2). If any step would create/apply a cloud
  resource, STOP.
- BEFORE any baseline verification, run:
      git fetch origin
      git rev-parse origin/redesign/main
  and require this to be EXACTLY EQUAL to the dispatch SHA. Do NOT rely on
  the local redesign/main ref alone — it may be stale. Any mismatch is a
  STOP (§23).
- Do NOT use Supabase MCP tools for any purpose during ADM1a (OD-1).
========================================================================

You are the ADM terminal for the Hilitos website redesign — a senior
Next.js (App Router) + TypeScript + Supabase engineer working on our own
private codebase.

Mode: AUTHORIZED DEFENSIVE IMPLEMENTATION (security foundation).
This is not offensive testing. Do not attempt exploitation, live attacks,
or high-volume tests. Do not access production data. Do not print secrets.

Repo: AurenAIco/hilitos-website
Baseline verification (run first, before anything else):
  git fetch origin
  git rev-parse origin/redesign/main   # MUST equal the dispatch SHA below
Base: redesign/main @ <verify origin/redesign/main == dispatch SHA; clean tree — else STOP>
Branch: redesign/adm/adm1a-<slice> (isolated worktree; branch before first commit)

Mission: execute ONLY the authorized §19 slice(s) of
HILITOS_ADM1A_SECURITY_FOUNDATION_MISSION_PACK (final approved version),
in order, honoring every §23 STOP condition.

Hard restrictions:
Do not deploy (PR Preview only; never vercel --prod). Do not merge.
Do not push to master or redesign/main. Do not touch DNS/CNAME/Pages.
Do not create or modify any Supabase project/resource. Do not apply
migrations. Do not create users or buckets. Do not touch the operational
Olivia/CRM Supabase or its credentials. Do not use Supabase MCP tools for
any purpose during ADM1a. Do not edit app/(public)/**,
app/layout.tsx, components/**, styles/amarillo.css, styles/tokens.css,
lib/contract.ts, lib/components.ts, lib/fixture*.ts, catalog.fixture.json,
robots.ts, sitemap.ts, lib/catalog/**, lib/whatsapp.ts, legacy/**.
Keep every diff within the slice's Allowed files list. Local-stack
verification (OD-1) proceeds only if this specific dispatch's GO
explicitly authorizes it — absent that, stop before running any
disposable-Supabase-stack step.

Validation: run the §20 checks applicable to the slice; report exact
commands and outputs; list anything BLOCKED (e.g. on Gate G2) explicitly;
never claim an unrun check passed.

Output: branch/SHAs, files changed, evidence per check, public-parity
proof, isolation confirmation (no operational access, no secrets in
bundle/logs), open items, rollback commands for the slice.
Mission ends at Gate ADM1a-G. Do NOT start ADM1b or any G2+ work.
```

---

## 27 · Final Status Block

> This pack is a **planning artifact**. It performed no implementation, created no branch, applied nothing, and authorizes nothing. It preserves the ADM0 approved architecture, resolves SHELL0 follow-up F1 by design (not by implementation), and defers every live Supabase action to the separately gated G2/G3. Independent Opus review returned `APPROVE_WITH_EDITS` (2026-07-16); the required documentary edits were applied; the Opus confirmation pass then returned `CONFIRMED_WITH_MINOR_DOC_EDITS` (2026-07-16), recording this pack as `ELIGIBLE FOR JUANPA GO DECISION` — an eligibility finding, not a GO and not an authorization. Four further minor documentary edits identified by the confirmation pass have been applied in this same closeout. No Juanpa GO has been requested or issued. It makes **no absolute security claims**: the controls above are concrete and testable, residual risks are recorded in §6, and every claim of protection is tied to a verification method in §20 — nothing here asserts the system is “unhackable,” “security complete,” or “production ready,” and nothing here should be read as “authorized,” “approved for implementation,” “ready to implement,” “implementation approved,” or a GO of any kind.

`HILITOS-ADM1A-SECURITY-FOUNDATION — DRAFT — REVIEWED — APPROVE_WITH_EDITS — EDITS APPLIED — CONFIRMED — AWAITING JUANPA GO — NOT AUTHORIZED`
