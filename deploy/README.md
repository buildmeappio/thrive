# Thrive Deployment

## Local development (env setup)

Before running apps locally, create `.env` files:

```bash
pnpm run setup:local
```

This mirrors the deployment flow: fetches from AWS Secrets Manager (`dev/shared` + app-specific) if AWS CLI is configured, otherwise copies `.env.example` templates. See `packages/secrets/README.md` for details.

## Overview

- **Lightsail/EC2**: PM2 + Node.js (no Docker)
- **Future ECS**: Docker-based Fargate (see `ecs/`)

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

| App           | Path         | Port |
|---------------|--------------|------|
| admin-web     | /admin       | 3000 |
| examiner-web  | /examiner    | 3001 |
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

## Manual deploy

```bash
# Build tarball
./scripts/create-deploy-tarball.sh admin-web deployment-admin-web.tar.gz

# Deploy (on server)
DEPLOY_PATH=/home/ubuntu/thrive/admin-web AWS_REGION=ca-central-1 \
  ./deploy/scripts/deploy-lightsail.sh admin-web prod deployment-admin-web.tar.gz
```
