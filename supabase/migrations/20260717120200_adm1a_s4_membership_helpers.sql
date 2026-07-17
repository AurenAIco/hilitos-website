-- ADM1a-S4: SECURITY DEFINER membership helpers — cms.is_member/role/company
-- Dispatch: HILITOS_ADM1A_S4_IMPLEMENTATION_DISPATCH_2026-07-17.md
-- (SHA256 1bf1be60b4e65662426bd315f6e0d73359b074b1d9c34015279ea8c380670945)
--
-- §6.0 PINNED HELPER-OWNER CONTRACT (Rojo F-1 resolution — blocking):
-- SECURITY DEFINER alone does not bypass RLS; it only switches execution
-- context to the function's OWNER. Because cms.admin_users carries FORCE
-- ROW LEVEL SECURITY, these helpers avoid the recursive-RLS deadlock only
-- if their owner holds BYPASSRLS. The owner is pinned explicitly below to
-- service_role — never left implicit to whichever role happens to run the
-- migration (§6.0 term 3). Every clause here is catalog-verified by
-- Layer B-F1 (pg_proc/pg_roles/pg_namespace), never merely grepped.
--
-- All three helpers: SECURITY DEFINER, STABLE, SET search_path = '' (empty
-- — pg_catalog remains implicitly searched regardless), fully-qualified
-- object references, zero arguments (cannot be asked about another user or
-- company — §6.5), no dynamic SQL, fail-closed NULL/false on no matching
-- row.

create or replace function cms.is_member()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from cms.admin_users
    where cms.admin_users.id = auth.uid()
      and cms.admin_users.status = 'active'
  );
$$;

comment on function cms.is_member() is
  'True iff auth.uid() has an active cms.admin_users row. SECURITY '
  'DEFINER, owner pinned to service_role (dispatch §6.0).';

alter function cms.is_member() owner to service_role;
revoke execute on function cms.is_member() from public;
grant execute on function cms.is_member() to authenticated;


create or replace function cms.role()
returns text
language sql
security definer
stable
set search_path = ''
as $$
  select cms.admin_users.role
  from cms.admin_users
  where cms.admin_users.id = auth.uid()
    and cms.admin_users.status = 'active';
$$;

comment on function cms.role() is
  'The caller''s active cms.admin_users role, else NULL. SECURITY '
  'DEFINER, owner pinned to service_role (dispatch §6.0).';

alter function cms.role() owner to service_role;
revoke execute on function cms.role() from public;
grant execute on function cms.role() to authenticated;


create or replace function cms.company()
returns uuid
language sql
security definer
stable
set search_path = ''
as $$
  select cms.admin_users.company_id
  from cms.admin_users
  where cms.admin_users.id = auth.uid()
    and cms.admin_users.status = 'active';
$$;

comment on function cms.company() is
  'The caller''s active cms.admin_users company_id, else NULL. SECURITY '
  'DEFINER, owner pinned to service_role (dispatch §6.0).';

alter function cms.company() owner to service_role;
revoke execute on function cms.company() from public;
grant execute on function cms.company() to authenticated;
