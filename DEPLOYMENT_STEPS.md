# AuraPrep Deployment: Step-by-Step Instructions

## Phase 1: Frontend Deployment (Firebase Hosting)

### Step 1.1: Build Frontend

```bash
cd "C:\Users\Wootton High School\AuraPrep"
npm run build
```

Expected output:
- Creates `dist/` folder with production build
- Should complete in 10-30 seconds

### Step 1.2: Deploy Frontend to Firebase

```bash
firebase deploy --only hosting
```

Expected output:
```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/auraprep-app/overview
Hosting URL: https://auraprep-app.firebaseapp.com
```

**Your frontend is now live at:** `https://auraprep-app.firebaseapp.com`

### Step 1.3: Verify Frontend

```bash
curl https://auraprep-app.firebaseapp.com/
# Or visit in browser
```

---

## Phase 2: Backend Deployment (Heroku)

### Step 2.1: Create Heroku Account & Install CLI

If not already done:
```bash
# Download from: https://devcenter.heroku.com/articles/heroku-cli
# Or use npm:
npm install -g heroku
heroku login
```

### Step 2.2: Create Heroku App

```bash
heroku create auraprep-api --region us
```

This creates an app and adds a `heroku` remote to your git config.

### Step 2.3: Set Environment Variables

```bash
# Set Node environment
heroku config:set NODE_ENV=production -a auraprep-api

# Set MongoDB URI (same as development)
heroku config:set MONGODB_URI="mongodb+srv://maxidea2008_db_user:XJiKp8aju6dKIVj6@auraprep.gkuuvix.mongodb.net/auraprep?retryWrites=true&w=majority&appName=AuraPrep" -a auraprep-api

# Generate secure JWT secrets
# Run this twice and copy each output:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Set JWT secrets (use the generated strings)
heroku config:set JWT_ACCESS_SECRET="YOUR_GENERATED_SECRET_1" -a auraprep-api
heroku config:set JWT_REFRESH_SECRET="YOUR_GENERATED_SECRET_2" -a auraprep-api

# Set CORS origin to your Firebase frontend URL
heroku config:set CORS_ORIGIN="https://auraprep-app.firebaseapp.com" -a auraprep-api
```

### Step 2.4: Deploy Backend

```bash
# Option A: Using git subtree (deploy just the server folder)
git subtree push --prefix server heroku main

# Option B: If that doesn't work, use:
cd server
heroku git:remote -a auraprep-api
git push heroku main
cd ..
```

Expected output:
```
remote: Compiling TypeScript
remote: Building...
remote: Launching... done
✔ Deployed successfully
```

### Step 2.5: Verify Backend is Running

```bash
# Check logs
heroku logs --tail -a auraprep-api

# Test health endpoint
curl https://auraprep-api.herokuapp.com/api/health

# Should return:
# {"status":"ok","timestamp":"...","environment":"production"}
```

---

## Phase 3: Connect Frontend to Backend

### Step 3.1: Update API URL

Edit `.env.production`:

```
VITE_API_URL=https://auraprep-api.herokuapp.com/api
```

### Step 3.2: Rebuild Frontend

```bash
npm run build
```

### Step 3.3: Redeploy Frontend

```bash
firebase deploy --only hosting
```

---

## Phase 4: Final Verification

### Test Authentication

```bash
# Go to https://auraprep-app.firebaseapp.com
# Try to register a new account
# Check if registration succeeds
```

### Test Game Data Sync

```bash
# After registering, check if game data is saved
# Look at browser Network tab to see API calls
```

### Check Heroku Logs

```bash
heroku logs --tail -a auraprep-api
```

Should show successful requests like:
```
2026-01-25T... POST /api/auth/register
2026-01-25T... POST /api/game-data/sync
2026-01-25T... GET /api/analytics/user/learning
```

---

## Deployment Complete! 🎉

**Your app is now live:**
- **Frontend:** https://auraprep-app.firebaseapp.com
- **Backend API:** https://auraprep-api.herokuapp.com/api
- **Health Check:** https://auraprep-api.herokuapp.com/api/health

---

## Setting Up Auto-Deployment (GitHub Actions)

### Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase and Heroku

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install dependencies
        run: npm install

      - name: Build frontend
        run: npm run build

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: auraprep-app

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.13.15
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "auraprep-api"
          heroku_email: ${{secrets.HEROKU_EMAIL}}
          appdir: "server"
```

### Add GitHub Secrets

1. Go to GitHub repo > Settings > Secrets > New repository secret
2. Add these secrets:

```
HEROKU_API_KEY: (run: heroku auth:token)
HEROKU_EMAIL: your-heroku-email@example.com
FIREBASE_SERVICE_ACCOUNT: (get from firebase init hosting:github)
```

---

## Troubleshooting

### Frontend showing blank page

```bash
# Check built files
ls dist/

# Check if index.html exists
cat dist/index.html | head -20

# Redeploy
npm run build
firebase deploy --only hosting --debug
```

### Backend 404 errors

```bash
# Check if environment variables are set
heroku config -a auraprep-api

# Check logs for errors
heroku logs --tail -a auraprep-api
```

### CORS errors in frontend

```bash
# Update CORS_ORIGIN
heroku config:set CORS_ORIGIN="https://auraprep-app.firebaseapp.com" -a auraprep-api

# Restart backend
heroku restart -a auraprep-api
```

### Database connection fails

```bash
# Verify MongoDB is accessible
heroku logs --tail -a auraprep-api

# Check MongoDB Atlas whitelist
# https://cloud.mongodb.com/v2/projects > Network Access

# Allow all IPs (0.0.0.0/0) for development
```

---

## Monitoring Production

### View Logs

```bash
# Frontend errors (Firebase)
firebase hosting:log

# Backend errors (Heroku)
heroku logs --tail -a auraprep-api

# Real-time logs
heroku logs --tail -a auraprep-api --num 50
```

### Database Monitoring

Visit MongoDB Atlas: https://cloud.mongodb.com
- Monitor connections
- View query performance
- Check storage usage

### Heroku Metrics

Visit: https://dashboard.heroku.com/apps/auraprep-api
- View dyno hours
- Monitor response times
- Check for errors

---

## Next Steps

1. ✅ Frontend deployed to Firebase Hosting
2. ✅ Backend deployed to Heroku
3. ✅ Connected via environment variables
4. 🔄 Monitor logs and user feedback
5. 🚀 Scale as needed (more dynos, database upgrades)
6. 📊 Set up error tracking (Sentry)

---

**Need help?** Check logs first:
```bash
heroku logs --tail -a auraprep-api
firebase hosting:log
```
