# Guardian Email System - Quick Reference Guide

**For:** Developers, DevOps, Product Managers

---

## 🚀 Quick Start

### Local Development
```bash
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
npm run dev

# Terminal 3: Firebase Emulator (optional)
cd functions && firebase emulators:start
```

### Production Deployment
```bash
# Backend
cd server && npm run build && npm start

# Cloud Functions
firebase deploy --only functions

# Frontend
npm run build && npm run deploy
```

---

## 🔑 Key Concepts

| Concept | Purpose | Location |
|---------|---------|----------|
| **UserGameData** | Stores user game data + email prefs | `server/src/models/UserGameData.ts` |
| **Guardian Personalities** | 24 email templates (3 × 8 types) | `shared/guardianPersonalities.ts` |
| **Cloud Functions** | Scheduled email sending | `functions/src/index.ts` |
| **Email Preferences** | User settings UI | `components/Settings/EmailPreferences.tsx` |
| **Deep Linking** | JWT-based auto-login | `functions/src/utils/deepLinkGenerator.ts` |
| **Analytics** | Metrics & engagement | `server/src/routes/analytics.ts` |

---

## 📧 Email System Architecture

```
User Completes Mission → Frontend Syncs → MongoDB
         ↑                                    ↓
    Auto-Login          Every Hour: Cloud Function
    from Email          ├─ Find users at 8 AM, 2 PM, 8 PM
         ↑              ├─ Generate Guardian copy
         └─ SendGrid    └─ Send via SendGrid
              Tracks (Opens/Clicks)
```

---

## 🔧 API Endpoints

### Game Data Sync
```bash
POST   /api/game-data/sync           # Sync data to backend
GET    /api/game-data                # Fetch game data
PATCH  /api/game-data/mission        # Update mission status
PATCH  /api/game-data/preferences    # Update email settings
PATCH  /api/game-data/nudge          # Track nudge sent (internal)
PATCH  /api/game-data/metrics        # Update metrics (internal)
```

### Analytics
```bash
GET    /api/analytics/email-metrics      # Global metrics
GET    /api/analytics/user-metrics/:id   # User metrics
GET    /api/analytics/streak-insights    # Streak data
GET    /api/analytics/guardians          # Guardian popularity
```

### Auth
```bash
POST   /api/auth/verify-email-token  # JWT token verification
```

---

## ⚙️ Configuration

### Environment Variables

**Backend (`server/.env`):**
```env
JWT_SECRET=your-secret
MONGODB_URI=mongodb+srv://...
CORS_ORIGIN=https://auraprep.com
```

**Cloud Functions (`functions/.env.local`):**
```env
SENDGRID_API_KEY=SG.xxx
JWT_SECRET=your-secret
APP_URL=https://auraprep.com
```

**Firebase Console:**
```bash
firebase functions:config:set sendgrid.key="SG.xxx"
firebase functions:config:set jwt.secret="your-secret"
firebase functions:config:set app.url="https://auraprep.com"
```

---

## 🎭 Guardian Types & Personalities

| Type | Style | Example |
|------|-------|---------|
| 🔥 **Fire** | Energetic & dramatic | "I'm literally going out!" |
| 💧 **Water** | Calm & emotional | "I'm drowning in disappointment" |
| 🌿 **Leaf** | Growth-focused & poetic | "I've completely withered" |
| ⚡ **Electric** | High-energy & buzzing | "SYSTEM SHUTTING DOWN!" |
| 🌬️ **Wind** | Free-spirited & stormy | "A storm is raging in my heart" |
| ⚙️ **Metal** | Solid & structural | "Everything I am is crumbling" |
| ✨ **Light** | Bright & illuminating | "The light has gone out" |
| 🌑 **Dark** | Sly & manipulative | "I'm lost in the darkness alone" |

Each has 3 escalation levels: Morning (helpful) → Afternoon (impatient) → Evening (desperate)

---

## 📊 Key Metrics

### Tracked Per User
- `emailsSent` - Total emails sent
- `emailsOpened` - Tracked opens
- `emailsClicked` - Tracked clicks
- `conversions.morning` - 8 AM conversion count
- `conversions.afternoon` - 2 PM conversion count
- `conversions.evening` - 8 PM conversion count

### API Queries
```bash
# Global metrics
curl /api/analytics/email-metrics -H "Authorization: Bearer TOKEN"

# User metrics
curl /api/analytics/user-metrics/:id -H "Authorization: Bearer TOKEN"

# Streak insights
curl /api/analytics/streak-insights -H "Authorization: Bearer TOKEN"

# Guardian popularity
curl /api/analytics/guardians -H "Authorization: Bearer TOKEN"
```

---

## 🌍 Supported Timezones

Easily add more in `functions/src/utils/timezoneUtils.ts`:

```typescript
const TIMEZONE_MAP: Record<string, number> = {
  'America/New_York': -5,
  'America/Chicago': -6,
  'Asia/Tokyo': 9,
  'Europe/London': 0,
  // Add more here...
};
```

**Supported:** US (6), Europe (5), Asia/Pacific (12+)

---

## 🔒 Security Checklist

- [x] JWT tokens signed with secret
- [x] 24-hour token expiry
- [x] CORS configured for production
- [x] Rate limiting on auth endpoints
- [x] Bearer token auth required
- [x] Input validation on all routes
- [x] Helmet.js security headers
- [x] No sensitive data in logs
- [x] Password hashing (bcrypt)
- [x] GDPR compliance (unsubscribe option)

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Emails not sending | Check SendGrid API key, verify sender email |
| Users not in queue | Verify timezone field populated, mission not completed |
| Auto-login not working | Verify JWT secret matches both services, token not expired |
| High bounce rate | Verify email list validity, check SPF/DKIM records |
| Cloud Functions not running | Check Firebase Console logs, verify Cloud Scheduler jobs |

---

## 📈 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Email Open Rate | > 35% | TBD on launch |
| Click-Through Rate | > 8% | TBD on launch |
| Conversion Rate | > 10% | TBD on launch |
| Email Bounce Rate | < 3% | TBD on launch |
| System Uptime | > 99.9% | TBD on launch |

---

## 🚦 Deployment Phases

### Phase 1: Foundation (Days 1-2)
- [ ] Deploy backend API
- [ ] Deploy Cloud Functions
- [ ] Configure SendGrid
- [ ] Test email sending

### Phase 2: Beta (Days 3-7)
- [ ] Enable for 5% of users
- [ ] Monitor metrics
- [ ] Fix bugs
- [ ] Gather feedback

### Phase 3: Gradual Rollout (Weeks 2-4)
- [ ] 25% of users
- [ ] 50% of users
- [ ] 100% of users
- [ ] Monitor at each step

### Phase 4: Optimization (Week 4+)
- [ ] A/B test personalities
- [ ] Optimize send times
- [ ] Fine-tune aggression level
- [ ] Monitor churn & retention

---

## 📞 Support Contacts

| Service | Contact | Use For |
|---------|---------|---------|
| Firebase | firebase.google.com/support | Cloud Functions, Auth |
| SendGrid | support.sendgrid.com | Email issues |
| MongoDB | mongodb.com/support | Database issues |
| GitHub | project issues | Bug reports |

---

## 🎯 Success Criteria

✅ System launches when:
- [ ] All endpoints tested and working
- [ ] Email delivery verified
- [ ] Auto-login flow working
- [ ] Metrics dashboard showing data
- [ ] Documentation reviewed
- [ ] Team trained on system
- [ ] Monitoring configured

✅ System successful when (Month 1):
- [ ] > 40% email open rate
- [ ] > 10% conversion rate
- [ ] < 2% bounce rate
- [ ] < 1% unsubscribe rate
- [ ] System uptime > 99.9%

---

## 📝 Debugging Commands

```bash
# View Cloud Function logs
firebase functions:log

# Check MongoDB connection
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/auraprep"

# Test email with SendGrid
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"personalizations":[{"to":[{"email":"test@example.com"}]}],"from":{"email":"noreply@auraprep.com"},"subject":"Test","content":[{"type":"text/plain","value":"Test"}]}'

# Verify JWT token
node -e "const jwt = require('jsonwebtoken'); console.log(jwt.verify('YOUR_TOKEN', 'YOUR_SECRET'))"
```

---

## 📚 File Quick Links

| What | Where |
|------|-------|
| Email templates | `shared/guardianPersonalities.ts` |
| Cloud Functions | `functions/src/index.ts` |
| Backend APIs | `server/src/routes/` |
| Frontend sync | `services/gameDataService.ts` |
| User settings UI | `components/Settings/EmailPreferences.tsx` |
| Full deployment guide | `DEPLOYMENT_GUIDE.md` |
| System documentation | `EMAIL_SYSTEM_README.md` |

---

## ⚡ Quick Deploy Checklist

```bash
# Pre-deploy
- [ ] Commit all changes
- [ ] Run tests (npm test)
- [ ] Build frontend (npm run build)
- [ ] Build backend (npm run build)
- [ ] Build functions (npm run build)

# Deploy
- [ ] Backend: Deploy to hosting
- [ ] Functions: firebase deploy --only functions
- [ ] Frontend: Deploy to hosting

# Post-deploy
- [ ] Test health endpoint: curl /api/health
- [ ] Check function logs: firebase functions:log
- [ ] Verify database connection
- [ ] Test email endpoint manually
- [ ] Monitor for 1 hour
```

---

## 💡 Pro Tips

1. **Monitor in real-time:** `firebase functions:log --follow`
2. **Test locally first:** Use Firebase emulator before deploying
3. **Set alerts:** Configure uptime monitoring for Cloud Functions
4. **Track analytics:** Use Firebase Analytics Dashboard
5. **Keep secrets safe:** Never commit API keys, use env vars
6. **Database backups:** Enable MongoDB automatic backups
7. **Email testing:** Use SendGrid sandbox mode for testing
8. **User feedback:** Add feedback link to email preferences page

---

**Last Updated:** January 2026
**For:** AuraPrep Guardian Email System v1.0
