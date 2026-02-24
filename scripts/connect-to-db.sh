#!/bin/bash

# Connect to RDS via Bastion - Dev Environment
# This script creates an SSH tunnel and connects to PostgreSQL

set -e

ENV=${1:-dev}
REGION="ca-central-1"
AWS_PROFILE="thrive"

echo "🔌 Connecting to $ENV database via bastion..."
echo ""

# Get database connection details from Secrets Manager
SECRET_JSON=$(aws secretsmanager get-secret-value \
  --secret-id ${ENV}-db-connection \
  --region ${REGION} \
  --profile ${AWS_PROFILE} \
  --query 'SecretString' \
  --output text)

DB_HOST=$(echo $SECRET_JSON | jq -r '.host')
DB_PORT=$(echo $SECRET_JSON | jq -r '.port')
DB_NAME=$(echo $SECRET_JSON | jq -r '.dbname')
DB_USER=$(echo $SECRET_JSON | jq -r '.username')
DB_PASS=$(echo $SECRET_JSON | jq -r '.password')

echo "📊 Database Connection Info:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo ""

# Get bastion info from Terraform output
cd /Users/admin/Desktop/thrive/iac/workload/environments/${ENV}
BASTION_IP=$(terraform output -raw bastion_public_ip 2>/dev/null || echo "15.223.251.234")

echo "🖥️  Bastion Host: $BASTION_IP"
echo ""
echo "Choose connection method:"
echo "  1) SSH Tunnel + psql (connect via localhost)"
echo "  2) SSH Tunnel only (for DBeaver/TablePlus)"
echo "  3) Print connection details"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
  1)
    echo ""
    echo "🚇 Creating SSH tunnel..."
    echo "📍 You can connect to: localhost:5432"
    echo ""
    echo "Press Ctrl+C to close tunnel"
    echo ""
    
    # Start tunnel in background
    ssh -i ~/.ssh/dev-keypair.pem \
      -L 5432:${DB_HOST}:${DB_PORT} \
      -N \
      -o StrictHostKeyChecking=no \
      ec2-user@${BASTION_IP} &
    
    SSH_PID=$!
    echo "SSH tunnel PID: $SSH_PID"
    
    # Wait for tunnel to establish
    sleep 2
    
    # Connect with psql
    echo ""
    echo "🔗 Connecting to database..."
    PGPASSWORD=$DB_PASS psql -h localhost -p 5432 -U $DB_USER -d $DB_NAME
    
    # Kill tunnel when psql exits
    kill $SSH_PID 2>/dev/null || true
    ;;
    
  2)
    echo ""
    echo "🚇 Starting SSH tunnel (background)..."
    echo ""
    echo "📍 Connection details for DBeaver/TablePlus:"
    echo "   Host: localhost"
    echo "   Port: 5432"
    echo "   Database: $DB_NAME"
    echo "   Username: $DB_USER"
    echo "   Password: $DB_PASS"
    echo ""
    echo "Press Ctrl+C to close tunnel"
    echo ""
    
    ssh -i ~/.ssh/dev-keypair.pem \
      -L 5432:${DB_HOST}:${DB_PORT} \
      -N \
      -o StrictHostKeyChecking=no \
      ec2-user@${BASTION_IP}
    ;;
    
  3)
    echo ""
    echo "📋 Connection Details:"
    echo "   Host: $DB_HOST"
    echo "   Port: $DB_PORT"
    echo "   Database: $DB_NAME"
    echo "   Username: $DB_USER"
    echo "   Password: $DB_PASS"
    echo ""
    echo "🚇 SSH Tunnel Command:"
    echo "   ssh -i ~/.ssh/dev-keypair.pem -L 5432:${DB_HOST}:${DB_PORT} ec2-user@${BASTION_IP} -N"
    echo ""
    echo "🔗 PostgreSQL Connection String:"
    echo "   postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}"
    echo ""
    ;;
    
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac

