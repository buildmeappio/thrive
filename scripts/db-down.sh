#!/bin/bash
# Stop local PostgreSQL. Run from repo root.

set -e
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if docker compose version &>/dev/null; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose &>/dev/null; then
  COMPOSE_CMD="docker-compose"
else
  echo "❌ Docker Compose is required."
  exit 1
fi

ENV_FILE=".env"
[ -f ".env.db" ] && ENV_FILE=".env.db"

echo "🛑 Stopping PostgreSQL..."
if [ -f "$ENV_FILE" ]; then
  $COMPOSE_CMD --env-file "$ENV_FILE" -f docker-compose.yml stop db
else
  $COMPOSE_CMD -f docker-compose.yml stop db
fi

echo "✅ Database stopped."
