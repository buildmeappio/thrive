# Quick Start - Database Migrations & Seeders

## 🎯 TL;DR

**Automatic:** Push to `dev`/`qa`/`staging`/`main` → Migrations run automatically  
**Manual:** Use GitHub Actions "Run workflow" button for production seeders

---

## 📦 What Does This Do?

✅ Runs Prisma migrations automatically when you push to environment branches  
✅ Runs seeders for dev/qa/staging (optional for production)  
✅ Uses ECS Fargate tasks (secure, cost-effective)  
✅ Logs everything to CloudWatch

---

## 🚀 Common Tasks

### **Run Migrations in Dev**
```bash
git push origin dev
```
Done! Check logs: https://console.aws.amazon.com/cloudwatch/home?region=ca-central-1#logsV2:log-groups/log-group/%2Fecs%2Fdev%2Fmigrations

### **Run Migrations in Production**
```bash
git push origin main
```
Migrations run automatically. Seeders require manual approval.

### **Run Seeders in Production (Manual)**
1. Go to: https://github.com/your-org/prisma-db/actions/workflows/deploy-migrations.yml
2. Click "Run workflow"
3. Select: Environment = `prod`, Run seeders = `true`
4. Click "Run workflow"

### **Create New Migration Locally**
```bash
# 1. Edit prisma/schema.prisma
# 2. Create migration
npx prisma migrate dev --name add_new_field

# 3. Push
git add .
git commit -m "feat: add new field"
git push origin dev
```

### **Add New Seeder**
```typescript
// 1. Create src/seeders/myThing.seeder.ts
export default class MyThingSeeder {
  static name = 'MyThingSeeder';
  static getInstance(prisma: PrismaClient) {
    return new MyThingSeeder(prisma);
  }
  constructor(private prisma: PrismaClient) {}
  async run() {
    // Your logic
  }
}

// 2. Register in src/seed.ts
import MyThingSeeder from './seeders/myThing.seeder';
const seeds = [..., MyThingSeeder];

// 3. Push
git add .
git commit -m "feat: add MyThing seeder"
git push origin dev
```

---

## 🔍 Monitoring

### **View Logs:**
```bash
# AWS CLI
aws logs tail /ecs/dev/migrations --follow

# Or web console
https://console.aws.amazon.com/cloudwatch/
→ Log groups
→ /ecs/{environment}/migrations
```

### **Check Recent Tasks:**
```bash
aws ecs list-tasks \
  --cluster dev-cluster \
  --family dev-db-migrations \
  --max-items 5
```

---

## ⚠️ Troubleshooting

### **Migration Failed**
1. Check CloudWatch logs
2. Fix migration locally: `npx prisma migrate dev`
3. Push fix: `git push origin dev`

### **Seeder Failed with "Duplicate Key"**
Your seeder isn't checking for existing records:
```typescript
// Add this check
const existing = await prisma.thing.findUnique({ where: { id } });
if (!existing) {
  await prisma.thing.create({ data });
}
```

### **Task Takes Too Long**
Normal! Large migrations can take 3-5 minutes. Check logs for progress.

---

## 📊 Cost

**Per deployment:** ~$0.02-0.05  
**Monthly (20 deployments):** ~$1-2

---

## 🔗 Resources

- Full documentation: `README-DEPLOYMENT.md`
- Architecture analysis: `/MIGRATION_STRATEGY_SUMMARY.md` (in root)
- Prisma docs: https://www.prisma.io/docs/concepts/components/prisma-migrate

---

## ✅ Next Steps After Setup

1. ✅ Apply IAM fixes: `terraform apply -target=module.github_actions`
2. ✅ Create ECR repos: `./iac/scripts/create-ecr-repos.sh dev`
3. ✅ Test: `git push origin dev`
4. ✅ Monitor: Check CloudWatch logs
5. ✅ Deploy apps: Apps connect to migrated database

**Need help?** Check `README-DEPLOYMENT.md` or ask in #dev-database

