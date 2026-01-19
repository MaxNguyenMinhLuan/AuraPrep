# Guardian Email Notification System - Deployment Guide

## Overview

This guide covers the complete deployment of the Guardian Email Notification System for AuraPrep. The system consists of:
- **Backend API**: Express.js + MongoDB
- **Frontend**: React with email preference UI
- **Firebase Cloud Functions**: Scheduled email nudges
- **SendGrid**: Email service provider

## Prerequisites

Before starting, ensure you have:
- Firebase project created (https://console.firebase.google.com)
- SendGrid account (https://sendgrid.com) with API key
- MongoDB Atlas cluster (https://www.mongodb.com/cloud/atlas)
- Node.js 18+ installed
- Firebase CLI installed: `npm install -g firebase-tools`

---

## Phase 1: Backend Setup

### 1.1 MongoDB Configuration

The backend uses MongoDB to store user game data. This requires extending your existing setup.

**Files involved:**
- `server/src/models/User.ts` - Extended with `timezone` and `emailNotificationsEnabled` fields
- `server/src/models/UserGameData.ts` - New model for game data

**Steps:**
1. Ensure your MongoDB connection string is in `server/.env`
2. MongoDB will automatically create the `userGameData` collection on first write
3. Indexes are automatically created by Mongoose schemas

**Verify MongoDB connection:**
```bash
cd server
npm run build
npm start
# Check logs for "Connected to MongoDB"
```

### 1.2 API Endpoints

The backend exposes new endpoints for game data sync and analytics.

**Game Data Endpoints:**
```
POST   /api/game-data/sync              # Sync localStorage → MongoDB
GET    /api/game-data                    # Fetch user's game data
PATCH  /api/game-data/mission            # Update daily mission status
PATCH  /api/game-data/preferences        # Update email preferences
PATCH  /api/game-data/nudge              # Update nudge tracking (internal)
PATCH  /api/game-data/metrics            # Update email metrics (internal)
```

**Analytics Endpoints:**
```
GET    /api/analytics/email-metrics      # Global email metrics
GET    /api/analytics/user-metrics/:id   # User-specific metrics
GET    /api/analytics/streak-insights    # Streak data
GET    /api/analytics/guardians          # Guardian popularity
```

**Auth Endpoint (new):**
```
POST   /api/auth/verify-email-token      # JWT token verification for email auto-login
```

### 1.3 Environment Variables

Add these to `server/.env`:

```env
# Existing variables...
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/auraprep

# JWT Configuration (shared with Cloud Functions)
JWT_SECRET=your-secret-key-here
JWT_ISSUER=auraprep
JWT_AUDIENCE=auraprep-web

# These should match your existing config
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://auraprep.com
```

---

## Phase 2: Firebase Cloud Functions Setup

The Cloud Functions handle automated email sending at specific times.

### 2.1 Initialize Firebase Functions

```bash
# Initialize Firebase in your project root
firebase init functions

# Select TypeScript when prompted
# Select "Overwrite" if asked about existing functions folder

# Navigate to functions directory
cd functions

# Install dependencies
npm install

# Build
npm run build
```

### 2.2 Configure Environment Variables

Create `functions/.env.local`:

```env
# SendGrid API Key - get from https://app.sendgrid.com/settings/api_keys
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx

# JWT Secret - MUST match server/.env
JWT_SECRET=your-secret-key-here

# App URL for deep links
APP_URL=https://auraprep.com

# MongoDB connection (optional, uses default from Firebase)
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/auraprep
```

Set Firebase config:
```bash
# From functions directory
firebase functions:config:set sendgrid.key="SG.xxxxxxxxxxxxxxxxxxxxx"
firebase functions:config:set jwt.secret="your-secret-key-here"
firebase functions:config:set app.url="https://auraprep.com"
```

### 2.3 Deploy Cloud Functions

```bash
# From project root
firebase deploy --only functions

# Monitor deployment
firebase functions:log
```

### 2.4 Verify Cloud Scheduler Jobs

After deployment, check Cloud Scheduler in Firebase Console:
- Navigate to Cloud Functions
- Look for `morningNudge`, `afternoonNudge`, `eveningNudge`, `dailyReset`
- Each should have an associated Cloud Scheduler job
- Jobs run hourly (nudges) or daily (reset)

---

## Phase 3: Frontend Setup

### 3.1 Update App.tsx

Already completed:
- Auto-login handler for email deep links
- Game data sync on login + periodic sync (5 minutes)
- Updated `AuthService.getAuthToken()` method

### 3.2 Add Email Preferences UI

The `EmailPreferences` component allows users to manage their settings.

**Add to your settings/profile menu:**
```tsx
import EmailPreferences from './components/Settings/EmailPreferences';

// In your settings component:
const [showEmailPrefs, setShowEmailPrefs] = useState(false);

return (
  <>
    {showEmailPrefs && (
      <EmailPreferences
        onClose={() => setShowEmailPrefs(false)}
        onSave={() => {
          // Reload user data or refresh
          setShowEmailPrefs(false);
        }}
      />
    )}
  </>
);
```

### 3.3 Frontend Environment Variables

Ensure `vite.env.d.ts` or your Vite config has:
```typescript
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_FIREBASE_API_KEY: string;
  // ... other env vars
}
```

---

## Phase 4: SendGrid Configuration

### 4.1 Create Email Templates

SendGrid dynamic templates allow personalized content injection.

**Create 24 templates (3 nudges × 8 Guardian types):**

1. Go to SendGrid Dashboard → Dynamic Templates
2. Create templates with these variables:
   - `{{userName}}` - User's name
   - `{{guardianName}}` - Guardian creature name
   - `{{currentStreak}}` - Current streak count
   - `{{deepLink}}` - Auto-login URL

**Template naming convention:**
- `fire-morning`, `fire-afternoon`, `fire-evening`
- `water-morning`, `water-afternoon`, `water-evening`
- ... (repeat for all 8 types)

**Or use the simple approach:**
The system generates full HTML emails directly, no templates needed. Just configure the API key.

### 4.2 Verify Sender Email

1. Go to SendGrid → Sender Authentication
2. Add your sender email (e.g., `guardians@auraprep.com`)
3. Verify domain ownership (SPF/DKIM records)

**Testing:**
```bash
# Send test email from Cloud Function
# Navigate to Firebase Console → Functions → Health endpoint
# Should return {"status":"ok"}
```

---

## Phase 5: Data Migration

### 5.1 Migrate Existing Users

Users' localStorage data will automatically sync on login:

1. User logs in
2. Frontend calls `migrateLocalStorageToBackend()`
3. All game data moved to MongoDB
4. Periodic sync keeps data in sync

### 5.2 Verify Migration

Check MongoDB Atlas:
```
Collections → userGameData
Should show documents with userId, email, timezone, metrics, etc.
```

---

## Phase 6: Testing

### 6.1 Local Development

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
npm run dev

# Terminal 3: Firebase Functions (emulator)
cd functions
npm run serve

# Emulator should start at http://localhost:5001
```

### 6.2 Test Flows

**1. Game Data Sync:**
- Login with test account
- Check browser console for sync messages
- Verify in MongoDB that `userGameData` document created

**2. Email Preferences:**
- Click settings → Email Preferences
- Change timezone, enable/disable nudges
- Click Save
- Verify in MongoDB that preferences updated

**3. Email Sending (Functions):**
- Deploy functions to Firebase
- Monitor with `firebase functions:log`
- Should see "Found X users to send nudges to" every hour

**4. Email Deep Link:**
- Generate a test email URL manually:
  ```javascript
  // In browser console during Firebase Functions test
  // Get JWT token generation to work
  ```
- Click link in email
- Should auto-login without password

### 6.3 Unit Tests

```bash
# Test Guardian copy generation
cd shared
npm test

# Should test all 24 personality combinations
```

---

## Phase 7: Production Deployment

### 7.1 Pre-Deployment Checklist

- [ ] MongoDB connection string configured
- [ ] SendGrid API key configured
- [ ] JWT secret configured (same in both backend and Cloud Functions)
- [ ] App URL configured for deep links
- [ ] Firebase Project initialized
- [ ] Cloud Scheduler jobs visible in Firebase Console
- [ ] Sender email verified in SendGrid
- [ ] SPF/DKIM records configured
- [ ] SSL certificates configured
- [ ] Rate limiting configured in API
- [ ] CORS origins configured for production domain

### 7.2 Deploy Backend

```bash
# From server directory
npm run build

# Deploy to your hosting (Heroku, Railway, Render, etc.)
# Example with Railway:
railway up

# Or with manual deployment:
git push heroku main
```

### 7.3 Deploy Frontend

```bash
# Build for production
npm run build

# Deploy (Firebase Hosting, Vercel, Netlify, etc.)
# Example with Firebase Hosting:
firebase deploy --only hosting

# Or manual:
npm run build
# Upload dist/ to your hosting
```

### 7.4 Deploy Cloud Functions

```bash
# From project root
firebase deploy --only functions

# Verify deployment
firebase functions:log
```

### 7.5 Health Checks

```bash
# Test all endpoints
curl https://auraprep.com/api/health
# Should return {"status":"ok"}

curl https://auraprep.com/api/analytics/email-metrics \
  -H "Authorization: Bearer YOUR_TOKEN"
# Should return email metrics

# Check function logs
firebase functions:log --limit 50
```

---

## Phase 8: Monitoring & Maintenance

### 8.1 Firebase Console Monitoring

Monitor these in Firebase Console:
- **Cloud Functions**: Check for errors in `morningNudge`, `afternoonNudge`, `eveningNudge`, `dailyReset`
- **Cloud Scheduler**: Verify jobs run on schedule
- **Firestore** (if using): Monitor read/write quotas

### 8.2 SendGrid Monitoring

Monitor in SendGrid Dashboard:
- **Delivery**: Check bounce and spam rates
- **Engagement**: Monitor open and click rates
- **API Calls**: Verify no rate limit errors

### 8.3 Application Logs

```bash
# View Firebase Function logs
firebase functions:log --follow

# View backend logs (depends on hosting provider)
# Railway: railway logs
# Heroku: heroku logs --tail
# Render: render logs
```

### 8.4 Performance Optimization

**Email Sending Rate:**
- SendGrid free tier: 100 emails/day
- Pro tier: Unlimited
- Optimize by batching users by timezone

**Database Optimization:**
- Indexes on `timezone`, `emailNotifications.enabled`, `dailyMissions.completed`
- Already created in schema

**Cold Start Reduction:**
- Cloud Functions automatically optimize
- First run ~2-3 seconds, subsequent runs <100ms

---

## Phase 9: Troubleshooting

### Issue: Emails not sending

**Check:**
1. SendGrid API key configured: `firebase functions:config:get`
2. Sender email verified in SendGrid
3. Check Cloud Function logs: `firebase functions:log`
4. Verify user has `emailNotifications.enabled: true`

**Solution:**
```bash
# Test email endpoint locally
firebase emulators:start

# Or deploy test function
firebase deploy --only functions:health
```

### Issue: Users not found for nudge time

**Check:**
1. Verify timezone field populated in MongoDB
2. Check `getTimezonesForLocalHour()` logic
3. Verify Cloud Scheduler job actually ran

**Debug:**
```bash
# Add logging to timezone check
firebase functions:log --grep "Timezones at"
```

### Issue: Email tokens not working

**Check:**
1. JWT_SECRET matches in both backend and Cloud Functions
2. Token not expired (24 hour expiry)
3. Verify `verifyEmailToken()` in TokenService works

**Debug:**
```bash
# Test token verification locally
npm test -- token.service.test.ts
```

### Issue: High email bounce rate

**Check:**
1. Email list contains valid addresses
2. Sender email properly configured
3. SPF/DKIM records correct

**Solution:**
```
SendGrid Dashboard → Email Validation → Verify List
```

---

## Phase 10: Scaling Considerations

### For 10,000+ Users

**Email Sending:**
- Batch users by timezone
- Use SendGrid Transactional Email instead of Marketing
- Consider SendGrid async endpoint

**Database:**
- Add sharding if needed
- Archive old metrics data
- Use read replicas for analytics

**Cloud Functions:**
- Increase memory allocation (512MB → 1GB)
- Use pub/sub batching
- Monitor cold start time

**Caching:**
- Cache timezone lists
- Cache frequently accessed analytics queries

---

## Phase 11: Support Resources

**Documentation:**
- [Firebase Cloud Functions](https://firebase.google.com/docs/functions)
- [SendGrid Email API](https://docs.sendgrid.com/api-reference)
- [MongoDB Aggregation](https://docs.mongodb.com/manual/aggregation/)
- [Express.js Guide](https://expressjs.com/)

**Contact Support:**
- Firebase: https://firebase.google.com/support/troubleshooting
- SendGrid: https://support.sendgrid.com
- MongoDB: https://docs.atlas.mongodb.com

---

## Summary

The Guardian Email Notification System is now deployed!

**Key Features:**
✓ 3 daily email nudges (8 AM, 2 PM, 8 PM local time)
✓ Personality-driven messaging for all 8 Guardian types
✓ Auto-login from email deep links
✓ Email preference management
✓ Comprehensive analytics and metrics
✓ Timezone-aware scheduling
✓ Conversion tracking and engagement metrics

**Next Steps:**
1. Monitor email delivery and engagement
2. A/B test different personality variations
3. Analyze which nudge times drive most conversions
4. Adjust aggressive level based on unsubscribe rates
5. Expand to additional languages if needed

---

**Deployment Checklist:**
- [ ] Backend API live and tested
- [ ] MongoDB data syncing properly
- [ ] Cloud Functions deployed and logs showing
- [ ] SendGrid emails sending and tracked
- [ ] Frontend email preferences UI working
- [ ] Auto-login from email links tested
- [ ] Analytics endpoints returning data
- [ ] Production monitoring configured
- [ ] Backup and disaster recovery plan in place
- [ ] Support documentation updated
