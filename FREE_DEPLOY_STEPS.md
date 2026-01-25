# 🚀 Free Deployment: 5-Step Quick Start

**Total time: ~15 minutes. Cost: $0 for <50 users.**

---

## ✅ Step 1: Build Frontend (2 minutes)

```bash
cd "C:\Users\Wootton High School\AuraPrep"
npm run build
```

Result: Creates `dist/` folder

---

## ✅ Step 2: Deploy Frontend (1 minute)

```bash
firebase deploy --only hosting
```

**Your frontend is live:**
```
https://auraprep.web.app
```

Verify:
```bash
curl https://auraprep.web.app/
```

---

## ✅ Step 3: Deploy Backend to Render (5 minutes)

### 3a: Create Render Account
- Go to https://render.com
- Sign up with GitHub
- Click "Create New" → "Web Service"

### 3b: Connect GitHub Repo
1. Select your AuraPrep repository
2. In settings, fill:
   - **Name:** `auraprep-api`
   - **Environment:** Node
   - **Region:** Oregon
   - **Build:** `npm install && npm --prefix server run build`
   - **Start:** `npm --prefix server start`

### 3c: Add Environment Variables

Click "Environment" and add:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://maxidea2008_db_user:XJiKp8aju6dKIVj6@auraprep.gkuuvix.mongodb.net/auraprep?retryWrites=true&w=majority&appName=AuraPrep
CORS_ORIGIN=https://auraprep.web.app
PORT=10000
```

For JWT secrets, generate two random strings:

```bash
# Run this twice in your terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add both outputs:
```
JWT_ACCESS_SECRET=[first output]
JWT_REFRESH_SECRET=[second output]
```

### 3d: Click "Create Web Service"

Wait 3-5 minutes for deployment...

**Your backend is live at:**
```
https://auraprep-api.onrender.com/api
```

Verify:
```bash
curl https://auraprep-api.onrender.com/api/health
```

---

## ✅ Step 4: Connect Frontend to Backend (1 minute)

Edit `.env.production`:

Change from:
```
VITE_API_URL=http://localhost:3005/api
```

To:
```
VITE_API_URL=https://auraprep-api.onrender.com/api
```

---

## ✅ Step 5: Redeploy Frontend (1 minute)

```bash
npm run build
firebase deploy --only hosting
```

**All done!** 🎉

---

## ✅ Test Your App

1. Visit: https://auraprep.web.app
2. Register a new account
3. Check Network tab in DevTools
4. Verify API calls work

---

## 📊 Your Live URLs

**Frontend:**
```
https://auraprep.web.app
```

**Backend:**
```
https://auraprep-api.onrender.com/api
```

**Health Check:**
```bash
curl https://auraprep-api.onrender.com/api/health
```

**View Logs:**

Frontend:
```bash
firebase hosting:log
```

Backend:
- Go to https://render.com
- Click your service
- Click "Logs"

---

## 💰 Cost

| Component | Cost |
|-----------|------|
| Firebase Hosting | Free (10GB/mo) |
| Render Backend | Free |
| MongoDB Database | Free (512MB) |
| **Total** | **$0/month** |

---

## ⚠️ Render Free Tier Notes

- **Spins down** after 15 minutes with no requests
- **First request** takes ~30 seconds to wake up
- **Subsequent requests** are fast (~100ms)
- **Unlimited requests** per day

To keep it awake, use free monitor: https://www.uptime.com

---

## 🔄 Auto-Deploy on Git Push (Optional)

In Render Dashboard:
1. Go to your web service
2. Settings → "Auto-Deploy"
3. Enable it

Now every `git push origin main` automatically redeploys! ✨

---

## 🆘 Quick Troubleshooting

### Frontend blank page
```bash
npm run build
firebase deploy --only hosting --debug
```

### Backend not working
1. Check Render Logs
2. Verify environment variables
3. Check CORS_ORIGIN = https://auraprep.web.app

### CORS errors
```bash
# Go to Render Dashboard
# Update CORS_ORIGIN to: https://auraprep.web.app
# Restart web service
```

---

## ✨ You're Live!

Your app is now running on a free tier that supports up to 50 concurrent users.

**Share with beta testers:**
```
https://auraprep.web.app
```

Good luck! 🚀
