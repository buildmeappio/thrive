#!/bin/bash
# Sync databases from remote (via SSH tunnel) into local PostgreSQL.
# Usage: scripts/db-sync.sh [thrive|master|keycloak|all]
# Requires .env.db with SYNC_* variables. See .env.db.example.
#
# Targets:
#   thrive   - Sync thrive_db (tenant data)
#   master   - Sync master_db (tenant registry)
#   keycloak - Sync keycloak_db (Keycloak auth data)
#   all      - Sync all three, reset local containers, start keycloak

set -e
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

COMPOSE_FILE="$ROOT/docker-compose.local.yml"
ENV_FILE=".env"
[ -f ".env.db" ] && ENV_FILE=".env.db"

if docker compose version &>/dev/null; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose &>/dev/null; then
  COMPOSE_CMD="docker-compose"
else
  echo "❌ Docker Compose is required."
  exit 1
fi

# Load env - split on first =
load_env() {
  if [ -f "$ENV_FILE" ]; then
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
  fi
}

load_env

# Sync config: SYNC_HOST/USER/PASSWORD for shared; SYNC_TENANT_*, SYNC_MASTER_*, SYNC_KEYCLOAK_* for overrides
# Legacy: SYNC_DB_* maps to SYNC_TENANT_*
get_sync_vars() {
  local target=$1
  case "$target" in
    thrive)
      echo "${SYNC_TENANT_HOST:-${SYNC_DB_HOST:-$SYNC_HOST}}" \
           "${SYNC_TENANT_PORT:-${SYNC_DB_PORT:-${SYNC_PORT:-5432}}}" \
           "${SYNC_TENANT_NAME:-${SYNC_TENANT_DB:-${SYNC_DB_NAME:-thrive_db}}}" \
           "${SYNC_TENANT_USER:-${SYNC_DB_USER:-$SYNC_USER}}" \
           "${SYNC_TENANT_PASSWORD:-${SYNC_DB_PASSWORD:-$SYNC_PASSWORD}}"
      ;;
    master)
      echo "${SYNC_MASTER_HOST:-${SYNC_DB_HOST:-$SYNC_HOST}}" \
           "${SYNC_MASTER_PORT:-${SYNC_DB_PORT:-${SYNC_PORT:-5432}}}" \
           "${SYNC_MASTER_NAME:-${SYNC_MASTER_DB:-master_db}}" \
           "${SYNC_MASTER_USER:-${SYNC_DB_USER:-$SYNC_USER}}" \
           "${SYNC_MASTER_PASSWORD:-${SYNC_DB_PASSWORD:-$SYNC_PASSWORD}}"
      ;;
    keycloak)
      echo "${SYNC_KEYCLOAK_HOST:-${SYNC_DB_HOST:-$SYNC_HOST}}" \
           "${SYNC_KEYCLOAK_PORT:-${SYNC_DB_PORT:-${SYNC_PORT:-5432}}}" \
           "${SYNC_KEYCLOAK_NAME:-${SYNC_KEYCLOAK_DB:-keycloak_db}}" \
           "${SYNC_KEYCLOAK_USER:-${SYNC_DB_USER:-$SYNC_USER}}" \
           "${SYNC_KEYCLOAK_PASSWORD:-${SYNC_DB_PASSWORD:-$SYNC_PASSWORD}}"
      ;;
    *) echo ""; return 1 ;;
  esac
}

check_sync_vars() {
  local target=$1
  read -r host port db_name db_user db_pass <<< "$(get_sync_vars "$target")"
  if [ -z "$host" ] || [ -z "$db_name" ] || [ -z "$db_user" ] || [ -z "$db_pass" ]; then
    echo "❌ Missing SYNC_* vars for $target. Set SYNC_HOST, SYNC_USER, SYNC_PASSWORD in .env.db (or SYNC_TENANT_*, SYNC_MASTER_*, SYNC_KEYCLOAK_* overrides)."
    return 1
  fi
  local key="${SYNC_BASTION_KEY:-$SYNC_BASTON_KEY}"
  local host="${SYNC_BASTION_HOST:-$SYNC_BASTON_HOST}"
  local user="${SYNC_BASTION_USER:-$SYNC_BASTON_USER}"
  if [ -z "$key" ] || [ -z "$host" ] || [ -z "$user" ]; then
    echo "❌ Missing SYNC_BASTION_KEY, SYNC_BASTION_HOST, SYNC_BASTION_USER (or SYNC_BASTON_*)."
    return 1
  fi
}

reset_and_import() {
  local target=$1
  local dump_file=$2
  local local_port=$3
  local db_name=$4

  case "$target" in
    thrive)
      $COMPOSE_CMD --env-file "$ENV_FILE" -f "$COMPOSE_FILE" stop thrive-db 2>/dev/null || true
      docker rm -f thrive-tenant-db-local 2>/dev/null || true
      docker volume rm thrive_postgres_local 2>/dev/null || true
      $COMPOSE_CMD --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d thrive-db
      for i in $(seq 1 20); do
        PGPASSWORD="${PG_PASSWORD}" psql -h localhost -p "${PG_EXTERNAL_PORT:-5441}" -U "${PG_USER:-postgres}" -d "${PG_DB:-thrive_db}" -c '\q' 2>/dev/null && break
        echo "   ...waiting ($i/20)"; sleep 5
      done
      PGPASSWORD="${PG_PASSWORD}" psql -h localhost -p "${PG_EXTERNAL_PORT:-5441}" -U "${PG_USER:-postgres}" -d "${PG_DB:-thrive_db}" -f "$dump_file"
      ;;
    master)
      $COMPOSE_CMD --env-file "$ENV_FILE" -f "$COMPOSE_FILE" stop master-db 2>/dev/null || true
      docker rm -f thrive-master-db-local 2>/dev/null || true
      docker volume rm master_postgres_local 2>/dev/null || true
      $COMPOSE_CMD --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d master-db
      for i in $(seq 1 20); do
        PGPASSWORD="${PG_PASSWORD}" psql -h localhost -p "${PG_MASTER_PORT:-5442}" -U "${PG_USER:-postgres}" -d "master_db" -c '\q' 2>/dev/null && break
        echo "   ...waiting ($i/20)"; sleep 5
      done
      PGPASSWORD="${PG_PASSWORD}" psql -h localhost -p "${PG_MASTER_PORT:-5442}" -U "${PG_USER:-postgres}" -d "master_db" -f "$dump_file"
      ;;
    keycloak)
      $COMPOSE_CMD --env-file "$ENV_FILE" -f "$COMPOSE_FILE" stop keycloak keycloak-db 2>/dev/null || true
      docker rm -f thrive-keycloak-local thrive-keycloak-db-local 2>/dev/null || true
      docker volume rm keycloak_postgres_local 2>/dev/null || true
      $COMPOSE_CMD --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d keycloak-db
      for i in $(seq 1 20); do
        PGPASSWORD="${KC_DB_PASSWORD:-$PG_PASSWORD}" psql -h localhost -p "${PG_KEYCLOAK_PORT:-5443}" -U "${KC_DB_USERNAME:-postgres}" -d "keycloak_db" -c '\q' 2>/dev/null && break
        echo "   ...waiting ($i/20)"; sleep 5
      done
      PGPASSWORD="${KC_DB_PASSWORD:-$PG_PASSWORD}" psql -h localhost -p "${PG_KEYCLOAK_PORT:-5443}" -U "${KC_DB_USERNAME:-postgres}" -d "keycloak_db" -f "$dump_file"
      $COMPOSE_CMD --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d keycloak
      ;;
  esac
}

sync_one() {
  local target=$1
  check_sync_vars "$target" || exit 1

  read -r host port db_name db_user db_pass <<< "$(get_sync_vars "$target")"
  local ssh_port=${SSH_PORT:-22}
  local local_port=${LOCAL_PORT:-15432}
  [ "$target" = "master" ] && local_port=${LOCAL_MASTER_PORT:-15433}
  [ "$target" = "keycloak" ] && local_port=${LOCAL_KEYCLOAK_PORT:-15434}
  local bastion="${SYNC_BASTION_USER:-$SYNC_BASTON_USER}@${SYNC_BASTION_HOST:-$SYNC_BASTON_HOST}"
  local key_file="${SYNC_BASTION_KEY:-$SYNC_BASTON_KEY}"
  DUMP_DIR="$ROOT/db"
  mkdir -p "$DUMP_DIR"
  DUMP_FILE="$DUMP_DIR/${target}.sql"

  echo "🔄 Syncing $target ($db_name) from $host:$port..."

  # Kill existing tunnel on this port
  pid=$(lsof -ti ":$local_port" 2>/dev/null) && kill $pid 2>/dev/null || true
  sleep 2

  ssh -i "$key_file" -o ConnectTimeout=10 "$bastion" -p "$ssh_port" "echo '✅ SSH OK'" 2>/dev/null || {
    echo "❌ SSH failed. Check SYNC_BASTION_*."
    exit 1
  }

  ssh -i "$key_file" -f -N -L "$local_port:$host:$port" "$bastion" -p "$ssh_port" || {
    echo "❌ Tunnel failed."
    exit 1
  }
  sleep 3

  PGPASSWORD="$db_pass" pg_dump -h localhost -p "$local_port" -U "$db_user" -d "$db_name" --no-owner --no-acl > "$DUMP_FILE" || {
    echo "❌ pg_dump failed."
    pid=$(lsof -ti ":$local_port" 2>/dev/null) && kill $pid 2>/dev/null || true
    exit 1
  }
  pid=$(lsof -ti ":$local_port" 2>/dev/null) && kill $pid 2>/dev/null || true

  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' 's/^CREATE SCHEMA public;/-- CREATE SCHEMA public;/' "$DUMP_FILE"
    sed -i '' 's/^SET transaction_timeout = 0;/-- SET transaction_timeout = 0;/' "$DUMP_FILE"
  else
    sed -i 's/^CREATE SCHEMA public;/-- CREATE SCHEMA public;/' "$DUMP_FILE"
    sed -i 's/^SET transaction_timeout = 0;/-- SET transaction_timeout = 0;/' "$DUMP_FILE"
  fi

  echo "📥 Importing $target..."
  reset_and_import "$target" "$DUMP_FILE" "$local_port" "$db_name"
  echo "✅ $target sync complete."
}

command -v pg_dump &>/dev/null || { echo "❌ pg_dump required. Install PostgreSQL client."; exit 1; }

TARGETS=("${@:-all}")
if [[ "${TARGETS[0]}" == "all" ]]; then
  for t in thrive master keycloak; do
    sync_one "$t"
  done
  echo ""
  echo "═══════════════════════════════════════════════════════════════"
  echo "✨ All databases synced and local infra started."
  echo "═══════════════════════════════════════════════════════════════"
else
  for t in "${TARGETS[@]}"; do
    case "$t" in
      thrive|master|keycloak) sync_one "$t" ;;
      *) echo "❌ Unknown target: $t. Use: thrive | master | keycloak | all"; exit 1 ;;
    esac
  done
fi
