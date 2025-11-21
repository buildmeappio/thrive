#!/bin/bash
# Upload secrets to AWS Secrets Manager
# Usage: ./scripts/upload-secrets.sh dev

set -e

ENV=${1:-dev}
SERVICE="examiner"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

AWS_REGION="ca-central-1"
SECRET_NAME="${ENV}/${SERVICE}"
SECRET_FILE="secrets/env.json"

echo -e "${YELLOW}🔐 Uploading secrets for ${SERVICE} (${ENV} environment)${NC}"
echo ""

# Automatically get the current AWS account to display info (no verification against a fixed account)
CURRENT_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
echo "Current AWS Account: $CURRENT_ACCOUNT"
echo ""

# Check if secret file exists
if [ ! -f "$SECRET_FILE" ]; then
  echo -e "${RED}❌ Error: Secret file not found: $SECRET_FILE${NC}"
  exit 1
fi

# Check if secrets have been replaced
if grep -q "REPLACE_WITH_YOUR" "$SECRET_FILE"; then
  echo -e "${RED}❌ Error: Please replace placeholder values in $SECRET_FILE${NC}"
  echo ""
  echo "Edit the file and replace all 'REPLACE_WITH_YOUR_*' values with actual secrets."
  exit 1
fi

# Check if secret already exists
if aws secretsmanager describe-secret --secret-id "$SECRET_NAME" --region "$AWS_REGION" &>/dev/null; then
  echo -e "${YELLOW}Secret already exists. Updating...${NC}"
  
  aws secretsmanager update-secret \
    --secret-id "$SECRET_NAME" \
    --secret-string file://"$SECRET_FILE" \
    --region "$AWS_REGION"
  
  echo -e "${GREEN}✅ Secret updated successfully!${NC}"
else
  echo -e "${YELLOW}Creating new secret...${NC}"
  
  aws secretsmanager create-secret \
    --name "$SECRET_NAME" \
    --description "Application secrets for ${SERVICE} service in ${ENV} environment" \
    --secret-string file://"$SECRET_FILE" \
    --region "$AWS_REGION"
  
  echo -e "${GREEN}✅ Secret created successfully!${NC}"
fi

# Get the ARN
SECRET_ARN=$(aws secretsmanager describe-secret \
  --secret-id "$SECRET_NAME" \
  --region "$AWS_REGION" \
  --query 'ARN' \
  --output text)

echo ""
echo -e "${GREEN}Secret ARN:${NC}"
echo "$SECRET_ARN"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Copy the ARN above"
echo "2. Add it to workload/environments/${ENV}/main.tf in the iam_ecs module secrets_arns"
echo "3. Use it in the ecs_${SERVICE} module configuration"
echo "4. Run: make plan env=${ENV}"
echo "5. Run: make apply env=${ENV}"
echo ""

