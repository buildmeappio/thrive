# IAM Role Setup Script

This script automates the setup of all IAM roles and policies required for GitHub Actions deployment to AWS.

## What It Does

The script creates:

1. **OIDC Provider** - Allows GitHub Actions to authenticate with AWS
2. **GitHub Actions IAM Role** - Allows GitHub Actions to push to ECR and read secrets
3. **EC2 Instance IAM Role** - Allows EC2 instance to pull images from ECR
4. **EC2 Instance Profile** - Associates the EC2 role with EC2 instances

## Prerequisites

1. AWS CLI installed and configured
2. `jq` command-line JSON processor (`sudo apt-get install jq`)
3. Appropriate AWS permissions to create IAM roles and policies
4. Your AWS account ID and region
5. Your GitHub organization and repository name
6. (Optional) EC2 instance ID if instance already has a profile

## Usage

### Basic Usage

```bash
cd scripts
./setup-iam-roles.sh
```

### With Custom Configuration

You can override default values using environment variables:

```bash
export AWS_REGION="ca-central-1"
export AWS_ACCOUNT_ID="564083281173"
export GITHUB_ORG="thrive-org"
export GITHUB_REPO="examiner-web"
export ECR_REPOSITORY_NAME="dev/examiner"
export ECR_REPOSITORIES="dev/examiner,dev/organization,dev/admin"  # For multi-app EC2
export EC2_INSTANCE_ID="i-xxxxxxxxxxxxxxxxx"  # Optional: to check existing profile

./setup-iam-roles.sh
```

### Configuration Variables

Edit the script or set these environment variables:

- `AWS_REGION` - AWS region (default: `ca-central-1`)
- `AWS_ACCOUNT_ID` - Your AWS account ID (default: `564083281173`)
- `GITHUB_ORG` - GitHub organization name (default: `thrive-org`)
- `GITHUB_REPO` - GitHub repository name (default: `examiner-web`)
- `ECR_REPOSITORY_NAME` - ECR repository name (default: `dev/examiner`)
- `ECR_REPOSITORIES` - Comma-separated list of ECR repositories for multi-app EC2 (default: `dev/examiner,dev/organization,dev/admin`)
- `EC2_INSTANCE_ID` - Optional EC2 instance ID to check for existing instance profile

## What the Script Does Step-by-Step

1. **Verifies AWS Configuration** - Checks credentials and account ID
2. **Checks Existing Resources** - Identifies what already exists
3. **Creates OIDC Provider** - Sets up GitHub Actions authentication
4. **Creates GitHub Actions Role** - With trust and permissions policies
5. **Checks EC2 Instance** - If instance ID provided, checks for existing instance profile
6. **Creates/Updates EC2 Instance Role** - With ECR pull permissions for multiple repositories
7. **Handles Instance Profile** - Uses existing profile if found, or creates new one
8. **Verifies Setup** - Confirms all resources were created

## Multi-Application EC2 Support

If your EC2 instance hosts multiple applications (e.g., examiner-web, organization-web, admin-web):

1. **Provide Instance ID**: Set `EC2_INSTANCE_ID` environment variable

   ```bash
   export EC2_INSTANCE_ID="i-0ee88f3d9fcd75071"
   ```

2. **List All ECR Repositories**: Set `ECR_REPOSITORIES` with comma-separated list

   ```bash
   export ECR_REPOSITORIES="dev/examiner,dev/organization,dev/admin"
   ```

3. **Script Behavior**:
   - If instance already has an instance profile, the script will detect it
   - It will add ECR permissions to the existing role instead of creating a new one
   - This prevents the "IncorrectState" error when trying to attach a second profile
   - The ECR policy will include access to all specified repositories

## Output

The script will output:

- Success/error messages for each step
- Role ARNs for GitHub Actions and EC2
- Instance Profile ARN
- Next steps instructions

## After Running the Script

1. **Add GitHub Variable**:
   - Go to your repository settings → Variables → Actions
   - Add `AWS_ROLE_ARN` with the value shown in the script output

2. **Attach Instance Profile to EC2**:

   ```bash
   aws ec2 associate-iam-instance-profile \
     --instance-id i-xxxxxxxxxxxxxxxxx \
     --iam-instance-profile Name=EC2ExaminerDeployProfile
   ```

3. **Verify Setup**:

   ```bash
   # Test ECR access
   aws ecr get-login-password --region ca-central-1

   # Test secrets access (requires assuming the GitHub role)
   aws secretsmanager get-secret-value --secret-id dev/examiner --region ca-central-1
   ```

## Troubleshooting

### Script Fails with "Access Denied"

- Ensure your AWS credentials have permissions to create IAM roles and policies
- You need permissions for: `iam:CreateRole`, `iam:PutRolePolicy`, `iam:CreateInstanceProfile`, etc.

### Role Already Exists

- The script will update existing roles instead of failing
- If you want to recreate, delete the role first:
  ```bash
  aws iam delete-role --role-name GitHubActionsDeployRole
  ```

### OIDC Provider Already Exists

- This is fine - the script will detect and use the existing provider
- Only one OIDC provider is needed per AWS account

### ECR Repository Not Found

- The script will prompt to create it
- Or create manually:
  ```bash
  aws ecr create-repository \
    --repository-name dev/examiner \
    --region ca-central-1
  ```

## Manual Verification Commands

```bash
# Check GitHub Actions role
aws iam get-role --role-name GitHubActionsDeployRole

# Check EC2 role
aws iam get-role --role-name EC2ExaminerDeployRole

# Check instance profile
aws iam get-instance-profile --instance-profile-name EC2ExaminerDeployProfile

# List all policies on a role
aws iam list-role-policies --role-name GitHubActionsDeployRole
aws iam get-role-policy --role-name GitHubActionsDeployRole --policy-name GitHubActionsDeployPolicy
```

## Cleanup (if needed)

To remove all created resources:

```bash
# Remove instance profile
aws iam remove-role-from-instance-profile \
  --instance-profile-name EC2ExaminerDeployProfile \
  --role-name EC2ExaminerDeployRole
aws iam delete-instance-profile --instance-profile-name EC2ExaminerDeployProfile

# Delete roles (will fail if policies are attached)
aws iam delete-role-policy --role-name GitHubActionsDeployRole --policy-name GitHubActionsDeployPolicy
aws iam delete-role --role-name GitHubActionsDeployRole

aws iam delete-role-policy --role-name EC2ExaminerDeployRole --policy-name EC2ECRPullPolicy
aws iam delete-role --role-name EC2ExaminerDeployRole
```

## Security Notes

- The script uses least-privilege policies
- GitHub Actions role is restricted to your specific repository
- EC2 role only has ECR pull permissions, not push
- All resources are tagged for easy identification
