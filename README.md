# DTGSA Website

The Durrat Construction company website and its administration panel. The approved public design remains a Next.js full-page experience; content, administrator sessions, contact messages, and uploaded media are persisted in PostgreSQL.

## Deployment Contract

| Setting | Value |
| --- | --- |
| Framework | Next.js 16.3.3, App Router |
| Runtime | Node.js 24.x |
| Package manager | npm 11, using `package-lock.json` |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Start command | `npm run start` |
| Health check | `GET /api/health` |
| Production branch | `main` |
| Staging branch | `staging` |

The start command applies committed Prisma migrations and starts Next.js on `0.0.0.0`. It never seeds content during container startup. Next.js reads the platform-provided `PORT` environment variable automatically; it defaults to port 3000 when `PORT` is absent.

Use the platform's native Node.js or Nixpacks build method. This application does not require a Dockerfile or Docker Compose.

## Environment

Required at runtime:

```text
DATABASE_URL
MIGRATION_DATABASE_URL
```

`DATABASE_URL` is the least-privilege connection used only by the running Next.js application. `MIGRATION_DATABASE_URL` is the schema-owning connection used by Prisma CLI migrations and guarded bootstrap operations. Prisma CLI prefers `MIGRATION_DATABASE_URL` and falls back to `DATABASE_URL` only for local compatibility. Neither variable is needed by the clean build command. Do not commit either value or any local `.env` file, and do not grant schema creation to the runtime role.

Optional baseline content bootstrap is a separate operator action. It is serialized with a PostgreSQL advisory transaction lock and skips sections that already contain data. Run it only after migrations, with a temporary opt-in:

```bash
DTG_DATABASE_BOOTSTRAP_ENABLED=true npm run db:bootstrap
```

The bootstrap command requires `MIGRATION_DATABASE_URL`; it never uses `DATABASE_URL`. Remove `DTG_DATABASE_BOOTSTRAP_ENABLED` from the command environment afterward.

Public URL configuration:

```text
SITE_URL
```

Set `SITE_URL` to the public origin assigned to each deployment, without a trailing path. For staging, use the assigned `https://*.dtgapps.cc` origin. After staging acceptance and infrastructure routing, set production to `https://dtgsa.com`. The application uses this value for canonical metadata and never hardcodes the temporary staging hostname. `SITE_URL` is not required for a clean build, but canonical metadata is omitted until it is configured.

One-time administrator bootstrap variables:

```text
ADMIN_EMAIL
ADMIN_PASSWORD
```

After the database is reachable and migrations have run, create or reset the administrator with:

```bash
npm run admin:create
```

Supply `ADMIN_EMAIL` and `ADMIN_PASSWORD` only for that one-time command. They are not required by the running application and should be removed from the command environment afterward.

## Local Verification

Set `DATABASE_URL` and `MIGRATION_DATABASE_URL` to the appropriate test PostgreSQL roles, then run:

```bash
npm ci
npm run build
npm run start
```

The public site is available on the port selected by `PORT`. The administration login is `/admin/login`, and the health response is `/api/health`.

Useful checks:

```bash
npm run lint
npm run typecheck
npm test
npx prisma validate
```

## Data Lifecycle

- Prisma migrations in `prisma/migrations` own the PostgreSQL schema.
- `prisma/seed.ts` is an explicit, guarded bootstrap that adds approved baseline content only when a section is empty.
- Uploaded media is stored in PostgreSQL and served through `/api/media/:id`.
- The application does not write persistent content or cache data to the container filesystem.
- Static assets under `public/` are immutable build inputs, not runtime persistence.

The production domain is intentionally not activated in this repository. Infrastructure will connect `dtgsa.com` after staging acceptance; the application code already supports it through `SITE_URL`.
