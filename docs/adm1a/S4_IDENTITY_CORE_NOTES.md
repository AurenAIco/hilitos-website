# ADM1a-S4 — Identity/Security-Core Notes

Dispatch: `Mission_Packs/HILITOS_ADM1A_S4_IMPLEMENTATION_DISPATCH_2026-07-17.md`
(SHA256 `1bf1be60b4e65662426bd315f6e0d73359b074b1d9c34015279ea8c380670945`)

This slice ships **files + local disposable-stack (OD-1) evidence only**. It
implements no Auth UI, no sessions, no OTP, no `@supabase/ssr`, no Supabase
JS client, no middleware change, no login/logout, no route guards, no
generated DB types, no seed data. Cookie presence is not authentication or
authorization — unchanged from Slice S2.

## 1 · Schema notes

### `cms` schema

Never added to `[api].schemas` in `supabase/config.toml` — identity/admin
tables are not exposed to the local Data API surface by construction
(INV-10 local posture; the live PostgREST-exposure **proof** is Gate G3's,
per canon). Grants: `USAGE` on schema `cms` to `authenticated` and
`service_role` only. `anon` receives no grant on `cms` at any layer.

### `cms.admin_users` (ADM0 §10.1 verbatim)

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | `= auth.users.id` (FK, `on delete cascade`). The **authorization** key — every helper derives from `auth.uid()`. |
| `company_id` | `uuid not null` | Bare — no `companies` table exists in the canonical model. |
| `email` | `citext not null` | The **invitation** key, paired with `company_id`. Case-insensitive at the type level. |
| `role` | `text check in ('owner','editor','reviewer')` | Exactly three roles, no roles table. |
| `status` | `text check in ('invited','active','revoked')` | State machine; S3 implements `invited → active` transition. |
| `invited_by` | `uuid null → admin_users(id)` | NULL exactly for bootstrap-created Owner rows. |
| `created_at`/`updated_at`/`last_seen_at` | `timestamptz` | `updated_at` maintained by trigger. |

Unique: `(company_id, email)` (citext ⇒ case-variant duplicates rejected too).

### Membership helpers — `cms.is_member()` / `cms.role()` / `cms.company()`

`SECURITY DEFINER`, `STABLE`, `SET search_path = ''`, zero arguments (can
only ever answer about the caller — never another user or company),
fully-qualified references, no dynamic SQL.

**Pinned-owner contract (§6.0 of the dispatch — Rojo F-1 resolution):**
`SECURITY DEFINER` alone does not bypass RLS; it only switches execution
context to the function's **owner**. Because `cms.admin_users` carries
`FORCE ROW LEVEL SECURITY`, these helpers avoid a recursive-RLS deadlock
only if their owner holds `BYPASSRLS`. The owner is pinned explicitly to
**`service_role`** via `ALTER FUNCTION ... OWNER TO service_role` — never
left implicit to whichever role happens to run the migration. Every
migration also carries `REVOKE EXECUTE ... FROM PUBLIC` per helper
(Postgres grants PUBLIC execute by default) and `GRANT EXECUTE ...  TO
authenticated` only. All of this is catalog-verified (not grepped) by the
pgTAP Layer B-F1 suite: `pg_proc.proowner`, `pg_proc.prosecdef`,
`pg_proc.proconfig`, `pg_roles.rolbypassrls`, and function ACLs.

### RLS posture

Every S4 table: `ENABLE ROW LEVEL SECURITY` **and** `FORCE ROW LEVEL
SECURITY`. No policy is ever `USING (true)`. Absence of a policy = denial.
`admin_users` additionally carries two triggers beyond the RLS policy set:

- **Self-elevation guard** — a row may not change its own `role`,
  `status`, or `company_id` while a JWT context names that row
  (`auth.uid() = NEW.id`). Defense-in-depth on top of the UPDATE policy's
  own `id <> auth.uid()` exclusion; specifically guards against
  privileged-path misuse (e.g. `service_role` with a JWT claim set), since
  RLS itself already blocks the normal authenticated path.
- **Last-active-owner guard** (an explicit S4 addition beyond ADM0 §10.1,
  flagged for reviewer approval — strike-able without ripple) — the last
  `active` `owner` row of a `company_id` cannot be demoted, revoked, or
  deleted. Like the self-elevation guard, this is only reachable via a
  privileged path in practice, since normal RLS already prevents an Owner
  from modifying their own row.

### `cms.site_change_log` / `cms.site_publications` (ADM0 §10.10/§10.11 verbatim)

Audit substrate. `site_change_log` is append-only for **all** application
roles including Owner (RLS denies UPDATE/DELETE with no grant at all —
double-layer denial); `service_role`/superuser access is an explicit,
minimized, out-of-band operational capability (S-M1). `entity_type` +
`entity_id` are intentionally FK-free so audit history survives entity
deletion. `site_publications` follows ADM0 §9.2's Owner-full stance
verbatim (including UPDATE/DELETE) rather than inventing an append-only
symmetry ADM0 did not specify — flagged for reviewer attention (dispatch
§19 R-4).

## 2 · Env-name inventory (names only — no values, ever)

No `.env*` file is created, read, or referenced by this slice (`.gitignore`
already excludes `.env*`). The following names are **documented here as a
forward-looking inventory only** — none is wired up, none has a committed
value:

| Name | Purpose (future slice) |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | S3+ — client-side Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | S3+ — client-side anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | G2+ — server-only, invitation Auth-user creation and §16.B live bootstrap |
| `ADM_BOOTSTRAP_TOKEN`-class env window | G2+ — one-time gate for the live owner bootstrap (§16.B) |

## 3 · Local-stack runbook

```bash
# Preconditions: Docker Desktop running; Supabase CLI v2.x on PATH.
supabase start                 # first run pulls images; prints local URLs/keys
supabase db reset               # apply all migrations from zero
supabase db reset               # again — must be identical (idempotence proof)
supabase db diff                 # must be empty (migrations ≡ schema)
supabase test db supabase/tests/adm1a   # pgTAP Layer B + Layer B-F1

# Owner-bootstrap rehearsal (throwaway example.com identity only).
# Pass RAW values to -v — no embedded quotes; the script's own `:'name'`
# references already apply SQL-literal quoting (verified against this stack):
psql "$(supabase status -o json | jq -r '.DB_URL')" \
  -v owner_auth_id="<throwaway-uuid>" \
  -v owner_email="owner-rehearsal@example.com" \
  -v company_id="<throwaway-uuid>" \
  -v bootstrap_gate="I_UNDERSTAND_ONE_TIME_OWNER_BOOTSTRAP" \
  -f supabase/scripts/adm1a_s4_owner_bootstrap.sql
# Run the same command again — must be a proven no-op (0 new rows).

npm test && npm run lint && npm run typecheck && npm run fixture-lint && npm run build

supabase stop --no-backup        # destroy the stack; remove volumes
```

Stack lifecycle per evidence run: destroyed after evidence capture every
time (OD-1) — nothing in this slice is ever left running or persisted
outside the disposable stack's lifetime.

## 4 · Staged handoff to S3 / G2+ (§16.B)

The `admin_users.id` FK to `auth.users.id` means an invited membership row
requires its Auth user to exist first.

- **Locally (this slice, rehearsal only):** the pgTAP fixture harness
  creates throwaway `auth.users` rows by direct SQL against the disposable
  stack — a documented local-only technique, never an app code path.
- **Live (S3+/G2+, out of scope here):** the invitation flow creates the
  Auth user via the server-side service-role admin API at invitation time
  (public signups stay disabled). The real owner-bootstrap execution
  (§16.B) requires Juanpa's real, verified Auth identity to already exist
  (created through the platform's invite/OTP surface under G2's own
  runbook) before the bootstrap script binds the Owner row to that
  verified `auth.users.id` — under G2's own literal GO, not this slice's.

## 5 · INV-9 / INV-10 spec pointers

- **INV-9** (server-side-only authorization surface): S4 ships zero app
  code, so there is nothing yet to violate INV-9 — the membership helpers
  exist as DB-catalog objects only, reachable exclusively via `EXECUTE`
  grants to `authenticated`/`service_role`. S3 is the slice that actually
  wires server-side authorization checks against this schema.
- **INV-10** (non-exposed `cms` schema): satisfied locally by construction
  (`cms` absent from `[api].schemas`) and proven structurally by the Layer
  A static suite (`tests/adm1a/s4-identity-foundation.test.ts`). The live
  PostgREST-exposure proof against a real hosted project remains Gate G3's,
  per canon — this slice's evidence is local-only.
