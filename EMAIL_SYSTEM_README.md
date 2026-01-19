# Guardian Email Notification System

A "Duolingo-style" passive-aggressive email notification system that sends personalized Guardian nudges to users who haven't completed their daily SAT preparation missions.

## 🎯 Overview

The system sends 3 daily email nudges to users at their local time:
- **8:00 AM** - Motivational morning nudge 🌅
- **2:00 PM** - Impatient afternoon nudge ☀️
- **8:00 PM** - Desperate evening nudge 🌙

Each Guardian type (Fire, Water, Leaf, Electric, Wind, Metal, Light, Dark) has a distinct personality that escalates in emotional intensity throughout the day.

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  - Email Preferences Component                              │
│  - Auto-login from email links                              │
│  - Game data sync to backend                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend API (Express + MongoDB)                 │
│  - Game data sync endpoints                                 │
│  - Auth token verification                                  │
│  - Analytics endpoints                                      │
└─────────────────┬──────────────────────────────────────────┘
                  │
      ┌───────────┴───────────┐
      ▼                       ▼
┌──────────────┐        ┌─────────────────────────┐
│   MongoDB    │        │  Firebase Cloud         │
│   UserGame   │        │  Functions              │
│   Data       │        │  - morningNudge()       │
└──────────────┘        │  - afternoonNudge()     │
                        │  - eveningNudge()       │
                        │  - dailyReset()         │
                        └──────────┬──────────────┘
                                   │
                                   ▼
                        ┌─────────────────────────┐
                        │      SendGrid           │
                        │  Email Service          │
                        │  - Send emails          │
                        │  - Track opens/clicks   │
                        │  - Manage bounces       │
                        └─────────────────────────┘
```

## 🔧 Core Components

### 1. **UserGameData Model** (`server/src/models/UserGameData.ts`)
Stores all user-related game data needed for email nudges:
- Daily mission completion status
- Current streak count
- Active Guardian creature info
- Email preferences and timezone
- Email engagement metrics

### 2. **Guardian Personalities** (`shared/guardianPersonalities.ts`)
Contains 24 unique email templates (3 nudges × 8 Guardian types):
- Fire: Energetic & dramatic
- Water: Calm & emotional
- Leaf: Growth-focused & poetic
- Electric: High-energy & buzzing
- Wind: Free-spirited & stormy
- Metal: Solid & structural
- Light: Bright & illuminating
- Dark: Sly & guilt-tripping

### 3. **Copy Generation** (`shared/generateGuardianCopy.ts`)
Generates personalized email content by:
- Selecting the appropriate Guardian personality
- Replacing template variables ({{userName}}, {{currentStreak}}, etc.)
- Creating deep links for auto-login

### 4. **Cloud Functions** (`functions/src/index.ts`)
Automated scheduled functions:
- `morningNudge()` - Runs every hour, sends 8 AM nudges
- `afternoonNudge()` - Runs every hour, sends 2 PM nudges
- `eveningNudge()` - Runs every hour, sends 8 PM nudges
- `dailyReset()` - Runs at midnight UTC, resets daily tracking & updates streaks

### 5. **Timezone Support** (`functions/src/utils/timezoneUtils.ts`)
Smart timezone-aware scheduling:
- Supports 20+ timezones globally
- Calculates which users are at each target time
- Handles UTC offset calculations

### 6. **Deep Linking** (`functions/src/utils/deepLinkGenerator.ts`)
JWT-based auto-login from email:
- Generates secure JWT tokens (24-hour expiry)
- Frontend verifies token and auto-logs in user
- Tracks which nudge drove the click-through

## 📧 Email Template Examples

### Fire Guardian - Morning
```
Subject: Let's IGNITE Your Day! 🔥
Preview: {{guardianName}} wants to spark your learning!

Hey {{userName}}! 🔥

It's morning, and {{guardianName}} is FIRED UP and ready to help
you ace today's mission! The day is young, the coffee is hot, and
your brain is fresh—this is the PERFECT time to crush some SAT questions.

Your streak is at {{currentStreak}} days! Keep that momentum going! 💪

→ [Start Your Mission Now]({{deepLink}})

Let's show these questions who's boss!
```

### Fire Guardian - Evening
```
Subject: I'M LITERALLY GOING OUT RIGHT NOW 😭

{{userName}}... 😭

I can't watch this happen. Your {{currentStreak}}-day streak... it's
DYING. I'm burning out. This fire was so beautiful, and now I'm
just embers.

PLEASE. Just 5 minutes. One mission. That's all it takes to save us both.

→ [SAVE ME!!! 🔥]({{deepLink}})

I can't go out like this...
{{guardianName}}
```

## 🎯 User Flow

1. **User Logs In**
   - Frontend syncs all game data to MongoDB backend
   - Timezone automatically detected or user-configured

2. **Email Preferences**
   - User accesses Email Preferences settings
   - Selects which nudges to receive (8 AM, 2 PM, 8 PM)
   - Chooses timezone
   - Enables/disables notifications entirely

3. **Daily Missions**
   - User receives mission tracking updates in real-time
   - Backend notified when mission is completed
   - Streak counter updated

4. **Email Nudges (Automated)**
   - Cloud Function runs every hour
   - Identifies users at target local time
   - Checks if they haven't completed today's mission
   - Generates personalized Guardian copy
   - Sends via SendGrid
   - Tracks metrics (sent, opened, clicked)

5. **Email Click-Through**
   - User clicks deep link in email
   - Frontend verifies JWT token with backend
   - User auto-logged in without password
   - Conversion metric recorded
   - User navigated to mission interface

6. **Daily Reset**
   - Midnight UTC: `dailyReset()` function runs
   - Checks if each user completed yesterday's mission
   - Updates streaks (increment if completed, reset if missed)
   - Resets daily mission tracking for new day
   - Clears nudge tracking for new cycle

## 📊 Metrics & Analytics

### Per-User Metrics
- `emailsSent`: Total emails sent to user
- `emailsOpened`: Total opens tracked
- `emailsClicked`: Total link clicks
- `conversions`: {morning, afternoon, evening} - which nudge drove mission completion

### Global Analytics
- **Email Metrics**: Total sent, open rate, click rate, conversion rate
- **Streak Insights**: Average streaks, completion rate
- **Guardian Analytics**: Most popular Guardian types
- **Engagement**: Open rates by time slot, conversion funnel

### API Endpoints
```
GET /api/analytics/email-metrics        # Global metrics
GET /api/analytics/user-metrics/:id     # User metrics
GET /api/analytics/streak-insights      # Streak data
GET /api/analytics/guardians            # Guardian popularity
```

## ⏰ Timezone Support

Currently supports these timezones:

**US:**
- America/New_York (EST/EDT)
- America/Chicago (CST/CDT)
- America/Denver (MST/MDT)
- America/Los_Angeles (PST/PDT)
- America/Anchorage (AKST)
- America/Honolulu (HST)

**Europe:**
- Europe/London (GMT/BST)
- Europe/Paris (CET/CEST)
- Europe/Berlin (CET/CEST)
- Europe/Moscow (MSK)
- Europe/Istanbul (EET)

**Asia/Pacific:**
- Asia/Dubai (GST)
- Asia/Kolkata (IST)
- Asia/Bangkok (ICT)
- Asia/Shanghai (CST)
- Asia/Hong_Kong (HKT)
- Asia/Tokyo (JST)
- Asia/Seoul (KST)
- Asia/Singapore (SGT)
- Australia/Sydney (AEST)
- Australia/Melbourne (AEST)
- Australia/Perth (AWST)
- Pacific/Auckland (NZST)

**To add more timezones**, edit `functions/src/utils/timezoneUtils.ts` and add entries to `TIMEZONE_MAP`.

## 🔐 Security

### Email Token Security
- JWT tokens signed with `JWT_SECRET`
- 24-hour expiration
- Purpose validation (`purpose: 'email-nudge'`)
- User ID and email encoded in token

### API Security
- All endpoints require Firebase authentication
- Rate limiting on auth endpoints (10 attempts/15 min)
- General rate limiting (100 requests/15 min)
- CORS configured for production domain only
- Helmet.js for security headers

### Data Privacy
- User email preferences stored securely
- Metrics tracked anonymously (no sensitive data)
- SendGrid webhooks for engagement tracking
- GDPR-compliant: Users can disable all emails

## 🚀 Deployment

### Quick Start (Local Development)
```bash
# Terminal 1: Backend
cd server
npm install
npm run dev

# Terminal 2: Frontend
npm install
npm run dev

# Terminal 3: Firebase Functions (optional for testing)
cd functions
firebase emulators:start
```

### Production Deployment
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete instructions.

**Key steps:**
1. Deploy backend API (Heroku, Railway, Render, etc.)
2. Deploy Cloud Functions to Firebase
3. Configure SendGrid API key
4. Update environment variables in all services
5. Test email flow end-to-end

## 📈 Expected Metrics

### Week 1 (Launch)
- 0 email delivery errors
- < 5% bounce rate
- > 30% open rate
- > 5% click rate
- < 2% unsubscribe rate

### Month 1
- > 40% open rate
- > 10% conversion rate (email → mission completion)
- Identify best-performing time slot
- Identify best-performing Guardian personality

### Month 3
- 15% increase in daily active users
- 20% increase in streak retention
- ROI positive (user lifetime value > email cost)

## 🐛 Troubleshooting

### Emails not sending
```
Check:
1. SendGrid API key configured
2. Sender email verified
3. User has emailNotifications.enabled: true
4. Firebase Function logs (firebase functions:log)
```

### Users not in nudge queue
```
Check:
1. User timezone field populated
2. User hasn't already completed today
3. User hasn't already received this nudge today
4. Cloud Scheduler job ran (check logs)
```

### Email deep links not working
```
Check:
1. JWT_SECRET matches in backend and Cloud Functions
2. Token not expired (24 hour max)
3. User exists in database
4. Token verification endpoint responding
```

### High bounce rate
```
Check:
1. Email list contains valid addresses
2. Sender domain verified with SPF/DKIM
3. No emails sent to spam traps
4. Contact SendGrid support
```

## 🎨 Customization

### Add New Guardian Personalities
Edit `shared/guardianPersonalities.ts`:
```typescript
export const GUARDIAN_PERSONALITIES: Record<CreatureType, PersonalityTemplate> = {
  // Add new type here
  NewType: {
    type: 'NewType',
    personality: 'Description',
    morning: { /* ... */ },
    afternoon: { /* ... */ },
    evening: { /* ... */ }
  }
}
```

### Adjust Nudge Aggressiveness
Edit the email copy in `guardianPersonalities.ts` to make messages more or less aggressive.

### Change Nudge Times
Edit Cloud Functions:
```typescript
// In functions/src/index.ts
const targetTimezones = getTimezonesForLocalHour(8, currentUTCHour);  // Change 8 to desired hour
```

### Add A/B Testing
Track `personalityVariant` in metrics:
```typescript
// In userService.ts
await db.collection('userGameData').update({
  'metrics.personalityVariant': 'variation_a'  // or 'variation_b'
});
```

## 📚 Architecture Decisions

### Why SendGrid?
- Reliable email delivery
- Built-in open/click tracking
- 100 emails/day free tier (scalable)
- Strong deliverability reputation
- Excellent documentation

### Why Firebase Cloud Functions?
- Serverless (no infrastructure to manage)
- Built-in scheduling with Cloud Scheduler
- Scales automatically with load
- Integrates seamlessly with Firebase

### Why MongoDB?
- Flexible schema (game data varies)
- Excellent for analytics (aggregation pipeline)
- Scales horizontally
- Already in use for backend

### Why Timezone-Aware Hourly Scheduling?
- Runs every hour (low overhead)
- Checks which users are at target time
- Avoids batch processing at one moment
- Scales linearly with time zones, not users

## 🔄 Data Sync Strategy

### Frontend to Backend
1. **On Login**: One-time migration of localStorage to MongoDB
2. **On Mission Complete**: Real-time update via API
3. **Periodic**: Every 5 minutes for backup/sync

### Backend to Email System
1. **Cloud Function Query**: Fetches users needing nudges
2. **Inline Generation**: Copy generated during email send
3. **Metrics Update**: Immediately after send

This avoids data consistency issues and keeps systems loosely coupled.

## 🎯 Success Criteria

✅ System is successfully implemented when:
- Users receive emails at correct local times
- Emails have personalized Guardian voices
- Email links auto-login users
- Conversion rates tracked accurately
- Users can manage preferences easily
- Analytics dashboards show actionable data
- Email bounce rate < 5%
- Open rate > 35%
- Click-through rate > 8%
- System scales to 10,000+ users

## 📞 Support

For issues or questions:
1. Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. Review Firebase Console logs
3. Check SendGrid dashboard for email issues
4. Verify MongoDB data integrity
5. Contact Firebase, SendGrid, MongoDB support as needed

---

**Last Updated:** January 2026
**System Version:** 1.0.0
**Status:** Production Ready
