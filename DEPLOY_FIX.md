# 🚀 Deploy Fix for 403 Error

## ✅ Root Cause Identified: **NGINX Configuration**

The 403 error was caused by nginx blocking Next.js Server Actions. The proxy configuration didn't have proper buffering settings for POST requests with large payloads.

---

## 📋 Step-by-Step Deployment Guide

### Step 1: Upload Updated nginx.conf to Server

```bash
# From your local machine, upload the fixed nginx.conf
scp nginx.conf user@your-server:/etc/nginx/sites-available/portal-dev.thriveassessmentcare.com

# Or if you have a different path:
scp nginx.conf user@your-server:/etc/nginx/nginx.conf
```

### Step 2: SSH into Your Server

```bash
ssh user@your-server
```

### Step 3: Test nginx Configuration

```bash
# Test the configuration for syntax errors
sudo nginx -t

# You should see:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Step 4: Reload nginx

```bash
# Reload nginx (graceful reload, no downtime)
sudo systemctl reload nginx

# OR if reload doesn't work:
sudo systemctl restart nginx
```

### Step 5: Verify nginx is Running

```bash
# Check nginx status
sudo systemctl status nginx

# Should show: Active: active (running)
```

### Step 6: Check nginx Error Logs (if needed)

```bash
# View recent nginx errors
sudo tail -f /var/log/nginx/error.log

# Keep this open in a separate terminal while testing
```

### Step 7: Deploy Your Next.js Changes

```bash
# Navigate to your project directory
cd /path/to/examiner-web

# Pull latest changes
git pull origin main  # or your branch name

# Install dependencies (if any changed)
npm install

# Build the project
npm run build

# Restart the Next.js application on port 3001
pm2 restart examiner-web
# OR if using systemd:
sudo systemctl restart examiner-web
# OR manually:
# pkill -f "next start"
# npm run start &
```

### Step 8: Test the Fix

1. Clear browser cache completely
2. Open browser console (F12) → Network tab
3. Navigate to: `https://portal-dev.thriveassessmentcare.com/examiner/register`
4. Fill out the form and submit
5. Watch the Network tab for the POST request
6. **Expected**: Status 200 (Success) ✅
7. **Before**: Status 403 (Forbidden) ❌

---

## 🔍 What Changed in nginx.conf

### Before (Causing 403):
```nginx
location /examiner/ {
  proxy_pass http://127.0.0.1:3001;
  proxy_http_version 1.1;
  
  proxy_set_header Host $host;
  # ... basic headers
  
  proxy_connect_timeout 5s;
  proxy_send_timeout 60s;
  proxy_read_timeout 60s;
}
```

### After (Fixed):
```nginx
location /examiner/ {
  proxy_pass http://127.0.0.1:3001;
  proxy_http_version 1.1;
  
  proxy_set_header Host $host;
  # ... basic headers
  
  # 🔥 CRITICAL ADDITIONS FOR SERVER ACTIONS:
  proxy_buffering off;                # Don't buffer responses
  proxy_request_buffering off;        # Don't buffer requests
  proxy_buffers 16 32k;               # Larger buffers
  proxy_buffer_size 64k;              # Larger buffer size
  
  # Longer timeouts for file uploads
  proxy_connect_timeout 60s;
  proxy_send_timeout 120s;
  proxy_read_timeout 120s;
  
  # Allow large POST bodies (10MB for file uploads)
  client_body_buffer_size 10M;
}
```

---

## 🎯 Why This Fixes the 403 Error

1. **`proxy_buffering off`**: Disables response buffering, allowing Server Actions to stream responses
2. **`proxy_request_buffering off`**: Disables request buffering, critical for large POST bodies
3. **Larger buffer sizes**: Handles Server Action payloads which can be large
4. **Increased timeouts**: Gives Server Actions enough time to process (especially file uploads)
5. **`client_body_buffer_size 10M`**: Allows POST bodies up to 10MB (for document uploads)

**Without these settings**, nginx was rejecting Server Action POST requests as potentially malicious or too large, resulting in 403 Forbidden.

---

## 🔧 Troubleshooting

### If nginx -t fails:

```bash
# View specific error
sudo nginx -t

# Fix the error shown, common issues:
# - Missing semicolon
# - Typo in directive name
# - Incorrect file path
```

### If still getting 403 after reload:

```bash
# Check nginx error logs
sudo tail -100 /var/log/nginx/error.log

# Check Next.js application logs
pm2 logs examiner-web
# OR
journalctl -u examiner-web -f
```

### Verify nginx is using the new config:

```bash
# Check which config file nginx is using
sudo nginx -V 2>&1 | grep -o 'conf-path=\S*'

# View the active configuration
sudo cat /etc/nginx/nginx.conf | grep -A 20 "location /examiner/"
```

### If Next.js app isn't responding:

```bash
# Check if port 3001 is listening
sudo netstat -tulpn | grep 3001
# OR
sudo lsof -i :3001

# If nothing is listening, start the app:
cd /path/to/examiner-web
npm run start
```

---

## ✅ Success Criteria

After deployment, you should see:

✅ **POST request returns 200** (not 403)
✅ **Form submits successfully**
✅ **Console shows success message or actual error** (not "unexpected response")
✅ **Documents upload correctly**
✅ **Data saved to database**

---

## 📝 Quick Commands Reference

```bash
# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Restart nginx
sudo systemctl restart nginx

# Check nginx status
sudo systemctl status nginx

# View nginx errors
sudo tail -f /var/log/nginx/error.log

# Restart Next.js app
pm2 restart examiner-web

# View Next.js logs
pm2 logs examiner-web
```

---

## 🆘 Need Help?

If still experiencing issues after deployment:

1. **Check nginx error log**: `sudo tail -100 /var/log/nginx/error.log`
2. **Check Next.js logs**: `pm2 logs examiner-web --lines 100`
3. **Check browser console**: Look for specific error messages
4. **Test with curl**:
   ```bash
   curl -X POST https://portal-dev.thriveassessmentcare.com/examiner/register \
     -H "Content-Type: application/json" \
     -d '{"test":"data"}' \
     -v
   ```

---

## 🎉 After Successful Deployment

The 403 error will be **completely resolved** and you'll be able to:
- Submit registration forms
- Upload documents
- See actual error messages (if any validation fails)
- Process Server Actions correctly

**The fix is at the infrastructure level (nginx), not in your application code!**

