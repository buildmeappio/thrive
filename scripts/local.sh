#!/bin/bash
# Unified local infra script. Run from repo root.
# Usage: scripts/local.sh <command> [targets]
#   command: up | down | sync
#   targets: all (default) | thrive | master | keycloak
#
# Examples:
#   pnpm local:up              # start all
#   pnpm local:up thrive       # start only thrive-db
#   pnpm local:down            # stop all
#   pnpm local:sync            # sync all from remote
#   pnpm local:sync thrive     # sync only thrive_db

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

COMPOSE_FILE="$ROOT/docker-compose.local.yml"
ENV_FILE=".env"
[ -f "$ROOT/.env.db" ] && ENV_FILE="$ROOT/.env.db"

# Load env file for display (PG_USER, PG_PASSWORD, ports). Used by cmd_up for connection URLs.
load_env() {
  [ ! -f "$ENV_FILE" ] && return
  while IFS= read -r line || [ -n "$line" ]; do
    [[ $line =~ ^#.*$ ]] && continue
    [[ -z "$line" ]] && continue
    key="${line%%=*}"
    key=$(echo "$key" | xargs)
    value="${line#*=}"
    value=$(echo "$value" | xargs | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
    [[ -z "$key" ]] && continue
    export "$key=$value"
  done < "$ENV_FILE"
}

cmd_up() {
  local targets="${1:-all}"
  echo "🐘 Starting local infra..."
  case "$targets" in
    all) $COMPOSE_CMD --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d thrive-db master-db keycloak-db keycloak ;;
    thrive) $COMPOSE_CMD --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d thrive-db ;;
    master) $COMPOSE_CMD --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d master-db ;;
    keycloak) $COMPOSE_CMD --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d keycloak-db keycloak ;;
    *) echo "❌ Unknown target: $targets. Use: all | thrive | master | keycloak"; exit 1 ;;
  esac
  load_env
  echo ""
  echo "✅ Services started (credentials from $ENV_FILE):"
  echo "   thrive_db:    postgresql://${PG_USER:-postgres}:${PG_PASSWORD:-postgres}@localhost:${PG_EXTERNAL_PORT:-5441}/${PG_DB:-thrive_db}"
  echo "   master_db:    postgresql://${PG_USER:-postgres}:${PG_PASSWORD:-postgres}@localhost:${PG_MASTER_PORT:-5442}/master_db"
  echo "   keycloak_db:  postgresql://${KC_DB_USERNAME:-${PG_USER:-postgres}}:${KC_DB_PASSWORD:-${PG_PASSWORD:-postgres}}@localhost:${PG_KEYCLOAK_PORT:-5443}/keycloak_db"
  echo "   Keycloak:     http://localhost:${KEYCLOAK_PORT:-8080}"
}

cmd_down() {
  local targets="${1:-all}"
  echo "🛑 Stopping local infra..."
  case "$targets" in
    all) $COMPOSE_CMD --env-file "$ENV_FILE" -f "$COMPOSE_FILE" stop thrive-db master-db keycloak-db keycloak ;;
    thrive) $COMPOSE_CMD --env-file "$ENV_FILE" -f "$COMPOSE_FILE" stop thrive-db ;;
    master) $COMPOSE_CMD --env-file "$ENV_FILE" -f "$COMPOSE_FILE" stop master-db ;;
    keycloak) $COMPOSE_CMD --env-file "$ENV_FILE" -f "$COMPOSE_FILE" stop keycloak-db keycloak ;;
    *) echo "❌ Unknown target: $targets"; exit 1 ;;
  esac
  echo "✅ Stopped."
}

cmd_sync() {
  exec "$ROOT/scripts/db-sync.sh" "$@"
}

case "${1:-}" in
  up)   cmd_up "${2:-all}" ;;
  down) cmd_down "${2:-all}" ;;
  sync) shift; cmd_sync "${@:-all}" ;;
  *)
    echo "Usage: scripts/local.sh <up|down|sync> [targets...]"
    echo ""
    echo "  up    - Start services (all | thrive | master | keycloak)"
    echo "  down  - Stop services"
    echo "  sync  - Sync from remote via SSH tunnel (thrive | master | keycloak | all)"
    exit 1
    ;;
esac
