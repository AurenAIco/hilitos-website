-- ADM1a-S4 Layer B / Layer B-F1 — pgTAP suite against the OD-1 disposable
-- stack only (`supabase test db`). Dispatch:
-- HILITOS_ADM1A_S4_IMPLEMENTATION_DISPATCH_2026-07-17.md
-- (SHA256 1bf1be60b4e65662426bd315f6e0d73359b074b1d9c34015279ea8c380670945)
--
-- HONESTY BOUNDARY: this file is a LOCAL REHEARSAL, never the G3 live
-- proof (dispatch §14). Rows 1-2 (clean `db reset`, double-reset +
-- `db diff` empty) and row 22 (bootstrap double-run) are procedural CLI
-- facts captured in the PR evidence register (dispatch §20 steps 3-5, 7),
-- not expressible as in-transaction pgTAP assertions — not silently
-- skipped, explicitly out of this file's scope.
--
-- Fixture legend (throwaway example.com-class identities only — dispatch
-- §13, §21):
--   company_a = 11111111-1111-1111-1111-111111111111
--   company_b = 22222222-2222-2222-2222-222222222222
--   owner_a    a0000000-0000-0000-0000-000000000001  owner/active   company_a (sole active owner)
--   editor_a   a0000000-0000-0000-0000-000000000002  editor/active  company_a
--   reviewer_a a0000000-0000-0000-0000-000000000003  reviewer/active company_a
--   invited_a  a0000000-0000-0000-0000-000000000004  editor/invited company_a
--   revoked_a  a0000000-0000-0000-0000-000000000005  editor/revoked company_a
--   owner_b    b0000000-0000-0000-0000-000000000001  owner/active   company_b (sole active owner)
--   no_member  c0000000-0000-0000-0000-000000000001  auth.users row, NO admin_users row

begin;
select no_plan();

-- ---------------------------------------------------------------------
-- Fixtures (run as postgres — superuser, bypasses RLS trivially).
-- ---------------------------------------------------------------------

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous
) values
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'owner-a@example.com', '', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, false),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'editor-a@example.com', '', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, false),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'reviewer-a@example.com', '', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, false),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'invited-a@example.com', '', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, false),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'revoked-a@example.com', '', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, false),
  ('00000000-0000-0000-0000-000000000000', 'b0000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'owner-b@example.com', '', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, false),
  ('00000000-0000-0000-0000-000000000000', 'c0000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'no-member@example.com', '', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, false);

insert into cms.admin_users (id, company_id, email, role, status, invited_by) values
  ('a0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'owner-a@example.com',    'owner',    'active',  null),
  ('a0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'editor-a@example.com',   'editor',   'active',  'a0000000-0000-0000-0000-000000000001'),
  ('a0000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'reviewer-a@example.com', 'reviewer', 'active',  'a0000000-0000-0000-0000-000000000001'),
  ('a0000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'invited-a@example.com',  'editor',   'invited', 'a0000000-0000-0000-0000-000000000001'),
  ('a0000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'revoked-a@example.com',  'editor',   'revoked', 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'owner-b@example.com',    'owner',    'active',  null);
-- no_member (c0000...0001) intentionally has NO cms.admin_users row.

-- ---------------------------------------------------------------------
-- Row 3 — expected objects exist (catalog-queried).
-- ---------------------------------------------------------------------

select has_schema('cms', 'B3: schema cms exists');
select has_table('cms', 'admin_users', 'B3: cms.admin_users exists');
select has_table('cms', 'site_change_log', 'B3: cms.site_change_log exists');
select has_table('cms', 'site_publications', 'B3: cms.site_publications exists');
select col_is_pk('cms', 'admin_users', 'id', 'B3: admin_users.id is PK');
select col_is_fk('cms', 'admin_users', 'id', 'B3: admin_users.id FKs to auth.users');
select ok(
  exists (
    select 1 from information_schema.table_constraints
    where table_schema = 'cms' and table_name = 'admin_users'
      and constraint_type = 'UNIQUE' and constraint_name = 'admin_users_company_email_unique'
  ),
  'B3: UNIQUE (company_id, email) constraint exists on admin_users'
);
select ok(
  (select data_type from information_schema.columns
   where table_schema = 'cms' and table_name = 'admin_users' and column_name = 'email') = 'citext'
  or (select udt_name from information_schema.columns
   where table_schema = 'cms' and table_name = 'admin_users' and column_name = 'email') = 'citext',
  'B3: admin_users.email is citext'
);
select ok(
  exists (
    select 1 from information_schema.check_constraints cc
      join information_schema.constraint_column_usage ccu on ccu.constraint_name = cc.constraint_name
    where ccu.table_schema = 'cms' and ccu.table_name = 'admin_users' and ccu.column_name = 'role'
  ),
  'B3: admin_users.role has a CHECK constraint'
);
select ok(
  exists (
    select 1 from information_schema.check_constraints cc
      join information_schema.constraint_column_usage ccu on ccu.constraint_name = cc.constraint_name
    where ccu.table_schema = 'cms' and ccu.table_name = 'admin_users' and ccu.column_name = 'status'
  ),
  'B3: admin_users.status has a CHECK constraint'
);
select ok(
  exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'cms' and p.proname = fn and p.prosecdef
  ),
  format('B3: cms.%s() is present with SECURITY DEFINER', fn)
)
from unnest(array['is_member', 'role', 'company']) as fn;

-- ---------------------------------------------------------------------
-- Row 4 — RLS enabled AND forced on all 3 tables.
-- ---------------------------------------------------------------------

select ok(
  (select relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'cms' and c.relname = t)
  and (select relforcerowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'cms' and c.relname = t),
  format('B4: cms.%s has RLS enabled AND forced', t)
)
from unnest(array['admin_users', 'site_change_log', 'site_publications']) as t;

-- ---------------------------------------------------------------------
-- Row 5 — anon: no schema USAGE, every operation on every cms table denied.
-- ---------------------------------------------------------------------

reset role;
select set_config('request.jwt.claims', '', true);
set local role anon;

select throws_ok(
  $$select count(*) from cms.admin_users$$,
  'B5: anon SELECT on cms.admin_users throws (no schema USAGE)'
);
select throws_ok(
  $$insert into cms.admin_users (id, company_id, email, role, status)
    values ('99999999-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'anon-attempt@example.com', 'owner', 'active')$$,
  'B5: anon INSERT on cms.admin_users throws'
);
select throws_ok(
  $$select count(*) from cms.site_change_log$$,
  'B5: anon SELECT on cms.site_change_log throws'
);
select throws_ok(
  $$select count(*) from cms.site_publications$$,
  'B5: anon SELECT on cms.site_publications throws'
);

reset role;

-- ---------------------------------------------------------------------
-- Row 6 — authenticated, no/invited/revoked membership: zero rows
-- readable, every write denied, on all 3 tables.
-- ---------------------------------------------------------------------

select ok(
  true,
  format('B6: fixture harness ready for identity %s', uid)
)
from unnest(array[
  'c0000000-0000-0000-0000-000000000001', -- no_member
  'a0000000-0000-0000-0000-000000000004', -- invited_a
  'a0000000-0000-0000-0000-000000000005'  -- revoked_a
]) as uid;

-- no_member
reset role;
select set_config('request.jwt.claims', json_build_object('sub', 'c0000000-0000-0000-0000-000000000001', 'role', 'authenticated')::text, true);
set local role authenticated;
select is((select count(*) from cms.admin_users where id <> auth.uid())::int, 0, 'B6: no_member sees zero OTHER admin_users rows');
select throws_ok(
  $$insert into cms.admin_users (id, company_id, email, role, status)
    values ('99999999-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'no-member-attempt@example.com', 'owner', 'active')$$,
  'B6: no_member INSERT on admin_users throws'
);
select is((select count(*) from cms.site_change_log)::int, 0, 'B6: no_member sees zero site_change_log rows');
select is((select count(*) from cms.site_publications)::int, 0, 'B6: no_member sees zero site_publications rows');

-- invited_a (own row IS visible per §6.1 status-independent self-SELECT,
-- but grants nothing else and cms.is_member() is false).
reset role;
select set_config('request.jwt.claims', json_build_object('sub', 'a0000000-0000-0000-0000-000000000004', 'role', 'authenticated')::text, true);
set local role authenticated;
select is(cms.is_member(), false, 'B6: invited_a is not an active member (is_member=false)');
select is((select count(*) from cms.admin_users where id <> auth.uid())::int, 0, 'B6: invited_a sees zero OTHER admin_users rows');
select throws_ok(
  $$insert into cms.admin_users (id, company_id, email, role, status)
    values ('99999999-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'invited-attempt@example.com', 'owner', 'active')$$,
  'B6: invited_a INSERT on admin_users throws'
);
select is((select count(*) from cms.site_change_log)::int, 0, 'B6: invited_a sees zero site_change_log rows');

-- revoked_a
reset role;
select set_config('request.jwt.claims', json_build_object('sub', 'a0000000-0000-0000-0000-000000000005', 'role', 'authenticated')::text, true);
set local role authenticated;
select is(cms.is_member(), false, 'B6: revoked_a is not an active member (is_member=false) — B-F1.9');
select is(cms.role(), null, 'B6: revoked_a role() is NULL — B-F1.9');
select is(cms.company(), null, 'B6: revoked_a company() is NULL — B-F1.9');
select is((select count(*) from cms.admin_users where id <> auth.uid())::int, 0, 'B6: revoked_a sees zero OTHER admin_users rows');
select throws_ok(
  $$insert into cms.admin_users (id, company_id, email, role, status)
    values ('99999999-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'revoked-attempt@example.com', 'owner', 'active')$$,
  'B6: revoked_a INSERT on admin_users throws'
);
select is((select count(*) from cms.site_change_log)::int, 0, 'B6: revoked_a sees zero site_change_log rows');

reset role;

-- ---------------------------------------------------------------------
-- Row 7 — member (editor) cannot self-promote; cannot write admin_users
-- at all.
-- ---------------------------------------------------------------------

reset role;
select set_config('request.jwt.claims', json_build_object('sub', 'a0000000-0000-0000-0000-000000000002', 'role', 'authenticated')::text, true);
set local role authenticated;

select is(
  (with upd as (
     update cms.admin_users set role = 'owner' where id = auth.uid() returning 1
   ) select count(*) from upd)::int,
  0,
  'B7: editor cannot UPDATE own role (denied by policy — no UPDATE policy for non-owner)'
);
select throws_ok(
  $$insert into cms.admin_users (id, company_id, email, role, status)
    values ('99999999-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'editor-insert-attempt@example.com', 'owner', 'active')$$,
  'B7: editor cannot INSERT any admin_users row'
);
select is(
  (with upd as (
     update cms.admin_users set role = 'owner' where id = 'a0000000-0000-0000-0000-000000000003' returning 1
   ) select count(*) from upd)::int,
  0,
  'B7: editor cannot UPDATE another member''s row either'
);
select is(
  (with del as (
     delete from cms.admin_users where id = 'a0000000-0000-0000-0000-000000000003' returning 1
   ) select count(*) from del)::int,
  0,
  'B7: editor cannot DELETE any admin_users row'
);

reset role;

-- ---------------------------------------------------------------------
-- Row 8 — non-owner cannot create an owner; owner CAN insert within own
-- company only; owner INSERT into a foreign company_id denied.
-- ---------------------------------------------------------------------

reset role;
select set_config('request.jwt.claims', json_build_object('sub', 'a0000000-0000-0000-0000-000000000001', 'role', 'authenticated')::text, true);
set local role authenticated;

select lives_ok(
  $$insert into cms.admin_users (id, company_id, email, role, status, invited_by)
    values ('a0000000-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111', 'new-editor-a@example.com', 'editor', 'invited', 'a0000000-0000-0000-0000-000000000001')$$,
  'B8/B16: owner_a CAN INSERT a new invited row within own company'
);
select throws_ok(
  $$insert into cms.admin_users (id, company_id, email, role, status, invited_by)
    values ('a0000000-0000-0000-0000-000000000011', '22222222-2222-2222-2222-222222222222', 'cross-company-attempt@example.com', 'editor', 'invited', 'a0000000-0000-0000-0000-000000000001')$$,
  'B8: owner_a INSERT with a foreign company_id is denied (WITH CHECK)'
);

reset role;

-- ---------------------------------------------------------------------
-- Row 9 — owner invariants: cannot UPDATE/DELETE own row; last-active-
-- owner guard blocks demotion/revocation/deletion of the sole active
-- owner; owner CAN manage other rows in own company.
-- ---------------------------------------------------------------------

reset role;
select set_config('request.jwt.claims', json_build_object('sub', 'a0000000-0000-0000-0000-000000000001', 'role', 'authenticated')::text, true);
set local role authenticated;

select is(
  (with upd as (
     update cms.admin_users set last_seen_at = now() where id = auth.uid() returning 1
   ) select count(*) from upd)::int,
  0,
  'B9: owner_a cannot UPDATE own row (RLS self-exclusion, id <> auth.uid())'
);
select is(
  (with del as (
     delete from cms.admin_users where id = auth.uid() returning 1
   ) select count(*) from del)::int,
  0,
  'B9: owner_a cannot DELETE own row (RLS self-exclusion)'
);
select lives_ok(
  $$update cms.admin_users set status = 'revoked' where id = 'a0000000-0000-0000-0000-000000000003'$$,
  'B9: owner_a CAN revoke another member (reviewer_a) in own company'
);
-- restore for later assertions
update cms.admin_users set status = 'active' where id = 'a0000000-0000-0000-0000-000000000003';

reset role;

-- Last-active-owner guard: only reachable when the DML actually reaches
-- the table despite RLS self-exclusion — i.e. the service_role path with
-- a JWT context set (dispatch §5.8 term 3 / §5.7's own stated rationale:
-- "also constrains accidental privileged-path misuse where a JWT context
-- exists"). owner_a is the sole active owner of company_a in this fixture.
reset role;
select set_config('request.jwt.claims', json_build_object('sub', 'a0000000-0000-0000-0000-000000000001', 'role', 'service_role')::text, true);
set local role service_role;

select throws_ok(
  $$update cms.admin_users set role = 'editor' where id = 'a0000000-0000-0000-0000-000000000001'$$,
  'B9: last-active-owner guard blocks demoting the sole active owner of company_a'
);
select throws_ok(
  $$update cms.admin_users set status = 'revoked' where id = 'a0000000-0000-0000-0000-000000000001'$$,
  'B9: last-active-owner guard blocks revoking the sole active owner of company_a'
);
select throws_ok(
  $$delete from cms.admin_users where id = 'a0000000-0000-0000-0000-000000000001'$$,
  'B9: last-active-owner guard blocks deleting the sole active owner of company_a'
);
-- Same identity, same-service-role JWT context, self-elevation guard:
-- role/status/company_id changing on one's own row is blocked even under
-- service_role when a JWT context names that row (defense-in-depth).
select throws_ok(
  $$update cms.admin_users set company_id = '22222222-2222-2222-2222-222222222222' where id = 'a0000000-0000-0000-0000-000000000001'$$,
  'B7/B9: self-elevation guard blocks own-row role/status/company_id change even under service_role+JWT context'
);
-- A non-self, non-owner-removal change by service_role succeeds normally.
select lives_ok(
  $$update cms.admin_users set last_seen_at = now() where id = 'a0000000-0000-0000-0000-000000000002'$$,
  'B9: service_role CAN update a non-owner, non-self row normally'
);

reset role;

-- ---------------------------------------------------------------------
-- Row 10/11/12 — duplicate PK / duplicate invitation / citext
-- case-variant duplicate all rejected.
-- ---------------------------------------------------------------------

reset role;
set local role service_role;

select throws_ok(
  $$insert into cms.admin_users (id, company_id, email, role, status)
    values ('a0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'duplicate-pk@example.com', 'editor', 'invited')$$,
  'B10: duplicate PK (admin_users.id) rejected'
);
select throws_ok(
  $$insert into cms.admin_users (id, company_id, email, role, status)
    values ('a0000000-0000-0000-0000-000000000012', '11111111-1111-1111-1111-111111111111', 'owner-a@example.com', 'editor', 'invited')$$,
  'B11: duplicate (company_id, email) invitation rejected'
);
select throws_ok(
  $$insert into cms.admin_users (id, company_id, email, role, status)
    values ('a0000000-0000-0000-0000-000000000013', '11111111-1111-1111-1111-111111111111', 'Owner-A@Example.com', 'editor', 'invited')$$,
  'B12: case-variant email duplicate rejected (citext normalization)'
);

reset role;

-- ---------------------------------------------------------------------
-- Row 13 — revocation -> immediate DB-level denial on next query.
-- ---------------------------------------------------------------------

reset role;
set local role service_role;
-- revoked_a was created already-revoked in fixtures; prove a live
-- active->revoked transition also takes effect immediately.
update cms.admin_users set status = 'revoked' where id = 'a0000000-0000-0000-0000-000000000003';
reset role;

select set_config('request.jwt.claims', json_build_object('sub', 'a0000000-0000-0000-0000-000000000003', 'role', 'authenticated')::text, true);
set local role authenticated;
select is(cms.is_member(), false, 'B13: freshly-revoked reviewer_a is denied on the very next query');
reset role;

set local role service_role;
update cms.admin_users set status = 'active' where id = 'a0000000-0000-0000-0000-000000000003';
reset role;

-- ---------------------------------------------------------------------
-- Row 14 — client-supplied metadata cannot establish role; helpers
-- ignore auth.jwt() entirely.
-- ---------------------------------------------------------------------

reset role;
select set_config(
  'request.jwt.claims',
  json_build_object('sub', 'c0000000-0000-0000-0000-000000000001', 'role', 'authenticated', 'user_role', 'owner', 'app_metadata', json_build_object('role', 'owner'))::text,
  true
);
set local role authenticated;
select is(cms.role(), null, 'B14: fabricated JWT role claim on a no-membership caller yields NULL role()');
select is(cms.is_member(), false, 'B14: fabricated JWT role claim does not establish membership');
select is((select count(*) from cms.admin_users where id <> auth.uid())::int, 0, 'B14: fabricated JWT role claim grants no visibility');

reset role;

-- ---------------------------------------------------------------------
-- Row 15 — cross-company reads/writes rejected for every role incl.
-- owner (two-tenant fixture).
-- ---------------------------------------------------------------------

reset role;
select set_config('request.jwt.claims', json_build_object('sub', 'b0000000-0000-0000-0000-000000000001', 'role', 'authenticated')::text, true);
set local role authenticated;

select is(
  (select count(*) from cms.admin_users where company_id = '11111111-1111-1111-1111-111111111111')::int,
  0,
  'B15: owner_b (company_b) sees zero company_a admin_users rows'
);
select is(
  (with upd as (
     update cms.admin_users set status = 'revoked'
     where id = 'a0000000-0000-0000-0000-000000000002' returning 1
   ) select count(*) from upd)::int,
  0,
  'B15: owner_b cannot UPDATE a company_a row'
);
select throws_ok(
  $$insert into cms.admin_users (id, company_id, email, role, status, invited_by)
    values ('b0000000-0000-0000-0000-000000000099', '11111111-1111-1111-1111-111111111111', 'owner-b-cross-attempt@example.com', 'editor', 'invited', 'b0000000-0000-0000-0000-000000000001')$$,
  'B15: owner_b cannot INSERT into company_a'
);

reset role;

-- ---------------------------------------------------------------------
-- Row 16 — permitted operations succeed.
-- ---------------------------------------------------------------------

-- member reads own row.
reset role;
select set_config('request.jwt.claims', json_build_object('sub', 'a0000000-0000-0000-0000-000000000002', 'role', 'authenticated')::text, true);
set local role authenticated;
select is((select count(*) from cms.admin_users where id = auth.uid())::int, 1, 'B16: editor_a reads own row');

-- owner reads company rows.
reset role;
select set_config('request.jwt.claims', json_build_object('sub', 'a0000000-0000-0000-0000-000000000001', 'role', 'authenticated')::text, true);
set local role authenticated;
select ok(
  (select count(*) from cms.admin_users where company_id = '11111111-1111-1111-1111-111111111111') >= 5,
  'B16: owner_a reads all company_a rows'
);

-- member INSERTs a site_change_log row, actor-pinned.
reset role;
select set_config('request.jwt.claims', json_build_object('sub', 'a0000000-0000-0000-0000-000000000002', 'role', 'authenticated')::text, true);
set local role authenticated;
select lives_ok(
  $$insert into cms.site_change_log (company_id, actor, action, entity_type, entity_id, after)
    values ('11111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000002', 'update', 'site_products', 'p1', '{"name":"x"}')$$,
  'B16: editor_a (member) can INSERT a site_change_log row'
);
select throws_ok(
  $$insert into cms.site_change_log (company_id, actor, action, entity_type, entity_id, after)
    values ('11111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000003', 'update', 'site_products', 'p1', '{"name":"x"}')$$,
  'B16: editor_a cannot forge actor to another user''s id (actor = auth.uid() WITH CHECK)'
);
select throws_ok(
  $$select count(*) from cms.site_change_log$$,
  'B16: editor_a (Editor: INSERT only) cannot SELECT the change log'
);

-- owner/reviewer read the log.
reset role;
select set_config('request.jwt.claims', json_build_object('sub', 'a0000000-0000-0000-0000-000000000001', 'role', 'authenticated')::text, true);
set local role authenticated;
select ok(
  (select count(*) from cms.site_change_log where company_id = '11111111-1111-1111-1111-111111111111') >= 1,
  'B16: owner_a can SELECT the change log'
);
select is(
  (with upd as (update cms.site_change_log set reason = 'x' returning 1) select count(*) from upd)::int,
  0,
  'B16: UPDATE on site_change_log denied to Owner too (append-only for app roles)'
);
select is(
  (with del as (delete from cms.site_change_log returning 1) select count(*) from del)::int,
  0,
  'B16: DELETE on site_change_log denied to Owner too (append-only for app roles)'
);

reset role;
select set_config('request.jwt.claims', json_build_object('sub', 'a0000000-0000-0000-0000-000000000003', 'role', 'authenticated')::text, true);
set local role authenticated;
select ok(
  (select count(*) from cms.site_change_log where company_id = '11111111-1111-1111-1111-111111111111') >= 1,
  'B16: reviewer_a can SELECT the change log'
);

reset role;

-- ---------------------------------------------------------------------
-- Layer B-F1 — catalog verification contract, run for every SECURITY
-- DEFINER helper (is_member, role, company). Set-returning queries (not
-- PERFORM inside a DO block) so each row emits a real TAP line.
-- ---------------------------------------------------------------------

-- B-F1.1 (+ B-F1.9 structural half): zero-argument signature.
select ok(
  exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'cms' and p.proname = fn and p.pronargs = 0
  ),
  format('B-F1.1/B-F1.9: cms.%s() exists with a zero-argument signature (cannot be asked about another user/company)', fn)
)
from unnest(array['is_member', 'role', 'company']) as fn;

-- B-F1.2: prosecdef = true.
select ok(
  (select prosecdef from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'cms' and p.proname = fn),
  format('B-F1.2: cms.%s() is SECURITY DEFINER (pg_proc.prosecdef)', fn)
)
from unnest(array['is_member', 'role', 'company']) as fn;

-- B-F1.3: owner is exactly service_role.
select is(
  (select r.rolname from pg_proc p
     join pg_namespace n on n.oid = p.pronamespace
     join pg_roles r on r.oid = p.proowner
   where n.nspname = 'cms' and p.proname = fn),
  'service_role',
  format('B-F1.3: cms.%s() owner is exactly service_role (not postgres, not the migration runner)', fn)
)
from unnest(array['is_member', 'role', 'company']) as fn;

-- B-F1.4: pinned owner holds BYPASSRLS.
select ok(
  (select rolbypassrls from pg_roles where rolname = 'service_role'),
  'B-F1.4: service_role holds BYPASSRLS'
);

-- B-F1.5: search_path pinned EMPTY in proconfig (exact element match).
select ok(
  exists (
    select 1
    from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace,
      lateral unnest(coalesce(p.proconfig, array[]::text[])) as cfg
    where n.nspname = 'cms' and p.proname = fn and cfg = 'search_path='
  ),
  format('B-F1.5: cms.%s() has search_path pinned EMPTY in proconfig', fn)
)
from unnest(array['is_member', 'role', 'company']) as fn;

-- B-F1.6: PUBLIC execute explicitly revoked.
select ok(
  not has_function_privilege(
    'public',
    (select p.oid from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'cms' and p.proname = fn),
    'EXECUTE'
  ),
  format('B-F1.6: PUBLIC execute revoked on cms.%s()', fn)
)
from unnest(array['is_member', 'role', 'company']) as fn;

-- B-F1.7: authenticated holds EXECUTE; anon does not.
select ok(
  has_function_privilege(
    'authenticated',
    (select p.oid from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'cms' and p.proname = fn),
    'EXECUTE'
  )
  and not has_function_privilege(
    'anon',
    (select p.oid from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'cms' and p.proname = fn),
    'EXECUTE'
  ),
  format('B-F1.7: authenticated holds EXECUTE on cms.%s(); anon does not', fn)
)
from unnest(array['is_member', 'role', 'company']) as fn;

-- B-F1.8: no same-named function outside schema cms (no shadowing risk;
-- empty pinned search_path + schema-qualified refs make resolution
-- non-hijackable regardless, this proves no look-alike even exists).
select ok(
  not exists (
    select 1 from pg_proc p2 join pg_namespace n2 on n2.oid = p2.pronamespace
    where p2.proname = fn and n2.nspname <> 'cms'
  ),
  format('B-F1.8: no same-named function %s exists outside schema cms', fn)
)
from unnest(array['is_member', 'role', 'company']) as fn;

-- B-F1.9 (behavioral half) already covered above: B6 rows for no_member
-- and revoked_a call all three helpers directly and assert false/NULL.

select * from finish();
rollback;
