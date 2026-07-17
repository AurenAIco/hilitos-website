-- ADM1a-S4: identity/security-core foundation — extensions + cms schema
-- Dispatch: HILITOS_ADM1A_S4_IMPLEMENTATION_DISPATCH_2026-07-17.md
-- (SHA256 1bf1be60b4e65662426bd315f6e0d73359b074b1d9c34015279ea8c380670945)
--
-- citext gives case-insensitive email matching/uniqueness at the type level
-- (dispatch §5.5) rather than relying on application-level normalization.
create extension if not exists citext with schema extensions;

-- cms holds the identity/admin data model. It is never added to
-- [api].schemas (supabase/config.toml) — identity tables stay off the
-- local Data API surface by construction (dispatch §8, INV-10 local posture;
-- live PostgREST-exposure proof is deferred to G3 per canon).
create schema if not exists cms;

comment on schema cms is
  'ADM1a identity/security core (ADM0 §21 ownership tree). Never added to '
  '[api].schemas — not exposed to PostgREST locally or live.';

-- Minimum schema-level grants: authenticated and service_role only.
-- anon receives no USAGE on cms at any layer (dispatch §6 global posture:
-- grant absence + RLS + non-exposed schema = three independent layers).
grant usage on schema cms to authenticated;
grant usage on schema cms to service_role;

-- service_role additionally needs CREATE on cms: Postgres requires the new
-- owner of an object to hold CREATE on its schema before ownership can be
-- transferred to it (checked at ALTER ... OWNER TO time). This is a direct,
-- necessary consequence of the §6.0 pinned-owner contract — every
-- membership helper below is owned by service_role — not a widening of
-- its trust boundary (§6 already grants service_role full table-level
-- access throughout cms).
grant create on schema cms to service_role;
