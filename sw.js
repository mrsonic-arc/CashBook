// ── Cashonic Service Worker ──
// Caches the app shell so it loads offline.
// Change CACHE_VERSION whenever you deploy new code — this triggers auto-update.
const CACHE_VERSION = 'cashonic-v1';

// Files to cache for offline use
const STATIC_ASSETS = [
  '/',
  '/index.html',
  // Google Fonts (cached on first load)
  'https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=DM+Mono:wght@300;400;500&display=swap',
];

// ── INSTALL: cache app shell ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      // Take control immediately without waiting for old SW to die
      return self.skipWaiting();
    })
  );
});

// ── ACTIVATE: delete old caches ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_VERSION)
          .map(key => caches.delete(key))
      );
    }).then(() => {
      // Take control of all open pages immediately
      return self.clients.claim();
    })
  );
});

// ── FETCH: serve from cache, update in background ──
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Don't intercept Firebase API calls — let them go to network always
  // Firebase handles its own offline queueing
  if (
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('firebase.googleapis.com') ||
    url.hostname.includes('identitytoolkit.googleapis.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com')
  ) {
    // For Firebase JS SDK files from gstatic — cache them (they are versioned & stable)
    if (url.hostname.includes('gstatic.com') && request.method === 'GET') {
      event.respondWith(
        caches.match(request).then(cached => {
          if (cached) return cached;
          return fetch(request).then(response => {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then(cache => cache.put(request, clone));
            return response;
          }).catch(() => cached);
        })
      );
    }
    // All other Firebase/Google API calls go straight to network
    return;
  }

  // For HTML pages — Network First, fall back to cache
  if (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Update cache with fresh response
          const clone = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => {
          // Offline — serve from cache
          return caches.match(request).then(cached => cached || caches.match('/index.html'));
        })
    );
    return;
  }

  // For all other assets — Cache First, update in background (Stale-While-Revalidate)
  event.respondWith(
    caches.match(request).then(cached => {
      const networkFetch = fetch(request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(request, clone));
        }
        return response;
      }).catch(() => cached);

      // Return cache immediately if available, otherwise wait for network
      return cached || networkFetch;
    })
  );
});
