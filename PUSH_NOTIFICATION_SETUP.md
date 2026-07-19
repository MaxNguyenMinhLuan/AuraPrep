# Web Push setup and iPhone/iPad verification

AuraPrep uses the standard Push API, Service Workers, Notifications API, and VAPID. It does not use Firebase Cloud Messaging or an Apple Developer Program certificate.

## Required production configuration

Set these values on the deployed API service (not in the frontend bundle):

```text
VAPID_PUBLIC_KEY=<generated VAPID public key>
VAPID_PRIVATE_KEY=<generated VAPID private key>
VAPID_CONTACT_EMAIL=mailto:notifications@auraprep.academy
APP_URL=https://auraprep.academy
CORS_ORIGIN=https://auraprep.academy,https://auraprep.web.app
```

Generate a single key pair and keep it stable. Replacing either VAPID key invalidates existing subscriptions.

```bash
cd server
npx web-push generate-vapid-keys --json
```

The public key is fetched from `GET /api/push/config`; do **not** place the private key or a `VITE_VAPID_*` value in the frontend.

## iOS and iPadOS 16.4+

1. Serve AuraPrep over HTTPS with its manifest and `/sw.js` available from the same origin.
2. In Safari, visit AuraPrep and choose **Share → Add to Home Screen**.
3. Launch AuraPrep from the new Home Screen icon. It must run as the installed web app, not in a Safari tab.
4. Sign in, then tap **Allow notifications**. This user action opens the iOS-native Allow / Don’t Allow prompt.
5. Choose **Allow**. AuraPrep saves the browser subscription to the API and immediately sends a test push.
6. Return to the Home Screen or lock the device. The test notification and later reminders should appear as normal iOS notifications.

The web page cannot open iOS Settings or show Apple’s permission dialog on its own. A visible app button is still needed solely to provide the intentional tap that iOS requires before `Notification.requestPermission()` can open the native system dialog.

## Troubleshooting

- If the app says to add AuraPrep to the Home Screen, repeat steps 2–3. iOS does not allow Web Push permission from an ordinary Safari tab.
- If the permission was denied, re-enable AuraPrep in **Settings → Notifications** on the device.
- If the button reports that notifications are temporarily unavailable, check `GET /api/push/config`; it must return `data.enabled: true` with a public key.
- If the test notification cannot be delivered, inspect the API logs for VAPID errors and confirm the API is deployed with the variables above.
