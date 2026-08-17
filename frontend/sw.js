// Finora Production Service Worker (v2.0.0)
const CACHE_NAME = 'finora-shell-v2.0.0';

const STATIC_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/css/style.css',
  '/js/app.js',
  '/js/api.js',
  '/js/auth.js',
  '/js/currency.js',
  '/js/views/authView.js',
  '/js/views/dashboardView.js',
  '/js/views/transactionsView.js',
  '/js/views/categoriesView.js',
  '/js/views/profileView.js',
  '/js/views/landingView.js',
  '/js/views/legalView.js',
  '/js/views/pulseView.js',
  '/js/views/accountsView.js',
  '/js/views/budgetsView.js',
  '/js/views/insightsView.js',
  '/js/views/goalsView.js',
  '/js/views/reportsView.js',
  '/js/components/transactionModal.js',
  '/js/components/manageFavoritesModal.js',
  '/assets/favicon.png',
  '/assets/favicon.ico',
  '/assets/apple-touch-icon.png',
  '/assets/logo.png',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/icon-maskable-192.png',
  '/assets/icon-maskable-512.png'
];

// 1. Install Event: Pre-cache Static Application Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_SHELL_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Some shell assets failed to pre-cache:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Clean Up Stale Old Cache Stores
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName.startsWith('finora-shell-')) {
            console.log('[ServiceWorker] Removing old cache store:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Strict Isolation for API vs Static Shell
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // CRITICAL SECURITY RULE: NEVER cache REST API requests or non-GET methods
  if (url.pathname.includes('/api/') || req.method !== 'GET') {
    return; // Pass through directly to Network
  }

  // Pass through third-party cross-origin requests (e.g., Google Fonts, external CDNs)
  if (url.origin !== self.location.origin) {
    return;
  }

  // Stale-While-Revalidate Strategy for Static Shell Assets
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      const fetchPromise = fetch(req).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback to cache if network fails
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
