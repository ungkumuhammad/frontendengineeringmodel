-- =============================================================================
-- Security hardening for functions flagged by the Supabase database linter.
-- Already applied directly to the remote project during initial setup; this
-- file exists so a fresh `supabase db push` reproduces the same state.
-- =============================================================================

-- Pin search_path on the updated_at trigger function (advisor: mutable search_path).
alter function public.set_updated_at() set search_path = public, pg_temp;

-- handle_new_user is only ever invoked by the on_auth_user_created trigger.
-- Revoke direct RPC EXECUTE from public API roles (trigger execution is unaffected).
revoke execute on function public.handle_new_user() from anon, authenticated, public;
