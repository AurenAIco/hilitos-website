-- ADM1a-S4: one-time owner-bootstrap script (OD-4 / dispatch §7).
-- Dispatch: HILITOS_ADM1A_S4_IMPLEMENTATION_DISPATCH_2026-07-17.md
-- (SHA256 1bf1be60b4e65662426bd315f6e0d73359b074b1d9c34015279ea8c380670945)
--
-- THIS IS NOT A MIGRATION. Migrations replay unconditionally on every
-- `supabase db reset`; this script must only ever run as an explicit,
-- gated, logged act, invoked directly via psql in a privileged,
-- server-side, non-HTTP context. S4 ships zero app code — no route,
-- server action, or API in this slice can reach this file.
--
-- Precondition: the Auth user this script binds to must already exist
-- (owner_auth_id references auth.users.id via the admin_users FK).
-- Locally (S4 rehearsal only): the rehearsal harness creates a throwaway
-- auth.users row by direct SQL against the disposable stack BEFORE
-- invoking this script (documented local-only technique — never an app
-- code path). Live (§16.B, out of scope here, G2+ only): Juanpa's real
-- verified Auth identity is created first through the platform's
-- invite/OTP surface under G2's own runbook and literal GO; this script
-- then only binds the Owner row to that already-verified auth.users.id.
--
-- Required psql -v parameters (placeholders only — no real value is ever
-- committed to this file; no secret, no real personal email, no token):
--   owner_auth_id   uuid  — must already exist as auth.users.id
--   owner_email     text  — the Owner's invitation-key email (citext)
--   company_id      uuid  — the tenant's well-known company_id constant
--   bootstrap_gate  text  — must be exactly
--                           'I_UNDERSTAND_ONE_TIME_OWNER_BOOTSTRAP'
--
-- Example invocation against the OD-1 disposable stack ONLY (throwaway
-- example.com identity and throwaway company_id constant — dispatch §7
-- "Local-only in S4"; never a real value, never run against any cloud
-- resource):
--   psql "$LOCAL_DB_URL" \
--     -v owner_auth_id="'00000000-0000-0000-0000-000000000001'" \
--     -v owner_email="'owner-rehearsal@example.com'" \
--     -v company_id="'00000000-0000-0000-0000-0000000000c0'" \
--     -v bootstrap_gate="'I_UNDERSTAND_ONE_TIME_OWNER_BOOTSTRAP'" \
--     -f supabase/scripts/adm1a_s4_owner_bootstrap.sql
--
-- Idempotence: a pre-flight existence check plus ON CONFLICT DO NOTHING
-- against the migration-backed PK (admin_users.id) and UNIQUE
-- (company_id, email) constraints make a second run a proven no-op —
-- verified by a mandatory double-run rehearsal (dispatch §14 Layer B
-- row 22): run 1 creates exactly one owner row + one audit row; run 2
-- creates zero new rows.

\set ON_ERROR_STOP on

-- psql variables (`:'name'`) are pure client-side text substitution and
-- are invisible to server-side PL/pgSQL. Move them into session-local
-- GUCs so the gate check and the insert logic below can see them.
select set_config('adm1a_s4_bootstrap.gate', :'bootstrap_gate', false);
select set_config('adm1a_s4_bootstrap.owner_auth_id', :'owner_auth_id', false);
select set_config('adm1a_s4_bootstrap.owner_email', :'owner_email', false);
select set_config('adm1a_s4_bootstrap.company_id', :'company_id', false);

do $$
begin
  if current_setting('adm1a_s4_bootstrap.gate', true)
       is distinct from 'I_UNDERSTAND_ONE_TIME_OWNER_BOOTSTRAP' then
    raise exception
      'adm1a_s4_owner_bootstrap: refused — bootstrap_gate parameter missing or incorrect. Pass -v bootstrap_gate=''I_UNDERSTAND_ONE_TIME_OWNER_BOOTSTRAP''.';
  end if;
end;
$$;

do $$
declare
  v_owner_auth_id uuid := current_setting('adm1a_s4_bootstrap.owner_auth_id')::uuid;
  v_owner_email extensions.citext := current_setting('adm1a_s4_bootstrap.owner_email')::extensions.citext;
  v_company_id uuid := current_setting('adm1a_s4_bootstrap.company_id')::uuid;
  v_inserted_id uuid;
  v_change_log_id bigint;
begin
  -- Idempotence pre-flight: no-op if an active owner already exists for
  -- this identity (matches either the auth id or the company+email key).
  if exists (
    select 1
    from cms.admin_users
    where (id = v_owner_auth_id or (company_id = v_company_id and email = v_owner_email))
      and role = 'owner'
      and status = 'active'
  ) then
    raise notice 'adm1a_s4_owner_bootstrap: no-op — an active owner already exists for this identity.';
    return;
  end if;

  insert into cms.admin_users (id, company_id, email, role, status, invited_by)
  values (v_owner_auth_id, v_company_id, v_owner_email, 'owner', 'active', null)
  on conflict do nothing
  returning id into v_inserted_id;

  if v_inserted_id is null then
    raise notice 'adm1a_s4_owner_bootstrap: no-op — row already existed (ON CONFLICT DO NOTHING).';
    return;
  end if;

  -- Auditable (dispatch §7): the bootstrap-created identity is its own
  -- actor — there is no other admin_users row that could plausibly be the
  -- actor at first-owner creation time.
  insert into cms.site_change_log (company_id, actor, action, entity_type, entity_id, before, after)
  values (
    v_company_id,
    v_inserted_id,
    'create',
    'admin_users',
    v_inserted_id::text,
    null,
    jsonb_build_object('role', 'owner', 'status', 'active', 'email', v_owner_email::text)
  )
  returning id into v_change_log_id;

  raise notice 'adm1a_s4_owner_bootstrap: created owner admin_users.id=% and site_change_log.id=%.',
    v_inserted_id, v_change_log_id;
end;
$$;
