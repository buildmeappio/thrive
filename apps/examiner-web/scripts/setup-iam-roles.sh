#!/bin/bash
set -e

###############################################################################
# IAM Role Setup Script for GitHub Actions Deployment
# This script sets up all required IAM roles and policies for:
# 1. GitHub Actions to push to ECR and read secrets
# 2. EC2 instance to pull images from ECR
###############################################################################

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration - Will be prompted if not provided via environment variables
export AWS_REGION="${AWS_REGION:-}"
export AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-}"
export GITHUB_ORG="${GITHUB_ORG:-}"
export ECR_REPOSITORIES="${ECR_REPOSITORIES:-}"
export EC2_INSTANCE_ID="${EC2_INSTANCE_ID:-}"
export ENVIRONMENT="${ENVIRONMENT:-dev}"

# Role names - Single role for dev environment with all apps
GITHUB_ROLE_NAME="GitHubActionsDevDeployRole"
EC2_ROLE_NAME="EC2DevDeployRole"
INSTANCE_PROFILE_NAME="EC2DevDeployProfile"

# Default repositories for dev environment
DEFAULT_ECR_REPOS="dev/examiner,dev/organization,dev/admin"
DEFAULT_SECRET_PATTERNS="dev-db-connection,dev/examiner,dev/organization,dev/admin"

# Temporary directory
TMP_DIR="/tmp/iam-setup-$$"
mkdir -p "${TMP_DIR}"

# Cleanup function
cleanup() {
    echo -e "\n${BLUE}Cleaning up temporary files...${NC}"
    rm -rf "${TMP_DIR}"
}
trap cleanup EXIT

# Print functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Function to prompt for input
prompt_input() {
    local prompt_text="$1"
    local var_name="$2"
    local default_value="$3"
    local required="${4:-true}"
    
    if [ -n "${!var_name}" ]; then
        # Value already set via environment variable
        return 0
    fi
    
    while true; do
        if [ -n "$default_value" ]; then
            read -p "${prompt_text} [${default_value}]: " input_value
            input_value="${input_value:-$default_value}"
        else
            read -p "${prompt_text}: " input_value
        fi
        
        if [ -n "$input_value" ] || [ "$required" != "true" ]; then
            export "${var_name}=${input_value}"
            break
        else
            print_error "This field is required. Please provide a value."
        fi
    done
}

###############################################################################
# Step 0: Collect Configuration
###############################################################################
print_header "Step 0: Configuration"

# Check dependencies
if ! command -v jq &> /dev/null; then
    print_error "jq is required but not installed. Please install it: sudo apt-get install jq"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &>/dev/null; then
    print_error "AWS credentials not configured. Please run 'aws configure'"
    exit 1
fi

# Get actual account ID and region from AWS
ACTUAL_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
DEFAULT_REGION=$(aws configure get region || echo "us-east-1")

print_info "Detected AWS Account ID: ${ACTUAL_ACCOUNT_ID}"
print_info "Detected AWS Region: ${DEFAULT_REGION}"

# Prompt for configuration if not provided
echo ""
print_info "Please provide the following configuration (or press Enter for defaults):"
echo ""

prompt_input "AWS Region" "AWS_REGION" "${DEFAULT_REGION}"
prompt_input "AWS Account ID" "AWS_ACCOUNT_ID" "${ACTUAL_ACCOUNT_ID}"
prompt_input "GitHub Organization" "GITHUB_ORG" ""
prompt_input "Environment (dev/staging/prod)" "ENVIRONMENT" "dev"
prompt_input "ECR Repositories (comma-separated, e.g., dev/examiner,dev/organization,dev/admin)" "ECR_REPOSITORIES" "${DEFAULT_ECR_REPOS}"
prompt_input "EC2 Instance ID (optional, to check existing profile)" "EC2_INSTANCE_ID" "" false

# Set derived values - GitHub repos that will use this role
# For dev environment, we support all three repos: examiner-web, organization-web, admin-web
export GITHUB_REPO_EXAMINER="${GITHUB_ORG}/examiner-web"
export GITHUB_REPO_ORGANIZATION="${GITHUB_ORG}/organization-web"
export GITHUB_REPO_ADMIN="${GITHUB_ORG}/admin-web"

# If ECR_REPOSITORIES not provided, use defaults
if [ -z "$ECR_REPOSITORIES" ]; then
    export ECR_REPOSITORIES="${DEFAULT_ECR_REPOS}"
fi

echo ""
print_success "Configuration collected:"
print_success "  AWS Account ID: ${AWS_ACCOUNT_ID}"
print_success "  AWS Region: ${AWS_REGION}"
print_success "  Environment: ${ENVIRONMENT}"
print_success "  GitHub Organization: ${GITHUB_ORG}"
print_success "  Supported Repos: examiner-web, organization-web, admin-web"
print_success "  ECR Repositories: ${ECR_REPOSITORIES}"
if [ -n "$EC2_INSTANCE_ID" ]; then
    print_success "  EC2 Instance ID: ${EC2_INSTANCE_ID}"
fi

###############################################################################
# Step 1: Verify AWS Configuration
###############################################################################
print_header "Step 1: Verifying AWS Configuration"

# Verify account ID matches
if [ "$ACTUAL_ACCOUNT_ID" != "$AWS_ACCOUNT_ID" ]; then
    print_warning "Provided account ID ($AWS_ACCOUNT_ID) doesn't match actual account ($ACTUAL_ACCOUNT_ID)"
    read -p "Use actual account ID ($ACTUAL_ACCOUNT_ID)? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        export AWS_ACCOUNT_ID="$ACTUAL_ACCOUNT_ID"
        print_success "Using actual account ID: ${AWS_ACCOUNT_ID}"
    fi
fi

###############################################################################
# Step 2: Check Existing Resources
###############################################################################
print_header "Step 2: Checking Existing Resources"

# Check OIDC provider
print_info "Checking OIDC provider..."
OIDC_PROVIDER_ARN=$(aws iam list-open-id-connect-providers --query 'OpenIDConnectProviderList[?contains(Arn, `token.actions.githubusercontent.com`)].Arn' --output text 2>/dev/null || echo "")
if [ -n "$OIDC_PROVIDER_ARN" ]; then
    print_success "OIDC provider exists: $OIDC_PROVIDER_ARN"
else
    print_warning "OIDC provider not found - will be created"
fi

# Check existing roles
print_info "Checking existing roles..."
if aws iam get-role --role-name "${GITHUB_ROLE_NAME}" &>/dev/null; then
    print_warning "Role ${GITHUB_ROLE_NAME} already exists"
fi

if aws iam get-role --role-name "${EC2_ROLE_NAME}" &>/dev/null; then
    print_warning "Role ${EC2_ROLE_NAME} already exists"
fi

# Check ECR repositories for all three projects
print_info "Checking ECR repositories..."
IFS=',' read -ra REPO_ARRAY <<< "$ECR_REPOSITORIES"
MISSING_REPOS=()
for repo in "${REPO_ARRAY[@]}"; do
    repo=$(echo "$repo" | xargs)  # trim whitespace
    if [ -n "$repo" ]; then
        if aws ecr describe-repositories --region "${AWS_REGION}" --repository-names "${repo}" &>/dev/null; then
            ECR_URI=$(aws ecr describe-repositories --region "${AWS_REGION}" --repository-names "${repo}" --query 'repositories[0].repositoryUri' --output text)
            print_success "ECR repository exists: ${repo} (${ECR_URI})"
        else
            print_warning "ECR repository not found: ${repo}"
            MISSING_REPOS+=("${repo}")
        fi
    fi
done

# Offer to create missing repositories
if [ ${#MISSING_REPOS[@]} -gt 0 ]; then
    echo ""
    print_warning "Missing ECR repositories: ${MISSING_REPOS[*]}"
    read -p "Create missing ECR repositories? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        for repo in "${MISSING_REPOS[@]}"; do
            print_info "Creating ECR repository: ${repo}..."
            aws ecr create-repository \
                --repository-name "${repo}" \
                --region "${AWS_REGION}" \
                --image-scanning-configuration scanOnPush=true \
                --encryption-configuration encryptionType=AES256
            print_success "ECR repository created: ${repo}"
        done
    fi
fi

# Check secrets for all three projects
print_info "Checking Secrets Manager secrets..."
SECRETS=$(aws secretsmanager list-secrets --region "${AWS_REGION}" --query 'SecretList[*].Name' --output text 2>/dev/null || echo "")

# Check database connection secret (shared)
if echo "$SECRETS" | grep -q "dev-db-connection"; then
    print_success "Secret 'dev-db-connection' exists"
else
    print_warning "Secret 'dev-db-connection' not found"
fi

# Check secrets for each application
for app in examiner organization admin; do
    SECRET_NAME="dev/${app}"
    if echo "$SECRETS" | grep -q "${SECRET_NAME}"; then
        print_success "Secret '${SECRET_NAME}' exists"
    else
        print_warning "Secret '${SECRET_NAME}' not found"
    fi
done

###############################################################################
# Step 3: Create OIDC Provider
###############################################################################
print_header "Step 3: Creating OIDC Provider"

if [ -z "$OIDC_PROVIDER_ARN" ]; then
    print_info "Creating OIDC provider..."
    aws iam create-open-id-connect-provider \
        --url https://token.actions.githubusercontent.com \
        --client-id-list sts.amazonaws.com \
        --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1 \
        --tags Key=Purpose,Value=GitHubActions Key=CreatedBy,Value=setup-script 2>&1 | grep -q "EntityAlreadyExists" && \
        print_warning "OIDC provider already exists" || \
        print_success "OIDC provider created"
    
    OIDC_PROVIDER_ARN=$(aws iam list-open-id-connect-providers --query 'OpenIDConnectProviderList[?contains(Arn, `token.actions.githubusercontent.com`)].Arn' --output text)
    print_success "OIDC Provider ARN: $OIDC_PROVIDER_ARN"
else
    print_success "OIDC provider already exists: $OIDC_PROVIDER_ARN"
fi

###############################################################################
# Step 4: Create GitHub Actions Trust Policy (Multi-Repo Support)
###############################################################################
print_header "Step 4: Creating GitHub Actions Trust Policy"

# Build trust policy that allows all three repositories
cat > "${TMP_DIR}/github-trust-policy.json" << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::${AWS_ACCOUNT_ID}:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": [
            "repo:${GITHUB_REPO_EXAMINER}:*",
            "repo:${GITHUB_REPO_ORGANIZATION}:*",
            "repo:${GITHUB_REPO_ADMIN}:*"
          ]
        }
      }
    }
  ]
}
EOF

print_success "Trust policy created for all three repositories: ${TMP_DIR}/github-trust-policy.json"

###############################################################################
# Step 5: Create GitHub Actions Permissions Policy (Multi-Repo & Multi-App)
###############################################################################
print_header "Step 5: Creating GitHub Actions Permissions Policy"

# Build ECR repository ARNs array
ECR_REPO_ARNS="[]"
IFS=',' read -ra REPO_ARRAY <<< "$ECR_REPOSITORIES"
for repo in "${REPO_ARRAY[@]}"; do
    repo=$(echo "$repo" | xargs)  # trim whitespace
    if [ -n "$repo" ]; then
        REPO_ARN="arn:aws:ecr:${AWS_REGION}:${AWS_ACCOUNT_ID}:repository/${repo}"
        ECR_REPO_ARNS=$(echo "$ECR_REPO_ARNS" | jq --arg arn "$REPO_ARN" '. + [$arn]')
    fi
done

# Build Secrets Manager ARNs array for all apps
SECRET_ARNS="[]"
IFS=',' read -ra SECRET_ARRAY <<< "${DEFAULT_SECRET_PATTERNS}"
for secret_pattern in "${SECRET_ARRAY[@]}"; do
    secret_pattern=$(echo "$secret_pattern" | xargs)  # trim whitespace
    if [ -n "$secret_pattern" ]; then
        SECRET_ARN="arn:aws:secretsmanager:${AWS_REGION}:${AWS_ACCOUNT_ID}:secret:${secret_pattern}-*"
        SECRET_ARNS=$(echo "$SECRET_ARNS" | jq --arg arn "$SECRET_ARN" '. + [$arn]')
    fi
done

# Create base policy document
cat > "${TMP_DIR}/github-permissions-policy.json" << 'POLICY_EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ECRAuthorization",
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken"
      ],
      "Resource": "*"
    },
    {
      "Sid": "ECRRepositoryAccess",
      "Effect": "Allow",
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecr:DescribeRepositories",
        "ecr:DescribeImages",
        "ecr:ListImages",
        "ecr:TagResource"
      ],
      "Resource": []
    },
    {
      "Sid": "SecretsManagerRead",
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": []
    }
  ]
}
POLICY_EOF

# Inject the repository ARNs and secret ARNs into the policy
jq --argjson repos "$ECR_REPO_ARNS" --argjson secrets "$SECRET_ARNS" \
   '.Statement[1].Resource = $repos | .Statement[2].Resource = $secrets' \
   "${TMP_DIR}/github-permissions-policy.json" > "${TMP_DIR}/github-permissions-policy-tmp.json"
mv "${TMP_DIR}/github-permissions-policy-tmp.json" "${TMP_DIR}/github-permissions-policy.json"

print_success "Permissions policy created for all ECR repositories and secrets"
print_info "  ECR Repositories: ${ECR_REPOSITORIES}"
print_info "  Secrets: ${DEFAULT_SECRET_PATTERNS}"

###############################################################################
# Step 6: Create GitHub Actions IAM Role
###############################################################################
print_header "Step 6: Creating GitHub Actions IAM Role"

if aws iam get-role --role-name "${GITHUB_ROLE_NAME}" &>/dev/null; then
    print_warning "Role ${GITHUB_ROLE_NAME} already exists. Updating trust policy..."
    aws iam update-assume-role-policy \
        --role-name "${GITHUB_ROLE_NAME}" \
        --policy-document "file://${TMP_DIR}/github-trust-policy.json"
    print_success "Trust policy updated"
else
    print_info "Creating role ${GITHUB_ROLE_NAME}..."
    # Create tags file - use semicolon instead of comma (commas not allowed in tag values)
    cat > "${TMP_DIR}/role-tags.json" << EOF
[
    {"Key": "Purpose", "Value": "GitHubActions"},
    {"Key": "Environment", "Value": "${ENVIRONMENT}"},
    {"Key": "CreatedBy", "Value": "setup-script"}
]
EOF
    aws iam create-role \
        --role-name "${GITHUB_ROLE_NAME}" \
        --assume-role-policy-document "file://${TMP_DIR}/github-trust-policy.json" \
        --description "Role for GitHub Actions dev environment - supports examiner-web, organization-web, and admin-web" \
        --tags file://"${TMP_DIR}/role-tags.json"
    print_success "Role created"
fi

# Attach inline policy
print_info "Attaching permissions policy..."
aws iam put-role-policy \
    --role-name "${GITHUB_ROLE_NAME}" \
    --policy-name GitHubActionsDeployPolicy \
    --policy-document "file://${TMP_DIR}/github-permissions-policy.json"
print_success "Permissions policy attached"

# Get role ARN
GITHUB_ROLE_ARN=$(aws iam get-role --role-name "${GITHUB_ROLE_NAME}" --query 'Role.Arn' --output text)
print_success "GitHub Actions Role ARN: ${GITHUB_ROLE_ARN}"

###############################################################################
# Step 7: Create EC2 Trust Policy
###############################################################################
print_header "Step 7: Creating EC2 Trust Policy"

cat > "${TMP_DIR}/ec2-trust-policy.json" << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

print_success "EC2 trust policy created"

###############################################################################
# Step 8: Create EC2 ECR Pull Policy (Multi-Repository Support)
###############################################################################
print_header "Step 8: Creating EC2 ECR Pull Policy"

# Build resource array for multiple ECR repositories using jq for proper JSON
if [ -z "$ECR_REPOSITORIES" ]; then
    print_error "ECR_REPOSITORIES is required for EC2 ECR pull policy"
    exit 1
fi

# Create array of repository ARNs
REPO_ARNS="[]"
IFS=',' read -ra REPO_ARRAY <<< "$ECR_REPOSITORIES"
for repo in "${REPO_ARRAY[@]}"; do
    repo=$(echo "$repo" | xargs)  # trim whitespace
    if [ -n "$repo" ]; then
        REPO_ARN="arn:aws:ecr:${AWS_REGION}:${AWS_ACCOUNT_ID}:repository/${repo}"
        REPO_ARNS=$(echo "$REPO_ARNS" | jq --arg arn "$REPO_ARN" '. + [$arn]')
    fi
done

# Create policy document using jq for proper JSON formatting
cat > "${TMP_DIR}/ec2-ecr-pull-policy.json" << 'POLICY_EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ECRPull",
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage"
      ],
      "Resource": "*"
    },
    {
      "Sid": "ECRRepositoryAccess",
      "Effect": "Allow",
      "Action": [
        "ecr:DescribeRepositories",
        "ecr:DescribeImages"
      ],
      "Resource": []
    }
  ]
}
POLICY_EOF

# Inject the repository ARNs array into the policy
jq --argjson repos "$REPO_ARNS" '.Statement[1].Resource = $repos' "${TMP_DIR}/ec2-ecr-pull-policy.json" > "${TMP_DIR}/ec2-ecr-pull-policy-tmp.json"
mv "${TMP_DIR}/ec2-ecr-pull-policy-tmp.json" "${TMP_DIR}/ec2-ecr-pull-policy.json"

print_success "EC2 ECR pull policy created for repositories: ${ECR_REPOSITORIES}"

###############################################################################
# Step 9: Check Existing EC2 Instance Profile and Determine Role
###############################################################################
print_header "Step 9: Checking EC2 Instance Configuration"

EXISTING_INSTANCE_PROFILE=""
EXISTING_ROLE_NAME=""

# Check if instance ID is provided and if it has an instance profile
if [ -n "${EC2_INSTANCE_ID}" ]; then
    print_info "Checking instance ${EC2_INSTANCE_ID} for existing instance profile..."
    EXISTING_ASSOCIATION=$(aws ec2 describe-iam-instance-profile-associations \
        --filters "Name=instance-id,Values=${EC2_INSTANCE_ID}" \
        --query 'IamInstanceProfileAssociations[0]' --output json 2>/dev/null || echo "{}")
    
    if [ "$EXISTING_ASSOCIATION" != "{}" ] && [ "$EXISTING_ASSOCIATION" != "null" ]; then
        EXISTING_INSTANCE_PROFILE=$(echo "$EXISTING_ASSOCIATION" | jq -r '.IamInstanceProfile.Arn // empty')
        EXISTING_ROLE_NAME=$(echo "$EXISTING_ASSOCIATION" | jq -r '.IamInstanceProfile.Arn // empty' | sed 's/.*instance-profile\///')
        
        if [ -n "$EXISTING_ROLE_NAME" ]; then
            # Get the actual role name from the instance profile
            EXISTING_ROLE_NAME=$(aws iam get-instance-profile --instance-profile-name "$EXISTING_ROLE_NAME" \
                --query 'InstanceProfile.Roles[0].RoleName' --output text 2>/dev/null || echo "")
            
            if [ -n "$EXISTING_ROLE_NAME" ]; then
                print_warning "Instance ${EC2_INSTANCE_ID} already has instance profile: ${EXISTING_INSTANCE_PROFILE}"
                print_info "Found existing role: ${EXISTING_ROLE_NAME}"
                print_info "Will add ECR permissions to existing role instead of creating new one"
                EC2_ROLE_NAME="${EXISTING_ROLE_NAME}"
            fi
        fi
    else
        print_info "Instance ${EC2_INSTANCE_ID} does not have an instance profile attached"
    fi
else
    print_info "EC2_INSTANCE_ID not provided. Will create new role: ${EC2_ROLE_NAME}"
    print_warning "If your instance already has a profile, provide EC2_INSTANCE_ID to update existing role"
fi

###############################################################################
# Step 10: Create or Update EC2 Instance Role
###############################################################################
print_header "Step 10: Creating/Updating EC2 Instance Role"

if aws iam get-role --role-name "${EC2_ROLE_NAME}" &>/dev/null; then
    print_warning "Role ${EC2_ROLE_NAME} already exists."
    if [ "$EC2_ROLE_NAME" != "${EXISTING_ROLE_NAME}" ] || [ -z "${EXISTING_ROLE_NAME}" ]; then
        print_info "Updating trust policy..."
        aws iam update-assume-role-policy \
            --role-name "${EC2_ROLE_NAME}" \
            --policy-document "file://${TMP_DIR}/ec2-trust-policy.json"
        print_success "Trust policy updated"
    else
        print_info "Using existing role (trust policy unchanged)"
    fi
else
    print_info "Creating role ${EC2_ROLE_NAME}..."
    # Create tags file
    cat > "${TMP_DIR}/ec2-role-tags.json" << EOF
[
    {"Key": "Purpose", "Value": "EC2Deploy"},
    {"Key": "Environment", "Value": "${ENVIRONMENT}"},
    {"Key": "CreatedBy", "Value": "setup-script"},
    {"Key": "MultiApp", "Value": "true"}
]
EOF
    aws iam create-role \
        --role-name "${EC2_ROLE_NAME}" \
        --assume-role-policy-document "file://${TMP_DIR}/ec2-trust-policy.json" \
        --description "Role for EC2 instance to pull images from ECR (multi-app support for dev environment)" \
        --tags file://"${TMP_DIR}/ec2-role-tags.json"
    print_success "Role created"
fi

# Attach or update inline policy
print_info "Attaching/updating ECR pull policy..."
aws iam put-role-policy \
    --role-name "${EC2_ROLE_NAME}" \
    --policy-name EC2ECRPullPolicy \
    --policy-document "file://${TMP_DIR}/ec2-ecr-pull-policy.json"
print_success "ECR pull policy attached/updated"

EC2_ROLE_ARN=$(aws iam get-role --role-name "${EC2_ROLE_NAME}" --query 'Role.Arn' --output text)
print_success "EC2 Role ARN: ${EC2_ROLE_ARN}"

###############################################################################
# Step 11: Handle EC2 Instance Profile
###############################################################################
print_header "Step 11: Handling EC2 Instance Profile"

# If instance already has a profile, we'll use that instead of creating a new one
if [ -n "${EXISTING_INSTANCE_PROFILE}" ]; then
    print_info "Instance already has instance profile: ${EXISTING_INSTANCE_PROFILE}"
    print_success "ECR permissions have been added to the existing role: ${EC2_ROLE_NAME}"
    INSTANCE_PROFILE_ARN="${EXISTING_INSTANCE_PROFILE}"
    INSTANCE_PROFILE_NAME=$(echo "${EXISTING_INSTANCE_PROFILE}" | sed 's/.*instance-profile\///')
else
    # Create new instance profile only if instance doesn't have one
    if aws iam get-instance-profile --instance-profile-name "${INSTANCE_PROFILE_NAME}" &>/dev/null; then
        print_warning "Instance profile ${INSTANCE_PROFILE_NAME} already exists"
        # Check if role is attached
        ATTACHED_ROLE=$(aws iam get-instance-profile --instance-profile-name "${INSTANCE_PROFILE_NAME}" --query 'InstanceProfile.Roles[0].RoleName' --output text 2>/dev/null || echo "")
        if [ "$ATTACHED_ROLE" != "${EC2_ROLE_NAME}" ]; then
            print_info "Adding role to instance profile..."
            aws iam add-role-to-instance-profile \
                --instance-profile-name "${INSTANCE_PROFILE_NAME}" \
                --role-name "${EC2_ROLE_NAME}" 2>/dev/null || \
            print_warning "Role may already be attached"
            print_success "Role added to instance profile"
        else
            print_success "Role already attached to instance profile"
        fi
    else
        print_info "Creating instance profile ${INSTANCE_PROFILE_NAME}..."
        aws iam create-instance-profile --instance-profile-name "${INSTANCE_PROFILE_NAME}"
        print_success "Instance profile created"
        
        print_info "Adding role to instance profile..."
        aws iam add-role-to-instance-profile \
            --instance-profile-name "${INSTANCE_PROFILE_NAME}" \
            --role-name "${EC2_ROLE_NAME}"
        print_success "Role added to instance profile"
    fi
    
    INSTANCE_PROFILE_ARN=$(aws iam get-instance-profile --instance-profile-name "${INSTANCE_PROFILE_NAME}" --query 'InstanceProfile.Arn' --output text)
    print_success "Instance Profile ARN: ${INSTANCE_PROFILE_ARN}"
    
    # Only suggest attaching if instance ID was not provided or instance doesn't have profile
    if [ -z "${EC2_INSTANCE_ID}" ]; then
        print_warning "To attach this profile to your EC2 instance, run:"
        print_info "aws ec2 associate-iam-instance-profile --instance-id i-xxxxx --iam-instance-profile Name=${INSTANCE_PROFILE_NAME}"
    fi
fi

###############################################################################
# Step 12: Verification Summary
###############################################################################
print_header "Step 12: Verification Summary"

echo -e "\n${GREEN}=== Setup Complete ===${NC}\n"

echo -e "${BLUE}GitHub Actions Configuration (${ENVIRONMENT} environment):${NC}"
echo "  Role Name: ${GITHUB_ROLE_NAME}"
echo "  Role ARN:  ${GITHUB_ROLE_ARN}"
echo "  Supported Repositories:"
echo "    - examiner-web (${GITHUB_REPO_EXAMINER})"
echo "    - organization-web (${GITHUB_REPO_ORGANIZATION})"
echo "    - admin-web (${GITHUB_REPO_ADMIN})"
echo "  ECR Repositories: ${ECR_REPOSITORIES}"
echo ""
echo -e "${BLUE}EC2 Instance Configuration:${NC}"
echo "  Role Name:        ${EC2_ROLE_NAME}"
echo "  Role ARN:         ${EC2_ROLE_ARN}"
echo "  Instance Profile: ${INSTANCE_PROFILE_NAME}"
echo "  Profile ARN:      ${INSTANCE_PROFILE_ARN}"
echo ""

###############################################################################
# Step 13: Next Steps
###############################################################################
print_header "Next Steps"

printf "${YELLOW}1. Add GitHub Repository Variables:${NC}\n"
printf "   Add AWS_ROLE_ARN to each repository:\n"
printf "   ${BLUE}examiner-web:${NC} https://github.com/${GITHUB_REPO_EXAMINER}/settings/variables/actions\n"
printf "   ${BLUE}organization-web:${NC} https://github.com/${GITHUB_REPO_ORGANIZATION}/settings/variables/actions\n"
printf "   ${BLUE}admin-web:${NC} https://github.com/${GITHUB_REPO_ADMIN}/settings/variables/actions\n"
printf "   Variable: AWS_ROLE_ARN = ${GITHUB_ROLE_ARN}\n"
printf "\n"

if [ -z "${EXISTING_INSTANCE_PROFILE}" ]; then
    printf "${YELLOW}2. Attach Instance Profile to EC2 Instance:${NC}\n"
    printf "   Run this command (replace INSTANCE_ID with your actual instance ID):\n"
    printf "   ${BLUE}aws ec2 associate-iam-instance-profile \\\\${NC}\n"
    printf "   ${BLUE}  --instance-id i-xxxxxxxxxxxxxxxxx \\\\${NC}\n"
    printf "   ${BLUE}  --iam-instance-profile Name=${INSTANCE_PROFILE_NAME}${NC}\n"
    printf "\n"
else
    printf "${YELLOW}2. EC2 Instance Profile:${NC}\n"
    printf "   ${GREEN}✓ Instance already has profile attached: ${EXISTING_INSTANCE_PROFILE}${NC}\n"
    printf "   ${GREEN}✓ ECR permissions added to existing role: ${EC2_ROLE_NAME}${NC}\n"
    printf "\n"
fi

printf "${YELLOW}3. GitHub Repository Variables & Secrets Required:${NC}\n"
printf "\n"
printf "   ${BLUE}For each repository (examiner-web, organization-web, admin-web):${NC}\n"
printf "   ${BLUE}Go to: Settings → Secrets and variables → Actions${NC}\n"
printf "\n"
printf "   ${GREEN}Variables (Repository Variables):${NC}\n"
printf "   ${BLUE}AWS_REGION${NC} = ${AWS_REGION}\n"
printf "   ${BLUE}AWS_ROLE_ARN${NC} = ${GITHUB_ROLE_ARN}\n"
printf "   ${BLUE}ECR_REPOSITORY${NC} = ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com\n"
printf "   ${BLUE}CONTAINER_NAME${NC} = (examiner-web | organization-web | admin-web)\n"
printf "   ${BLUE}SECRET_NAME_DB${NC} = dev-db-connection\n"
printf "   ${BLUE}SECRET_NAME_ENV${NC} = dev/(examiner | organization | admin)\n"
printf "   ${BLUE}DEPLOY_PATH${NC} = ~/(examiner | organization | admin)\n"
printf "\n"
printf "   ${GREEN}Secrets (Repository Secrets):${NC}\n"
printf "   ${BLUE}EC2_HOST${NC} = (your EC2 instance hostname/IP)\n"
printf "   ${BLUE}EC2_USER${NC} = ubuntu (or your SSH user)\n"
printf "   ${BLUE}EC2_SSH_KEY${NC} = (your SSH private key for EC2)\n"
printf "   ${BLUE}NEXT_PUBLIC_APP_URL${NC} = (your app URL)\n"
printf "   ${BLUE}NEXT_PUBLIC_CDN_URL${NC} = (your CDN URL)\n"
printf "   ${BLUE}NEXT_PUBLIC_GOOGLE_PLACES_API_KEY${NC} = (your Google Places API key)\n"
printf "   ${BLUE}NEXT_PUBLIC_CLAIMANT_AVAILABILITY_URL${NC} = (your claimant availability URL)\n"
printf "\n"
printf "   ${YELLOW}Example for examiner-web:${NC}\n"
printf "   Variables:\n"
printf "     AWS_REGION = ${AWS_REGION}\n"
printf "     AWS_ROLE_ARN = ${GITHUB_ROLE_ARN}\n"
printf "     ECR_REPOSITORY = ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com\n"
printf "     CONTAINER_NAME = examiner-web\n"
printf "     SECRET_NAME_DB = dev-db-connection\n"
printf "     SECRET_NAME_ENV = dev/examiner\n"
printf "     DEPLOY_PATH = ~/examiner\n"
printf "\n"

printf "${YELLOW}4. Verify Setup:${NC}\n"
printf "   Test ECR access: ${BLUE}aws ecr get-login-password --region ${AWS_REGION}${NC}\n"
printf "   Test secrets:    ${BLUE}aws secretsmanager get-secret-value --secret-id dev/examiner --region ${AWS_REGION}${NC}\n"
printf "\n"

printf "${GREEN}Setup completed successfully!${NC}\n\n"

