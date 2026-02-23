# Database Migrations & Seeders - Deployment Guide

## 📋 Overview

This repository manages Prisma database migrations and seeders for the Thrive Portal across all environments (dev, qa, staging, prod).

**Architecture:** ECS Fargate One-Off Tasks running in private subnets

---

## 🔄 How It Works

### **1. Migrations (`prisma migrate deploy`)**

**What:** Structural database changes (tables, columns, indexes, constraints)  
**When:** Automatically on every push to `dev`/`qa`/`staging`/`main` branches  
**Where:** Runs as ECS Fargate task in private subnet  
**Cost:** ~$0.02-0.05 per deployment

**Workflow:**
```
Push to branch → Build Docker image → Push to ECR → Run ECS migration task → Complete
```

### **2. Seeders (`npm run seed`)**

**What:** Populate database with initial/reference data (roles, types, departments, etc.)  
**When:** See table below  
**Idempotent:** ✅ Yes - tracks which seeders have run via `prismaSeed` table

| Environment | Auto-Run on Push? | Manual Run Available? |
|-------------|-------------------|----------------------|
| **Dev** | ✅ Yes | ✅ Yes (workflow_dispatch) |
| **QA** | ✅ Yes | ✅ Yes (workflow_dispatch) |
| **Staging** | ✅ Yes | ✅ Yes (workflow_dispatch) |
| **Production** | ❌ No | ✅ Yes (workflow_dispatch only) |

---

## 🚀 Automatic Deployment

### **Trigger:** Push to branch

```bash
# Dev environment
git push origin dev

# QA environment
git push origin qa

# Staging environment
git push origin staging

# Production environment (migrations only, no auto-seeders)
git push origin main
```

### **What Happens:**

1. ✅ **Build:** Docker image created with Prisma + migrations + seeders
2. ✅ **Push:** Image pushed to ECR (`dev/prisma-db`, `qa/prisma-db`, etc.)
3. ✅ **Migrate:** ECS task runs `prisma migrate deploy`
4. ✅ **Seed:** (if enabled) ECS task runs `npm run seed`
5. ✅ **Logs:** Available in CloudWatch `/ecs/{env}/migrations`

**Duration:** ~2-4 minutes total

---

## 🎯 Manual Deployment (Workflow Dispatch)

### **Use Cases:**
- Run migrations in production manually
- Run seeders in production for first-time setup
- Re-run seeders in any environment
- Run migrations without modifying code

### **Steps:**

1. Go to GitHub Actions: https://github.com/your-org/prisma-db/actions/workflows/deploy-migrations.yml

2. Click "Run workflow"

3. Select:
   - **Environment:** dev | qa | staging | prod
   - **Run seeders:** true | false

4. Click "Run workflow"

**Screenshot:**
```
┌─────────────────────────────────────┐
│ Run workflow                        │
├─────────────────────────────────────┤
│ Use workflow from: Branch: main  ▼  │
│                                     │
│ Environment: [prod ▼]              │
│ Run seeders: [✓] true              │
│                                     │
│           [Run workflow]            │
└─────────────────────────────────────┘
```

---

## 🛠️ Local Development

### **Run Migrations Locally:**

```bash
cd prisma-db

# Set database URL (get from AWS Secrets Manager or local .env)
export DATABASE_URL="postgresql://user:pass@localhost:5432/thrive"

# Run migrations
npx prisma migrate deploy

# Or use the local Docker setup
npm run docker:up  # Starts local PostgreSQL
npx prisma migrate dev  # Creates and applies migration
```

### **Run Seeders Locally:**

```bash
# Run all seeders (idempotent)
npm run seed

# Or using Prisma CLI
npx prisma db seed
```

### **Create New Migration:**

```bash
# 1. Make changes to prisma/schema.prisma

# 2. Create migration
npx prisma migrate dev --name add_new_field

# 3. Commit and push
git add .
git commit -m "feat: add new field to User model"
git push origin dev
```

---

## 📦 Seeder Details

### **Idempotency Mechanism:**

Seeders track which ones have run using the `prismaSeed` table:

```typescript
// seed.ts
async function hasRunSeed(name: string) {
  const existing = await prisma.prismaSeed.findFirst({
    where: { name },
  });
  return !!existing;
}
```

**This means:**
- ✅ Safe to run multiple times
- ✅ Won't duplicate data
- ✅ Adds only new/missing records
- ✅ Can add new seeders anytime

### **Current Seeders:**

1. `RoleSeeder` - System roles (Admin, Manager, Examiner, etc.)
2. `OrganizationTypeSeeder` - Organization types
3. `DepartmentSeeder` - Departments
4. `AdminSeeder` - Default admin user(s)
5. `CaseTypeSeeder` - Case types
6. `CaseStatusSeeder` - Case statuses
7. `LanguageSeeder` - Supported languages
8. `ExaminationTypeSeeder` - Examination types
9. `ExaminationTypeShortFormSeeder` - Exam type short forms

### **Adding New Seeders:**

```typescript
// 1. Create new seeder in src/seeders/
// src/seeders/myNewThing.seeder.ts
export default class MyNewThingSeeder {
  static name = 'MyNewThingSeeder';
  
  static getInstance(prisma: PrismaClient) {
    return new MyNewThingSeeder(prisma);
  }
  
  constructor(private prisma: PrismaClient) {}
  
  async run() {
    // Your seeding logic
  }
}

// 2. Register in src/seed.ts
import MyNewThingSeeder from './seeders/myNewThing.seeder';

const seeds = [
  // ... existing seeders
  MyNewThingSeeder
];

// 3. Commit and push
git add .
git commit -m "feat: add MyNewThing seeder"
git push origin dev
```

---

## 🔍 Monitoring & Debugging

### **CloudWatch Logs:**

**Migrations:**
```
/ecs/dev/migrations     → Dev environment migrations
/ecs/qa/migrations      → QA environment migrations
/ecs/staging/migrations → Staging environment migrations
/ecs/prod/migrations    → Production environment migrations
```

**View Logs:**
```bash
# AWS CLI
aws logs tail /ecs/dev/migrations --follow

# Or in AWS Console
https://console.aws.amazon.com/cloudwatch/home?region=ca-central-1#logsV2:log-groups
```

### **ECS Task History:**

```bash
# List recent migration tasks
aws ecs list-tasks \
  --cluster dev-cluster \
  --family dev-db-migrations \
  --desired-status STOPPED \
  --max-items 10

# Describe specific task
aws ecs describe-tasks \
  --cluster dev-cluster \
  --tasks <task-arn>
```

### **Common Issues:**

#### **Migration Task Failed (Exit Code 1)**

**Symptom:** Migration task exits with code 1

**Causes:**
- SQL syntax error in migration
- Database constraint violation
- Network connectivity issue

**Solution:**
```bash
# 1. Check CloudWatch logs for specific error
aws logs tail /ecs/dev/migrations --since 10m

# 2. Fix the migration locally
npx prisma migrate dev

# 3. Push fix
git push origin dev
```

#### **Seeder Failed - Duplicate Key Error**

**Symptom:** Seeder fails with unique constraint violation

**Cause:** Seeder not properly checking for existing records

**Solution:**
```typescript
// Update seeder to check existence
async run() {
  const existing = await this.prisma.role.findUnique({
    where: { name: 'Admin' }
  });
  
  if (!existing) {
    await this.prisma.role.create({
      data: { name: 'Admin' }
    });
  }
}
```

#### **Task Takes Too Long / Times Out**

**Symptom:** Task runs for >5 minutes

**Cause:** Large migration or seeder

**Solution:**
```bash
# Increase task timeout in workflow
# .github/workflows/deploy-migrations.yml
aws ecs wait tasks-stopped \
  --cli-read-timeout 600  # Increase from 300 to 600 seconds
```

---

## 🔐 Security

### **Network Isolation:**
- ✅ Tasks run in **private subnets** (no internet access)
- ✅ Database access via **VPC security groups** only
- ✅ Secrets fetched from **AWS Secrets Manager**
- ✅ No bastion host required

### **IAM Permissions:**

**GitHub Actions Role:**
```json
{
  "Effect": "Allow",
  "Action": [
    "ecs:RunTask",
    "ecs:RegisterTaskDefinition",
    "ecs:DescribeTasks",
    "ecs:TagResource",
    "secretsmanager:GetSecretValue"
  ],
  "Resource": "*"
}
```

**ECS Execution Role:**
```json
{
  "Effect": "Allow",
  "Action": [
    "ecr:GetAuthorizationToken",
    "ecr:BatchCheckLayerAvailability",
    "ecr:GetDownloadUrlForLayer",
    "ecr:BatchGetImage",
    "logs:CreateLogStream",
    "logs:PutLogEvents",
    "secretsmanager:GetSecretValue"
  ],
  "Resource": "*"
}
```

---

## 💰 Cost Analysis

| Component | Cost per Deployment | Monthly Cost (20 deployments/month) |
|-----------|---------------------|-------------------------------------|
| ECS Fargate Task (2-3 min) | $0.02-0.05 | $0.40-1.00 |
| ECR Storage (images) | $0.10/GB/month | $0.30-0.50 |
| CloudWatch Logs (100 MB) | $0.50/GB ingested | $0.05 |
| **Total** | **~$0.05** | **~$1.00-2.00** |

**Compared to alternatives:**
- Bastion host (always-on): $7-10/month ❌
- Lambda (same workload): $0.001/deployment ✅ (but 15-min limit)
- RDS Proxy: $0.015/hour = $10.80/month ❌

**Winner:** ECS Fargate tasks = Best balance of cost, security, and flexibility

---

## 📊 Production Checklist

Before running migrations in production:

### **Pre-Deployment:**
- [ ] Test migration in dev environment
- [ ] Test migration in qa environment
- [ ] Test migration in staging environment
- [ ] Review migration SQL (`npx prisma migrate diff`)
- [ ] Backup production database
- [ ] Schedule maintenance window (if needed)
- [ ] Notify team of deployment

### **Deployment:**
- [ ] Merge PR to `main` branch
- [ ] Monitor GitHub Actions workflow
- [ ] Monitor CloudWatch logs
- [ ] Verify migration completion
- [ ] Run smoke tests on production apps

### **Post-Deployment:**
- [ ] Verify data integrity
- [ ] Check application health endpoints
- [ ] Monitor error rates in CloudWatch
- [ ] Document any issues
- [ ] Update team on completion

### **Rollback Plan:**

If migration fails:

```bash
# 1. Restore database from backup
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier prod-postgres \
  --target-db-instance-identifier prod-postgres-restored \
  --restore-time 2024-01-15T10:00:00Z

# 2. Revert code changes
git revert <commit-hash>
git push origin main

# 3. Re-deploy applications
# (Applications will connect to restored DB)
```

---

## 🤝 Support

**Issues:** https://github.com/your-org/prisma-db/issues  
**Slack:** #dev-database-migrations  
**On-call:** DevOps team

---

## 📚 Additional Resources

- [Prisma Migrate Documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [AWS ECS Fargate Pricing](https://aws.amazon.com/fargate/pricing/)
- [VPC Endpoints for Cost Optimization](https://aws.amazon.com/vpc/pricing/)

