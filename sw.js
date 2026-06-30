const CACHE_VERSION = 'v4';
const CACHE_NAME = `vanta-sarukulu-${CACHE_VERSION}`;

// Local shell assets - these must succeed, or the app genuinely can't work offline.
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Remote assets that are nice to have cached but shouldn't block install if
// the CDN happens to be slow or unreachable at install time.
const OPTIONAL_ASSETS = [
  'https://i.postimg.cc/kXGhXSwf/Vanga_Satyanarayana_వ_ట_మ_స_త_ర_LOGO_1_1.png'
];

// Install Event - caches the shell. Bumping CACHE_VERSION on future deploys
// is what lets the activate handler below clean up the old version.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(CORE_ASSETS);

      await Promise.all(
        OPTIONAL_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('ServiceWorker: optional asset failed to cache:', url, err);
          })
        )
      );
    })
  );
  // Don't wait for every open tab to close before this version takes over.
  self.skipWaiting();
});

// Activate Event - removes caches from any previous version of this app.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  // Take control of any already-open tabs immediately, instead of only
  // affecting the next full page load.
  self.clients.claim();
});

// Fetch Event - network-first, cache fallback when offline.
// Successful responses are also written back to the cache so the offline
// fallback stays reasonably fresh without a separate update step.
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle plain http(s) GET requests. Skip POSTs and non-http schemes
  // (e.g. chrome-extension://) which the Cache API can't store anyway.
  if (request.method !== 'GET' || !request.url.startsWith('http')) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone).catch(() => {});
        });
        return response;
      })
      .catch(() => caches.match(request))
  );
});
