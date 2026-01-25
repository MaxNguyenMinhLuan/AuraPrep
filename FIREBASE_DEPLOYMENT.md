# AuraPrep Firebase Deployment Guide

## Architecture

```
┌──────────────────────┐
│  Firebase Hosting    │
│  (Frontend React)    │  https://auraprep.web.app
└──────────┬───────────┘
           │ API calls
           ▼
┌──────────────────────┐
│  Cloud Functions     │
│  (Express Backend)   │  https://region-projectid.cloudfunctions.net
└──────────┬───────────┘
           │ Database queries
           ▼
┌──────────────────────┐
│  Cloud Firestore OR  │
│  MongoDB Atlas       │  External Database
└──────────────────────┘
```

## Prerequisites

1. Firebase CLI installed
2. Google Cloud SDK installed
3. Firebase project created (auraprep-da99c)
4. GitHub repository

## Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

## Step 2: Initialize Firebase in Your Project

```bash
cd "C:\Users\Wootton High School\AuraPrep"
firebase init
```

Select:
- [x] Hosting
- [x] Functions
- [x] Emulators (optional, for local testing)

Choose:
- Project: `auraprep-da99c`
- Hosting directory: `dist`
- Single-page app: Yes
- Functions language: JavaScript
- Use ESLint: Yes
- Install dependencies: Yes

## Step 3: Restructure Project for Firebase

### Create functions directory structure

```
functions/
├── package.json
├── .env (production env vars)
├── src/
│   └── index.ts (Express app export)
├── lib/
│   ├── index.js
│   ├── app.js
│   ├── routes/
│   └── models/
└── tsconfig.json
```

## Step 4: Convert Backend to Cloud Functions

Create `functions/src/index.ts`:

```typescript
import * as functions from 'firebase-functions';
import app from './app';

// Deploy as HTTP Cloud Function
export const api = functions.https.onRequest(app);
```

Your existing `server/src/app.ts` becomes `functions/src/app.ts`.

## Step 5: Configure Environment Variables

Create `functions/.env.production`:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://maxidea2008_db_user:XJiKp8aju6dKIVj6@auraprep.gkuuvix.mongodb.net/auraprep?retryWrites=true&w=majority&appName=AuraPrep
JWT_ACCESS_SECRET=your-secure-random-secret-here
JWT_REFRESH_SECRET=your-secure-random-secret-here
CORS_ORIGIN=https://auraprep.web.app
```

To set in Firebase:

```bash
firebase functions:config:set env.mongodb_uri="your-mongodb-uri"
firebase functions:config:set env.jwt_access_secret="your-secret"
firebase functions:config:set env.jwt_refresh_secret="your-secret"
firebase functions:config:set env.cors_origin="https://auraprep.web.app"
```

## Step 6: Update Frontend Environment

Update `src/.env.production`:

```
VITE_API_URL=https://region-projectid.cloudfunctions.net/api
```

Or use a Cloud Function that returns the correct URL.

## Step 7: Build Frontend

```bash
npm run build
```

This creates the `dist/` folder that Firebase Hosting will serve.

## Step 8: Deploy to Firebase

```bash
# Deploy both frontend and backend
firebase deploy

# Or deploy separately
firebase deploy --only hosting  # Frontend only
firebase deploy --only functions  # Backend only
```

## Step 9: Configure CORS in Functions

Your existing CORS configuration will work, but ensure:

```typescript
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'https://auraprep.web.app',
    credentials: true
}));
```

## Step 10: Set Up Continuous Deployment

Create `.github/workflows/firebase-deploy.yml`:

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
        run: |
          npm install
          npm install --prefix functions

      - name: Build frontend
        run: npm run build

      - name: Deploy to Firebase
        uses: w9jds/firebase-action@master
        with:
          args: deploy
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

Get Firebase token:

```bash
firebase login:ci
```

Add to GitHub Secrets: `FIREBASE_TOKEN`

## Detailed Setup Instructions

### Option A: Move Backend to Functions (Recommended)

1. Copy `server/src/*` to `functions/src/`
2. Update imports in `functions/src/index.ts` to export Express app
3. Update `functions/package.json` with all backend dependencies
4. Run `firebase deploy`

### Option B: Keep Separate Backend

Keep backend deployed elsewhere (Heroku, Railway, etc.) and just deploy frontend to Firebase Hosting.

## Testing Locally

```bash
firebase emulators:start
```

This starts:
- Firebase Emulator Suite (http://localhost:4000)
- Functions Emulator (http://localhost:5001)
- Hosting Emulator (http://localhost:5000)

## Verify Deployment

### Frontend
```bash
curl https://auraprep.web.app/
```

### Backend
```bash
curl https://region-projectid.cloudfunctions.net/api/health
```

### Check Logs
```bash
firebase functions:log
```

## Performance Optimization

### Cold Start Optimization

- Keep functions lightweight
- Use environment variables instead of fetching config
- Consider background functions for non-critical tasks

### Database Query Optimization

- Add MongoDB indexes
- Use aggregation pipelines for complex queries
- Implement caching where possible

## Monitoring

### In Firebase Console

1. Go to Functions section
2. View execution stats
3. Monitor errors and logs
4. Check billing

### Set Up Alerts

```bash
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="Function Errors" \
  --condition-display-name="High Error Rate"
```

## Troubleshooting

### Function won't deploy

```bash
firebase deploy --debug
```

### CORS errors

Update `CORS_ORIGIN` environment variable to match your Firebase Hosting URL

### Cold starts too slow

- Optimize imports
- Use Node.js 18 runtime
- Pre-warm critical functions

### Environment variables not loading

```bash
# Check what's set
firebase functions:config:get

# Set correctly
firebase functions:config:set env.var_name="value"
```

## Scaling

Firebase Hosting automatically scales globally with CDN.

Cloud Functions automatically scales:
- Max 1000 concurrent executions per region
- Upgrade to Premium tier for higher limits

## Cost Estimation

**Free Tier Includes:**
- 125K Cloud Function invocations/month
- 1GB storage per day
- 1GB/day egress

**Beyond Free:**
- $0.40 per million invocations
- Pay for actual compute time

Monitor costs: https://console.firebase.google.com/project/auraprep-da99c/billing

## Deployment Checklist

- [ ] Firebase CLI installed and logged in
- [ ] Backend converted to Cloud Functions
- [ ] Environment variables configured
- [ ] Frontend builds successfully
- [ ] CORS origin set correctly
- [ ] Database credentials working in production
- [ ] Tests passing
- [ ] GitHub Actions workflow created
- [ ] Firebase token added to GitHub Secrets
- [ ] Monitored first deployment

## Next Steps

1. Deploy: `firebase deploy`
2. Test: Visit https://auraprep.web.app
3. Monitor: Check Firebase Console logs
4. Iterate: Push changes to main branch for auto-deploy
