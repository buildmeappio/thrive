#!/bin/bash

set -e

# -------------------------------
# Usage: ./deploy.sh <env> [--app <app_name>] [--config <ecosystem_file>] [--env <env_file>]
# Example: ./deploy.sh dev --app metou-admin --config ecosystem.config.js --env .env.development
# -------------------------------

# 1. Required argument
ENV="$1"
shift

if [[ -z "$ENV" ]]; then
  echo "❌ Please provide the environment: dev, staging, qa, or production"
  exit 1
fi

if [[ "$ENV" != "dev" && "$ENV" != "staging" && "$ENV" != "qa" && "$ENV" != "production" ]]; then
  echo "❌ Invalid environment: $ENV"
  echo "✅ Allowed values: dev, staging, qa, production"
  exit 1
fi

# 2. Optional flags
APP_NAME="app"
ECOSYSTEM_FILE="ecosystem.config.js"
ENV_FILE=".env"
SKIP_BUILD=false

while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    --app)
      APP_NAME="$2"
      shift; shift
      ;;
    --config)
      ECOSYSTEM_FILE="$2"
      shift; shift
      ;;
    --env)
      ENV_FILE="$2"
      shift; shift
      ;;
    --skip-build)
      SKIP_BUILD=true
      shift
      ;;
    *)
      echo "❌ Unknown option: $1"
      exit 1
      ;;
  esac
done

# 3. Determine Git branch
case "$ENV" in
  dev)
    BRANCH="develop"
    ;;
  staging)
    BRANCH="staging"
    ;;
  qa)
    BRANCH="qa"
    ;;
  production)
    BRANCH="main"
    ;;
esac

echo "📄 Environment: $ENV"
echo "🔧 App Name: $APP_NAME"
echo "⚙️ Ecosystem Config: $ECOSYSTEM_FILE"
echo "🌍 Environment File: $ENV_FILE"
echo "🌿 Git Branch: $BRANCH"

# 4. Checkout branch & pull latest (skip if using pre-built artifacts)
if [[ "$SKIP_BUILD" == "true" ]]; then
  echo "⏭️ Skipping git operations (using pre-built artifacts)..."
else
  echo "📥 Pulling latest code..."
  git fetch origin
  git checkout $BRANCH
  git pull origin $BRANCH
fi

resolve_env_file() {
  if [[ -f "$ENV_FILE" ]]; then
    echo "📁 Found environment file: $ENV_FILE"
    if [[ "$ENV_FILE" != ".env" ]]; then
      cp "$ENV_FILE" .env
      echo "📁 Copied $ENV_FILE to .env"
    else
      echo "📁 Using default .env file directly"
    fi
    return
  fi

  if [[ -f ".env" ]]; then
    echo "📁 Fallback: using existing default .env file"
    return
  fi

  echo "⚠️ Neither '$ENV_FILE' nor default .env exists."

  if [[ -f "env-example" ]]; then
    echo "🧪 Found env-example — generating new .env file interactively..."

    > .env  # Truncate or create

    while IFS= read -r line || [[ -n "$line" ]]; do
      # Trim whitespace
      line="$(echo "$line" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"

      # Skip comments and blank lines
      [[ -z "$line" || "$line" == \#* ]] && continue

      KEY="$(echo "$line" | cut -d '=' -f1)"
      printf "Please enter value for \"%s\": " "$KEY"
      IFS= read -r VALUE < /dev/tty
      echo "$KEY=$VALUE" >> .env
    done < env-example

    if [[ "$ENV_FILE" != ".env" ]]; then
      cp .env "$ENV_FILE"
      echo "✅ Saved interactive .env as $ENV_FILE"
    fi

    echo "✅ .env file created successfully."
  else
    echo "❌ No environment file found and no env-example to prompt from."
    exit 1
  fi
}

resolve_env_file

# 6. Install and build
if [[ "$SKIP_BUILD" == "true" ]]; then
  echo "⏭️ Skipping install, Prisma generation, and build (using pre-built artifacts)..."
  echo "ℹ️  Assuming dependencies and Prisma client are already installed/generated"
else
  echo "📦 Installing dependencies..."
  npm install

  echo "🔧 Generating Prisma client..."
  npm run db:generate

  echo "🛠️ Building project..."
  npm run build
fi

# 7. Manage PM2 process
echo "🔍 Checking existing PM2 process..."
if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
  echo "🛑 Stopping and deleting existing PM2 process..."
  pm2 stop "$APP_NAME"
  pm2 delete "$APP_NAME"
else
  echo "✅ No existing PM2 process found."
fi

echo "🚀 Starting PM2..."
pm2 start "$ECOSYSTEM_FILE" --name "$APP_NAME"

echo "💾 Saving PM2 process list..."
pm2 save

echo "✅ Deployment to '$ENV' complete. '$APP_NAME' is now running under PM2!"