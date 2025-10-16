# Fix 403 Forbidden Error on Server

## 🔴 Issue: Server Actions Blocked with 403 Error

**Error Message:**
```
Failed to load resource: the server responded with a status of 403
An unexpected response was received from the server.
```

---

## ✅ Changes Already Applied

### 1. **Updated Middleware** (`src/middleware.ts`)
- Removed overly broad matcher pattern
- Now only matches `/dashboard/:path*`
- Register page is no longer blocked by middleware

### 2. **Updated Next.js Config** (`next.config.ts`)
- Added server actions configuration
- Set `allowedOrigins: ["*"]` to allow all origins
- Increased `bodySizeLimit` to `10mb` for file uploads
- Added security headers

### 3. **Improved Error Handling**
- Server actions now catch and return errors properly
- Better error logging in console

---

## 🚀 Deploy These Changes

**After deploying, the 403 error should be resolved.**

If you're still getting 403, follow these additional steps:

---

## 🔍 Additional Troubleshooting

### Step 1: Check Your Hosting Platform Settings

#### If using **Vercel:**

1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add this variable:
   ```
   NEXTAUTH_URL=https://yourdomain.com/examiner
   ```

4. Check **Deployment Protection**:
   - Settings → Deployment Protection
   - Ensure it's not blocking API routes
   - Whitelist your domain if needed

5. Check **Security** settings:
   - Ensure no IP restrictions
   - Check firewall rules

#### If using **AWS/EC2/Other:**

1. Check security groups
2. Verify port 3000 (or your port) is open
3. Check nginx/reverse proxy configuration

---

### Step 2: Create a `vercel.json` (if using Vercel)

Create this file at the root of your project:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/examiner/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "X-Requested-With, Content-Type, Authorization"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/examiner/:path*",
      "destination": "/examiner/:path*"
    }
  ]
}
```

---

### Step 3: Check Environment-Specific Issues

#### Compare URLs:
- Local: `http://localhost:3000/examiner/register`
- Production: `https://yourdomain.com/examiner/register`

#### Verify the server URL is correct:
1. Open browser console
2. Check the Network tab
3. Find the failed request
4. Verify the URL includes `/examiner` base path

---

### Step 4: Server Action Specific Fixes

#### Option A: Add explicit allowed origins in production

Update `next.config.ts`:

```typescript
experimental: {
  serverActions: {
    allowedOrigins: [
      "yourdomain.com",
      "*.yourdomain.com",
      "localhost:3000"
    ],
    bodySizeLimit: "10mb",
  },
}
```

#### Option B: Check for WAF (Web Application Firewall)

If your hosting has a WAF:
- Whitelist Next.js server action endpoints
- Check for rate limiting
- Verify POST requests are allowed

---

### Step 5: Debugging Steps

#### 1. Test with minimal payload:

Update `SubmitConfirmation.tsx` temporarily:

```tsx
const handleSubmit = async () => {
  console.log("Submitting with minimal data...");
  
  try {
    // Test with minimal data first
    const testPayload = {
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      phone: "+1 (123) 456-7890",
      provinceOfResidence: "Ontario",
      mailingAddress: "123 Test St",
      specialties: ["Orthopedic Surgery"],
      licenseNumber: "TEST123",
      provinceOfLicensure: "Ontario",
      medicalLicenseDocumentId: "test-id",
      resumeDocumentId: "test-id",
      languagesSpoken: ["en"],
      yearsOfIMEExperience: "5",
      forensicAssessmentTrained: true,
      agreeTermsConditions: true,
      consentBackgroundVerification: true,
    };
    
    const result = await authActions.createMedicalExaminer(testPayload as any);
    console.log("Result:", result);
  } catch (error) {
    console.error("Test error:", error);
  }
};
```

#### 2. Check browser console for more details:

Open browser DevTools:
1. **Console tab**: Look for detailed error messages
2. **Network tab**: 
   - Filter by "Fetch/XHR"
   - Find the failed request
   - Check:
     - Request Headers
     - Response Headers
     - Request Payload
     - Response (might have more details)

#### 3. Add logging to middleware:

```typescript
export default withAuth(
  function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    console.log("Middleware - Path:", pathname);
    console.log("Middleware - Method:", request.method);
    
    // ... rest of code
  }
);
```

---

## 🎯 Most Likely Cause

Based on the 403 error, the issue is **NOT** in your application code. It's a **deployment/infrastructure** issue:

### Checklist:

- [ ] Middleware was too broad (✅ FIXED)
- [ ] Server actions not configured (✅ FIXED)
- [ ] Missing NEXTAUTH_URL environment variable
- [ ] Hosting platform blocking POST requests
- [ ] WAF/Firewall blocking the request
- [ ] CORS policy on hosting platform
- [ ] Rate limiting triggered
- [ ] IP whitelist/blacklist issue

---

## 📝 Quick Test Commands

After deployment, test these:

```bash
# Test the API endpoint
curl -X POST https://yourdomain.com/examiner/register \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Check if the endpoint is reachable
curl -I https://yourdomain.com/examiner/register
```

---

## 🚨 If Still Getting 403

### Contact your hosting platform support with:

1. **Error details:**
   - "403 Forbidden on POST requests to Next.js server actions"
   - "Works locally but not in production"

2. **Request details:**
   - Method: POST
   - Path: `/examiner/register`
   - Content-Type: application/json

3. **Ask them to check:**
   - WAF rules
   - Security policies
   - CORS configuration
   - Rate limiting
   - IP restrictions

---

## ✅ After Deploying the Fix

1. Clear browser cache
2. Hard refresh (Ctrl + Shift + R / Cmd + Shift + R)
3. Try in incognito/private window
4. Check server logs for any errors
5. Monitor the Network tab in DevTools

The 403 error should now be resolved! 🎉

