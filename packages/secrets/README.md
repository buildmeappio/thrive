# @thrive/secrets

Environment setup for the Thrive monorepo across **four environments**: local, dev, staging, prod. Creates `.env` files for each app, mirroring the deployment flow (shared + app-specific secrets). Supports uploading and downloading secrets to/from AWS Secrets Manager.

## Environments

| Env         | Purpose                                                                | AWS Secrets Manager                     |
| ----------- | ---------------------------------------------------------------------- | --------------------------------------- |
| **local**   | New developer onboarding, local development (localhost URLs, local DB) | `local/shared`, `local/admin`, etc.     |
| **dev**     | Development server                                                     | `dev/shared`, `dev/admin`, etc.         |
| **staging** | Staging/pre-production                                                 | `staging/shared`, `staging/admin`, etc. |
| **prod**    | Production                                                             | `prod/shared`, `prod/admin`, etc.       |

## Quick start (new developer)

From the repo root:

```bash
pnpm install
pnpm run setup:local
```

This will (in order of preference):

1. **If `secrets/local/shared.json` exists**: Use local JSON files to generate `.env`
2. **Else if AWS CLI is configured**: Fetch `local/shared` + app-specific secrets from AWS and write `.env`
3. **Otherwise**: Copy `.env.example` templates to each app

For new developers, ensure `local` secrets are uploaded to AWS first (see [Bootstrap local in AWS](#bootstrap-local-in-aws)).

## Setup commands

| Command                           | Description                                           |
| --------------------------------- | ----------------------------------------------------- |
| `pnpm run setup:local`            | Auto: local JSON → AWS (local env) → templates        |
| `pnpm run setup:local:aws`        | Force fetch from AWS Secrets Manager (uses `local/*`) |
| `pnpm run setup:local:template`   | Force use of `.env.example` templates                 |
| `pnpm run setup:local:local-json` | Use `secrets/local/*.json`                            |

## Upload / Download (AWS)

Secrets are stored as JSON in `secrets/{env}/`:

```
secrets/
  local/
    shared.json
    admin.json
    examiner.json
    organization.json
  dev/
    ...
  staging/
    ...
  prod/
    ...
```

The `secrets/` directory is gitignored. Never commit real secrets.

| Command                           | Description                           |
| --------------------------------- | ------------------------------------- |
| `pnpm run secrets:upload local`   | Upload `secrets/local/` to AWS        |
| `pnpm run secrets:upload dev`     | Upload `secrets/dev/` to AWS          |
| `pnpm run secrets:upload staging` | Upload `secrets/staging/` to AWS      |
| `pnpm run secrets:upload prod`    | Upload `secrets/prod/` to AWS         |
| `pnpm run secrets:download local` | Download from AWS to `secrets/local/` |
| `pnpm run secrets:download dev`   | Download from AWS to `secrets/dev/`   |
| ...                               | Same for staging, prod                |

Convenience scripts from repo root:

- `pnpm run secrets:upload:local`, `secrets:upload:dev`, etc.
- `pnpm run secrets:download:local`, `secrets:download:dev`, etc.

## Bootstrap local in AWS

To enable new developers to run `pnpm run setup:local` and get env from AWS:

1. Create `secrets/local/` with `shared.json`, `admin.json`, `examiner.json`, `organization.json` (copy from `secrets/dev/` and adjust for localhost, local DB, etc.). See `packages/secrets/examples/local-shared.example.json` for structure.
2. Run: `pnpm run secrets:upload local`
3. New developers with AWS CLI configured will then fetch `local/*` automatically

## Fetch other envs locally

To pull dev, staging, or prod secrets for local testing:

```bash
THRIVE_ENV=dev pnpm run setup:local:aws    # Fetch dev/* from AWS
THRIVE_ENV=staging pnpm run setup:local:aws
THRIVE_ENV=prod pnpm run setup:local:aws
```

## Environment variables

- `THRIVE_ENV` – AWS secret prefix (default: `local` for setup:local). Use `dev`, `staging`, or `prod` to pull those envs.
- `AWS_REGION` – AWS region (default: `ca-central-1`).

## AWS setup

For AWS mode, ensure:

1. AWS CLI is installed (`aws --version`)
2. Credentials are configured (`aws configure` or env vars `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)

Secrets in AWS must be JSON objects. Deployment and setup use:

- `{env}/shared` – shared vars (e.g. `DATABASE_URL`)
- `{env}/admin` – admin-web specific
- `{env}/examiner` – examiner-web specific
- `{env}/organization` – organization-web specific

## Deployment flow

GitHub Actions and deploy scripts fetch secrets from AWS at build/deploy time:

- **dev** → `dev/shared` + `dev/{app}`
- **staging** → `staging/shared` + `staging/{app}`
- **prod** → `prod/shared` + `prod/{app}`

`.env` files are generated on the runner/EC2 and never committed.

## Templates

Templates live in `packages/secrets/templates/`:

- `admin-web.env.example`
- `examiner-web.env.example`
- `organization-web.env.example`

Edit these to add new variables or change defaults for new developers.
