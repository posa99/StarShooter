/**
 * Service Worker for Space Shooter PWA
 * Enables offline play and app caching
 */

const CACHE_NAME = 'spaceshooter-v1';
const URLS_TO_CACHE = [
    './',
    './index.html',
    './css/style.css',
    './js/utils.js',
    './js/bullet.js',
    './js/enemy.js',
    './js/player.js',
    './js/game.js',
    './manifest.json'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching assets');
                return cache.addAll(URLS_TO_CACHE);
            })
            .catch((error) => {
                console.log('Service Worker: Cache error:', error);
            })
    );
    
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                return fetch(event.request)
                    .then((response) => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        // Cache the fetched response for future use
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Return offline page if needed
                        return new Response('Offline - Please reconnect to load new content', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

// Background sync for analytics (if needed in future)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-scores') {
        event.waitUntil(
            // Implement score syncing logic here
            Promise.resolve()
        );
    }
});

// Push notifications (optional for future updates)
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const options = {
        body: data.body || 'Space Shooter - A new challenge awaits!',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%231a1a1a" width="192" height="192"/><circle cx="96" cy="96" r="60" fill="%2300d4ff"/><polygon points="96,50 110,90 96,100 82,90" fill="%23ff006e"/></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect fill="%231a1a1a" width="96" height="96"/><circle cx="48" cy="48" r="30" fill="%2300d4ff"/><polygon points="48,30 60,45 48,55 36,45" fill="%23ff006e"/></svg>',
        tag: 'spaceshooter-notification'
    };

    event.waitUntil(
        self.registration.showNotification('Space Shooter', options)
    );
});
