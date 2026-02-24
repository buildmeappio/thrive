#!/bin/bash
# Start local PostgreSQL for development. Run from repo root.
# Uses docker-compose.yml db service. Requires .env or .env.db with PG_* vars.

set -e
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# Prefer docker compose (v2) over docker-compose (v1)
if docker compose version &>/dev/null; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose &>/dev/null; then
  COMPOSE_CMD="docker-compose"
else
  echo "❌ Docker Compose is required. Install Docker Desktop or docker-compose."
  exit 1
fi

ENV_FILE=".env"
[ -f ".env.db" ] && ENV_FILE=".env.db"

echo "🐘 Starting PostgreSQL..."
if [ -f "$ENV_FILE" ]; then
  $COMPOSE_CMD --env-file "$ENV_FILE" -f docker-compose.yml up -d db
else
  echo "⚠️  No .env or .env.db found. Using defaults (copy .env.db.example to .env.db to customize)."
  $COMPOSE_CMD -f docker-compose.yml up -d db
fi

echo ""
echo "✅ Database is starting. Connection (defaults):"
echo "   Host: localhost"
echo "   Port: 5441"
echo "   Database: thrive_db"
echo "   User: postgres"
echo ""
echo "Run: pnpm db:migrate  # apply migrations"
echo "Run: pnpm db:seed     # seed data"
