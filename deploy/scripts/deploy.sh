#!/bin/bash
# Consolidated deploy script for Thrive apps (git-pull flow, PM2)
# Usage: ./deploy/scripts/deploy.sh --app <app> --env <env> [--skip-git] [--skip-build]
# Example: ./deploy/scripts/deploy.sh --app admin-web --env dev
# Local testing (skip git): ./deploy/scripts/deploy.sh --app admin-web --env dev --skip-git
#
# Run from repo root. Uses root ecosystem.config.js with --only <app_name>.

set -e

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

# Parse arguments
APP=""
ENV=""
SKIP_GIT=false
SKIP_BUILD=false

while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    --app)
      APP="$2"
      shift
      shift
      ;;
    --env)
      ENV="$2"
      shift
      shift
      ;;
    --skip-git)
      SKIP_GIT=true
      shift
      ;;
    --skip-build)
      SKIP_BUILD=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 --app <admin-web|examiner-web|organization-web> --env <dev|staging|qa|production> [--skip-git] [--skip-build]"
      exit 1
      ;;
  esac
done

if [[ -z "$APP" || -z "$ENV" ]]; then
  echo "Usage: $0 --app <admin-web|examiner-web|organization-web> --env <dev|staging|qa|production> [--skip-git] [--skip-build]"
  exit 1
fi

case "$APP" in
  admin-web) APP_NAME="thrive-admin"; BUILD_CMD="build:admin" ;;
  examiner-web) APP_NAME="thrive-examiner"; BUILD_CMD="build:examiner" ;;
  organization-web) APP_NAME="thrive-organization"; BUILD_CMD="build:organization" ;;
  *)
    echo "Invalid app: $APP"
    exit 1
    ;;
esac

case "$ENV" in
  dev) BRANCH="develop" ;;
  staging) BRANCH="staging" ;;
  qa) BRANCH="qa" ;;
  production) BRANCH="main" ;;
  *)
    echo "Invalid env: $ENV (use dev, staging, qa, or production)"
    exit 1
    ;;
esac

echo "Environment: $ENV"
echo "App: $APP ($APP_NAME)"
echo "Branch: $BRANCH"

# Git pull
if [[ "$SKIP_GIT" == "true" ]]; then
  echo "Skipping git operations (--skip-git)"
elif [[ "$SKIP_BUILD" == "true" ]]; then
  echo "Skipping git operations (--skip-build)"
else
  echo "Pulling latest code..."
  git fetch origin
  git checkout "$BRANCH"
  git pull origin "$BRANCH"
fi

# Resolve .env (setup:local creates apps/$APP/.env; also check root)
APP_ENV="apps/$APP/.env.$ENV"
APP_ENV_DEFAULT="apps/$APP/.env"
ROOT_ENV=".env.$ENV"
ROOT_ENV_DEFAULT=".env"

if [[ -f "$APP_ENV" ]]; then
  cp "$APP_ENV" "apps/$APP/.env"
  echo "Using $APP_ENV"
elif [[ -f "$APP_ENV_DEFAULT" ]]; then
  echo "Using $APP_ENV_DEFAULT"
elif [[ -f "$ROOT_ENV" ]]; then
  cp "$ROOT_ENV" ".env"
  cp "$ROOT_ENV" "apps/$APP/.env"
  echo "Using $ROOT_ENV"
elif [[ -f "$ROOT_ENV_DEFAULT" ]]; then
  cp "$ROOT_ENV_DEFAULT" "apps/$APP/.env"
  echo "Using $ROOT_ENV_DEFAULT"
else
  echo "Warning: No .env file found. Run 'pnpm run setup:local' or create apps/$APP/.env"
fi

# Install and build
if [[ "$SKIP_BUILD" == "true" ]]; then
  echo "Skipping install and build (--skip-build)"
else
  echo "Installing dependencies..."
  pnpm install --frozen-lockfile

  echo "Generating Prisma client..."
  pnpm run db:generate

  echo "Building $APP..."
  pnpm run "$BUILD_CMD"
fi

mkdir -p logs

# PM2
if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
  echo "Stopping existing PM2 process..."
  pm2 stop "$APP_NAME"
  pm2 delete "$APP_NAME"
fi

echo "Starting PM2..."
pm2 start ecosystem.config.js --only "$APP_NAME"
pm2 save

echo "Deployment complete: $APP_NAME"
