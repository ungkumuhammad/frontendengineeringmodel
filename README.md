# Frontend Engineering Model

This repository has been consolidated from a set of standalone HTML engineering
calculators into a single, authenticated web application.

## → The application lives in [`Dashboard/`](./Dashboard)

The **Dashboard** is a Next.js (App Router) + TypeScript + TailwindCSS +
Supabase SaaS platform that unifies all the former standalone calculators
behind login, role-based access control, admin-driven user management, and full
login/activity auditing.

See **[`Dashboard/README.md`](./Dashboard/README.md)** for:

- What was migrated and where each tool now lives
- Architecture & folder structure
- Database schema + SQL migrations
- Local development, Supabase setup, and admin bootstrap
- Vercel deployment instructions

### Quick start

```bash
cd Dashboard
cp .env.example .env.local   # add your Supabase keys
npm install
npm run dev
```

The original calculators are preserved verbatim under
`Dashboard/public/modules/` and are surfaced as modules inside the dashboard.
