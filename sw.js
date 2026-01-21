self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    event.waitUntil(
        self.registration.showNotification(data.title || 'Notification', {
            body: data.body || '',
            icon: '/icon.png',
            data: data
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const payload = event.notification.data;
    const targetUrl = payload.url;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // 1. If App is open, send message to redirect immediately
            for (const client of clientList) {
                if (client.url.includes(self.registration.scope) && 'focus' in client) {
                    client.postMessage({ type: 'NOTIFICATION_CLICK', payload: payload });
                    return client.focus();
                }
            }

            // 2. If App is closed, launch it with the redirect param
            if (clients.openWindow) {
                const baseUrl = self.registration.scope;
                if (targetUrl) {
                    return clients.openWindow(`${baseUrl}?redirect=${encodeURIComponent(targetUrl)}`);
                }
                // Just open normally if no URL
                return clients.openWindow(baseUrl);
            }
        })
    );
});