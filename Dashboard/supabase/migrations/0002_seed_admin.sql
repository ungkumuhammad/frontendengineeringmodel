-- =============================================================================
-- Seed the first admin account.
--
-- Supabase does not allow inserting into auth.users with a valid password hash
-- from plain SQL portably, so the recommended flow is:
--
--   1. Create the auth user (either in the Supabase dashboard: Authentication ->
--      Users -> "Add user", with "Auto Confirm User" checked; or via the
--      admin API). Use the email you want for your first administrator.
--   2. Run the statement below to promote that user to the 'admin' role.
--      The handle_new_user() trigger will already have created a 'user' profile.
--
-- Replace the email with your real admin email before running.
-- =============================================================================

update public.profiles
set role = 'admin', disabled = false
where email = 'admin@example.com';

-- Verify:
--   select id, email, name, role, disabled from public.profiles;
