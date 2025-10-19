#!/bin/bash

# Function to create .env.db file interactively
create_env_db_file() {
    echo "📝 .env.db file not found."
    echo "🔧 Let's create your .env.db file interactively..."
    echo ""

    temp_env_file=$(mktemp)

    # Database connection settings
    echo "🔧 Setting up database connection:"
    echo ""
    
    # Function to get and validate input
    get_input() {
        local prompt="$1"
        local var_name="$2"  # kept for compatibility, not used currently
        local default_value="$3"
        local value
        local confirmation

        while true; do
            if [ -n "$default_value" ]; then
                printf "%s (default: %s): " "$prompt" "$default_value" >&2
                IFS= read -r value </dev/tty
                value=${value:-$default_value}
            else
                printf "%s: " "$prompt" >&2
                IFS= read -r value </dev/tty
            fi

            # Trim quotes and spaces
            value=$(echo "$value" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")

            # Show preview and ask for confirmation
            printf "   Preview: %s\n" "$value" >&2
            printf "   Is this correct? (y/n/e to edit): " >&2
            IFS= read -r confirmation </dev/tty
            case $confirmation in
                [Yy]* ) printf "%s" "$value"; break;;
                [Ee]* ) printf "   Please re-enter the value\n" >&2;;
                [Nn]* ) printf "   Please re-enter the value\n" >&2;;   
                * ) printf "%s" "$value"; break;;
            esac
        done
    }
    
    echo ""
    db_host=$(get_input "   Enter database host (RDS endpoint)" "SYNC_DB_HOST")
    echo "SYNC_DB_HOST=\"$db_host\"" >> "$temp_env_file"

    echo ""
    db_port=$(get_input "   Enter database port" "SYNC_DB_PORT" "5432")
    echo "SYNC_DB_PORT=\"$db_port\"" >> "$temp_env_file"

    echo ""
    db_name=$(get_input "   Enter database name" "SYNC_DB_NAME")
    echo "SYNC_DB_NAME=\"$db_name\"" >> "$temp_env_file"

    echo ""
    db_user=$(get_input "   Enter database user" "SYNC_DB_USER")
    echo "SYNC_DB_USER=\"$db_user\"" >> "$temp_env_file"

    # Handle password separately for security
    echo ""
    while true; do
        printf "   Enter database password: " >&2
        IFS= read -rs db_password_input </dev/tty
        printf "\n" >&2

        # Trim quotes and spaces from password
        db_password=$(echo "$db_password_input" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")

        printf "   Preview: [password hidden]\n" >&2
        printf "   Is this correct? (y/n/e to edit): " >&2
        IFS= read -r confirmation </dev/tty
        case $confirmation in
            [Yy]* ) break;;
            [Ee]* ) printf "   Please re-enter the password\n" >&2;;
            [Nn]* ) printf "   Please re-enter the password\n" >&2;;
            * ) break;;
        esac
    done
    echo "SYNC_DB_PASSWORD=\"$db_password\"" >> "$temp_env_file"

    echo "" >> "$temp_env_file"

    # SSH connection settings
    echo ""
    echo "🔧 Setting up SSH connection:"
    echo ""
    
    echo ""
    ssh_key=$(get_input "   Enter path to SSH key file" "SYNC_BASTON_KEY")
    echo "SYNC_BASTON_KEY=\"$ssh_key\"" >> "$temp_env_file"

    echo ""
    bastion_host=$(get_input "   Enter bastion host (IP or DNS)" "SYNC_BASTON_HOST")
    echo "SYNC_BASTON_HOST=\"$bastion_host\"" >> "$temp_env_file"

    echo ""
    bastion_user=$(get_input "   Enter bastion user" "SYNC_BASTON_USER" "ec2-user")
    echo "SYNC_BASTON_USER=\"$bastion_user\"" >> "$temp_env_file"

    echo "" >> "$temp_env_file"

    # Optional parameters
    echo ""
    echo "🔧 Optional parameters:"
    echo ""
    
    echo ""
    ssh_port=$(get_input "   Enter SSH port" "SSH_PORT" "22")
    echo "SSH_PORT=\"$ssh_port\"" >> "$temp_env_file"

    echo ""
    local_port=$(get_input "   Enter local port for tunnel" "LOCAL_PORT" "15432")
    echo "LOCAL_PORT=\"$local_port\"" >> "$temp_env_file"

    mv "$temp_env_file" ".env.db"
    echo ""
    echo "✅ .env.db file created successfully!"
}

# Function to load environment variables from .env.db file or .env file
load_env() {
    if [ -f ".env.db" ]; then
        echo "📄 Loading environment variables from .env.db"
        while IFS='=' read -r key value || [ -n "$key" ]; do
            # Skip comments and empty lines
            [[ $key =~ ^#.*$ ]] && continue
            [[ -z "$key" ]] && continue
            
            # Remove leading/trailing whitespace and quotes
            key=$(echo "$key" | xargs)
            value=$(echo "$value" | xargs | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
            
            # Export the variable
            export "$key=$value"
        done < ".env.db"
    elif [ -f ".env" ]; then
        echo "📄 Loading environment variables from .env"
        while IFS='=' read -r key value || [ -n "$key" ]; do
            # Skip comments and empty lines
            [[ $key =~ ^#.*$ ]] && continue
            [[ -z "$key" ]] && continue
            
            # Remove leading/trailing whitespace and quotes
            key=$(echo "$key" | xargs)
            value=$(echo "$value" | xargs | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
            
            # Export the variable
            export "$key=$value"
        done < ".env"
    else
        echo "ℹ️  No .env.db or .env file found."
        create_env_db_file
        # Load the newly created .env.db file
        echo "📄 Loading environment variables from newly created .env.db"
        while IFS='=' read -r key value || [ -n "$key" ]; do
            # Skip comments and empty lines
            [[ $key =~ ^#.*$ ]] && continue
            [[ -z "$key" ]] && continue
            
            # Remove leading/trailing whitespace and quotes
            key=$(echo "$key" | xargs)
            value=$(echo "$value" | xargs | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
            
            # Export the variable
            export "$key=$value"
        done < ".env.db"
    fi
}

# Function to check if Docker Compose is available and set the command
check_docker_compose() {
    # Check for docker-compose (legacy syntax) first - give it priority
    if command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
        return 0
    fi

    # Check for docker compose (newer syntax)
    if docker compose version &> /dev/null 2>&1; then
        COMPOSE_CMD="docker compose"
        return 0
    fi

    echo "❌ Error: Docker Compose is not installed"
    echo ""
    echo "Installation instructions:"
    echo ""
    echo "For macOS:"
    echo "1. Install Docker Desktop from https://www.docker.com/products/docker-desktop"
    echo "   Docker Desktop includes Docker Compose"
    echo ""
    echo "For Ubuntu/Debian:"
    echo "1. sudo apt-get update"
    echo "2. sudo apt-get install docker-compose"
    echo ""
    echo "For other systems, visit:"
    echo "https://docs.docker.com/compose/install/"
    exit 1
}

# Check if Docker Compose is available
check_docker_compose

# Create db directory if it doesn't exist
if [ ! -d "./db" ]; then
    echo "📁 Creating db directory..."
    mkdir -p ./db
fi

# Load environment variables from .env.db or .env
load_env

# Function to check required environment variables
check_required_vars() {
    local missing_vars=()
    
    # Database connection variables
    [ -z "$SYNC_DB_HOST" ] && missing_vars+=("SYNC_DB_HOST")
    [ -z "$SYNC_DB_PORT" ] && missing_vars+=("SYNC_DB_PORT")
    [ -z "$SYNC_DB_NAME" ] && missing_vars+=("SYNC_DB_NAME")
    [ -z "$SYNC_DB_USER" ] && missing_vars+=("SYNC_DB_USER")
    [ -z "$SYNC_DB_PASSWORD" ] && missing_vars+=("SYNC_DB_PASSWORD")
    
    # SSH connection variables
    [ -z "$SYNC_BASTON_KEY" ] && missing_vars+=("SYNC_BASTON_KEY")
    [ -z "$SYNC_BASTON_HOST" ] && missing_vars+=("SYNC_BASTON_HOST")
    [ -z "$SYNC_BASTON_USER" ] && missing_vars+=("SYNC_BASTON_USER")

    # Local database variables
    [ -z "$PG_EXTERNAL_PORT" ] && missing_vars+=("PG_EXTERNAL_PORT")
    [ -z "$PG_USER" ] && missing_vars+=("PG_USER")
    [ -z "$PG_PASSWORD" ] && missing_vars+=("PG_PASSWORD")
    [ -z "$PG_DB" ] && missing_vars+=("PG_DB")
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        echo "❌ Error: Missing required environment variables:"
        printf '%s\n' "${missing_vars[@]}"
        echo ""
        echo "Please set all required variables:"
        echo "# Database connection"
        echo "export SYNC_DB_HOST='your-db-host'"
        echo "export SYNC_DB_PORT='5432'"
        echo "export SYNC_DB_NAME='your-db-name'"
        echo "export SYNC_DB_USER='your-db-user'"
        echo "export SYNC_DB_PASSWORD='your-db-password'"
        echo ""
        echo "# SSH connection"
        echo "export SYNC_BASTON_KEY='/path/to/your/key.pem'"
        echo "export SYNC_BASTON_HOST='your-bastion-host'"
        echo "export SYNC_BASTON_USER='ec2-user'"
        echo ""
        echo "# Local database"
        echo "export PG_EXTERNAL_PORT='5441'"
        echo "export PG_USER='postgres'"
        echo "export PG_PASSWORD='postgres'"
        echo "export PG_DB='thrive_db'"
        exit 1
    fi
}

# Function to detect OS
get_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ -f /etc/os-release ]]; then
        source /etc/os-release
        if [[ "$ID" == "ubuntu" ]] || [[ "$ID" == "debian" ]]; then
            echo "debian"
        else
            echo "unknown"
        fi
    else
        echo "unknown"
    fi
}

# Function to show installation instructions
show_install_instructions() {
    local os_type=$(get_os)
    echo "❌ Error: PostgreSQL 16 client tools are not installed or version is incorrect"
    echo "Current version: ${1:-not installed}"
    echo "Required version: 16"
    echo ""
    echo "Installation instructions for your OS ($os_type):"
    
    if [[ "$os_type" == "macos" ]]; then
        echo "For macOS (using Homebrew):"
        echo "1. brew uninstall postgresql (if installed)"
        echo "2. brew install postgresql@16"
        echo "3. brew link postgresql@16"
        echo "   If linking fails, use: brew link --force postgresql@16"
    elif [[ "$os_type" == "debian" ]]; then
        echo "For Ubuntu/Debian:"
        echo "1. sudo sh -c 'echo \"deb http://apt.postgresql.org/pub/repos/apt \$(lsb_release -cs)-pgdg main\" > /etc/apt/sources.list.d/pgdg.list'"
        echo "2. wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -"
        echo "3. sudo apt-get update"
        echo "4. sudo apt-get install -y postgresql-client-16"
    else
        echo "For other systems:"
        echo "Please install PostgreSQL 16 client tools using your system's package manager"
        echo "or visit: https://www.postgresql.org/download/"
    fi
    exit 1
}

# Check if pg_dump is installed
if ! command -v pg_dump &> /dev/null; then
    show_install_instructions
fi

# Check pg_dump version
PG_VERSION=$(pg_dump --version | grep -oE '[0-9]+' | head -1)
if [ "$PG_VERSION" -lt "16" ]; then
    show_install_instructions "$PG_VERSION"
fi

# Verify required environment variables are set
check_required_vars

# Verify SSH key file exists and has correct permissions
if [ ! -f "$SYNC_BASTON_KEY" ]; then
    echo "❌ Error: SSH key file not found at $SYNC_BASTON_KEY"
    exit 1
fi

# Check and fix SSH key permissions
# Use different stat commands for macOS vs Linux
if [[ "$OSTYPE" == "darwin"* ]]; then
    current_perms=$(stat -f %Lp "$SYNC_BASTON_KEY")
else
    current_perms=$(stat -c %a "$SYNC_BASTON_KEY")
fi

if [ "$current_perms" != "600" ]; then
    echo "🔒 Fixing SSH key permissions (changing from $current_perms to 600)..."
    chmod 600 "$SYNC_BASTON_KEY"
    if [ $? -ne 0 ]; then
        echo "❌ Failed to set correct permissions on SSH key file"
        echo "Please run: chmod 600 $SYNC_BASTON_KEY"
        exit 1
    fi
    echo "✅ SSH key permissions fixed"
fi

# Function to cleanup SSH tunnels
cleanup_tunnels() {
    echo "🧹 Cleaning up SSH tunnels..."
    
    # Kill any existing SSH tunnels on the local port
    local existing_tunnels=$(lsof -ti :$LOCAL_PORT 2>/dev/null)
    if [ ! -z "$existing_tunnels" ]; then
        echo "Found existing tunnels on port $LOCAL_PORT, cleaning up..."
        kill $existing_tunnels 2>/dev/null
    fi

    # Kill our specific SSH tunnel if we have its PID
    if [ ! -z "$SSH_PID" ]; then
        echo "Cleaning up SSH tunnel (PID: $SSH_PID)..."
        kill $SSH_PID 2>/dev/null
    fi

    # Find and kill any remaining SSH tunnels matching our connection
    if [ ! -z "$BASTION_CONNECTION" ] && [ ! -z "$SYNC_DB_HOST" ]; then
        local remaining_tunnels=$(ps aux | grep "ssh.*$LOCAL_PORT:$SYNC_DB_HOST:$SYNC_DB_PORT.*$BASTION_CONNECTION" | grep -v grep | awk '{print $2}')
        if [ ! -z "$remaining_tunnels" ]; then
            echo "Found remaining SSH tunnels, cleaning up..."
            kill $remaining_tunnels 2>/dev/null
        fi
    fi

    # Wait a moment to ensure ports are freed
    sleep 2
}

# Function to find an available port
find_available_port() {
    local start_port=${1:-15432}
    local max_attempts=20
    local port=$start_port

    for (( i=0; i<$max_attempts; i++ )); do
        if ! lsof -i ":$port" > /dev/null 2>&1; then
            echo $port
            return 0
        fi
        ((port++))
    done
    
    echo "❌ Error: Could not find an available port after $max_attempts attempts"
    exit 1
}

# Set default values for optional parameters
SSH_PORT=${SSH_PORT:-"22"}

# Find an available local port
if [ -z "$LOCAL_PORT" ]; then
    echo "🔍 Finding available port..."
    LOCAL_PORT=$(find_available_port 15432)
    echo "✅ Using port: $LOCAL_PORT"
fi

# Construct full bastion connection string
BASTION_CONNECTION="$SYNC_BASTON_USER@$SYNC_BASTON_HOST"

# Register cleanup function for script exit
trap cleanup_tunnels EXIT

# Initial cleanup of any existing tunnels
cleanup_tunnels

# Local paths
DUMP_FILE="./db/init.sql"

echo "🔄 Starting database sync process..."
echo "🔑 Using SSH key: $SYNC_BASTON_KEY"
echo "🌐 Connecting through bastion: $BASTION_CONNECTION"
echo "🎯 Target database: $SYNC_DB_HOST:$SYNC_DB_PORT"
echo "📦 Database name: $SYNC_DB_NAME"
echo "👤 Database user: $SYNC_DB_USER"

# Test SSH connection first
echo "🔄 Testing SSH connection..."
ssh -i "$SYNC_BASTON_KEY" -o ConnectTimeout=10 "$BASTION_CONNECTION" -p "$SSH_PORT" "echo '✅ SSH connection successful'" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ Failed to connect to bastion host"
    echo "Please verify:"
    echo "1. Your SSH key file is correct"
    echo "2. The bastion host is reachable"
    echo "3. The bastion user is correct"
    echo "Current settings:"
    echo "- SSH Key: $SYNC_BASTON_KEY"
    echo "- Bastion: $BASTION_CONNECTION"
    echo "- Port: $SSH_PORT"
    exit 1
fi

# Ensure no existing tunnels are running
cleanup_tunnels

# Create SSH tunnel
echo "🚇 Setting up SSH tunnel..."
ssh -i "$SYNC_BASTON_KEY" -f -N -L "$LOCAL_PORT:$SYNC_DB_HOST:$SYNC_DB_PORT" "$BASTION_CONNECTION" -p "$SSH_PORT"
if [ $? -ne 0 ]; then
    echo "❌ Failed to create SSH tunnel"
    exit 1
fi

# Store the SSH tunnel process ID
SSH_PID=$!

# Function to cleanup SSH tunnels
cleanup_tunnels() {
    echo "🧹 Cleaning up SSH tunnels..."
    
    # Kill any existing SSH tunnels on the local port
    local existing_tunnels=$(lsof -ti :$LOCAL_PORT 2>/dev/null)
    if [ ! -z "$existing_tunnels" ]; then
        echo "Found existing tunnels on port $LOCAL_PORT, cleaning up..."
        kill $existing_tunnels 2>/dev/null
    fi

    # Kill our specific SSH tunnel if we have its PID
    if [ ! -z "$SSH_PID" ]; then
        echo "Cleaning up SSH tunnel (PID: $SSH_PID)..."
        kill $SSH_PID 2>/dev/null
    fi

    # Find and kill any remaining SSH tunnels matching our connection
    if [ ! -z "$BASTION_CONNECTION" ] && [ ! -z "$SYNC_DB_HOST" ]; then
        local remaining_tunnels=$(ps aux | grep "ssh.*$LOCAL_PORT:$SYNC_DB_HOST:$SYNC_DB_PORT.*$BASTION_CONNECTION" | grep -v grep | awk '{print $2}')
        if [ ! -z "$remaining_tunnels" ]; then
            echo "Found remaining SSH tunnels, cleaning up..."
            kill $remaining_tunnels 2>/dev/null
        fi
    fi

    # Wait a moment to ensure ports are freed
    sleep 2
}

# Wait for tunnel to be established
sleep 5

# Create dump through SSH tunnel
echo "📥 Creating database dump through SSH tunnel..."
PGPASSWORD="$SYNC_DB_PASSWORD" pg_dump \
    -h "localhost" \
    -p "$LOCAL_PORT" \
    -U "$SYNC_DB_USER" \
    -d "$SYNC_DB_NAME" \
    --no-owner \
    --no-acl \
    > "$DUMP_FILE"

# Check if dump was successful
if [ $? -ne 0 ]; then
    echo "❌ Failed to create database dump"
    exit 1
fi

echo "✅ Database dump created successfully"

# Comment out problematic lines in the dump file
echo "🔧 Modifying dump file..."
# Use different sed syntax for macOS vs Linux
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' 's/^CREATE SCHEMA public;/-- CREATE SCHEMA public;/' "$DUMP_FILE"
    sed -i '' 's/^SET transaction_timeout = 0;/-- SET transaction_timeout = 0;/' "$DUMP_FILE"
else
    sed -i 's/^CREATE SCHEMA public;/-- CREATE SCHEMA public;/' "$DUMP_FILE"
    sed -i 's/^SET transaction_timeout = 0;/-- SET transaction_timeout = 0;/' "$DUMP_FILE"
fi

echo "🚀 Starting local database containers..."

# Always stop and remove volumes to ensure clean state with correct credentials
echo "🧹 Stopping and removing existing containers and volumes..."
$COMPOSE_CMD --env-file .env -f docker-compose.dev.yaml down -v

# Start containers with fresh volumes
echo "🆕 Creating new database container with credentials from .env..."
$COMPOSE_CMD --env-file .env -f docker-compose.dev.yaml up -d db

# Wait for PostgreSQL to be ready (try connecting in a loop)
echo "⏳ Waiting for PostgreSQL to be ready..."

RETRIES=20
for i in $(seq 1 $RETRIES); do
    PGPASSWORD="${PG_PASSWORD}" psql -h "localhost" -p "${PG_EXTERNAL_PORT}" -U "${PG_USER}" -d "${PG_DB}" -c '\q' 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Database is ready!"
        break
    fi
    echo "   ...not ready yet, retrying in 10s ($i/$RETRIES)"
    sleep 10
done

if [ $i -eq $RETRIES ]; then
    echo "❌ Database did not become ready in time."
    exit 1
fi

# Import the dump file
echo "📥 Importing database dump..."
PGPASSWORD="${PG_PASSWORD}" psql -h "localhost" -p "${PG_EXTERNAL_PORT}" -U "${PG_USER}" -d "${PG_DB}" -f "$DUMP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Database dump imported successfully!"
else
    echo "❌ Failed to import database dump"
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✨ Database sync completed!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📊 Connection Information:"
echo "  Host:     localhost"
echo "  Port:     ${PG_EXTERNAL_PORT}"
echo "  Database: ${PG_DB}"
echo "  User:     ${PG_USER}"
echo "  Password: ${PG_PASSWORD}"
echo ""
echo "  Connection URL:"
echo "  postgresql://${PG_USER}:${PG_PASSWORD}@localhost:${PG_EXTERNAL_PORT}/${PG_DB}"
echo ""
echo "═══════════════════════════════════════════════════════════════"