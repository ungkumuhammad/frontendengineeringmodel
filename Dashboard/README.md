# Engineering Dashboard

A centralized, authenticated SaaS platform that consolidates the previously
standalone engineering calculators (LCOE, multi-fuel energy balance, and
pipeline sizing tools) into a single Next.js application with role-based access
control, admin-driven user management, and full login/activity auditing.

Built with **Next.js (App Router) · TypeScript · TailwindCSS · React · Supabase
· Vercel**.

---

## Table of contents

1. [What was migrated](#what-was-migrated)
2. [Architecture & folder structure](#architecture--folder-structure)
3. [Database schema](#database-schema)
4. [Local development](#local-development)
5. [Supabase setup](#supabase-setup)
6. [Creating the first admin](#creating-the-first-admin)
7. [Vercel deployment](#vercel-deployment)
8. [Security model](#security-model)

---

## What was migrated

The repository previously contained five standalone, self-contained HTML
calculators. Each has been migrated into the platform as an **embedded module**
(the original tool is served from `public/modules/` and surfaced through a typed
Next.js route + the reusable `<ModuleFrame>` component inside the authenticated
dashboard shell). This preserves 100% of each calculator's behaviour — including
its inline calculation engine and client-side Excel export — while providing
centralized auth, navigation, and a maintainable module registry
(`lib/modules.ts`).

| Original file | Module route |
| --- | --- |
| `gas-power-lcoe-calculator.html` | `/modules/gas-power-lcoe` |
| `TCOE_Multigas Converter.html` | `/modules/multigas-converter` |
| `pipeline-sizing-calculator.html` | `/modules/pipeline-sizing` (H2 & NH3 Pipeline Sizing Calculator) |

New modules can be authored natively in React by adding an entry to
`lib/modules.ts` and rendering a component instead of `<ModuleFrame>`.

---

## Architecture & folder structure

```
Dashboard/
├── app/
│   ├── (app)/                  # Authenticated user shell (requireUser)
│   │   ├── layout.tsx
│   │   ├── dashboard/          # /dashboard  (user home)
│   │   ├── modules/            # /modules and /modules/[slug]
│   │   └── settings/           # /settings  (self-service profile/password)
│   ├── admin/                  # Admin shell (requireAdmin)
│   │   ├── layout.tsx
│   │   ├── page.tsx            # /admin  (admin home + recent logins)
│   │   ├── users/             # /admin/users + server actions (CRUD)
│   │   ├── logins/            # /admin/logins  (login audit)
│   │   └── audit/             # /admin/audit   (activity audit)
│   ├── login/                  # /login + auth server actions
│   ├── unauthorized/           # /unauthorized
│   ├── page.tsx                # /  → redirects by auth + role
│   ├── layout.tsx              # Root layout (theme + toast providers)
│   ├── error.tsx / not-found.tsx
│   └── globals.css
├── components/
│   ├── ui/                     # Card, Table, Button, Input, Badge, Modal,
│   │                           # Pagination, SearchInput, Toast, states…
│   ├── layout/                 # Sidebar, Topbar, AppShell, ThemeProvider,
│   │                           # ModuleFrame, nav-config
│   ├── modules/                # ModuleCard
│   └── admin/                  # UserManagement (table + CRUD modals)
├── lib/
│   ├── supabase/               # client / server / admin / middleware clients
│   ├── auth.ts                 # requireUser / requireAdmin guards
│   ├── modules.ts              # module registry (single source of truth)
│   └── utils.ts
├── services/
│   └── audit.ts                # login_logs + activity_logs writers
├── hooks/
├── types/                      # domain types + typed Database schema
├── supabase/
│   └── migrations/             # 0001_init.sql, 0002_seed_admin.sql
├── public/modules/             # migrated legacy calculators (HTML)
├── middleware.ts               # route protection + session refresh
├── .env.example
└── package.json
```

### Route map

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | public | Redirects to `/login`, `/dashboard`, or `/admin` |
| `/login` | public | Email/password sign-in (no public sign-up) |
| `/dashboard` | user | User home + module catalog |
| `/modules`, `/modules/[slug]` | user | Module catalog + embedded tools |
| `/settings` | user | Self-service profile & password |
| `/admin` | admin | Metrics + recent login activity |
| `/admin/users` | admin | Full user management (CRUD) |
| `/admin/logins` | admin | Login audit trail |
| `/admin/audit` | admin | Activity audit trail |
| `/unauthorized` | authed | Shown when a user hits an admin route |

---

## Database schema

Three tables (full DDL in `supabase/migrations/0001_init.sql`):

- **`profiles`** — `id` (FK → `auth.users`), `email`, `name`, `role`
  (`admin`｜`user` enum), `disabled`, `created_at`, `updated_at`.
- **`login_logs`** — `id`, `user_id`, `email`, `ip_address`, `user_agent`,
  `login_time`, `logout_time`, `session_id`.
- **`activity_logs`** — `id`, `timestamp`, `user_id`, `user_email`, `action`,
  `target`, `metadata` (jsonb).

Includes indexes, an `is_admin()` `SECURITY DEFINER` helper (avoids recursive
RLS), an `updated_at` trigger, and a `handle_new_user()` trigger that
auto-creates a profile for every new auth user.

---

## Local development

```bash
cd Dashboard
cp .env.example .env.local        # fill in your Supabase values
npm install
npm run dev                       # http://localhost:3000
```

Useful scripts: `npm run build`, `npm run typecheck`, `npm run lint`.

---

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In **Project Settings → API**, copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (server-only!)
3. In **SQL Editor**, run `supabase/migrations/0001_init.sql`.
   (Or use the Supabase CLI: `supabase db push`.)
4. Put the three values in `.env.local` (local) and in Vercel env vars (prod).

---

## Creating the first admin

There is no public sign-up — the first admin is bootstrapped once, then all
further accounts are created from **/admin/users** inside the app.

1. In the Supabase dashboard: **Authentication → Users → Add user**. Enter the
   admin email + password and check **Auto Confirm User**.
2. In **SQL Editor**, promote that user (edit the email first):

   ```sql
   update public.profiles set role = 'admin' where email = 'you@company.com';
   ```

   (This is exactly `supabase/migrations/0002_seed_admin.sql`.)
3. Sign in at `/login` → you land on `/admin`. From there, create all other
   users; no further Supabase-dashboard access is required.

---

## Vercel deployment

1. Push this repo to GitHub.
2. In Vercel: **New Project → import the repo**. Set the **Root Directory** to
   `Dashboard`.
3. Add environment variables (Project → Settings → Environment Variables):

   | Variable | Scope |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | All |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All |
   | `SUPABASE_SERVICE_ROLE_KEY` | All (server-only; never exposed) |

4. Deploy. Next.js is auto-detected — no extra build config needed.
5. In Supabase **Authentication → URL Configuration**, add your Vercel domain
   to the allowed redirect/site URLs.

---

## Security model

- **Middleware** (`middleware.ts`) refreshes the session and redirects
  unauthenticated users to `/login` and non-admins away from `/admin/*`.
- **Server-side guards** (`requireUser` / `requireAdmin`) re-check auth and role
  in every protected layout — defense in depth beyond middleware.
- **Row Level Security** on all tables: users can read only their own profile;
  `login_logs` / `activity_logs` are admin-read-only; audit tables have **no**
  client write policy (only the service role writes them).
- **Service-role key is server-only** — used exclusively in server actions for
  admin user management and audit writes. It is never imported into a client
  component and never exposed to the browser.
- **No secrets in the frontend** — only the `NEXT_PUBLIC_*` anon key reaches the
  client, and RLS governs everything it can do.
