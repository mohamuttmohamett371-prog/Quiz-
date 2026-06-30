/* ==========================================================================
   Quiz App — Service Worker
   Handles caching, offline support, cache versioning, and background sync.
   ========================================================================== */

const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `quiz-app-static-${CACHE_VERSION}`;
const DATA_CACHE = `quiz-app-data-${CACHE_VERSION}`;
const RUNTIME_CACHE = `quiz-app-runtime-${CACHE_VERSION}`;

const OFFLINE_URL = './offline.html';

/* Core files required for the app shell to work fully offline */
const CORE_ASSETS = [
  './',
  './index.html',
  './offline.html',
  './manifest.json',
  './css/style.css',
  './css/dark.css',
  './css/light.css',
  './css/animation.css',
  './js/app.js',
  './js/quiz.js',
  './js/settings.js',
  './js/rewards.js',
  './js/profile.js',
  './js/storage.js',
  './js/animations.js',
  './js/router.js',
  './js/register-sw.js',
  './data/questions.json',
  './data/stories.json',
  './data/rewards.json',
  './assets/icons/icon-16.png',
  './assets/icons/icon-32.png',
  './assets/icons/icon-72.png',
  './assets/icons/icon-96.png',
  './assets/icons/icon-128.png',
  './assets/icons/icon-144.png',
  './assets/icons/icon-152.png',
  './assets/icons/icon-180.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-256.png',
  './assets/icons/icon-384.png',
  './assets/icons/icon-512.png',
  './assets/logo/logo.svg'
];

/* ---------------------------------------------------------------------- */
/* INSTALL — pre-cache the app shell                                      */
/* ---------------------------------------------------------------------- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* ---------------------------------------------------------------------- */
/* ACTIVATE — remove old cache versions                                   */
/* ---------------------------------------------------------------------- */
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE, DATA_CACHE, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((name) => name.startsWith('quiz-app-') && !currentCaches.includes(name))
          .map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

/* ---------------------------------------------------------------------- */
/* FETCH — routing strategy                                               */
/* ---------------------------------------------------------------------- */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Navigation requests (HTML pages) -> network first, fallback to cache, then offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match(OFFLINE_URL)))
    );
    return;
  }

  // JSON data files -> stale-while-revalidate
  if (url.pathname.endsWith('.json')) {
    event.respondWith(
      caches.open(DATA_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const networkFetch = fetch(request)
            .then((response) => {
              cache.put(request, response.clone());
              return response;
            })
            .catch(() => cached);
          return cached || networkFetch;
        })
      )
    );
    return;
  }

  // Static assets (css/js/images/fonts) -> cache first, fallback to network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type !== 'opaque') {
            const copy = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(OFFLINE_URL));
    })
  );
});

/* ---------------------------------------------------------------------- */
/* MESSAGE — allow page to trigger immediate activation of new SW         */
/* ---------------------------------------------------------------------- */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/* ---------------------------------------------------------------------- */
/* BACKGROUND SYNC — ready for future use (e.g. syncing scores to a server)*/
/* ---------------------------------------------------------------------- */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-quiz-progress') {
    event.waitUntil(
      Promise.resolve().then(() => {
        // Placeholder hook: when a backend exists, read queued results
        // from IndexedDB/localStorage and POST them here.
        console.log('[ServiceWorker] Background sync triggered: sync-quiz-progress');
      })
    );
  }
});

/* ---------------------------------------------------------------------- */
/* PUSH NOTIFICATIONS — ready to enable later                             */
/* ---------------------------------------------------------------------- */
self.addEventListener('push', (event) => {
  let data = { title: 'Quiz App', body: 'You have a new notification!' };
  if (event.data) {
    try { data = event.data.json(); } catch (e) { data.body = event.data.text(); }
  }
  const options = {
    body: data.body,
    icon: './assets/icons/icon-192.png',
    badge: './assets/icons/icon-96.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || './index.html' }
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || './index.html';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
