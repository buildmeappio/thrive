# ⚡ QUICK FIX - 403 Error (2 Minutes)

## 🎯 Problem: 403 Forbidden on Form Submit

**Root Cause:** nginx blocking Next.js Server Actions

---

## 🚀 3-Step Fix

### 1️⃣ Upload nginx.conf to Server

```bash
scp nginx.conf user@your-server:/etc/nginx/sites-available/portal-dev
```

### 2️⃣ Test & Reload nginx

```bash
ssh user@your-server
sudo nginx -t && sudo systemctl reload nginx
```

### 3️⃣ Test Form Submission

- Go to: `https://portal-dev.thriveassessmentcare.com/examiner/register`
- Fill form and submit
- ✅ Should work now (no more 403!)

---

## ✅ Verification

Run this on your server:

```bash
curl -X POST https://portal-dev.thriveassessmentcare.com/examiner/register \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}' \
  -w "\nStatus: %{http_code}\n"
```

**Before Fix:** `Status: 403` ❌  
**After Fix:** `Status: 200, 400, or 500` ✅

---

## 🔍 What Changed

Added to `nginx.conf` → `location /examiner/`:

```nginx
proxy_buffering off;
proxy_request_buffering off;
proxy_buffers 16 32k;
proxy_buffer_size 64k;
proxy_connect_timeout 60s;
proxy_send_timeout 120s;
proxy_read_timeout 120s;
client_body_buffer_size 10M;
```

**These settings allow nginx to properly proxy Next.js Server Actions with large POST bodies.**

---

## 📚 More Info

- **Detailed Guide:** `DEPLOY_FIX.md`
- **Full Explanation:** `403_ERROR_SOLUTION.md`
- **Test Script:** `test-server-action.sh`

---

## 🆘 Still Not Working?

```bash
# Check nginx is using new config
sudo nginx -t

# View nginx errors
sudo tail -20 /var/log/nginx/error.log

# Check Next.js is running
sudo lsof -i :3001
```

---

**TL;DR:** Upload `nginx.conf` → `sudo nginx -t` → `sudo systemctl reload nginx` → Done! 🎉

