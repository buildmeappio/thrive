#!/bin/bash

set -e

# -------------------------------
# Production EC2 Deployment Script
# Usage: ./deploy-production-ec2.sh <deploy_path> <ecr_registry> <ecr_repository> <image_tag> <ecr_password> <aws_region>
# -------------------------------

# Set HOME if not set (SSM might not have it)
export HOME="${HOME:-/home/ubuntu}"
export USER="${USER:-ubuntu}"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Parse arguments
DEPLOY_PATH="${1:-/home/ubuntu/projects/admin-web}"
ECR_REGISTRY="${2}"
ECR_REPOSITORY="${3}"
IMAGE_TAG="${4}"
ECR_PASSWORD="${5}"
AWS_REGION="${6:-ca-central-1}"

# Validate required arguments
if [[ -z "$ECR_REGISTRY" || -z "$ECR_REPOSITORY" || -z "$IMAGE_TAG" || -z "$ECR_PASSWORD" ]]; then
  echo -e "${RED}❌ Error: Missing required arguments${NC}"
  echo "Usage: $0 <deploy_path> <ecr_registry> <ecr_repository> <image_tag> <ecr_password> <aws_region>"
  exit 1
fi

echo -e "${YELLOW}🚀 Starting production deployment...${NC}"
echo "Deploy Path: $DEPLOY_PATH"
echo "ECR Registry: $ECR_REGISTRY"
echo "ECR Repository: $ECR_REPOSITORY"
echo "Image Tag: $IMAGE_TAG"
echo "AWS Region: $AWS_REGION"
echo ""

# Load nvm or install if not found
export NVM_DIR="${HOME}/.nvm"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  echo -e "${YELLOW}📦 NVM not found. Installing NVM...${NC}"
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
fi

[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Verify nvm is available
if ! command -v nvm &> /dev/null; then
  echo -e "${RED}❌ Failed to install/load NVM${NC}"
  exit 1
fi

# Use Node.js 22
echo -e "${YELLOW}📦 Setting up Node.js...${NC}"
nvm use 22 || (nvm install 22 && nvm use 22)
echo -e "${GREEN}✅ Node.js $(node --version) ready${NC}"
echo ""

# Create deployment directory
echo -e "${YELLOW}📁 Setting up deployment directory...${NC}"
mkdir -p "$DEPLOY_PATH"
cd "$DEPLOY_PATH"
echo -e "${GREEN}✅ Working directory: $(pwd)${NC}"
echo ""

# Install jq if not available
echo -e "${YELLOW}🔧 Installing dependencies...${NC}"
sudo apt-get update && sudo apt-get install -y jq || true
echo ""

# Step 1: Pull secrets from AWS Secrets Manager and create .env file
echo -e "${YELLOW}🔐 Fetching secrets from AWS Secrets Manager...${NC}"
SHARED_SECRET=$(aws secretsmanager get-secret-value --secret-id prod/shared --region "$AWS_REGION" --query SecretString --output text)
ADMIN_SECRET=$(aws secretsmanager get-secret-value --secret-id prod/admin --region "$AWS_REGION" --query SecretString --output text)

if [[ -z "$SHARED_SECRET" || -z "$ADMIN_SECRET" ]]; then
  echo -e "${RED}❌ Error: Failed to fetch secrets from AWS Secrets Manager${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Secrets fetched successfully${NC}"

# Merge secrets (admin overrides shared) and convert JSON to .env format
echo -e "${YELLOW}📝 Creating .env file...${NC}"
jq -r -n \
  --argjson shared "$SHARED_SECRET" \
  --argjson admin "$ADMIN_SECRET" \
  '$shared * $admin | to_entries[] | "\(.key)=\(.value | tojson)"' | sudo tee "$DEPLOY_PATH/.env" > /dev/null

if [[ ! -f "$DEPLOY_PATH/.env" ]]; then
  echo -e "${RED}❌ Error: Failed to create .env file${NC}"
  exit 1
fi

echo -e "${GREEN}✅ .env file created at $DEPLOY_PATH/.env${NC}"
echo ""

# Step 2: Git operations
echo -e "${YELLOW}📥 Updating code from repository...${NC}"
if [[ ! -d ".git" ]]; then
  echo -e "${RED}❌ Error: Not a git repository. Please clone the repository first.${NC}"
  exit 1
fi

# Fix git ownership issue (add directory to safe.directory)
git config --global --add safe.directory "$DEPLOY_PATH" || true

# Ensure correct ownership
sudo chown -R $USER:$USER "$DEPLOY_PATH" || true

# Configure git to use deploy keys via SSH config
if [[ -f "$HOME/.ssh/config" ]]; then
  # Use SSH config if it exists (should have github-admin-web configured)
  export GIT_SSH_COMMAND="ssh -F $HOME/.ssh/config -o IdentitiesOnly=yes"
else
  # Fallback: use deploy key directly
  if [[ -f "$HOME/.ssh/id_ed25519_admin-web" ]]; then
    export GIT_SSH_COMMAND="ssh -i $HOME/.ssh/id_ed25519_admin-web -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"
  else
    echo -e "${YELLOW}⚠️  Warning: No SSH deploy key found. Git operations may fail.${NC}"
  fi
fi

# Update remote URL to use SSH alias if SSH config exists
if [[ -f "$HOME/.ssh/config" ]]; then
  CURRENT_REMOTE=$(git config --get remote.origin.url || echo "")
  if [[ -n "$CURRENT_REMOTE" && "$CURRENT_REMOTE" != *"github-admin-web"* ]]; then
    # Extract GitHub org/username from current remote
    if [[ "$CURRENT_REMOTE" =~ git@github.com:([^/]+)/admin-web ]]; then
      GITHUB_ORG="${BASH_REMATCH[1]}"
      git remote set-url origin "git@github-admin-web:${GITHUB_ORG}/admin-web.git" || true
    elif [[ "$CURRENT_REMOTE" =~ https://github.com/([^/]+)/admin-web ]]; then
      GITHUB_ORG="${BASH_REMATCH[1]}"
      git remote set-url origin "git@github-admin-web:${GITHUB_ORG}/admin-web.git" || true
    fi
  fi
fi

git fetch origin
git checkout main
git pull origin main
echo -e "${GREEN}✅ Code updated${NC}"
echo ""

# Step 3: Install dependencies
echo -e "${YELLOW}📦 Installing npm dependencies...${NC}"
npm ci --legacy-peer-deps --include=optional
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 4: Login to ECR
echo -e "${YELLOW}🔑 Logging into Amazon ECR...${NC}"
echo "$ECR_PASSWORD" | docker login --username AWS --password-stdin "$ECR_REGISTRY"
echo -e "${GREEN}✅ Logged into ECR${NC}"
echo ""

# Step 5: Pull Docker image
echo -e "${YELLOW}🐳 Pulling Docker image...${NC}"
docker pull "$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG"
echo -e "${GREEN}✅ Image pulled: $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG${NC}"
echo ""

# Step 6: Deploy with docker-compose
echo -e "${YELLOW}🚀 Deploying application...${NC}"

# Find currently running container image before stopping
OLD_IMAGE=$(docker ps --filter "ancestor=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" --format "{{.Image}}" | head -1)
if [[ -z "$OLD_IMAGE" ]]; then
  OLD_IMAGE=$(docker ps --filter "name=$(basename $DEPLOY_PATH)" --format "{{.Image}}" | head -1)
fi

# Export ECR variables for docker-compose
export ECR_REGISTRY="$ECR_REGISTRY/$ECR_REPOSITORY"
export IMAGE_TAG="$IMAGE_TAG"

# Stop existing containers
echo "Stopping existing containers..."
docker-compose down || true

# Start new containers
echo "Starting new containers..."
docker-compose up -d

# Show running containers
echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Running containers:"
docker ps
echo ""
echo "Docker Compose status:"
docker-compose ps

# Clean up old image if different
if [[ -n "$OLD_IMAGE" && "$OLD_IMAGE" != "$ECR_REGISTRY:$IMAGE_TAG" ]]; then
  echo ""
  echo -e "${YELLOW}🧹 Removing old Docker image: $OLD_IMAGE${NC}"
  docker rmi "$OLD_IMAGE" || true
  echo -e "${GREEN}✅ Cleanup complete${NC}"
else
  echo ""
  echo -e "${GREEN}ℹ️  No old image to remove${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Production deployment completed successfully!${NC}"

