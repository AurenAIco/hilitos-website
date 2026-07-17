-- ADM1a-S4: cms.site_publications + cms.site_change_log — audit substrate
-- (ADM0 §10.10/§10.11 verbatim shapes; dispatch §6.2/§6.3 RLS + grants)
-- Dispatch: HILITOS_ADM1A_S4_IMPLEMENTATION_DISPATCH_2026-07-17.md
-- (SHA256 1bf1be60b4e65662426bd315f6e0d73359b074b1d9c34015279ea8c380670945)
--
-- Both tables are ADM1a-G3's actual editorial audit trail; S4 ships the
-- schema/policy foundation only (dispatch §3) — no editorial rows are
-- ever written by this slice.

-- ---------------------------------------------------------------------
-- cms.site_publications (ADM0 §10.10) — one row per publish event.
-- ---------------------------------------------------------------------

create table cms.site_publications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  actor uuid not null references cms.admin_users (id),
  published_at timestamptz not null default now(),
  scope text not null check (
    scope in ('product', 'homepage', 'page', 'settings', 'collection', 'category', 'batch')
  ),
  entity_ref text,
  from_version integer,
  to_version integer,
  note text
);

comment on table cms.site_publications is
  'One row per publish event (ADM0 §10.10). from_version/to_version '
  'reference the entity''s version; publish is idempotent per '
  '(entity, to_version). No public exposure.';

alter table cms.site_publications enable row level security;
alter table cms.site_publications force row level security;

-- Grants: authenticated gets the full verb set; RLS policies below narrow
-- per role. service_role gets INSERT only on THIS table (narrower than
-- site_change_log below) — matches dispatch §6.3 literally; do not widen.
grant select, insert, update, delete on cms.site_publications to authenticated;
grant insert on cms.site_publications to service_role;

-- INSERT: Editor or Owner, company- and actor-pinned (dispatch §6.3).
-- "Via publish action only" is an app-layer gate (S3+), not expressible in
-- RLS alone — stated honestly, not silently assumed.
create policy site_publications_insert_editor_owner on cms.site_publications
  for insert
  to authenticated
  with check (
    cms.role() in ('editor', 'owner')
    and company_id = cms.company()
    and actor = auth.uid()
  );

-- SELECT: Owner or Reviewer, own company.
create policy site_publications_select_owner_reviewer on cms.site_publications
  for select
  to authenticated
  using (cms.role() in ('owner', 'reviewer') and company_id = cms.company());

-- UPDATE/DELETE: Owner, own company only. ADM0 §9.2 verbatim stance
-- (Owner full, including UPDATE/DELETE) — followed as canon states rather
-- than inventing an append-only symmetry with site_change_log ADM0 did
-- not specify. Flagged for reviewer attention (dispatch §19 R-4).
create policy site_publications_update_owner on cms.site_publications
  for update
  to authenticated
  using (cms.role() = 'owner' and company_id = cms.company())
  with check (company_id = cms.company());

create policy site_publications_delete_owner on cms.site_publications
  for delete
  to authenticated
  using (cms.role() = 'owner' and company_id = cms.company());


-- ---------------------------------------------------------------------
-- cms.site_change_log (ADM0 §10.11) — append-only (for app roles) audit
-- of every material edit + publication.
-- ---------------------------------------------------------------------

create table cms.site_change_log (
  id bigint generated always as identity primary key,
  company_id uuid not null,
  actor uuid not null references cms.admin_users (id),
  action text not null check (
    action in ('create', 'update', 'delete', 'reorder', 'upload', 'publish', 'archive', 'revert')
  ),
  entity_type text not null,
  entity_id text not null,
  before jsonb,
  after jsonb,
  publication_id uuid references cms.site_publications (id),
  reason text,
  created_at timestamptz not null default now()
);

comment on table cms.site_change_log is
  'Append-only (for application roles) audit of every material edit + '
  'publication (ADM0 §10.11). entity_type/entity_id are intentionally '
  'FK-free (S-L2) so audit history survives entity deletion/archival. '
  'before/after carry field values and media ids/paths only — never file '
  'bytes, never secrets. No public exposure.';

alter table cms.site_change_log enable row level security;
alter table cms.site_change_log force row level security;

-- Grants: authenticated gets SELECT + INSERT only — UPDATE/DELETE have NO
-- grant at all (double-layer denial: absent grant AND absent policy,
-- dispatch §6.2). service_role gets full (minimized; a dedicated
-- inserts-only role is the G3/S-M1 preference, not adopted here).
grant select, insert on cms.site_change_log to authenticated;
grant select, insert, update, delete on cms.site_change_log to service_role;

-- INSERT: any active member, company- and actor-pinned (dispatch §6.2 /
-- ADM0 §9.2 construction rule "INSERT allowed to members"). A reviewer's
-- writes are app-layer-denied in S3+; its own audit inserts are
-- server-mediated — not a DB-level distinction this policy can express.
create policy site_change_log_insert_member on cms.site_change_log
  for insert
  to authenticated
  with check (
    cms.is_member()
    and company_id = cms.company()
    and actor = auth.uid()
  );

-- SELECT: Owner or Reviewer, own company. Editor has INSERT only — no
-- SELECT policy exists for editor (ADM0 §9.2: Editor "INSERT only").
create policy site_change_log_select_owner_reviewer on cms.site_change_log
  for select
  to authenticated
  using (cms.role() in ('owner', 'reviewer') and company_id = cms.company());

-- No UPDATE/DELETE policy exists for any application role, including
-- Owner (dispatch §6.2 — append-only for app roles, S-M1). Combined with
-- the grant absence above, this is denial by two independent layers.
