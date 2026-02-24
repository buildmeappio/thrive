#!/bin/bash
# One-time Lightsail/EC2 server setup for Thrive apps (PM2, no Docker)
# Run as: ./deploy/scripts/setup-server.sh
# Requires: Ubuntu 22.04 LTS

set -e

echo "=== Thrive Server Setup (Lightsail/EC2) ==="

# Node.js 22 via nvm
if ! command -v nvm &>/dev/null; then
  echo "Installing nvm..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "Installing Node.js 22..."
nvm install 22
nvm use 22
nvm alias default 22

# pnpm
echo "Installing pnpm..."
corepack enable
pnpm --version || npm install -g pnpm

# PM2
echo "Installing PM2..."
npm install -g pm2
pm2 startup || true

# Nginx
echo "Installing Nginx..."
sudo apt-get update
sudo apt-get install -y nginx

# Certbot for SSL
echo "Installing Certbot..."
sudo apt-get install -y certbot python3-certbot-nginx

# AWS CLI (for Secrets Manager)
echo "Installing AWS CLI..."
command -v aws &>/dev/null || (curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && unzip -q awscliv2.zip && sudo ./aws/install && rm -rf aws awscliv2.zip)

# jq
sudo apt-get install -y jq

# Create base directory structure
THRIVE_BASE="${THRIVE_BASE:-/home/ubuntu/thrive}"
echo "Creating directory structure at $THRIVE_BASE..."
mkdir -p "$THRIVE_BASE"/{admin-web,examiner-web,organization-web}/releases

echo ""
echo "=== Setup complete ==="
echo "Next steps:"
echo "1. Copy deploy/nginx/portal.conf to /etc/nginx/sites-available/thrive"
echo "2. Copy deploy/nginx/snippets/* to /etc/nginx/snippets/"
echo "3. Run: sudo ln -sf /etc/nginx/sites-available/thrive /etc/nginx/sites-enabled/"
echo "4. Run: sudo certbot --nginx -d portal-dev.thriveassessmentcare.com"
echo "5. Configure GitHub secrets: EC2_DEPLOY_PATH_ADMIN=$THRIVE_BASE/admin-web, etc."
