# Deployment Learnings: Consolidation + Vercel/Supabase Go-Live

Consolidated learnings from migrating five standalone HTML calculators into
this Next.js + Supabase dashboard and getting it live on Vercel. Read this
before touching deployment config, middleware, or `components/admin/`.

## Current state (as of this writing)

- **Live URL:** `https://frontendengineeringmodel.vercel.app` — working,
  verified 200 on `/`, `/login`, `/admin/users` (redirect-when-unauthenticated
  confirmed; full authenticated click-through not yet done by an agent).
- **Vercel project:** `prj_kxKiQFDG5j7xNaoMaJQx3MRZfxFj`, team
  `team_lUjOAE16d0tSEZMNiO4OAvBN` (slug `ungku-m-zulhilmi`). Production branch
  is `main`. Root Directory is set to `Dashboard` in Vercel project settings
  (dashboard-only setting, not in git).
- **Supabase project:** ref `yblwfgazqqprchnezftv`. Schema, RLS, triggers, and
  one admin account (`ungkumzulhilmi.ungku@petronas.com.my`, role `admin`,
  confirmed, not banned) are live. Migration `0001_init.sql` plus a follow-up
  hardening migration (`harden_functions`, applied directly via MCP, **not**
  yet mirrored into a checked-in `.sql` file — see Follow-ups below) are both
  applied to the remote DB.
- **MCP access:** This session had `mcp__Vercel__*` and `mcp__Supabase__*`
  tools connected, which is what made direct debugging/fixing possible instead
  of just handing the user instructions. If a future session doesn't have
  these connected, check for them before assuming you must go back to
  "tell the user what to click."

## The four-layer deploy failure (all fixed, all on `main`)

The site returned different errors at each stage — each fix revealed the
next problem underneath. In order:

1. **Root Directory unset → whole-site 404.** The app lives in `Dashboard/`,
   not the repo root. Vercel found no `package.json` at the root and produced
   an empty static deploy. Fix: dashboard setting, Root Directory = `Dashboard`
   (exact case, no slashes). **This is not stored in git** — if the Vercel
   project is ever recreated, this must be set again manually.

2. **Edge middleware crashed at runtime (`MIDDLEWARE_INVOCATION_FAILED`).**
   `middleware.ts` used `@supabase/ssr`'s `createServerClient`, which pulls in
   `@supabase/supabase-js`, which references `process.version` — a Node-only
   API unsupported in Vercel's Edge runtime. This showed up first as a build
   *warning* locally (`next build` compiles it but warns), then as a hard
   `NOW_SANDBOX_WORKER_EDGE_FUNCTION_UNSUPPORTED_MODULES` deploy error, then —
   after removing the Supabase import but keeping middleware — as a
   `ReferenceError: __dirname is not defined` at request time.
   - Tried and **failed**: pinning `engines.node` to `22.x` (Vercel build log
     confirmed the pin took effect; error persisted anyway).
   - Tried and **failed**: a webpack `DefinePlugin` shim
     (`__dirname: JSON.stringify("/")`) scoped to `nextRuntime === "edge"` in
     `next.config.mjs`. Local build showed zero `__dirname` occurrences in the
     compiled edge bundle, yet the error still fired in production — meaning
     Vercel's `vercel build` step injects/wraps the edge function **after**
     webpack runs, so webpack-level fixes can't reach it.
   - **What actually worked:** delete `middleware.ts` entirely. Its logic was
     redundant with the server-side guards that already existed
     (`requireUser()`/`requireAdmin()` in `lib/auth.ts`, called from
     `app/(app)/layout.tsx` and `app/admin/layout.tsx`, which already redirect
     unauthenticated/wrong-role users). The one middleware-only behavior —
     bouncing an already-logged-in user off `/login` — was moved into
     `app/login/page.tsx` as a server component check
     (`getCurrentProfile()` + `redirect()`).
   - **Takeaway for future work:** if this app ever needs Edge middleware
     again (e.g. for geolocation, A/B testing, or fast-path redirects), do
     **not** import `@supabase/ssr` or any Supabase client into it. If you
     need auth state at the edge, read/check the `sb-*-auth-token` cookie's
     mere *presence* (not its validity) for a cheap pre-redirect, and always
     keep the authoritative check server-side in a layout/page. Full
     signature/JWT verification at the edge would require a JWT library that
     doesn't pull Node built-ins (e.g. `jose`), not `supabase-js`.

3. **Framework preset was `null` on the Vercel project → all Next.js routes
   404'd, but static `public/` files (the migrated `.html` calculators) served
   fine with 200.** This is diagnostic gold for next time: *if static assets
   work but every app route 404s, the framework isn't being detected/applied,*
   not a code bug. Root cause here is unconfirmed (possibly interaction with
   Root Directory being set after initial project creation), but the fix was
   trivial and durable: add `Dashboard/vercel.json` with
   `{"framework": "nextjs"}`. This is checked into git, so it survives
   project recreation unlike the Root Directory setting.

4. **RSC client-reference-manifest crash on `/admin/users` only**
   (`Could not find the module ".../user-management.tsx#UserManagement#Table"
   in the React Client Manifest`). Root cause:
   `components/admin/user-management.tsx` is a `"use client"` file that
   exported its two components grouped into a plain object at the bottom:
   ```ts
   export const UserManagement = { CreateButton, Table: UsersTable };
   ```
   and the server component `app/admin/users/page.tsx` referenced them as
   `<UserManagement.CreateButton />` / `<UserManagement.Table .../>`.
   **Next's RSC client-reference compiler only tracks direct named/default
   exports of a `"use client"` module** — property access on a grouped export
   object can't be resolved against the production client manifest. This is
   invisible in `next dev` (no manifest check) and even survives a full
   `next build` locally without erroring — it only surfaces as a *runtime*
   error in production, and only on the specific page that renders the
   affected component. Fix: export components directly
   (`export { CreateButton as UserManagementCreateButton }`, etc.) and import
   by name in the server page.
   - **General rule to carry forward:** never group `"use client"` component
     exports into an object/namespace and access them via property syntax
     from a server component. Always `export { X, Y }` (or default-export a
     single component per client file) and import by name. Grep for
     `^export (const|default) \w+ = \{` in `components/` before shipping to
     catch this pattern again — it was checked once this session
     (`components/admin/user-management.tsx` was the only offender) but new
     client components could reintroduce it.

## Debugging technique that worked well

- **`mcp__Vercel__web_fetch_vercel_url`** was essential — this sandbox's
  direct `curl`/`Bash` network access is blocked (goes through a proxy that
  doesn't reach the public internet for arbitrary HTTPS), so verifying the
  live site required going through Vercel's own fetch tool. `Bash` + `curl`
  against the live URL fails silently (`exit 56`, empty response) — don't
  waste time retrying that path in this environment; go straight to the MCP
  fetch tool.
- **`mcp__Vercel__get_runtime_errors`** and **`get_runtime_logs`** (scoped by
  `deploymentId`) were the fastest way to get the *actual* server-side
  stack trace / digest — the browser only shows "A server error has occurred
  ... digest property," which is useless on its own. Always pull runtime
  logs scoped to the specific deployment ID you just shipped, not just "last
  N minutes," since stale errors from a previous (already-fixed) deployment
  can still show up in a time-window query and cause false alarms (this
  happened once this session — errors attributed to
  `lastDeployment=dpl_CcZR...` were from the *prior* deploy, not the one just
  verified).
- **Local `next build` is necessary but not sufficient** for catching
  Vercel-specific failures. Two of the four failure layers above (`__dirname`
  in the edge bundle, and the RSC client manifest error) built cleanly with
  zero errors/warnings locally and only broke in Vercel's actual production
  deploy. Don't declare victory on `next build` succeeding — verify the live
  URL via MCP after every deploy-affecting change.
- **Rebuild-and-poll cadence used:** push → `ScheduleWakeup`/background
  `sleep` for ~100s → `mcp__Vercel__list_deployments` filtered by `since=<last
  known deployment timestamp>` → check `state` → if `READY`, fetch the live
  URL; if `ERROR`, pull `get_deployment` (for `errorCode`/`errorMessage`) and
  `get_deployment_build_logs` (tail, `errorsOnly: true`) before guessing.

## Architecture decisions worth remembering

- **Migrated calculators are embedded via iframe (`components/layout/
  module-frame.tsx`), not rewritten to React.** The five original HTML files
  (`gas-power-lcoe-calculator.html`, `TCOE_Multigas Converter.html`,
  `pipeline-sizing-calculator.html`, `hydrogen-pipeline-sizing.html`,
  `ammonia-pipeline-sizing.html`) are byte-identical copies under
  `Dashboard/public/modules/*.html`, served statically and framed by
  `/modules/[slug]`. This was a deliberate choice to guarantee zero
  functional regression on calculators with thousands of lines of validated
  domain logic (see `Dashboard/docs/legacy-lcoe-notes.md` for the LCOE
  calculator's own internal learnings). Do not "helpfully" rewrite these into
  native React components without being asked — the whole point was
  preserving them verbatim.
- **Auth/authz is enforced twice, deliberately:** RLS policies in Postgres
  (defense at the data layer) plus `requireUser()`/`requireAdmin()` in every
  protected layout (defense at the app layer). There is currently **no**
  Edge middleware layer (see failure #2 above) — this is intentional, not an
  oversight, given the `__dirname` issue couldn't be worked around.
- **Service-role key usage is confined to `lib/supabase/admin.ts` and
  `services/audit.ts`** (server-only, used for user CRUD and audit-log
  writes that must bypass RLS). Never import `createAdminClient` into
  anything that isn't already server-only.

## Security follow-ups (not yet done, flag if picking this up)

1. **Rotate the Supabase `service_role` key.** It was pasted into this chat
   session by the user during setup. Anyone with that key bypasses all RLS.
   Rotate via Supabase → Project Settings → API → reset, then update the
   Vercel env var (`SUPABASE_SERVICE_ROLE_KEY`) and redeploy.
2. **The `harden_functions` migration was applied directly to the remote DB
   via `mcp__Supabase__apply_migration` but was never written to a checked-in
   `.sql` file in `supabase/migrations/`.** It pinned `search_path` on
   `set_updated_at()` and revoked public `EXECUTE` on `handle_new_user()`
   (advisor-flagged findings). Anyone rebuilding this Supabase project from
   the migrations folder alone would be missing this hardening — a
   `0003_harden_functions.sql` should be added to close that gap:
   ```sql
   alter function public.set_updated_at() set search_path = public, pg_temp;
   revoke execute on function public.handle_new_user() from anon, authenticated, public;
   ```
3. **"Leaked password protection" is disabled** in Supabase Auth (advisor
   WARN, optional). Toggle under Authentication → Policies if desired.
4. **Framework preset shows `null`** in `mcp__Vercel__get_project` output
   even though `vercel.json` overrides it at build time and everything works.
   Cosmetic only — Settings → Framework Preset → Next.js in the dashboard
   would clean this up but isn't required.

## Full failure→fix commit chain (for `git log` orientation)

```
2ef69db  Consolidate standalone calculators into a Next.js + Supabase dashboard
2df3a19  (empty) Trigger Vercel production deploy with Root Directory + env vars configured
a90051d  Make middleware Edge-safe by removing Supabase from the edge bundle       [attempt 1, failed]
713e4e4  Pin build to Node 22 to fix edge middleware __dirname error               [attempt 2, failed]
1ec4f08  Define __dirname in edge build to fix MIDDLEWARE_INVOCATION_FAILED        [attempt 3, failed]
8c50f0d  Remove edge middleware; rely on server-side auth guards                   [worked]
1b55188  Add vercel.json to force Next.js framework preset                        [worked]
afa1bfc  Fix RSC client manifest error on /admin/users                            [worked]
```
