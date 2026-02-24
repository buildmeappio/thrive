# GitHub Actions Variables & Secrets for Dev Environment

This document lists all required GitHub repository variables and secrets for the `deploy-dev.yml` workflow.

## Repository Variables

Add these in: **Settings → Secrets and variables → Actions → Variables**

### Common Variables (Same for all repositories)

| Variable         | Value                                                       | Description                     |
| ---------------- | ----------------------------------------------------------- | ------------------------------- |
| `AWS_REGION`     | `ca-central-1`                                              | AWS region                      |
| `AWS_ROLE_ARN`   | `arn:aws:iam::564083281173:role/GitHubActionsDevDeployRole` | IAM role ARN for GitHub Actions |
| `ECR_REPOSITORY` | `564083281173.dkr.ecr.ca-central-1.amazonaws.com`           | ECR repository base URL         |

### Repository-Specific Variables

#### examiner-web

| Variable          | Value               | Description                                           |
| ----------------- | ------------------- | ----------------------------------------------------- |
| `CONTAINER_NAME`  | `examiner-web`      | Docker container name                                 |
| `SECRET_NAME_DB`  | `dev-db-connection` | Secrets Manager secret name for database              |
| `SECRET_NAME_ENV` | `dev/examiner`      | Secrets Manager secret name for environment variables |
| `DEPLOY_PATH`     | `~/examiner`        | Deployment path on EC2                                |

#### organization-web

| Variable          | Value               | Description                                           |
| ----------------- | ------------------- | ----------------------------------------------------- |
| `CONTAINER_NAME`  | `organization-web`  | Docker container name                                 |
| `SECRET_NAME_DB`  | `dev-db-connection` | Secrets Manager secret name for database              |
| `SECRET_NAME_ENV` | `dev/organization`  | Secrets Manager secret name for environment variables |
| `DEPLOY_PATH`     | `~/organization`    | Deployment path on EC2                                |

#### admin-web

| Variable          | Value               | Description                                           |
| ----------------- | ------------------- | ----------------------------------------------------- |
| `CONTAINER_NAME`  | `admin-web`         | Docker container name                                 |
| `SECRET_NAME_DB`  | `dev-db-connection` | Secrets Manager secret name for database              |
| `SECRET_NAME_ENV` | `dev/admin`         | Secrets Manager secret name for environment variables |
| `DEPLOY_PATH`     | `~/admin`           | Deployment path on EC2                                |

## Repository Secrets

Add these in: **Settings → Secrets and variables → Actions → Secrets**

### Common Secrets (Same for all repositories)

| Secret        | Description                         |
| ------------- | ----------------------------------- |
| `EC2_HOST`    | EC2 instance hostname or IP address |
| `EC2_USER`    | SSH username (default: `ubuntu`)    |
| `EC2_SSH_KEY` | Private SSH key for EC2 access      |

### Application-Specific Secrets

These may vary per application. Add the following if your workflow uses them:

| Secret                                  | Description                   |
| --------------------------------------- | ----------------------------- |
| `NEXT_PUBLIC_APP_URL`                   | Public URL of the application |
| `NEXT_PUBLIC_CDN_URL`                   | CDN URL for static assets     |
| `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`     | Google Places API key         |
| `NEXT_PUBLIC_CLAIMANT_AVAILABILITY_URL` | Claimant availability API URL |

## Quick Setup Commands

### For examiner-web repository:

```bash
# Variables
gh variable set AWS_REGION --body "ca-central-1" --repo thrive-org/examiner-web
gh variable set AWS_ROLE_ARN --body "arn:aws:iam::564083281173:role/GitHubActionsDevDeployRole" --repo thrive-org/examiner-web
gh variable set ECR_REPOSITORY --body "564083281173.dkr.ecr.ca-central-1.amazonaws.com" --repo thrive-org/examiner-web
gh variable set CONTAINER_NAME --body "examiner-web" --repo thrive-org/examiner-web
gh variable set SECRET_NAME_DB --body "dev-db-connection" --repo thrive-org/examiner-web
gh variable set SECRET_NAME_ENV --body "dev/examiner" --repo thrive-org/examiner-web
gh variable set DEPLOY_PATH --body "~/examiner" --repo thrive-org/examiner-web

# Secrets (replace with actual values)
gh secret set EC2_HOST --body "your-ec2-host" --repo thrive-org/examiner-web
gh secret set EC2_USER --body "ubuntu" --repo thrive-org/examiner-web
gh secret set EC2_SSH_KEY --body "$(cat ~/.ssh/your-key)" --repo thrive-org/examiner-web
```

### For organization-web repository:

```bash
# Variables
gh variable set AWS_REGION --body "ca-central-1" --repo thrive-org/organization-web
gh variable set AWS_ROLE_ARN --body "arn:aws:iam::564083281173:role/GitHubActionsDevDeployRole" --repo thrive-org/organization-web
gh variable set ECR_REPOSITORY --body "564083281173.dkr.ecr.ca-central-1.amazonaws.com" --repo thrive-org/organization-web
gh variable set CONTAINER_NAME --body "organization-web" --repo thrive-org/organization-web
gh variable set SECRET_NAME_DB --body "dev-db-connection" --repo thrive-org/organization-web
gh variable set SECRET_NAME_ENV --body "dev/organization" --repo thrive-org/organization-web
gh variable set DEPLOY_PATH --body "~/organization" --repo thrive-org/organization-web
```

### For admin-web repository:

```bash
# Variables
gh variable set AWS_REGION --body "ca-central-1" --repo thrive-org/admin-web
gh variable set AWS_ROLE_ARN --body "arn:aws:iam::564083281173:role/GitHubActionsDevDeployRole" --repo thrive-org/admin-web
gh variable set ECR_REPOSITORY --body "564083281173.dkr.ecr.ca-central-1.amazonaws.com" --repo thrive-org/admin-web
gh variable set CONTAINER_NAME --body "admin-web" --repo thrive-org/admin-web
gh variable set SECRET_NAME_DB --body "dev-db-connection" --repo thrive-org/admin-web
gh variable set SECRET_NAME_ENV --body "dev/admin" --repo thrive-org/admin-web
gh variable set DEPLOY_PATH --body "~/admin" --repo thrive-org/admin-web
```

## Verification

After setting up variables and secrets, verify the workflow can access them by checking the workflow logs. The workflow should:

1. ✅ Successfully assume the IAM role
2. ✅ Login to ECR
3. ✅ Build and push Docker images
4. ✅ Read secrets from Secrets Manager
5. ✅ SSH to EC2 and deploy

## Notes

- All three repositories share the same `AWS_ROLE_ARN` (GitHubActionsDevDeployRole)
- The IAM role has permissions for all three ECR repositories: `dev/examiner`, `dev/organization`, `dev/admin`
- The EC2 instance uses the `EC2DevDeployRole` which has pull permissions for all three repositories
- Each application deploys to its own directory on the EC2 instance (`~/examiner`, `~/organization`, `~/admin`)
