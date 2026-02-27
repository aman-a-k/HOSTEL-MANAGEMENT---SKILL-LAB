# Vercel Deployment Guide

## Architecture Overview

Your application has two parts that deploy separately:

```
┌─────────────────────────┐
│   Vercel Frontend       │
│  (React built to HTML)  │
│   yourdomain.com        │
└───────────┬─────────────┘
            │ API calls
            ▼
┌─────────────────────────┐
│  Backend API Server     │
│  (Express.js)           │
│  (Railway/Heroku/AWS)   │
│  api.yourdomain.com     │
│  or yourdomain.com/api  │
└─────────────────────────┘
```

---

## Option 1: Frontend on Vercel + Backend on Railway (Recommended)

### Step 1: Deploy Frontend to Vercel

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub account

2. **Connect Repository**
   - Click "New Project"
   - Select your `hostel-management` repository
   - Click "Import"

3. **Configure Build Settings**
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
   - Click "Deploy"

4. **Set Environment Variables**
   - Go to **Settings** → **Environment Variables**
   - Add: `VITE_API_URL=https://your-backend-url.com`
     - Replace with your actual backend URL
   - Save and redeploy

5. **Done!**
   - Your frontend is live at: `https://your-project.vercel.app`

### Step 2: Deploy Backend to Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub account

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `hostel-management` repository
   - Click "Deploy"

3. **Configure Environment Variables**
   - In Railway dashboard, go to **Variables**
   - Add the following:
     ```
     NODE_ENV=production
     PORT=3000
     MONGODB_URI=your-mongodb-atlas-url
     JWT_SECRET=your-secure-random-key
     FRONTEND_URL=https://your-project.vercel.app
     ```

4. **Add MongoDB**
   - Click "Add Services"
   - Select "MongoDB"
   - Railway will auto-populate `MONGODB_URI`
   - Click "Add"

5. **Custom Domain (Optional)**
   - In Settings, add custom domain
   - Point to your domain registrar

6. **Done!**
   - Your backend is live at: `https://your-railway-app.up.railway.app`

### Step 3: Connect Them

1. **Update Vercel Environment**
   - Go back to Vercel project
   - Settings → Environment Variables
   - Update `VITE_API_URL` to: `https://your-railway-app.up.railway.app`
   - Redeploy

2. **Test Connection**
   - Open your Vercel app
   - Try logging in with demo credentials
   - Should work seamlessly

---

## Option 2: Same Domain Deployment (Backend hosts everything)

If you deploy backend to Heroku, AWS, or Railway as main domain:

### Step 1: Build Frontend
```bash
npm run build
```

### Step 2: Backend serves React
The `server.js` already does this! It:
- Serves React build files from `/dist`
- Routes all API requests
- Falls back to index.html for SPA routing

### Step 3: Deploy Entire App to Railway/Heroku

**Railway:**
```bash
# Railway automatically detects and runs your app
# Make sure package.json has:
"start": "node server.js"

# Just connect GitHub and it works!
```

**Heroku:**
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create hostel-management

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
heroku config:set MONGODB_URI=your-db-uri

# Deploy
git push heroku main

# Open
heroku open
```

---

## Environment Variables Reference

### For Vercel Frontend

```
VITE_API_URL=https://api.yourdomain.com
```

Options:
- `https://api.yourdomain.com` - Separate backend domain
- `https://yourdomain.com` - Same domain backend
- `/` - Same domain with path routing

### For Backend Server

```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/hostelops
JWT_SECRET=your-super-secure-random-key
FRONTEND_URL=https://yourdomain.com
```

---

## Testing Locally Before Deploying

### Test 1: Build Production Bundle
```bash
npm run build
```

### Test 2: Run Server with Production Bundle
```bash
# Kill any running servers
Get-Process node | Stop-Process -Force

# Start server with production build
NODE_ENV=production npm start
```

### Test 3: Access in Browser
```
http://localhost:5000
```

Should work exactly like development!

### Test 4: Check Backend Works
```bash
curl -X GET http://localhost:5000/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Troubleshooting Deployment Issues

### Issue: CORS Error in Vercel

**Error:** `Access to XMLHttpRequest blocked by CORS`

**Solution:**
1. Check `VITE_API_URL` is set in Vercel
2. Check backend CORS allows Vercel domain
3. Verify backend has Vercel URL in allowed origins

**Quick Fix in server.js:**
```javascript
const allowedOrigins = [
  'https://your-project.vercel.app',
  'https://your-project.vercel.app/*',
  // ... other origins
]
```

### Issue: 404 on Route Refresh

**Error:** Page not found when refreshing

**Solution:** Vercel.json is configured to handle this!
- Make sure `vercel.json` exists in root
- Contains rewrite rule to index.html

### Issue: Environment Variables Not Working

**Solution:**
1. In Vercel: Settings → Environment Variables
2. Re-trigger deployment after adding vars
3. Check `VITE_` prefix for frontend vars
4. Rebuild after changes

### Issue: Backend Returns 503

**Solution:**
1. Check Railway/Heroku dyno is awake
2. Check MongoDB connection string
3. View logs in Railway/Heroku dashboard
4. Restart services if needed

---

## Production Security Checklist

Before going live:

- [ ] Change all default passwords
- [ ] Generate strong JWT_SECRET (`openssl rand -base64 32`)
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Set NODE_ENV=production
- [ ] Enable database authentication
- [ ] Setup automatic backups
- [ ] Enable monitoring/logging
- [ ] Restrict database access to app only
- [ ] Use environment variables for all secrets
- [ ] Test with production data

---

## Monitoring & Maintenance

### Vercel Dashboard
- View deployments: **Deployments** tab
- Check build logs: Click deployment
- Monitor usage: **Analytics** tab
- Check errors: **Functions** tab

### Railway Dashboard
- View logs: **Logs** tab
- Monitor resources: **Metrics** tab
- Check environment: **Variables** tab
- Restart service: **Settings** → **Restart**

### Testing Connection
```bash
# Check frontend accessibility
curl https://your-project.vercel.app

# Check backend accessibility
curl https://api.yourdomain.com/stats

# Test with auth
curl https://api.yourdomain.com/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Cost Summary

### Vercel Frontend
- **Free Tier:** 100GB/month bandwidth, 1GB/month storage
- **Pro:** $20/month for more features
- **Cost:** Usually **FREE** for standard projects

### Railway Backend
- **Pay-as-you-go:** $5 credit/month free
- **Typical cost:** $5-20/month for small hostel
- **MongoDB (Railway):** Included in free tier
- **Cost:** Usually **FREE** or very cheap

### Total Monthly Cost
- **Small project:** FREE - $10/month
- **Medium project:** $10-30/month
- **Large project:** $30-100/month

---

## Next Steps

1. **Create accounts**
   - Vercel: vercel.com
   - Railway: railway.app
   - MongoDB Atlas: mongodb.com/atlas (if not using Railway MongoDB)

2. **Deploy frontend**
   - Connect GitHub to Vercel
   - Set environment variables
   - Deploy

3. **Deploy backend**
   - Connect GitHub to Railway
   - Add MongoDB service
   - Set environment variables
   - Deploy

4. **Test everything**
   - Test login
   - Test complaints
   - Test leaves
   - Test announcements

5. **Setup domain** (Optional)
   - Buy domain
   - Point to Vercel and Railway
   - Setup SSL certificates

6. **Monitor**
   - Check logs daily first week
   - Setup alerts for errors
   - Regular backups

---

## Quick Reference

### Vercel Commands
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod

# Check deployments
vercel ls
```

### Railway Commands
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up

# View logs
railway logs
```

---

## Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Railway Docs:** https://railway.app/docs
- **MongoDB Atlas:** https://mongodb.com/docs/atlas
- **Express.js:** https://expressjs.com/en/starter/static-files.html

---

**You're ready to deploy!** 🚀

Choose your platform and follow the steps above. Everything is configured and ready to go.

**Last Updated:** February 2026
