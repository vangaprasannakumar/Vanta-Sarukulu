const CACHE_NAME = 'vanta-sarukulu-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://i.postimg.cc/kXGhXSwf/Vanga_Satyanarayana_వ_ట_మ_స_త_ర_LOGO_1_1.png'
];

// Install Event - Caches the main assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Fetch Event - Serves from cache if offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
