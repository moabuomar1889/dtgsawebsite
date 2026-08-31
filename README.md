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

The start command applies committed Prisma migrations, seeds missing baseline public content, and starts Next.js on `0.0.0.0`. Next.js reads the platform-provided `PORT` environment variable automatically; it defaults to port 3000 when `PORT` is absent.

Use the platform's native Node.js or Nixpacks build method. This application does not require a Dockerfile or Docker Compose.

## Environment

Required at runtime:

```text
DATABASE_URL
```

`DATABASE_URL` must be a PostgreSQL connection string supplied as a runtime secret by the deployment platform. Do not commit it or any local `.env` file.

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

Set `DATABASE_URL` to a test PostgreSQL database, then run:

```bash
npm ci
npm run build
npm run start
```

The public site is available on the port selected by `PORT`. The administration login is `/admin/login`, and the health response is `/api/health`.

Useful checks:

```bash
npm run lint
npm run test:security
```

## Data Lifecycle

- Prisma migrations in `prisma/migrations` own the PostgreSQL schema.
- `prisma/seed.ts` adds approved baseline content only when a section is empty.
- Uploaded media is stored in PostgreSQL and served through `/api/media/:id`.
- The application does not write persistent content or cache data to the container filesystem.
- Static assets under `public/` are immutable build inputs, not runtime persistence.

The production domain is intentionally not configured in this repository. Infrastructure will connect `dtgsa.com` after staging acceptance.
