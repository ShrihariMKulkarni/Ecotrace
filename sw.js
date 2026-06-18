/* ═══════════════════════════════════════════════════════════
   EcoTrace — Service Worker
   Offline-first caching strategy
   ═══════════════════════════════════════════════════════════ */

const CACHE_NAME = 'ecotrace-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/design-system.css',
  '/css/components.css',
  '/css/views.css',
  '/js/utils/storage.js',
  '/js/utils/formatter.js',
  '/js/utils/calculator.js',
  '/js/data/emission-factors.js',
  '/js/data/challenges.js',
  '/js/models/user-profile.js',
  '/js/models/activity-log.js',
  '/js/models/achievements.js',
  '/js/components/charts.js',
  '/js/components/animations.js',
  '/js/views/onboarding.js',
  '/js/views/dashboard.js',
  '/js/views/tracker.js',
  '/js/views/insights.js',
  '/js/views/challenges.js',
  '/js/views/learn.js',
  '/js/app.js',
];

// Install — cache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch — cache-first strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip external resources (fonts, etc.)
  if (!event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) {
          // Return cached, but also update cache in background
          fetch(event.request).then(response => {
            if (response.ok) {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, response);
              });
            }
          }).catch(() => {});
          return cached;
        }
        
        // Not cached — fetch and cache
        return fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, clone);
            });
          }
          return response;
        });
      })
  );
});
