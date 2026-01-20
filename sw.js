self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'New Notification', {
      body: data.body || '',
      icon: '/icon.png',
      // CRITICAL: We pass the entire data object here so 'notificationclick' can read it
      data: data 
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 1. If the app is already open, tell it to redirect
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          client.postMessage({ action: 'navigate', url: targetUrl });
          return client.focus();
        }
      }

      // 2. If app is closed, open it with the URL as a "redirect" parameter
      // IMPORTANT: Adjust the path below if your repo name is different
      if (clients.openWindow) {
        const newUrl = self.registration.scope + "?redirect=" + encodeURIComponent(targetUrl);
        return clients.openWindow(newUrl);
      }
    })
  );
});

