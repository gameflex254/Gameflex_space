# GameFlex

A production-ready competitive gaming platform: tournaments, squads, matches,
wallets, leaderboards, messaging and a social feed.

Built with **TanStack Start** (React 19, SSR), **Vite**, **Tailwind CSS v4**,
**TanStack Query** and a **swappable backend layer** (Supabase by default).

## Requirements

- Node.js 20+ (or Bun 1.1+)
- A Postgres-backed auth/data provider — Supabase (hosted or self-hosted) works out of the box

## Quick start

```sh
git clone <this-repository-url>
cd gameflex
npm install          # or: bun install
cp .env.example .env # fill in your own values
npm run dev
```

The app runs at http://localhost:8080.

## Scripts

| Script              | Purpose                                                |
| ------------------- | ------------------------------------------------------ |
| `npm run dev`       | Start the dev server with HMR                          |
| `npm run build`     | Production build (`dist/`)                          |
| `npm start`         | Run the built server (`node dist/server/index.mjs`) |
| `npm run typecheck` | TypeScript check, no emit                              |
| `npm run lint`      | ESLint                                                 |
| `npm run format`    | Prettier                                               |

## Configuration

Everything is driven by environment variables — see `.env.example` for the full
list. No hosting platform, vendor SDK or proprietary service is required.

### Backend providers

Each capability is selected independently, so you can migrate one piece at a
time (details in [`docs/backend-providers.md`](docs/backend-providers.md)):

| Variable                 | Values                        | Default    |
| ------------------------ | ----------------------------- | ---------- |
| `VITE_BACKEND_PROVIDER`  | `supabase`, `rest`            | `supabase` |
| `VITE_AUTH_PROVIDER`     | `supabase`, `custom`          | `supabase` |
| `VITE_STORAGE_PROVIDER`  | `supabase`, `s3`, `r2`, `vps` | `r2`      |
| `VITE_REALTIME_PROVIDER` | `supabase`, `none`            | `supabase` |

Supply the matching credentials (`VITE_SUPABASE_URL`,
`VITE_SUPABASE_PUBLISHABLE_KEY`, or `VITE_BACKEND_REST_URL` /
`VITE_AUTH_API_URL` / `VITE_STORAGE_API_URL`) for whichever providers you pick.

### Branding, auth and observability

- `VITE_APP_NAME`, `VITE_APP_DESCRIPTION`, `VITE_SITE_URL`, `VITE_CURRENCY`,
  `VITE_SUPPORT_EMAIL` — site identity, no hardcoded branding in code.
- `VITE_OAUTH_PROVIDERS` — comma-separated social logins (`google,apple,github,…`).
  They must also be enabled in your auth backend.
- `VITE_ERROR_REPORTING_URL` — optional JSON endpoint for client error reports
  (Sentry tunnel, Logflare, your own collector). Unset = console only in dev.

Variables prefixed with `VITE_` are exposed to the browser; unprefixed mirrors
(`SUPABASE_URL`, …) are server-only and read inside server functions.

## Database

SQL migrations live in `supabase/migrations/`. Apply them with the Supabase CLI
(`supabase db push`) or any Postgres migration runner against your own database.

## Deployment

`npm run build` produces a self-contained server bundle in `dist/`. Deploy it
anywhere that runs Node or a Worker runtime (VPS, Docker, Fly.io, Render,
Cloudflare, …) and set the same environment variables in that environment.

Docker (Node server target):

```bash
docker build -t gameflex .
docker run -p 8080:8080 --env-file .env gameflex
```

Operational endpoints:

- `GET /healthz` — dependency-free liveness/readiness probe (used by the
  container `HEALTHCHECK` and by load balancers).
- `GET /sitemap.xml` — generated from the public route list; the origin comes
  from `SITE_URL`/`VITE_SITE_URL`, falling back to the request origin.

Pre-deploy checklist: `npm run lint`, `bunx tsgo --noEmit`, `npm run build`, and
apply pending SQL from `supabase/migrations/`.

## Project structure

```
src/
  backend/       provider-agnostic adapters (data, auth, storage, realtime)
  components/    UI components (shadcn/ui + feature components)
  features/      feature modules with their own api/hooks
  integrations/  Supabase client + generated types
  lib/           cross-cutting utilities (auth context, oauth, error reporting)
  pages/         page components
  routes/        TanStack Start file-based routes
  services/      domain services (tournaments, payments, social, …)
supabase/migrations/  SQL schema
```
GameFlex Production Deployment
Initial Setup

Install dependencies:

npm install

Build the production application:

npm run build

Start GameFlex with PM2:

npm run pm2:start

Save the PM2 process:

npm run pm2:save

The PM2 ecosystem file loads `.env` through `env_file`; keep production secrets
out of source control. Run `pm2 startup` once on the deployment host, execute
the generated command with the host's system privileges, then use
`npm run pm2:save` so PM2 restores GameFlex after a reboot.

Check the application status:

npx pm2 status

View application logs:

npx pm2 logs gameflex

Updating the Website

After making changes to the source code, rebuild and restart the application:

npm run build && npx pm2 restart gameflex

Important: PM2 runs the production build from the dist/ directory. Changes made in src/ will not appear in production until the application is rebuilt.

PM2 Commands

Check status

npx pm2 status

Restart GameFlex

npx pm2 restart gameflex

Stop GameFlex

npx pm2 stop gameflex

Start GameFlex

npx pm2 start ecosystem.config.cjs

Delete GameFlex

npx pm2 delete gameflex

View logs

npx pm2 logs gameflex

View recent logs

npx pm2 logs gameflex --lines 100

Save PM2 processes

npx pm2 save

rm -rf node_modules package-lock.json && npm cache clean --force && npm install
