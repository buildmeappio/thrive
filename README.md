# Thrive Monorepo

Thrive assessment care platform — a pnpm + Turborepo monorepo with three Next.js apps and shared packages.

## Prerequisites

- **Node.js** 20+ (22 recommended; see `.nvmrc`)
- **pnpm** 9+
- **Docker** (optional, for local Postgres and full-stack runs)

## Quick start

```bash
pnpm install
pnpm run setup:local
pnpm dev
```

This installs dependencies, creates `.env` files for each app (from AWS Secrets Manager or templates), and starts all apps in dev mode.

## Scripts

| Command                       | Description                                                |
| ----------------------------- | ---------------------------------------------------------- |
| `pnpm dev`                    | Start all apps in dev mode                                 |
| `pnpm dev:admin`              | Start admin-web only                                       |
| `pnpm dev:examiner`           | Start examiner-web only                                    |
| `pnpm dev:organization`       | Start organization-web only                                |
| `pnpm build`                  | Build all apps                                             |
| `pnpm build:admin-web`        | Build admin-web                                            |
| `pnpm build:examiner-web`     | Build examiner-web                                         |
| `pnpm build:organization-web` | Build organization-web                                     |
| `pnpm lint`                   | Lint all apps                                              |
| `pnpm db:generate`            | Generate Prisma client                                     |
| `pnpm db:migrate`             | Run database migrations                                    |
| `pnpm db:studio`              | Open Prisma Studio                                         |
| `pnpm db:seed`                | Seed the database                                          |
| `pnpm db:up`                  | Start Postgres via Docker                                  |
| `pnpm db:down`                | Stop Postgres                                              |
| `pnpm db:sync`                | Sync database schema                                       |
| `pnpm setup:local`            | Create `.env` files for local dev (local/dev/staging/prod) |
| `pnpm setup:local:aws`        | Fetch `local/*` from AWS Secrets Manager                   |
| `pnpm setup:local:template`   | Copy from `.env.example` templates                         |
| `pnpm secrets:upload local`   | Upload local secrets to AWS (new dev onboarding)           |
| `pnpm secrets:download dev`   | Download dev secrets from AWS                              |

## Structure

```
apps/
  admin-web/       # Admin portal (port 3000, basePath /admin)
  examiner-web/    # Examiner portal (port 3001, basePath /examiner)
  organization-web/ # Organization portal (port 3002, basePath /organization)
packages/
  database/        # Prisma schema, migrations, generated client
  secrets/         # Local env setup (AWS Secrets Manager or templates)
```

## Deployment

See [deploy/README.md](deploy/README.md) for deployment setup, GitHub Actions, and server configuration.
