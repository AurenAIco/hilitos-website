-- ADM1a-S4: cms.admin_users — RLS, self-elevation guard, last-active-owner
-- guard (dispatch §6.1, §5.7, §5.8)
-- Dispatch: HILITOS_ADM1A_S4_IMPLEMENTATION_DISPATCH_2026-07-17.md
-- (SHA256 1bf1be60b4e65662426bd315f6e0d73359b074b1d9c34015279ea8c380670945)

alter table cms.admin_users enable row level security;
alter table cms.admin_users force row level security;

-- Table-level DML grants. RLS policies below further restrict `authenticated`.
-- service_role's BYPASSRLS attribute (verified §6.0/§14 Layer B-F1) means
-- these grants are the only gate on the privileged path. anon holds no
-- grant on cms.admin_users at all — deny by absence (dispatch §6).
grant select, insert, update, delete on cms.admin_users to authenticated;
grant select, insert, update, delete on cms.admin_users to service_role;

-- SELECT: a subject with a row always sees their own row — status-
-- independent and helper-free (no recursion possible). This lets S3's
-- guard and invited->active acceptance flow run under a user-scoped
-- client with no service-role key (dispatch §6.1, S3-discovery contract
-- point (a); §11).
create policy admin_users_select_own on cms.admin_users
  for select
  to authenticated
  using (id = auth.uid());

-- SELECT: an active Owner additionally sees every row in their own
-- company. Does not recurse (dispatch §6.4/§6.5): cms.role()/cms.company()
-- execute as their pinned owner (service_role, BYPASSRLS), exempt from
-- this policy's own RLS evaluation.
create policy admin_users_select_owner_company on cms.admin_users
  for select
  to authenticated
  using (cms.role() = 'owner' and company_id = cms.company());

-- INSERT: Owner-only, and only within their own company (dispatch §5.8
-- term 1: no INSERT policy exists for non-owner members at all).
create policy admin_users_insert_owner on cms.admin_users
  for insert
  to authenticated
  with check (cms.role() = 'owner' and company_id = cms.company());

-- UPDATE: Owner-only, rows in own company, EXCLUDING the Owner's own row
-- (dispatch §5.8 term 2 / INV-7 — "never editable by the row's own
-- subject"). WITH CHECK re-pins company_id so an update cannot move a row
-- to a foreign company.
create policy admin_users_update_owner on cms.admin_users
  for update
  to authenticated
  using (cms.role() = 'owner' and company_id = cms.company() and id <> auth.uid())
  with check (company_id = cms.company());

-- DELETE: Owner-only, rows in own company, EXCLUDING the Owner's own row.
create policy admin_users_delete_owner on cms.admin_users
  for delete
  to authenticated
  using (cms.role() = 'owner' and company_id = cms.company() and id <> auth.uid());


-- Self-elevation guard (dispatch §5.8 term 3): defense-in-depth on top of
-- the UPDATE policy's `id <> auth.uid()` predicate. Raises whenever a row
-- would change its own role/status/company_id while a JWT context exists
-- for that same row, constraining accidental privileged-path misuse too.
create or replace function cms.prevent_admin_users_self_elevation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.uid() is not null and new.id = auth.uid() then
    if new.role is distinct from old.role
       or new.status is distinct from old.status
       or new.company_id is distinct from old.company_id then
      raise exception
        'admin_users: a row may not change its own role, status, or company_id (self-elevation guard, dispatch §5.8)';
    end if;
  end if;
  return new;
end;
$$;

create trigger admin_users_prevent_self_elevation
  before update on cms.admin_users
  for each row
  execute function cms.prevent_admin_users_self_elevation();


-- Last-active-owner guard (dispatch §5.7 — an explicit S4 addition beyond
-- ADM0 §10.1, flagged for reviewer approval; strike-able without ripple
-- per §19 R-5). Prevents demoting, revoking, or deleting the last active
-- Owner of a company at the DB layer, defending against the §21.3 lockout
-- failure mode.
create or replace function cms.prevent_last_active_owner_removal()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  remaining_owners integer;
  still_active_owner_same_company boolean;
begin
  -- Only relevant when the row being changed is currently an active owner.
  if old.role <> 'owner' or old.status <> 'active' then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  if tg_op = 'UPDATE' then
    still_active_owner_same_company :=
      new.role = 'owner' and new.status = 'active' and new.company_id = old.company_id;
    if still_active_owner_same_company then
      return new;
    end if;
  end if;

  select count(*) into remaining_owners
  from cms.admin_users
  where company_id = old.company_id
    and role = 'owner'
    and status = 'active'
    and id <> old.id;

  if remaining_owners = 0 then
    raise exception
      'admin_users: cannot remove the last active owner of company % (last-active-owner guard, dispatch §5.7)',
      old.company_id;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger admin_users_prevent_last_active_owner_removal
  before update or delete on cms.admin_users
  for each row
  execute function cms.prevent_last_active_owner_removal();
