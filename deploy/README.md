# Thrive Deployment

## Local development (env setup)

Before running apps locally, create `.env` files:

```bash
pnpm run setup:local
```

This mirrors the deployment flow: fetches from AWS Secrets Manager (`local/shared` + app-specific for new devs, or `dev/staging/prod` via `THRIVE_ENV`) if AWS CLI is configured, otherwise copies `.env.example` templates. Four envs: local, dev, staging, prod. See `packages/secrets/README.md` for details.

## Overview

- **PM2 (primary)**: Single root `ecosystem.config.js` manages all apps. Deploy via tarball (GitHub Actions, deploy-lightsail) or git-pull (deploy.sh).
- **Docker**: Future work. Root `docker-compose.yml` for local/CI; ECS Fargate migration path in `ecs/`.

## Nginx

### Single-server setup (all 3 apps)

1. Copy configs to server:

   ```bash
   sudo cp deploy/nginx/portal-standalone.conf /etc/nginx/sites-available/thrive
   # Or use snippet-based: portal.conf + deploy/nginx/snippets/* -> /etc/nginx/snippets/
   ```

2. Enable and reload:

   ```bash
   sudo ln -sf /etc/nginx/sites-available/thrive /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

3. SSL (Certbot):
   ```bash
   sudo certbot --nginx -d portal-dev.thriveassessmentcare.com
   ```

### Paths

| App              | Path          | Port |
| ---------------- | ------------- | ---- |
| admin-web        | /admin        | 3000 |
| examiner-web     | /examiner     | 3001 |
| organization-web | /organization | 3002 |

## GitHub Actions

Workflows are in `.github/workflows/`:

- `deploy-production.yml` - Push to `main`
- `deploy-staging.yml` - Push to `staging`
- `deploy-dev.yml` - Push to `develop`

### Required secrets

- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`
- `EC2_HOST`, `EC2_USERNAME`, `EC2_SSH_KEY`
- `EC2_DEPLOY_PATH_ADMIN`, `EC2_DEPLOY_PATH_EXAMINER`, `EC2_DEPLOY_PATH_ORGANIZATION`

Or set `EC2_DEPLOY_PATH_BASE` (e.g. `/home/ubuntu/thrive`) to use `$BASE/admin-web`, etc.

## Server setup

Run once on a new Lightsail/EC2 instance:

```bash
./deploy/scripts/setup-server.sh
```

## PM2 ecosystem

A single `ecosystem.config.js` at repo root defines all apps (thrive-admin, thrive-examiner, thrive-organization). Deploy scripts use `pm2 start ecosystem.config.js --only <app-name>` to start a single app.

**PM2 commands:**

```bash
# Start all apps (from release root)
pm2 start ecosystem.config.js

# Start single app
pm2 start ecosystem.config.js --only thrive-admin

# Restart single app
pm2 restart ecosystem.config.js --only thrive-admin

# Logs
pm2 logs thrive-admin
pm2 status
```

## Manual deploy

```bash
# Build tarball
./scripts/create-deploy-tarball.sh admin-web deployment-admin-web.tar.gz

# Deploy (on server)
DEPLOY_PATH=/home/ubuntu/thrive/admin-web AWS_REGION=ca-central-1 \
  ./deploy/scripts/deploy-lightsail.sh admin-web prod deployment-admin-web.tar.gz
```

## Git-pull deploy (from repo root)

For local or SSH-based deploy without tarball:

```bash
pnpm run deploy:admin:dev          # dev (includes git pull)
pnpm run deploy:admin:staging
pnpm run deploy:admin:production

# Local PM2 testing (skip git pull - use current code)
pnpm run deploy:admin:local        # build + PM2 start, no git (avoids ambiguous branch errors)
pnpm run deploy:examiner:local
pnpm run deploy:organization:local

# Or run script directly
./deploy/scripts/deploy.sh --app admin-web --env dev [--skip-git] [--skip-build]
```

**Local PM2 testing:** Use `--skip-git` when testing locally to avoid git checkout/pull. Ensure you have built first (`pnpm run build:admin`) and have a `.env` file.
