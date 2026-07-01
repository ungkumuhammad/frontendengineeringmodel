-- =============================================================================
-- Engineering Dashboard — initial schema
-- Tables: profiles, login_logs, activity_logs
-- Includes: enum, indexes, RLS policies, auth trigger, updated_at trigger
-- Run in the Supabase SQL editor, or via `supabase db push`.
-- =============================================================================

-- ---- Enums -----------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('admin', 'user');
  end if;
end$$;

-- ---- profiles --------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null unique,
  name        text,
  role        public.user_role not null default 'user',
  disabled    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_email_idx on public.profiles (email);

-- ---- login_logs ------------------------------------------------------------
create table if not exists public.login_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users (id) on delete set null,
  email        text not null,
  ip_address   text,
  user_agent   text,
  login_time   timestamptz not null default now(),
  logout_time  timestamptz,
  session_id   text
);

create index if not exists login_logs_user_idx on public.login_logs (user_id);
create index if not exists login_logs_login_time_idx on public.login_logs (login_time desc);
create index if not exists login_logs_open_idx
  on public.login_logs (user_id) where logout_time is null;

-- ---- activity_logs ---------------------------------------------------------
create table if not exists public.activity_logs (
  id          uuid primary key default gen_random_uuid(),
  timestamp   timestamptz not null default now(),
  user_id     uuid references auth.users (id) on delete set null,
  user_email  text,
  action      text not null,
  target      text,
  metadata    jsonb
);

create index if not exists activity_logs_timestamp_idx on public.activity_logs (timestamp desc);
create index if not exists activity_logs_action_idx on public.activity_logs (action);
create index if not exists activity_logs_user_idx on public.activity_logs (user_id);

-- =============================================================================
-- Helper: is the current auth user an admin? (SECURITY DEFINER avoids the
-- recursive RLS problem of selecting profiles from within a profiles policy.)
-- =============================================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and disabled = false
  );
$$;

-- =============================================================================
-- updated_at maintenance
-- =============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- =============================================================================
-- Auto-create a profile row when a new auth user is created (default role
-- 'user'). Admin-created users are then upserted by the app with their role.
-- =============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', null),
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.profiles     enable row level security;
alter table public.login_logs   enable row level security;
alter table public.activity_logs enable row level security;

-- profiles ------------------------------------------------------------------
drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

-- Users may update their own name only; role/disabled changes go through the
-- service-role key in server actions (which bypass RLS). Admin UPDATE via the
-- app also uses the service role, so no admin UPDATE policy is required here.
drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- login_logs (admin read-only; writes happen via service role) ---------------
drop policy if exists "login_logs_select_admin" on public.login_logs;
create policy "login_logs_select_admin"
  on public.login_logs for select
  using (public.is_admin());

-- activity_logs (admin read-only; writes happen via service role) ------------
drop policy if exists "activity_logs_select_admin" on public.activity_logs;
create policy "activity_logs_select_admin"
  on public.activity_logs for select
  using (public.is_admin());

-- Note: no INSERT/UPDATE/DELETE policies are defined for login_logs and
-- activity_logs. With RLS enabled and no permissive write policy, the anon /
-- authenticated roles cannot write to them — only the service-role key (used
-- exclusively in trusted server actions) can. This is intentional.
