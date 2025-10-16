# Server Error Diagnostic Checklist

## Issue: "An unexpected response was received from the server"

This error occurs when the server throws an exception that isn't being caught properly. Follow this checklist to diagnose the issue.

---

## ✅ 1. Check Server Logs

**Where to look:**
- Vercel/hosting platform logs
- Server console output
- Error tracking service (Sentry, LogRocket, etc.)

**What to look for:**
- The actual error message before "An unexpected response was received"
- Stack traces
- Database connection errors
- Missing environment variables

---

## ✅ 2. Environment Variables

Ensure all required environment variables are set on the server:

### Required Variables:
```env
# Database
DATABASE_URL=

# NextAuth
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# AWS S3 (for file uploads)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET_NAME=

# Email Service
EMAIL_SERVICE_API_KEY=
EMAIL_FROM=

# JWT
JWT_SECRET=
```

**How to check:**
- Go to your hosting platform dashboard
- Navigate to Environment Variables section
- Verify all variables are set and match your local `.env` file

---

## ✅ 3. Database Connection

**Common issues:**
- Database URL is incorrect
- Database is not accessible from server (IP whitelist)
- Connection pool exhausted
- SSL/TLS certificate issues

**How to verify:**
```bash
# Run Prisma Studio on server (if possible)
npx prisma studio

# Or check database migrations
npx prisma migrate status
```

---

## ✅ 4. File Upload Service (S3)

**Common issues:**
- AWS credentials are invalid
- S3 bucket doesn't exist
- S3 bucket permissions are incorrect
- Region mismatch

**How to test:**
- Try uploading a small test file
- Check AWS CloudWatch logs
- Verify IAM permissions

---

## ✅ 5. Email Service

**Common issues:**
- Email service API key is invalid
- Email template files are missing
- Rate limits exceeded

**How to test:**
- Temporarily comment out email sending
- Check if submission works without email

---

## ✅ 6. Prisma Schema & Migrations

**Ensure:**
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

**Check for:**
- Schema changes that haven't been migrated
- Missing fields in database
- Type mismatches

---

## ✅ 7. Server Action Serialization

**Common issues:**
- Returning non-serializable data (File objects, Functions, etc.)
- Circular references
- Large data payloads

**Solution:**
- Ensure all data returned from server actions is JSON-serializable
- Use `.toJSON()` for complex objects
- Limit data size

---

## ✅ 8. Phone Number Validation

Since we updated phone number format to include "+1":

**Check:**
- Database stores phone numbers correctly
- Validation schema handles the "+1" prefix
- Phone number field length is sufficient (VARCHAR length)

---

## ✅ 9. CORS & CSP Issues

**If using external services:**
- Check Content Security Policy headers
- Verify CORS configuration
- Whitelist required domains

---

## ✅ 10. Build & Deployment

**Verify:**
```bash
# Clean build
rm -rf .next
npm run build

# Check for build errors
# Ensure all TypeScript errors are resolved
```

---

## 🔍 Quick Debug Steps

### Step 1: Add More Logging
The actions now have better error logging. Check your server logs for:
```
Error in createMedicalExaminer action: [error details]
```

### Step 2: Test Individual Components
1. Test file upload separately
2. Test database connection
3. Test email service
4. Test without documents

### Step 3: Compare Environments
- Check Node.js version (local vs server)
- Check npm/package versions
- Compare environment variables

### Step 4: Simplify Payload
Try submitting with minimal data to isolate the issue.

---

## 🐛 Common Server-Only Errors

### 1. Missing Payout Fields
If you haven't run the migration:
```bash
npx prisma migrate deploy
```

### 2. File Upload Timeout
Increase timeout limits on your hosting platform.

### 3. Memory Limits
Large file uploads might exceed memory limits.

### 4. Cold Start Issues
Serverless functions might timeout on cold starts.

---

## 📝 Next Steps

1. Check your server logs for the actual error
2. Copy the full error message
3. Check which specific field or operation is failing
4. Verify that field exists in your database schema
5. Ensure the migration was run on production

---

## 🚀 After Deploying the Fix

The updated server actions will now:
- ✅ Catch all errors properly
- ✅ Return error messages instead of throwing
- ✅ Log detailed error information
- ✅ Prevent "unexpected response" errors

You should now see the actual error message in the UI instead of the generic message.

