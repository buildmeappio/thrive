#!/bin/bash
# Create deployment tarball for a Thrive app (monorepo-aware)
# Usage: ./scripts/create-deploy-tarball.sh <app> [output_path]
# Example: ./scripts/create-deploy-tarball.sh admin-web deployment.tar.gz

set -e

APP="$1"
OUTPUT="${2:-deployment.tar.gz}"

if [[ -z "$APP" ]]; then
  echo "Usage: $0 <app> [output_path]"
  echo "  app: admin-web | examiner-web | organization-web"
  exit 1
fi

case "$APP" in
  admin-web|examiner-web|organization-web) ;;
  *)
    echo "Invalid app: $APP"
    exit 1
    ;;
esac

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Resolve tailwind config (admin uses .ts, others use .js)
TAILWIND="tailwind.config.ts"
[[ -f "apps/$APP/tailwind.config.js" ]] && TAILWIND="tailwind.config.js"

echo "Creating deployment tarball for $APP..."

TAR_ARGS=(
  "apps/$APP/.next"
  "apps/$APP/public"
  "apps/$APP/package.json"
  "apps/$APP/next.config.ts"
  "apps/$APP/$TAILWIND"
  "apps/$APP/postcss.config.mjs"
  "apps/$APP/prisma.config.ts"
  "apps/$APP/tsconfig.json"
  "apps/$APP/eslint.config.mjs"
  "apps/$APP/scripts"
  "packages/eslint-config/package.json"
  "packages/eslint-config/eslint.config.mjs"
  "packages/database/prisma"
  "packages/database/package.json"
  "packages/database/prisma.config.ts"
  "packages/database/src"
  "packages/database/tsconfig.json"
  "package.json"
  "pnpm-workspace.yaml"
  "pnpm-lock.yaml"
  "ecosystem.config.js"
)
[[ -d "apps/$APP/templates" ]] && TAR_ARGS+=("apps/$APP/templates")

tar -czf "$OUTPUT" "${TAR_ARGS[@]}"

# Flatten structure for deploy: extract creates apps/ and packages/ at root
# Deploy script expects: RELEASE_DIR/apps/$APP/ and RELEASE_DIR/packages/database/
# So we keep the structure. The deploy will cd to RELEASE_DIR and run from there.

echo "Tarball created: $OUTPUT"
echo "Contents (sample):"
tar -tzf "$OUTPUT" | head -20
