const CACHE_NAME = 'attendance-app-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json'
];

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache).catch(err => {
                console.log('Cache addAll error:', err);
            });
        })
    );
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', event => {
    // For API calls, use network first with cache fallback
    if (event.request.url.includes('script.google.com')) {
        event.respondWith(
            fetch(event.request).catch(() => {
                return new Response(
                    JSON.stringify({ offline: true }),
                    { headers: { 'Content-Type': 'application/json' } }
                );
            })
        );
    } else {
        // For everything else, use cache first with network fallback
        event.respondWith(
            caches.match(event.request).then(response => {
                return response || fetch(event.request).then(response => {
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, response.clone());
                        return response;
                    });
                });
            }).catch(() => {
                return new Response('Offline - Please check your connection');
            })
        );
    }
});
