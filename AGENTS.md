# Repo Scope

- This root is not a package workspace. Work inside `olympus-bite-ft/` (Next.js frontend) or `olympus-bite-bk/` (NestJS backend); root-level `README.md` is only a high-level overview.
- There is no root `package.json`, lockfile, or task runner. Install, run, lint, and test from the target app directory.

# Frontend (`olympus-bite-ft`)

- Stack: Next.js 16 App Router, React 19, Tailwind v4.
- Real route entrypoints are under `app/`: public auth pages in `app/(auth)/{login,register}`, authenticated app pages in `app/(app)/*`.
- Shared UI and utilities live in `shared/`; feature-specific logic lives in `features/`.
- Auth state is entirely client-side in `features/auth/hooks/useAuth.tsx` via `localStorage` keys `ob_token` and `ob_user`.
- API calls go through `shared/lib/api.ts`; `NEXT_PUBLIC_API_URL` may be either the API origin or full `/api/v1` base because the helper appends `/api/v1` when missing.
- Default commands:
  - `npm install`
  - `npm run dev`
  - `npm run build`
  - `npm run lint`
- There is no dedicated test script or separate typecheck script in the frontend package.

# Backend (`olympus-bite-bk`)

- Stack: NestJS 11, Prisma, Supabase, Gemini.
- HTTP API is mounted under `/api/v1` in `src/main.ts`; controllers are registered from `src/modules/*/infrastructure/adapters/http/*.controller.ts` via `src/app.module.ts`.
- Main domain modules currently wired in: `auth`, `users`, `meals`, `routines`, `dashboard`, `tasks`.
- Prisma schema and migrations live in `prisma/`. `npm run build` runs `prisma generate && nest build`; `start:dev`, `test`, and `test:e2e` do not regenerate the Prisma client.
- Backend lint is mutating: `npm run lint` runs ESLint with `--fix`.
- Default commands:
  - `npm install`
  - `npm run start:dev`
  - `npm run build`
  - `npm run lint`
  - `npm run test`
  - `npm run test:e2e`
- The checked-in e2e test is still the Nest starter smoke test (`GET /` => `Hello World!`); do not treat it as meaningful feature coverage.
- `scripts/fix-trainer-links.ts` is a one-off repair script with a dry-run default and `--apply` for real writes.

# Cross-App Gotchas

- Port defaults conflict if you start both apps naively: frontend `npm run dev` defaults to `3000`, backend also defaults to `3000`, but backend CORS allowlist expects the frontend at `http://localhost:3001`. In local full-stack work, run the frontend on `3001` or set `FRONTEND_URL` explicitly.
- Meals features depend on backend env vars for Supabase and Gemini (`SUPABASE_URL`, `SUPABASE_KEY`, `GEMINI_API_KEY`); auth registration also reads `ADMIN_INVITATION_CODE`.
- A backend `.env` is present in-repo. Treat it as sensitive: do not print, rewrite, or commit secrets casually.

# Verification

- Frontend-focused change: run `npm run lint` and, when routing/rendering changed, `npm run build` inside `olympus-bite-ft`.
- Backend-focused change: run `npm run lint`, then the narrowest useful test (`npm run test` or `npm run test:e2e`), and use `npm run build` when Prisma types or compile-time wiring changed.
