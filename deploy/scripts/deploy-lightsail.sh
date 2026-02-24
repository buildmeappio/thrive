#!/bin/bash
# Manual Lightsail/EC2 deployment script (PM2, no Docker)
# Usage: ./deploy/scripts/deploy-lightsail.sh <app> <env> [tarball_path]
# Example: ./deploy/scripts/deploy-lightsail.sh admin-web prod ./deployment-admin-web.tar.gz
#
# Requires: DEPLOY_PATH, AWS_REGION, and .env or AWS credentials for Secrets Manager
# The tarball should be created by: ./scripts/create-deploy-tarball.sh admin-web deployment.tar.gz

set -e

APP="${1:?Usage: $0 <app> <env> [tarball_path]}"
ENV="${2:?Usage: $0 <app> <env> [tarball_path]}"
TARBALL="${3:-deployment-$APP.tar.gz}"

case "$APP" in
  admin-web) APP_NAME="thrive-admin"; SECRET_ID="admin" ;;
  examiner-web) APP_NAME="thrive-examiner"; SECRET_ID="examiner" ;;
  organization-web) APP_NAME="thrive-organization"; SECRET_ID="organization" ;;
  *)
    echo "Invalid app: $APP"
    exit 1
    ;;
esac

DEPLOY_PATH="${DEPLOY_PATH:-$HOME/thrive/$APP}"
RELEASES="$DEPLOY_PATH/releases"
CURRENT="$DEPLOY_PATH/current"
RELEASE="$RELEASES/$(date +%Y%m%d%H%M%S)"
AWS_REGION="${AWS_REGION:-ca-central-1}"

if [[ ! -f "$TARBALL" ]]; then
  echo "Tarball not found: $TARBALL"
  echo "Create it with: ./scripts/create-deploy-tarball.sh $APP $TARBALL"
  exit 1
fi

echo "Deploying $APP ($APP_NAME) to $ENV"
echo "Release dir: $RELEASE"

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 22 || (nvm install 22 && nvm use 22)

mkdir -p "$RELEASES" "$RELEASE"
cp "$TARBALL" "$RELEASE/"
cd "$RELEASE"
tar -xzf "$(basename "$TARBALL")"
rm -f "$(basename "$TARBALL")"

pnpm install --frozen-lockfile
pnpm --filter @thrive/database run generate

ln -sfn "$RELEASE" "$CURRENT"
cd "$CURRENT"

mkdir -p logs

# Fetch secrets from AWS
if command -v aws &>/dev/null; then
  SHARED=$(aws secretsmanager get-secret-value --secret-id $ENV/shared --region $AWS_REGION --query SecretString --output text)
  APP_SECRET=$(aws secretsmanager get-secret-value --secret-id $ENV/$SECRET_ID --region $AWS_REGION --query SecretString --output text)
  jq -r -n --argjson s "$SHARED" --argjson a "$APP_SECRET" '$s * $a | to_entries[] | "\(.key)=\(.value | tojson)"' > .env
fi

(pm2 describe "$APP_NAME" 2>/dev/null && pm2 delete "$APP_NAME") || true
pm2 start ecosystem.config.js --only "$APP_NAME"
pm2 save

# Prune old releases
ls -1dt "$RELEASES"/*/ 2>/dev/null | tail -n +4 | xargs -r rm -rf

echo "Deployment complete: $APP_NAME"
