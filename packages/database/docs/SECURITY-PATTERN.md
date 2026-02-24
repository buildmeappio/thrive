# Security Pattern: Database Migration Pipeline

## 🔐 Security Architecture

### **Principle: Least Privilege + Separation of Concerns**

---

## ✅ **Questions Answered**

### **Q1: Does GitHub Actions Role Have Access to Secrets?**

**Answer: NO** ❌ (and that's CORRECT!)

**Why?**

- GitHub Actions = **Orchestration** (doesn't need secrets)
- ECS Tasks = **Runtime** (gets secrets when needed)
- Following **principle of least privilege**

---

### **Q2: Should We Construct Connection String or Use Secrets Manager?**

**Answer: Use Secrets Manager** ✅ (ALWAYS!)

**Why?**

- ✅ Single source of truth
- ✅ Audit trail (CloudTrail)
- ✅ Easy rotation
- ✅ Encrypted at rest (KMS)
- ✅ Never exposed in logs
- ✅ Dynamic resolution

---

## 🏗️ **Architecture: Three-Layer Security Model**

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1: GitHub Actions (Orchestration)                │
│                                                         │
│ Permissions:                                            │
│   ✅ ECR (push/pull images)                            │
│   ✅ ECS (register tasks, update services)             │
│   ✅ IAM PassRole (pass roles to ECS)                  │
│   ❌ Secrets Manager (NONE)                            │
│   ❌ IAM Get* (NONE - constructs ARNs directly)       │
│                                                         │
│ What it does:                                           │
│   • Builds Docker image                                 │
│   • Pushes to ECR                                       │
│   • Registers ECS task definition                       │
│   • References secret ARN (doesn't access secret)       │
│   • Starts ECS task                                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 2: ECS Execution Role (Bootstrap)                │
│                                                         │
│ Permissions:                                            │
│   ✅ secretsmanager:GetSecretValue (specific secrets) │
│   ✅ ECR (pull images)                                 │
│   ✅ CloudWatch Logs (create/write)                    │
│                                                         │
│ What it does:                                           │
│   • Fetches DB secret from Secrets Manager              │
│   • Injects as environment variable                     │
│   • Pulls container image from ECR                      │
│   • Starts container with secrets                       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 3: Container (Runtime)                           │
│                                                         │
│ Environment Variables:                                  │
│   DATABASE_URL = postgresql://user:pass@host/db        │
│                                                         │
│ What it does:                                           │
│   • Runs Prisma migrations                              │
│   • Runs seeders                                        │
│   • Exits                                               │
└─────────────────────────────────────────────────────────┘
```

---

## 🔑 **The Wildcard ARN Pattern**

### **Problem:**

AWS Secrets Manager appends random 6-character suffix to secret names:

```
dev-db-connection-ABC123  ← Random suffix
```

To reference this, you need the full ARN:

```
arn:aws:secretsmanager:region:account:secret:dev-db-connection-ABC123
```

But getting this requires `secretsmanager:ListSecrets` permission (we don't want to give this to GitHub Actions).

### **Solution: Wildcard Pattern**

```bash
# Instead of listing secrets:
DB_SECRET_ARN=$(aws secretsmanager list-secrets ...)  # ❌ Requires ListSecrets

# Use wildcard pattern:
DB_SECRET_ARN="arn:aws:secretsmanager:${AWS_REGION}:${ACCOUNT_ID}:secret:${ENV}-db-connection-*"
                                                                                             # ↑ Wildcard
```

**How it works:**

1. GitHub Actions constructs ARN with wildcard
2. Passes ARN to ECS task definition
3. ECS Execution Role resolves wildcard at runtime
4. ECS Execution Role fetches actual secret (it has `GetSecretValue` permission)
5. Container receives secret as environment variable

**Benefits:**

- ✅ No `ListSecrets` permission needed
- ✅ No `IAM GetRole` permission needed
- ✅ Works across all environments
- ✅ Automatic resolution by ECS

---

## 🎯 **IAM Permission Matrix**

| Permission                      | GitHub Actions | ECS Execution | ECS Task     | Container  |
| ------------------------------- | -------------- | ------------- | ------------ | ---------- |
| `ecr:GetAuthorizationToken`     | ✅             | ✅            | ❌           | ❌         |
| `ecr:PutImage`                  | ✅             | ❌            | ❌           | ❌         |
| `ecs:RegisterTaskDefinition`    | ✅             | ❌            | ❌           | ❌         |
| `ecs:RunTask`                   | ✅             | ❌            | ❌           | ❌         |
| `iam:PassRole`                  | ✅             | ❌            | ❌           | ❌         |
| `secretsmanager:GetSecretValue` | ❌             | ✅            | ❌           | ❌         |
| `secretsmanager:ListSecrets`    | ❌             | ❌            | ❌           | ❌         |
| `iam:GetRole`                   | ❌             | ❌            | ❌           | ❌         |
| `logs:CreateLogStream`          | ❌             | ✅            | ❌           | ❌         |
| `s3:*Object`                    | ❌             | ❌            | ✅           | ❌         |
| **DATABASE_URL**                | **❌ Never**   | **❌ Never**  | **❌ Never** | **✅ Yes** |

---

## 🛡️ **Security Best Practices Implemented**

### **1. Least Privilege Principle** ✅

Each role has ONLY the permissions it needs:

- GitHub Actions: Orchestration only
- ECS Execution: Bootstrap only
- ECS Task: Runtime app permissions
- Container: Uses secrets, doesn't manage them

### **2. Separation of Concerns** ✅

- **Deploy** ≠ **Runtime**
- GitHub Actions deploys but never accesses secrets
- ECS fetches secrets at runtime

### **3. Defense in Depth** ✅

Multiple layers of security:

- OIDC authentication (no long-lived keys)
- IAM roles with specific permissions
- VPC isolation (private subnets)
- Secrets Manager encryption (KMS)
- CloudTrail audit logging

### **4. No Secrets in Code** ✅

- No hardcoded passwords
- No passwords in environment variables (in workflow)
- No passwords in logs
- Secrets only exist in:
  1. Secrets Manager (encrypted)
  2. Container memory (runtime only)

### **5. Audit Trail** ✅

Every secret access logged:

```bash
# View who accessed secrets
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=ResourceName,AttributeValue=dev-db-connection \
  --region ca-central-1
```

### **6. Easy Rotation** ✅

Rotate password without code changes:

```bash
# Update secret in Secrets Manager
aws secretsmanager update-secret --secret-id dev-db-connection --secret-string "{...}"

# Restart ECS tasks (they'll fetch new password)
aws ecs update-service --cluster dev-cluster --service dev-admin-service --force-new-deployment
```

---

## 🚫 **Anti-Patterns to Avoid**

### **❌ DON'T: Store Passwords in GitHub Secrets**

```yaml
# ❌ BAD
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

**Why?**

- Secrets spread across two systems
- Harder to rotate
- GitHub has access to production passwords
- No CloudTrail audit

### **❌ DON'T: Construct Connection String in Workflow**

```yaml
# ❌ BAD
env:
  DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
run: |
  DATABASE_URL="postgresql://user:${DB_PASSWORD}@host/db"
```

**Why?**

- Password exposed in workflow logs
- Password in GitHub environment
- Violates separation of concerns

### **❌ DON'T: Give GitHub Actions Secret Access**

```hcl
# ❌ BAD
actions = [
  "secretsmanager:GetSecretValue",
  "secretsmanager:ListSecrets"
]
```

**Why?**

- Violates least privilege
- GitHub Actions doesn't need secrets
- Increases attack surface

---

## ✅ **What We Built**

A **zero-trust architecture** where:

1. **GitHub Actions** = Untrusted orchestrator
   - Can start tasks
   - Can't access secrets
   - Can't access database

2. **ECS Execution Role** = Trusted bootstrap
   - Can fetch secrets
   - Only at container startup
   - Logs every access

3. **Container** = Ephemeral runtime
   - Gets secrets via env vars
   - Secrets in memory only
   - Destroyed after migration

**Result:** Maximum security with zero manual steps!

---

## 📊 **Security Comparison**

| Approach                       | Security Score | Complexity | Rotation   |
| ------------------------------ | -------------- | ---------- | ---------- |
| **Secrets Manager + Wildcard** | ⭐⭐⭐⭐⭐     | Low        | Easy       |
| GitHub Secrets                 | ⭐⭐⭐         | Low        | Hard       |
| Hardcoded passwords            | ⭐             | Very Low   | Impossible |
| Environment files              | ⭐⭐           | Low        | Hard       |

---

## 🎓 **Key Takeaways**

1. ✅ **Never give CI/CD access to secrets** (unless absolutely necessary)
2. ✅ **Use Secrets Manager as single source of truth**
3. ✅ **Wildcard ARNs avoid permission sprawl**
4. ✅ **Separation of concerns = better security**
5. ✅ **Audit everything via CloudTrail**

---

## 📚 **References**

- [AWS Secrets Manager Best Practices](https://docs.aws.amazon.com/secretsmanager/latest/userguide/best-practices.html)
- [ECS Task IAM Roles](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html)
- [GitHub OIDC with AWS](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
- [Principle of Least Privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege)

---

**This is production-grade security architecture!** 🔒
