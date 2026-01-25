# 🆓 AuraPrep Free Deployment Guide (Firebase + Render)

## Cost: $0/month (for <50 users) ✅

This guide deploys AuraPrep completely free using:
- **Firebase Hosting** (10GB/month free - enough for 50+ users)
- **Render** (Free tier backend - perfect for small audiences)
- **MongoDB Atlas** (Free tier - 512MB storage)

## Architecture

```
Frontend (Firebase) → Backend (Render) → Database (MongoDB)
https://auraprep.web.app → https://auraprep-api.onrender.com
```

## Prerequisites

1. Firebase Account (already have it ✅)
2. Render Account - Sign up at https://render.com (free)
3. MongoDB Atlas Account (already have it ✅)
4. Git + GitHub (already set up ✅)

## Phase 1: Deploy Frontend to Firebase Hosting

### Step 1.1: Build Frontend

```bash
cd "C:\Users\Wootton High School\AuraPrep"
npm run build
```

### Step 1.2: Deploy to Firebase

```bash
firebase deploy --only hosting
```

**Your frontend is LIVE at:** https://auraprep.web.app

### Step 1.3: Verify

```bash
curl https://auraprep.web.app/
```

---

## Phase 2: Deploy Backend to Render (Free Tier)

### Step 2.1: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub (easiest)
3. Click "New +" → "Web Service"

### Step 2.2: Connect GitHub & Configure

In Render:
1. Select your AuraPrep GitHub repo
2. Settings:
   - Name: `auraprep-api`
   - Environment: `Node`
   - Region: `Oregon`
   - Build Command: `npm install && npm --prefix server run build`
   - Start Command: `npm --prefix server start`

### Step 2.3: Set Environment Variables

Add in Render Dashboard:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://maxidea2008_db_user:XJiKp8aju6dKIVj6@auraprep.gkuuvix.mongodb.net/auraprep?retryWrites=true&w=majority&appName=AuraPrep
JWT_ACCESS_SECRET=(generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_REFRESH_SECRET=(generate second secret)
CORS_ORIGIN=https://auraprep.web.app
PORT=10000
```

### Step 2.4: Deploy

Click "Create Web Service" and wait 3-5 minutes.

**Your backend is LIVE at:** https://auraprep-api.onrender.com

### Step 2.5: Verify

```bash
curl https://auraprep-api.onrender.com/api/health
```

Should return: `{"status":"ok",...}`

⚠️ **Note:** Render free tier spins down after 15 minutes. First request takes ~30 seconds (normal).

---

## Phase 3: Connect Frontend to Backend

### Step 3.1: Update API URL

Edit `.env.production`:

```
VITE_API_URL=https://auraprep-api.onrender.com/api
```

### Step 3.2: Rebuild & Redeploy

```bash
npm run build
firebase deploy --only hosting
```

**Done!** ✅

---

## Phase 4: Test Everything

### Test in Browser

1. Visit https://auraprep.web.app
2. Register account
3. Check Network tab for API calls
4. Verify game data syncs

### View Logs

**Frontend logs:**
```bash
firebase hosting:log
```

**Backend logs:**
- Render Dashboard → Your web service → Logs tab

**Database:**
- MongoDB Atlas console → Collections

---

## Complete Setup

### Frontend: Firebase Hosting
- URL: https://auraprep.web.app
- Storage: 10GB/month free
- Bandwidth: 1GB/month free
- SSL: Automatic ✅

### Backend: Render Free Tier
- URL: https://auraprep-api.onrender.com
- Requests: Unlimited
- Cold starts: ~30 sec (after 15 min inactivity)
- Uptime: 99.9%

### Database: MongoDB Atlas Free
- Storage: 512MB
- Connections: 500
- Perfect for <50 users ✅

### Total Cost: $0/month 🎉

---

## Free Tier Limits

| Component | Free Limit | For 50 Users | Status |
|-----------|-----------|--------------|--------|
| Firebase Hosting | 10GB/mo | ~100MB | ✅ Safe |
| Render Backend | ∞ requests | ~5000/day | ✅ Safe |
| MongoDB | 512MB | ~100MB | ✅ Safe |

---

## Scaling Later

When you grow:

**Firebase:** $1.26/GB after 1GB
**Render Starter:** $7/month (no cold starts)
**MongoDB M10:** $57/month (50GB)

---

## Troubleshooting

### Frontend blank page
```bash
npm run build
firebase deploy --only hosting --debug
```

### Backend 404
- Check Render environment variables
- Check CORS_ORIGIN setting

### CORS errors
```
CORS_ORIGIN must equal: https://auraprep.web.app
```

### Backend slow on first request
- Normal! Render free tier spins down
- First request ~30 seconds to wake
- Subsequent requests: ~100ms

### Keep backend awake
Use free uptime monitor: https://www.uptime.com
Ping every 10 minutes to prevent spin-down

---

## Auto-Deploy on Git Push (Optional)

### Render Auto-Deploy

In Render Dashboard → Settings:
- Enable "Auto-Deploy"
- Select branch: `main`

Now every `git push origin main` redeploys automatically!

---

## Summary

**You now have:**
- ✅ Frontend live at https://auraprep.web.app
- ✅ Backend live at https://auraprep-api.onrender.com
- ✅ Database connected to MongoDB Atlas
- ✅ All completely free for <50 users
- ✅ Easy to scale when needed

**Total deployment time: ~10 minutes**
**Total cost: $0/month** 🚀

---

## Quick Commands

```bash
# Deploy frontend
npm run build && firebase deploy --only hosting

# View frontend logs
firebase hosting:log

# View backend logs
# Render Dashboard → Logs

# Test API
curl https://auraprep-api.onrender.com/api/health

# Test frontend
curl https://auraprep.web.app/
```

Good luck with your beta! 🎉
