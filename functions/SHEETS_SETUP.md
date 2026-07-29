# Live Google Sheet setup — daily stats export

`exportDailyStatsToSheet` (functions/src/dailyStatsExport.ts) runs at **8am and 8pm
America/New_York** and writes one row per active user per day — logins (with
timestamps), missions completed, practice questions answered, summons, and
boss fights — into a Google Sheet you own. It reads from the
`users_game_data/{uid}/dailyStats/{date}` docs the app already writes as
those events happen; the function only republishes them, it never invents
numbers.

No exported service-account key is needed — the function authenticates as
its own Cloud Functions runtime identity.

## Already done for you

- **The Sheet exists**: created via your connected Google Drive account.
  **https://docs.google.com/spreadsheets/d/1j6Uh6eX0QKQPGA3EuSVXcMM7hHAFhwlIb4bZOw1RAno/edit**
  (owner: maxidea2008@gmail.com, titled "AuraPrep Daily Stats")
- Its ID is already filled into `functions/.env` as `SHEETS_SPREADSHEET_ID`.
- The export code writes to whatever the first tab is named (no rename
  needed), and creates the header row itself on first run.

I don't have a browser-automation tool in this environment, so the two
steps below need a Google/GCP console click from you — I can't do them for
you. Everything else (code, Firestore rules/index, the Sheet itself) is
already in place.

## 1. Share the Sheet with the function's identity

Open the Sheet above, click **Share**, and add this email as **Editor**:

```
auraprep-da99c@appspot.gserviceaccount.com
```

That's the default runtime service account for this Firebase project's
Cloud Functions. Without this step the export will fail with a permission
error every run.

## 2. Enable the Google Sheets API

Open this link (project is pre-filled) and click **Enable**:
https://console.cloud.google.com/apis/library/sheets.googleapis.com?project=auraprep-da99c

## 3. Confirm the Blaze (pay-as-you-go) plan

Scheduled functions run on Cloud Scheduler, which isn't available on the
free Spark plan. If this project is still on Spark, upgrade it in the
[Firebase console](https://console.firebase.google.com/project/auraprep-da99c/usage/details)
first — the free tier's monthly quota comfortably covers 2 runs/day.

## 4. Deploy

```bash
firebase deploy --only functions:exportDailyStatsToSheet,firestore:rules,firestore:indexes
```

The Firestore index deploy may take a few minutes to finish building on
Google's side before the function's first run can query across all users'
`dailyStats` subcollections — check progress in the
[Firestore indexes console](https://console.firebase.google.com/project/auraprep-da99c/firestore/indexes).

## 5. Test it without waiting for 8am/8pm

In the [Cloud Scheduler console](https://console.cloud.google.com/cloudscheduler?project=auraprep-da99c),
find the job named `firebase-schedule-exportDailyStatsToSheet-...` and click
**Run now**. Then check the log or the Sheet itself:

```bash
firebase functions:log --only exportDailyStatsToSheet
```

If a row doesn't show up, the most common cause is step 1 (sharing) not
done yet, or the Sheets API (step 2) not enabled — both show up as an
error in the log above.
