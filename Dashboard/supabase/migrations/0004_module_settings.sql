-- =============================================================================
-- Module visibility: lets an admin hide a module from the dashboard with a
-- button in the Administration panel (/admin/modules), without a code change.
-- A module with no row here is visible. Modules themselves stay defined in
-- lib/modules.ts; this table only stores the per-slug hidden flag.
-- =============================================================================

create table if not exists public.module_settings (
  slug        text primary key,
  hidden      boolean not null default false,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users (id) on delete set null
);

drop trigger if exists module_settings_set_updated_at on public.module_settings;
create trigger module_settings_set_updated_at
  before update on public.module_settings
  for each row execute function public.set_updated_at();

alter table public.module_settings enable row level security;

-- Every signed-in user reads the flags (the sidebar, /modules and /dashboard
-- filter on them). Writes happen only through the service-role key in the
-- admin server action, so no INSERT/UPDATE/DELETE policy is defined.
drop policy if exists "module_settings_select_authenticated" on public.module_settings;
create policy "module_settings_select_authenticated"
  on public.module_settings for select
  to authenticated
  using (true);
