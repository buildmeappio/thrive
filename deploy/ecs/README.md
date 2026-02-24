# ECS Deployment (Future)

This folder contains templates and documentation for future ECS Fargate deployment.

## Current State

- **Lightsail/EC2**: PM2-based deployment (no Docker) - see `deploy/scripts/`
- **Future ECS**: Docker images are built from `apps/*/Dockerfile` (monorepo-aware)

## Migration Path

1. Build Docker images from monorepo root (see `apps/*/Dockerfile`)
2. Push to ECR
3. Create ECS task definitions (use `task-definition.json` as template)
4. Configure ALB with path-based routing: `/admin` -> admin task, `/examiner` -> examiner task, `/organization` -> organization task
5. Update GitHub Actions to build/push images and update ECS services

## Task Definition Template

The `task-definition.json` is a template. Replace placeholders:

- `{{ECR_REPO}}`: ECR repository URL
- `{{IMAGE_TAG}}`: Image tag (e.g. `main-abc123`)
- `{{TASK_NAME}}`: thrive-admin, thrive-examiner, or thrive-organization
- `{{CONTAINER_PORT}}`: 3000, 3001, or 3002

## Required IAM

- ECS task execution role: ECR pull, Secrets Manager, CloudWatch Logs
- ECS task role: Any app-specific AWS access (S3, etc.)
