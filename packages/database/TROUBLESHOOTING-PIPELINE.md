# Pipeline Troubleshooting Guide

## Issue: "Can't reach database server" Error

### Error Message
```
Error: P1001: Can't reach database server at `dev-postgres.c1gaougw46sm.ca-central-1.rds.amazonaws.com:5432`
```

### Root Cause
The EC2 instance (bastion) used in the GitHub Actions workflow cannot reach the RDS database instance. This is typically a **network/security group configuration issue**.

---

## Solution Steps

### 1. Verify Security Group Configuration

**RDS Security Group** must allow inbound connections from the **EC2 Security Group**:

1. Go to AWS Console → RDS → Your database instance
2. Click on the **Security** tab
3. Note the **VPC security groups** (usually one main security group)
4. Click on the security group name
5. Go to **Inbound rules** tab
6. **Add/Edit rule:**
   - **Type:** PostgreSQL (or Custom TCP)
   - **Port:** 5432
   - **Source:** Select the EC2 instance's security group (not an IP address)
   - **Description:** "Allow from EC2 bastion for migrations"

**Example:**
```
Type: PostgreSQL
Protocol: TCP
Port: 5432
Source: sg-xxxxxxxxx (EC2 bastion security group)
```

### 2. Verify Network Configuration

**Check VPC Configuration:**
- EC2 instance and RDS must be in the **same VPC** (or have VPC peering configured)
- If in different VPCs, set up VPC peering or use a different approach

**Check Subnet Configuration:**
- EC2 instance should be able to route to RDS subnet
- Check route tables for both subnets

**Check Network ACLs:**
- Network ACLs should allow traffic on port 5432 between EC2 and RDS subnets

### 3. Test Connectivity from EC2 Instance

SSH into your EC2 instance and test connectivity:

```bash
# Test DNS resolution
nslookup dev-postgres.c1gaougw46sm.ca-central-1.rds.amazonaws.com

# Test TCP connection (if netcat is installed)
nc -zv dev-postgres.c1gaougw46sm.ca-central-1.rds.amazonaws.com 5432

# Or use telnet
telnet dev-postgres.c1gaougw46sm.ca-central-1.rds.amazonaws.com 5432
```

### 4. Verify EC2 Instance Details

**Get EC2 Security Group ID:**
```bash
# From EC2 instance
curl -s http://169.254.169.254/latest/meta-data/security-groups
```

**Get EC2 VPC and Subnet:**
```bash
# From EC2 instance
curl -s http://169.254.169.254/latest/meta-data/network/interfaces/macs/
# Then use the MAC to get VPC and subnet details
```

### 5. Alternative: Use RDS Proxy or Direct Connection

If the EC2 instance cannot be configured to reach RDS directly, consider:

**Option A: Use AWS Systems Manager Session Manager**
- Create an SSM session to the EC2 instance
- Run migrations through the session (which has VPC access)

**Option B: Use ECS Fargate Tasks (Recommended)**
- Deploy migrations as ECS tasks in the same VPC as RDS
- Tasks run in private subnets with direct RDS access
- See `README-DEPLOYMENT.md` for details

**Option C: Use RDS Proxy**
- Set up RDS Proxy in the same VPC
- Connect through the proxy endpoint
- Proxy handles connection pooling and security

---

## Quick Fix Checklist

- [ ] RDS security group allows inbound from EC2 security group on port 5432
- [ ] EC2 and RDS are in the same VPC
- [ ] Network ACLs allow traffic between subnets
- [ ] Route tables are configured correctly
- [ ] Tested connectivity from EC2 instance manually
- [ ] Verified DATABASE_URL secret is correct
- [ ] EC2 instance has internet access (if needed for npm install)

---

## AWS CLI Commands for Verification

```bash
# Get RDS security group
aws rds describe-db-instances \
  --db-instance-identifier dev-postgres \
  --query 'DBInstances[0].VpcSecurityGroups[*].VpcSecurityGroupId' \
  --output text

# Get EC2 security group
aws ec2 describe-instances \
  --instance-ids i-xxxxxxxxx \
  --query 'Reservations[0].Instances[0].SecurityGroups[*].GroupId' \
  --output text

# Check security group rules
aws ec2 describe-security-groups \
  --group-ids sg-xxxxxxxxx \
  --query 'SecurityGroups[0].IpPermissions'

# Add rule to RDS security group (example)
aws ec2 authorize-security-group-ingress \
  --group-id sg-rds-security-group-id \
  --protocol tcp \
  --port 5432 \
  --source-group sg-ec2-security-group-id
```

---

## Common Issues

### Issue: "Connection timeout"
**Cause:** Security group blocking or wrong VPC
**Fix:** Verify security group rules and VPC configuration

### Issue: "DNS resolution failed"
**Cause:** EC2 instance cannot resolve RDS endpoint
**Fix:** Check VPC DNS settings and route tables

### Issue: "Connection refused"
**Cause:** RDS is not accepting connections (wrong port or RDS is down)
**Fix:** Verify RDS is running and port is correct (5432 for PostgreSQL)

---

## Need Help?

1. Check CloudWatch logs for detailed error messages
2. Review security group rules in AWS Console
3. Test connectivity manually from EC2 instance
4. Contact DevOps team with:
   - EC2 instance ID
   - RDS instance identifier
   - Security group IDs
   - VPC IDs
