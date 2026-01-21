self.addEventListener('install', (event) => {
    self.skipWaiting(); // Forces new updates to apply immediately
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};

    event.waitUntil(
        self.registration.showNotification(data.title || 'New Notification', {
            body: data.body || '',
            icon: '/icon.png', // Ensure this path matches your repo structure
            data: data
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const payload = event.notification.data;

    // 1. Determine if we need to redirect or just open the app
    // If 'url' is present in payload, we redirect. Otherwise just open dashboard.
    const targetUrl = payload.url;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Check if app is already open
            for (const client of clientList) {
                if (client.url.includes(self.registration.scope) && 'focus' in client) {
                    // Send the data to the open window to display it
                    client.postMessage({ type: 'NOTIFICATION_CLICK', payload: payload });
                    return client.focus();
                }
            }

            // If app is closed, open it. 
            // We pass the data as a query param so the page can read it on load.
            if (clients.openWindow) {
                const baseUrl = self.registration.scope;
                // If there is a redirect URL, append it
                if (targetUrl) {
                    return clients.openWindow(`${baseUrl}?redirect=${encodeURIComponent(targetUrl)}`);
                }
                // Otherwise just append the data for display
                const dataStr = encodeURIComponent(JSON.stringify(payload));
                return clients.openWindow(`${baseUrl}?last_notification=${dataStr}`);
            }
        })
    );
});