# IAM Role Setup for GitHub Actions Deployment

This document outlines the IAM role and policies required for the GitHub Actions workflow to deploy to AWS.

## Overview

The `AWS_ROLE_ARN` role is used by GitHub Actions to:

1. **Build Job**: Push Docker images to Amazon ECR
2. **Deploy Job**: Read secrets from AWS Secrets Manager

## Required IAM Role Configuration

### 1. Trust Policy (OIDC for GitHub Actions)

The role must trust GitHub Actions OIDC provider. Here's the trust policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_ORG/YOUR_REPO:*"
        }
      }
    }
  ]
}
```

**Replace:**

- `YOUR_ACCOUNT_ID` with your AWS account ID
- `YOUR_ORG/YOUR_REPO` with your GitHub organization/repository (e.g., `Thrive/examiner-web`)

**Note**: If you want to restrict to specific branches/environments, you can add conditions like:

```json
"StringLike": {
  "token.actions.githubusercontent.com:sub": [
    "repo:YOUR_ORG/YOUR_REPO:ref:refs/heads/develop",
    "repo:YOUR_ORG/YOUR_REPO:pull_request"
  ]
}
```

### 2. Permissions Policy

Attach the following policy to the role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ECRPushPull",
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    },
    {
      "Sid": "ECRRepositoryAccess",
      "Effect": "Allow",
      "Action": [
        "ecr:DescribeRepositories",
        "ecr:DescribeImages",
        "ecr:ListImages",
        "ecr:TagResource"
      ],
      "Resource": "arn:aws:ecr:REGION:ACCOUNT_ID:repository/REPOSITORY_NAME/*"
    },
    {
      "Sid": "SecretsManagerRead",
      "Effect": "Allow",
      "Action": ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"],
      "Resource": [
        "arn:aws:secretsmanager:REGION:ACCOUNT_ID:secret:dev-db-connection*",
        "arn:aws:secretsmanager:REGION:ACCOUNT_ID:secret:dev/examiner*"
      ]
    }
  ]
}
```

**Replace:**

- `REGION` with your AWS region (e.g., `ca-central-1`)
- `ACCOUNT_ID` with your AWS account ID
- `REPOSITORY_NAME` with your ECR repository name (e.g., `examiner-web`)

### 3. Minimal Permissions Policy (More Restrictive)

For better security, you can use a more restrictive policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ECRAuthorization",
      "Effect": "Allow",
      "Action": ["ecr:GetAuthorizationToken"],
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
      "Resource": "arn:aws:ecr:REGION:ACCOUNT_ID:repository/REPOSITORY_NAME"
    },
    {
      "Sid": "SecretsManagerRead",
      "Effect": "Allow",
      "Action": ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"],
      "Resource": [
        "arn:aws:secretsmanager:REGION:ACCOUNT_ID:secret:dev-db-connection-*",
        "arn:aws:secretsmanager:REGION:ACCOUNT_ID:secret:dev/examiner-*"
      ]
    }
  ]
}
```

## Setup Steps

### 1. Create OIDC Provider (if not already exists)

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

### 2. Create IAM Role

```bash
# Create the role with trust policy
aws iam create-role \
  --role-name GitHubActionsDeployRole \
  --assume-role-policy-document file://trust-policy.json

# Attach permissions policy
aws iam put-role-policy \
  --role-name GitHubActionsDeployRole \
  --policy-name GitHubActionsDeployPolicy \
  --policy-document file://permissions-policy.json
```

### 3. Get Role ARN

```bash
aws iam get-role --role-name GitHubActionsDeployRole --query 'Role.Arn' --output text
```

Use this ARN as the value for `AWS_ROLE_ARN` in your GitHub repository variables.

## EC2 Instance IAM Role (Separate)

**Important**: The EC2 instance also needs its own IAM role/permissions to pull images from ECR. This is separate from the GitHub Actions role.

### EC2 Instance Role Permissions

The EC2 instance needs:

```json
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
      "Action": ["ecr:DescribeRepositories", "ecr:DescribeImages"],
      "Resource": "arn:aws:ecr:REGION:ACCOUNT_ID:repository/REPOSITORY_NAME"
    }
  ]
}
```

Attach this policy to an IAM role and assign it to your EC2 instance.

## Testing

After setting up the role, test it by running the workflow. If there are permission errors, check CloudTrail logs to see which actions are being denied.

## Security Best Practices

1. **Use least privilege**: Only grant the minimum permissions needed
2. **Restrict by repository**: Use conditions in the trust policy to limit which repositories can assume the role
3. **Restrict by branch**: Add conditions to limit which branches can use the role
4. **Use separate roles**: Consider separate roles for build and deploy jobs if needed
5. **Rotate credentials**: Regularly review and rotate access keys
6. **Monitor usage**: Enable CloudTrail to monitor role usage

## Troubleshooting

### Common Issues

1. **"Access Denied" errors**: Check that the trust policy allows your repository
2. **ECR push failures**: Ensure the role has `ecr:PutImage` permission
3. **Secrets Manager errors**: Verify the secret ARNs match your actual secrets
4. **EC2 can't pull images**: Ensure the EC2 instance has an IAM role with ECR pull permissions

### Debug Commands

```bash
# Test ECR access
aws ecr get-login-password --region REGION

# Test Secrets Manager access
aws secretsmanager get-secret-value --secret-id dev/examiner --region REGION

# Check role policies
aws iam list-role-policies --role-name GitHubActionsDeployRole
aws iam get-role-policy --role-name GitHubActionsDeployRole --policy-name GitHubActionsDeployPolicy
```
