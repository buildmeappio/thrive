#!/bin/bash
# Sync database from remote (via SSH tunnel) into local PostgreSQL.
# Run from repo root. Uses root docker-compose.yml for local DB.
# Requires .env.db or .env with SYNC_* and PG_* variables.

set -e
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

COMPOSE_FILE="$ROOT/docker-compose.yml"

# =========================== WINDOWS COMPATIBILITY NOTICE/EXIT ===========================

detect_windows() {
    case "$OSTYPE" in
        cygwin*|msys*|win32*) return 0 ;;
    esac
    if grep -qi microsoft /proc/version 2>/dev/null; then return 1; fi
    if [[ "$COMSPEC" =~ [Ww][Ii][Nn][Dd][Oo][Ww][Ss] ]] || [[ -n "$WINDIR" ]]; then return 0; fi
    unameOut="$(uname -s 2>/dev/null)"
    case "$unameOut" in CYGWIN*|MINGW*|MSYS*) return 0 ;; esac
    return 1
}

# Function to create .env.db file interactively
create_env_db_file() {
    echo "📝 .env.db file not found."
    echo "🔧 Let's create your .env.db file interactively..."
    echo ""

    temp_env_file=$(mktemp)

    get_input() {
        local prompt="$1" default_value="$2" value confirmation
        while true; do
            if [ -n "$default_value" ]; then
                printf "%s (default: %s): " "$prompt" "$default_value" >&2
                IFS= read -r value </dev/tty
                value=${value:-$default_value}
            else
                printf "%s: " "$prompt" >&2
                IFS= read -r value </dev/tty
            fi
            value=$(echo "$value" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
            printf "   Preview: %s\n" "$value" >&2
            printf "   Is this correct? (y/n/e to edit): " >&2
            IFS= read -r confirmation </dev/tty
            case $confirmation in [Yy]*|*) printf "%s" "$value"; break;; [Ee]*|[Nn]*) printf "   Please re-enter the value\n" >&2;; esac
        done
    }

    echo ""; db_host=$(get_input "   Enter database host (RDS endpoint)" ""); echo "SYNC_DB_HOST=\"$db_host\"" >> "$temp_env_file"
    echo ""; db_port=$(get_input "   Enter database port" "5432"); echo "SYNC_DB_PORT=\"$db_port\"" >> "$temp_env_file"
    echo ""; db_name=$(get_input "   Enter database name" ""); echo "SYNC_DB_NAME=\"$db_name\"" >> "$temp_env_file"
    echo ""; db_user=$(get_input "   Enter database user" ""); echo "SYNC_DB_USER=\"$db_user\"" >> "$temp_env_file"
    echo ""
    while true; do
        printf "   Enter database password: " >&2; IFS= read -rs db_password_input </dev/tty; printf "\n" >&2
        db_password=$(echo "$db_password_input" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
        printf "   Is this correct? (y/n/e to edit): " >&2; IFS= read -r confirmation </dev/tty
        case $confirmation in [Yy]*|*) break;; [Ee]*|[Nn]*) printf "   Please re-enter the password\n" >&2;; esac
    done
    echo "SYNC_DB_PASSWORD=\"$db_password\"" >> "$temp_env_file"
    echo "" >> "$temp_env_file"

    echo ""; ssh_key=$(get_input "   Enter path to SSH key file" ""); echo "SYNC_BASTON_KEY=\"$ssh_key\"" >> "$temp_env_file"
    echo ""; bastion_host=$(get_input "   Enter bastion host (IP or DNS)" ""); echo "SYNC_BASTON_HOST=\"$bastion_host\"" >> "$temp_env_file"
    echo ""; bastion_user=$(get_input "   Enter bastion user" "ec2-user"); echo "SYNC_BASTON_USER=\"$bastion_user\"" >> "$temp_env_file"
    echo "" >> "$temp_env_file"
    echo ""; ssh_port=$(get_input "   Enter SSH port" "22"); echo "SSH_PORT=\"$ssh_port\"" >> "$temp_env_file"
    echo ""; local_port=$(get_input "   Enter local port for tunnel" "15432"); echo "LOCAL_PORT=\"$local_port\"" >> "$temp_env_file"

    echo ""; echo "PG_EXTERNAL_PORT=\"5441\"" >> "$temp_env_file"; echo "PG_USER=\"postgres\"" >> "$temp_env_file"; echo "PG_PASSWORD=\"postgres\"" >> "$temp_env_file"; echo "PG_DB=\"thrive_db\"" >> "$temp_env_file"

    mv "$temp_env_file" ".env.db"
    echo ""; echo "✅ .env.db file created successfully!"
}

convert_windows_path() {
    local path="$1"
    if [[ "$path" =~ ^[A-Za-z]:\\ ]]; then
        drive=$(echo "${path:0:1}" | tr '[:upper:]' '[:lower:]')
        rest="${path:2}"; rest="${rest//\\//}"
        echo "/$drive/$rest"
    else echo "$path"; fi
}

load_env() {
    if [ -f ".env.db" ]; then
        echo "📄 Loading environment variables from .env.db"
        while IFS='=' read -r key value || [ -n "$key" ]; do
            [[ $key =~ ^#.*$ ]] && continue; [[ -z "$key" ]] && continue; [[ -z "$value" ]] && continue
            key=$(echo "$key" | xargs); value=$(echo "$value" | xargs | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
            [[ "$key" == "SYNC_BASTON_KEY" ]] || [[ "$key" =~ _KEY$ ]] && value=$(convert_windows_path "$value")
            export "$key=$value"
        done < ".env.db"
    elif [ -f ".env" ]; then
        echo "📄 Loading environment variables from .env"
        while IFS='=' read -r key value || [ -n "$key" ]; do
            [[ $key =~ ^#.*$ ]] && continue; [[ -z "$key" ]] && continue; [[ -z "$value" ]] && continue
            key=$(echo "$key" | xargs); value=$(echo "$value" | xargs | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
            [[ "$key" == "SYNC_BASTON_KEY" ]] || [[ "$key" =~ _KEY$ ]] && value=$(convert_windows_path "$value")
            export "$key=$value"
        done < ".env"
    else
        echo "ℹ️  No .env.db or .env file found."; create_env_db_file
        echo "📄 Loading environment variables from newly created .env.db"
        while IFS='=' read -r key value || [ -n "$key" ]; do
            [[ $key =~ ^#.*$ ]] && continue; [[ -z "$key" ]] && continue; [[ -z "$value" ]] && continue
            key=$(echo "$key" | xargs); value=$(echo "$value" | xargs | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
            [[ "$key" == "SYNC_BASTON_KEY" ]] || [[ "$key" =~ _KEY$ ]] && value=$(convert_windows_path "$value")
            export "$key=$value"
        done < ".env.db"
    fi
}

check_docker_compose() {
    if docker compose version &>/dev/null; then COMPOSE_CMD="docker compose"; return 0; fi
    if command -v docker-compose &>/dev/null; then COMPOSE_CMD="docker-compose"; return 0; fi
    echo "❌ Error: Docker Compose is not installed"; exit 1
}

check_docker_compose

[ ! -d "./db" ] && echo "📁 Creating db directory..." && mkdir -p ./db

load_env

check_required_vars() {
    local missing_vars=()
    [ -z "$SYNC_DB_HOST" ] && missing_vars+=("SYNC_DB_HOST")
    [ -z "$SYNC_DB_PORT" ] && missing_vars+=("SYNC_DB_PORT")
    [ -z "$SYNC_DB_NAME" ] && missing_vars+=("SYNC_DB_NAME")
    [ -z "$SYNC_DB_USER" ] && missing_vars+=("SYNC_DB_USER")
    [ -z "$SYNC_DB_PASSWORD" ] && missing_vars+=("SYNC_DB_PASSWORD")
    [ -z "$SYNC_BASTON_KEY" ] && missing_vars+=("SYNC_BASTON_KEY")
    [ -z "$SYNC_BASTON_HOST" ] && missing_vars+=("SYNC_BASTON_HOST")
    [ -z "$SYNC_BASTON_USER" ] && missing_vars+=("SYNC_BASTON_USER")
    [ -z "$PG_EXTERNAL_PORT" ] && missing_vars+=("PG_EXTERNAL_PORT")
    [ -z "$PG_USER" ] && missing_vars+=("PG_USER")
    [ -z "$PG_PASSWORD" ] && missing_vars+=("PG_PASSWORD")
    [ -z "$PG_DB" ] && missing_vars+=("PG_DB")
    if [ ${#missing_vars[@]} -ne 0 ]; then
        echo "❌ Error: Missing required environment variables:"; printf '%s\n' "${missing_vars[@]}"
        echo ""; echo "Create .env.db at repo root with SYNC_* and PG_* vars. See .env.db.example"
        exit 1
    fi
}

get_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then echo "macos"
    elif [[ -f /etc/os-release ]]; then source /etc/os-release; [[ "$ID" == "ubuntu" ]] || [[ "$ID" == "debian" ]] && echo "debian" || echo "unknown"
    else echo "unknown"; fi
}

show_install_instructions() {
    echo "❌ Error: PostgreSQL 16+ client tools required. Current: ${1:-not installed}"
    echo "Install: brew install postgresql@16 (macOS) or apt install postgresql-client-16 (Ubuntu)"
    exit 1
}

command -v pg_dump &>/dev/null || show_install_instructions
PG_VERSION=$(pg_dump --version | grep -oE '[0-9]+' | head -1)
[ "$PG_VERSION" -lt "16" ] && show_install_instructions "$PG_VERSION"

check_required_vars

[ ! -f "$SYNC_BASTON_KEY" ] && echo "❌ Error: SSH key not found at $SYNC_BASTON_KEY" && exit 1

if [[ "$OSTYPE" == "darwin"* ]]; then current_perms=$(stat -f %Lp "$SYNC_BASTON_KEY")
else current_perms=$(stat -c %a "$SYNC_BASTON_KEY"); fi
[ "$current_perms" != "600" ] && chmod 600 "$SYNC_BASTON_KEY" && echo "🔒 Fixed SSH key permissions"

cleanup_tunnels() {
    [ -n "$(lsof -ti :$LOCAL_PORT 2>/dev/null)" ] && kill $(lsof -ti :$LOCAL_PORT) 2>/dev/null || true
    [ -n "$SSH_PID" ] && kill $SSH_PID 2>/dev/null || true
    sleep 2
}

find_available_port() {
    local port=${1:-15432} i
    for (( i=0; i<20; i++ )); do
        ! lsof -i ":$port" &>/dev/null && echo $port && return 0
        ((port++))
    done
    echo "❌ No available port"; exit 1
}

SSH_PORT=${SSH_PORT:-"22"}
[ -z "$LOCAL_PORT" ] && LOCAL_PORT=$(find_available_port 15432)
BASTON_CONNECTION="$SYNC_BASTON_USER@$SYNC_BASTON_HOST"
trap cleanup_tunnels EXIT
cleanup_tunnels

DUMP_FILE="$ROOT/db/init.sql"

ENV_FILE=".env"
[ -f ".env.db" ] && ENV_FILE=".env.db"

echo "🔄 Starting database sync..."
echo "🔑 SSH key: $SYNC_BASTON_KEY"
echo "🌐 Bastion: $BASTON_CONNECTION"
echo "🎯 Target: $SYNC_DB_HOST:$SYNC_DB_PORT / $SYNC_DB_NAME"

ssh -i "$SYNC_BASTON_KEY" -o ConnectTimeout=10 "$BASTON_CONNECTION" -p "$SSH_PORT" "echo '✅ SSH OK'" 2>/dev/null || {
    echo "❌ SSH failed. Check key, bastion, user."; exit 1
}

cleanup_tunnels
echo "🚇 Setting up SSH tunnel..."
ssh -i "$SYNC_BASTON_KEY" -f -N -L "$LOCAL_PORT:$SYNC_DB_HOST:$SYNC_DB_PORT" "$BASTON_CONNECTION" -p "$SSH_PORT" || { echo "❌ Tunnel failed"; exit 1; }
SSH_PID=$!
sleep 5

echo "📥 Creating dump..."
PGPASSWORD="$SYNC_DB_PASSWORD" pg_dump -h localhost -p "$LOCAL_PORT" -U "$SYNC_DB_USER" -d "$SYNC_DB_NAME" --no-owner --no-acl > "$DUMP_FILE" || { echo "❌ Dump failed"; exit 1; }
echo "✅ Dump created"

if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' 's/^CREATE SCHEMA public;/-- CREATE SCHEMA public;/' "$DUMP_FILE"
    sed -i '' 's/^SET transaction_timeout = 0;/-- SET transaction_timeout = 0;/' "$DUMP_FILE"
else
    sed -i 's/^CREATE SCHEMA public;/-- CREATE SCHEMA public;/' "$DUMP_FILE"
    sed -i 's/^SET transaction_timeout = 0;/-- SET transaction_timeout = 0;/' "$DUMP_FILE"
fi

echo "🚀 Starting local database..."
$COMPOSE_CMD --env-file "$ENV_FILE" -f "$COMPOSE_FILE" down -v
$COMPOSE_CMD --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d db

echo "⏳ Waiting for PostgreSQL..."
for i in $(seq 1 20); do
    PGPASSWORD="${PG_PASSWORD}" psql -h localhost -p "${PG_EXTERNAL_PORT}" -U "${PG_USER}" -d "${PG_DB}" -c '\q' 2>/dev/null && echo "✅ Database ready!" && break
    echo "   ...retrying ($i/20)"; sleep 10
done
[ $i -eq 20 ] && echo "❌ Database not ready" && exit 1

echo "📥 Importing dump..."
PGPASSWORD="${PG_PASSWORD}" psql -h localhost -p "${PG_EXTERNAL_PORT}" -U "${PG_USER}" -d "${PG_DB}" -f "$DUMP_FILE" || { echo "❌ Import failed"; exit 1; }

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✨ Database sync completed!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "  postgresql://${PG_USER}:${PG_PASSWORD}@localhost:${PG_EXTERNAL_PORT}/${PG_DB}"
echo "═══════════════════════════════════════════════════════════════"
