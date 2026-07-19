// AuraPrep Service Worker — iOS 16.4+ Web Push Support
// This file lives at /sw.js so it has root scope.

self.addEventListener('push', (event) => {
  let title = 'AuraPrep';
  let options = {
    body: 'You have a new notification!',
    icon: '/app-icon.png',
    badge: '/app-icon.png',
    vibrate: [100, 50, 100],
    data: { url: '/' },
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      title = payload.title || title;
      options.body = payload.body || options.body;
      options.data = { url: payload.url || '/' };
    } catch (_e) {
      // Plain text fallback
      options.body = event.data.text() || options.body;
    }
  }

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If the app is already open, focus it and navigate
      for (const client of windowClients) {
        if ('focus' in client) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      // Otherwise open a new window
      return clients.openWindow(targetUrl);
    })
  );
});

// Activate immediately — skip waiting for old SW to die
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});
