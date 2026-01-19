# Analytics Layer - Deployment Checklist

**For:** DevOps Engineers, Release Management
**Date:** January 2026
**Status:** Ready for Production

---

## Pre-Deployment: Requirements Verification

### MongoDB Setup
- [ ] MongoDB Atlas cluster created (M0 free or higher)
- [ ] Network whitelist configured (allow server IP)
- [ ] Database name set: `auraprep`
- [ ] Backup enabled (Atlas automatic backups)
- [ ] Connection string available

### npm Dependencies
```bash
# Required packages to install
npm install node-cron json2csv uuid
```

- [ ] `node-cron@3.0.3+` - Cron job scheduling
- [ ] `json2csv@6.0.0+` - CSV export utility
- [ ] `uuid@9.0.0+` - Anonymous ID generation

### Environment Variables
Create `server/.env`:
```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/auraprep

# Server
NODE_ENV=production
PORT=5000

# Firebase (if using auth)
FIREBASE_PROJECT_ID=your-project
FIREBASE_PRIVATE_KEY=your-key
FIREBASE_CLIENT_EMAIL=your-email

# CORS
CORS_ORIGIN=https://auraprep.com
```

- [ ] All vars configured
- [ ] Secrets not committed to git
- [ ] Database connection verified: `npm run test:db`

---

## Deployment Phase 1: Backend Deployment

### 1.1 Build Backend
```bash
cd server
npm install
npm run build
```

- [ ] Build completes without errors
- [ ] Check `server/dist` folder created
- [ ] TypeScript compilation successful

### 1.2 Deploy to Hosting
Choose one:

**Option A: Heroku**
```bash
heroku login
git push heroku main
heroku logs --tail
```
- [ ] Deploy successful
- [ ] Health check passes: `curl https://api.auraprep.com/api/health`

**Option B: Railway/Render**
```bash
# Follow platform-specific deployment instructions
# Ensure environment variables configured in dashboard
```
- [ ] Deploy successful
- [ ] Logs viewable in dashboard

**Option C: Docker/Kubernetes**
```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install && npm run build
CMD ["npm", "start"]
```
- [ ] Dockerfile tested locally
- [ ] Container image builds successfully
- [ ] Deployed to cluster

### 1.3 Verify Backend Health
```bash
curl https://api.auraprep.com/api/health
# Expected: {"status":"ok","timestamp":"...","environment":"production"}
```

- [ ] Health endpoint returns 200 OK
- [ ] Server responding to requests
- [ ] Logs show no errors

---

## Deployment Phase 2: Database Setup

### 2.1 Create MongoDB Indexes

**Run in MongoDB shell or Atlas GUI:**

```javascript
// Switch to auraprep database
use auraprep

// UserMetrics indexes
db.usermetrics.createIndex({userId: 1}, {unique: true})
db.usermetrics.createIndex({lastActivityDate: 1})
db.usermetrics.createIndex({createdAt: 1})

// PerformanceLog indexes (with TTL)
db.performancelogs.createIndex({userId: 1, timestamp: -1})
db.performancelogs.createIndex({subtopicId: 1, timestamp: -1})
db.performancelogs.createIndex({timestamp: 1}, {expireAfterSeconds: 31536000})

// SubtopicMetrics indexes
db.subtopicmetrics.createIndex({userId: 1, subtopicId: 1}, {unique: true})
db.subtopicmetrics.createIndex({isAbovePercentile25: 1})

// EngagementEvent indexes (with TTL)
db.engagementevents.createIndex({userId: 1, eventType: 1, timestamp: -1})
db.engagementevents.createIndex({eventType: 1, timestamp: -1})
db.engagementevents.createIndex({timestamp: 1}, {expireAfterSeconds: 15552000})

// DailyCohortMetrics indexes
db.dailycohortmetrics.createIndex({date: 1}, {unique: true})

// SentimentLog indexes
db.sentimentlogs.createIndex({userId: 1, timestamp: -1})
```

**Verification:**
```javascript
// Verify all indexes created
db.usermetrics.getIndexes()           // Should show ~3 indexes
db.performancelogs.getIndexes()       // Should show ~3 indexes (with TTL)
db.engagementevents.getIndexes()      // Should show ~3 indexes (with TTL)
db.dailycohortmetrics.getIndexes()    // Should show ~1 index
```

- [ ] All indexes created successfully
- [ ] TTL indexes verified in `MongoDB Atlas → Collections → Index Management`
- [ ] No index creation errors

### 2.2 Verify TTL Index Configuration

In MongoDB Atlas:

1. Go to `Collections` tab
2. Select `performancelogs` collection
3. Click `Index Management`
4. Find index with `expireAfterSeconds: 31536000`
5. Verify TTL job running

Expected behavior:
- Documents older than 365 days auto-deleted
- MongoDB runs cleanup every 60 seconds
- Check: `db.performancelogs.countDocuments()` should stabilize after 1 year

- [ ] TTL indexes verified in Atlas UI
- [ ] Auto-cleanup enabled for all TTL indexes
- [ ] Understood retention policy

---

## Deployment Phase 3: Verify Analytics System

### 3.1 Test Database Connection

```bash
cd server
npm run test:db
# Expected: "✓ MongoDB connection successful"
```

- [ ] Database connection successful
- [ ] Collections created automatically by Mongoose

### 3.2 Start Server and Verify Cron Jobs

```bash
npm start
# Look for these logs:
# ✓ Connected to MongoDB
# ✓ Initializing analytics cron jobs...
# ✓ Scheduled daily aggregation at 00:00 UTC
# ✓ All analytics cron jobs initialized
```

Wait 2 minutes, check logs:
```bash
# Should see no errors in initialization
grep -i "error\|failed" server.log
# Result should be empty
```

- [ ] Server starts without errors
- [ ] All cron jobs initialized
- [ ] No error messages in logs

### 3.3 Test API Endpoints

**Test dashboard endpoint:**
```bash
curl https://api.auraprep.com/api/analytics/dashboard/overview

# Expected response:
# {
#   "success": true,
#   "data": {
#     "totalUsers": 0,
#     "activeUsers": 0,
#     "dau": 0,
#     ...
#   }
# }
```

- [ ] Returns 200 OK
- [ ] Response includes all metrics
- [ ] No 5xx errors

**Test export endpoint:**
```bash
curl "https://api.auraprep.com/api/analytics/export/dashboard-metrics?format=json"

# Expected: JSON with exportDate and metrics
# Expected size: 500-1000 bytes (initially)
```

- [ ] JSON export works
- [ ] CSV export works: `?format=csv`
- [ ] Both formats valid

### 3.4 Test Privacy Utilities

```bash
node -e "
const {validateAnonymization} = require('./dist/utils/privacy');
const data = {anonymousUserId: 'user-abc', metrics: 100};
console.log(validateAnonymization(data));
// Should print: {isAnonymized: true, issues: []}
"
```

- [ ] Privacy validation successful
- [ ] No sensitive data detected

---

## Deployment Phase 4: Cron Job Verification

### 4.1 Monitor First Daily Aggregation

**Setup:**
1. Deploy around 23:50 UTC (10 min before midnight)
2. Wait for cron to execute
3. Monitor logs at 00:00-00:10 UTC

**Expected logs at 00:00 UTC:**
```
[2026-01-19T00:00:00Z] Starting daily aggregation...
✓ Daily cohort metrics calculated
✓ Batch user metrics updated
✓ Retention cohorts calculated
✅ Daily aggregation completed successfully in 2.45s
```

- [ ] Aggregation runs at midnight UTC
- [ ] Completes within 5 minutes
- [ ] No errors in process
- [ ] Check MongoDB for new `dailycohortmetrics` document

**Query to verify:**
```javascript
db.dailycohortmetrics.find().sort({date: -1}).limit(1)
// Should show document with today's date
```

### 4.2 Verify Other Cron Jobs

| Job | Time | Log Pattern | Check |
|-----|------|-------------|-------|
| Daily Aggregation | 00:00 UTC | "Daily aggregation completed" | ✓ Runs daily |
| Hourly Nudge | Every hour | "Hourly nudge metrics" | ✓ Runs hourly |
| Weekly Retention | Sun 02:00 UTC | "Weekly retention analysis" | ✓ Runs weekly |
| Monthly Report | 1st 03:00 UTC | "Monthly investor report" | ✓ Runs monthly |

- [ ] Daily job runs at 00:00 UTC
- [ ] Hourly job runs at top of each hour
- [ ] All jobs complete without errors

### 4.3 Graceful Shutdown Test

```bash
# Send SIGTERM signal
kill -TERM $(pgrep -f "npm start")

# Expected in logs:
# Shutting down gracefully...
# ✓ All cron jobs stopped
# MongoDB connection closed
```

- [ ] Server shuts down gracefully
- [ ] Cron jobs stopped cleanly
- [ ] No orphaned processes

---

## Deployment Phase 5: Monitoring Setup

### 5.1 Configure Log Monitoring

**For any platform:**
```bash
# Tail logs in real-time
tail -f /var/log/auraprep/server.log

# Search for errors
grep "ERROR\|error\|failed" /var/log/auraprep/server.log

# Monitor cron execution
grep "aggregation\|cron\|job" /var/log/auraprep/server.log
```

- [ ] Log monitoring configured
- [ ] Error alerts setup
- [ ] Can view logs in real-time

### 5.2 MongoDB Monitoring

In MongoDB Atlas:
1. Go to `Monitoring` tab
2. Check `Operations/Sec` graph
3. Check `Network I/O` graph
4. Setup alert: Replica set election

- [ ] Performance metrics visible
- [ ] Can identify slow queries with `Atlas → Activity`
- [ ] Alerts configured for:
  - [ ] High memory usage
  - [ ] Many connections
  - [ ] Replication lag (if applicable)

### 5.3 API Monitoring

Setup HTTP monitoring (e.g., Pingdom, Uptime Robot):
```
Endpoint: https://api.auraprep.com/api/health
Interval: Every 5 minutes
Alert on: 5xx responses or timeout
```

- [ ] Health check monitoring active
- [ ] Alert configured
- [ ] Test alert: curl with bad endpoint

---

## Deployment Phase 6: Load Testing

### 6.1 Simulate Analytics Load

```bash
# Generate 100 test documents in each collection
for i in {1..100}; do
  curl -X POST https://api.auraprep.com/api/analytics/... \
    -H "Content-Type: application/json" \
    -d "{...}"
done
```

- [ ] Can handle 100+ concurrent requests
- [ ] No timeouts
- [ ] Error rate < 1%

### 6.2 Verify Query Performance

```bash
# Test dashboard endpoint response time
time curl https://api.auraprep.com/api/analytics/dashboard/overview

# Expected: < 500ms
# Actual time: _____ ms
```

- [ ] Response time acceptable (< 1000ms)
- [ ] Consistent across multiple requests
- [ ] No degradation under load

---

## Post-Deployment: Verification Checklist

### Immediate (First Hour)
- [ ] Server running without errors
- [ ] All API endpoints responding
- [ ] Cron jobs initialized
- [ ] MongoDB connection stable
- [ ] Logs accessible and clean

### 24 Hours
- [ ] First daily aggregation completed
- [ ] New DailyCohortMetrics document created
- [ ] No errors in logs
- [ ] Query performance acceptable
- [ ] Backups running

### 1 Week
- [ ] All 4 cron jobs executed successfully
- [ ] TTL cleanup running (if any data was old enough)
- [ ] No slow queries in logs
- [ ] Performance metrics stable
- [ ] Error rate: 0%

---

## Rollback Plan

If critical issues occur, rollback procedure:

### Step 1: Stop Current Version
```bash
kubectl delete deployment auraprep-api  # K8s example
# OR
heroku scale web=0  # Heroku example
```

### Step 2: Restore Previous Version
```bash
git revert <commit-hash>
npm run build
npm start
```

### Step 3: Verify Rollback
```bash
curl https://api.auraprep.com/api/health
# Should return old version info
```

### Step 4: Investigate Issue
- [ ] Check logs for error patterns
- [ ] Verify MongoDB indexes
- [ ] Check for out-of-memory issues
- [ ] Review recent code changes

**Rollback decision:**
- Issues with cron jobs: Disable scheduler, rollback not required
- Issues with database: Check indexes and connections
- Issues with API: Check error logs for specific endpoint
- Critical issues: Execute full rollback

---

## Success Criteria

✅ Analytics layer is successfully deployed when:

- [ ] Backend deployed and healthy
- [ ] MongoDB indexes created
- [ ] First daily aggregation executed
- [ ] All 4 cron jobs running
- [ ] API endpoints responding
- [ ] Export functionality working
- [ ] Privacy validation passing
- [ ] No errors in logs (24 hours)
- [ ] Performance targets met:
  - [ ] Dashboard queries < 500ms
  - [ ] Aggregation < 5 minutes
  - [ ] TTL cleanup working
- [ ] Monitoring configured
- [ ] Team trained on system

---

## Support Resources

### In Case of Issues

| Issue | Resource | Action |
|-------|----------|--------|
| MongoDB error | MongoDB Atlas UI | Check connection, indexes |
| Cron not running | Server logs | Verify job initialization |
| Slow queries | MongoDB profiling | Add missing indexes |
| Privacy concerns | Privacy utility tests | Run validation function |

### Contact
- **MongoDB Support:** https://support.mongodb.com/
- **DevOps Team:** `#devops` Slack channel
- **Database Team:** `#database` Slack channel

---

## Handoff Documentation

**Give to Operations Team:**

1. **How to monitor:**
   - Check server logs daily
   - Monitor MongoDB disk usage
   - Verify cron execution at key times

2. **How to troubleshoot:**
   - Refer to "Common Issues" section
   - Check logs first
   - Run manual aggregation if needed

3. **How to scale:**
   - Increase MongoDB instance if > 80% CPU
   - Archive old PerformanceLogs to cold storage
   - Consider read replicas for query load

4. **How to update:**
   - Pull latest code: `git pull origin main`
   - Run `npm install` (if dependencies changed)
   - Run `npm run build`
   - Deploy normally (no special steps for analytics)

---

## Final Sign-Off

**Backend Team Lead:** _________________ Date: _______

**DevOps Engineer:** _________________ Date: _______

**Product Manager:** _________________ Date: _______

**QA Lead:** _________________ Date: _______

---

**Deployment Date:** _______________
**Deployed By:** _______________
**Notes:** _______________

---

**Production Status:** ✅ LIVE
**Last Verified:** January 2026
**Next Review:** 1 month after deployment
