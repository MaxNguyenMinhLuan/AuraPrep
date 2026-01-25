# Quick Start: Deploy AuraPrep to Firebase

## Current Setup

You already have:
- ✅ Firebase project: `auraprep-app`
- ✅ Firebase Hosting configured (`dist/` folder)
- ✅ Cloud Functions set up (for email notifications)
- ✅ Backend Express server ready
- ✅ Frontend React app ready

## Deployment Strategy

**Deploy Frontend to Firebase Hosting + Backend to External Service**

Since you already have Cloud Functions for email notifications, we'll:
1. Deploy frontend to Firebase Hosting (https://auraprep.firebaseapp.com)
2. Keep backend on Heroku/Railway/other service (separate from Cloud Functions)
3. Keep email notification functions in Cloud Functions

This separation is cleaner and avoids conflicts.

## Quick Deployment Steps

### Step 1: Install Firebase CLI (one-time)

```bash
npm install -g firebase-tools
firebase login
```

### Step 2: Build Frontend

```bash
cd "C:\Users\Wootton High School\AuraPrep"
npm run build
```

This creates the `dist/` folder with your production build.

### Step 3: Update Frontend API URL for Production

Edit `.env.production` in root:

```
VITE_API_URL=https://your-backend-api-url.com/api
```

Or update it before building:

```bash
VITE_API_URL=https://your-backend.herokuapp.com/api npm run build
```

### Step 4: Deploy Frontend to Firebase Hosting

```bash
firebase deploy --only hosting
```

Your frontend will be live at: **https://auraprep.firebaseapp.com**

### Step 5: Deploy Backend Separately

Choose one option:

#### Option A: Heroku (Easiest)

```bash
# Create Heroku app
heroku create auraprep-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI="your-mongodb-uri"
heroku config:set JWT_ACCESS_SECRET="secure-random-string"
heroku config:set JWT_REFRESH_SECRET="secure-random-string"
heroku config:set CORS_ORIGIN="https://auraprep.firebaseapp.com"

# Deploy
cd server
git push heroku main
```

#### Option B: Railway (Modern Alternative)

1. Sign up at https://railway.app
2. Connect your GitHub repo
3. Set environment variables in Railway dashboard
4. Deploy with one click

#### Option C: Cloud Run (Google Cloud)

```bash
gcloud run deploy auraprep-api \
  --source server \
  --platform managed \
  --region us-central1 \
  --set-env-vars NODE_ENV=production,MONGODB_URI=your-uri
```

### Step 6: Update Frontend After Backend Deployed

Once backend is deployed, update the API URL:

```bash
# Edit .env or .env.production
VITE_API_URL=https://your-backend-url.com/api

# Rebuild and redeploy
npm run build
firebase deploy --only hosting
```

## Verify Deployment

```bash
# Frontend
curl https://auraprep.firebaseapp.com/

# Backend (replace with your URL)
curl https://auraprep-api.herokuapp.com/api/health
```

## Setup Automatic Deployments

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Deploy to Firebase Hosting
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: auraprep-app
```

Get Firebase service account:

```bash
firebase init hosting:github
```

## Environment Variables

### For Firebase Hosting (Frontend)

`.env.production`:
```
VITE_API_URL=https://auraprep-api.herokuapp.com/api
VITE_FIREBASE_API_KEY=AIzaSyDGmQozAQW6ox2hxrgnNo7F1DClr__6sCo
VITE_FIREBASE_AUTH_DOMAIN=auraprep-da99c.firebaseapp.com
...
```

### For Backend Deployment

```bash
# For Heroku
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI="your-mongodb-uri"
heroku config:set CORS_ORIGIN="https://auraprep.firebaseapp.com"
heroku config:set JWT_ACCESS_SECRET="secure-random"
heroku config:set JWT_REFRESH_SECRET="secure-random"
```

## Custom Domain Setup

### Add custom domain to Firebase Hosting

1. Go to Firebase Console > Hosting
2. Click "Add custom domain"
3. Enter your domain: `auraprep.com`
4. Follow DNS verification steps
5. Update your domain DNS settings

Firebase provides free SSL certificate automatically.

## Monitoring & Logs

```bash
# Firebase Hosting logs
firebase hosting:log

# View function logs
firebase functions:log

# Tail logs in real-time
firebase functions:log --limit 50
```

## Cost Breakdown

**Firebase Hosting:** $1.26/GB (free tier: 10GB/month)
**Cloud Functions:** $0.40/million invocations
**Heroku Backend:** $7-50/month (depends on dyno type)

## Next Steps

1. Build: `npm run build`
2. Deploy: `firebase deploy --only hosting`
3. Test: Visit https://auraprep.firebaseapp.com
4. Deploy backend separately (Heroku/Railway/Cloud Run)
5. Update API URL in frontend
6. Monitor: Check Firebase Console & backend logs

## Troubleshooting

### Frontend won't load

```bash
firebase hosting:disable  # Check status
firebase deploy --only hosting  # Redeploy
```

### API calls failing

- Check `VITE_API_URL` in built files: `cat dist/index.html`
- Check backend is running and CORS is configured
- Check network tab in browser DevTools

### Deploy fails

```bash
firebase deploy --debug
```

---

**You're ready to deploy! Run:**

```bash
npm run build && firebase deploy --only hosting
```

Once backend is deployed, update the API URL and redeploy frontend.
