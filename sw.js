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
  event.notification.close(); // Close the notification immediately

  // 1. Get the URL from the payload (or default to root)
  const urlToOpen = event.notification.data.url || '/';

  // 2. Open the URL
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If the app is already open, focus it
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
