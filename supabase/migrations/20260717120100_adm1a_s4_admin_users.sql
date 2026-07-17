-- ADM1a-S4: cms.admin_users — identity/membership core (ADM0 §10.1 verbatim)
-- Dispatch: HILITOS_ADM1A_S4_IMPLEMENTATION_DISPATCH_2026-07-17.md
-- (SHA256 1bf1be60b4e65662426bd315f6e0d73359b074b1d9c34015279ea8c380670945)
--
-- Table + constraints + updated_at trigger only. RLS and the self-elevation
-- guard land in the RLS migration (dispatch §9 file #5) — kept separate so
-- "table exists" and "table is protected" are independently reviewable and
-- independently testable.

create table cms.admin_users (
  -- id = auth.users.id is the *authorization* key (dispatch §5.4): every
  -- helper derives from auth.uid(). The FK forces the Auth user to exist
  -- before an invited membership row can be created (§5.4, §5.15 — S3+/G2+
  -- creates the Auth user via the server-side service-role admin API at
  -- invitation time; public signups stay disabled).
  id uuid primary key references auth.users (id) on delete cascade,

  -- Bare uuid, not null. No `companies` table exists in the canonical model
  -- (dispatch §5.14) — table discipline forbids inventing one.
  company_id uuid not null,

  -- citext is the *invitation* key (dispatch §5.4): case-insensitive
  -- matching/uniqueness at the type level, paired with company_id below.
  email extensions.citext not null,

  role text not null check (role in ('owner', 'editor', 'reviewer')),
  status text not null check (status in ('invited', 'active', 'revoked')),

  -- NULL exactly for bootstrap-created Owner rows (dispatch §5.15).
  invited_by uuid references cms.admin_users (id),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz,

  constraint admin_users_company_email_unique unique (company_id, email)
);

comment on table cms.admin_users is
  'ADM1a identity/membership core (ADM0 §10.1). id = auth.users.id is the '
  'authorization key; email (citext) + company_id is the invitation key. '
  'Roles: owner/editor/reviewer. Status: invited/active/revoked.';

comment on column cms.admin_users.invited_by is
  'References admin_users(id). NULL exactly for bootstrap-created Owner '
  'rows (dispatch §5.15) — every invited row has a non-null inviter.';

-- updated_at maintenance (dispatch §9 file #3). Runs as invoker (no
-- SECURITY DEFINER needed: it only rewrites the row already being updated
-- by the same statement) — least-privilege, not subject to the §6.0
-- pinned-owner contract, which applies only to the membership helpers.
create or replace function cms.set_admin_users_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger admin_users_set_updated_at
  before update on cms.admin_users
  for each row
  execute function cms.set_admin_users_updated_at();
