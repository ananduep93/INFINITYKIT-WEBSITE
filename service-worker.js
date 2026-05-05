const CACHE_NAME = 'infinity-kit-v1.0';
const CORE_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './app.css',
    './auth-ui.js',
    './auth.js',
    './expense-tracker.js',
    './firebase-config.js',
    './main.js',
    './notifications.js',
    './shared-tool.js',
    './survey-hub.js',
    './sync.js',
    './updates-popup.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys
                .filter((key) => key !== CACHE_NAME)
                .map((key) => caches.delete(key))
        )).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') {
        return;
    }

    const requestUrl = new URL(event.request.url);
    
    // Bypass cache for version.json and other configuration files
    if (requestUrl.pathname.endsWith('version.json') || requestUrl.pathname.endsWith('firebase-config.js')) {
        event.respondWith(fetch(event.request));
        return;
    }

    if (requestUrl.origin !== self.location.origin) {
        return;
    }

    if (event.request.mode === 'navigate') {
        // Force network for navigation to ensure the latest HTML is fetched
        event.respondWith(
            fetch(event.request, { cache: 'no-store' })
                .then((networkResponse) => {
                    if (networkResponse.status === 200) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => {
                    // Fallback to cache if network fails
                    return caches.match(event.request).then((cachedPage) => {
                        return cachedPage || caches.match('./index.html');
                    });
                })
        );
        return;
    }


    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request).then((networkResponse) => {
                // Only cache successful GET responses
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }

                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return networkResponse;
            }).catch(() => caches.match('./'));
        })
    );
});

// Handle messages from the client
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});


// Notifications API handlers
self.addEventListener('notificationclick', (event) => {
    const action = event.action;
    const notification = event.notification;
    const data = notification.data;

    event.notification.close();

    if (action === 'snooze') {
        // Since we can't easily wait/reschedule from SW without main thread or IDB access
        // We'll tell the clients to reschedule if any are open
        event.waitUntil(
            self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
                if (clients.length > 0) {
                    clients[0].postMessage({ type: 'SNOOZE_ALERT', data: data });
                }
            })
        );
    } else if (action === 'done') {
        // Just closed it
    } else {
        // Default click: focus the app
        event.waitUntil(
            self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
                for (const client of clients) {
                    if (client.url.includes('/') && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (self.clients.openWindow) {
                    return self.clients.openWindow('./');
                }
            })
        );
    }
});
