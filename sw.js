// Service Worker — Dépensoo PWA
// Stratégie : Cache-first — l'app fonctionne 100% hors ligne après la première visite

const CACHE_NAME = 'depensoo-v2'; // v2 : ajout SheetJS inliné (import Excel/ODS) — bump pour forcer le rechargement du cache PWA
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

// Installation : mise en cache des fichiers de l'app
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activation : suppression des anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch : cache-first, réseau en fallback
self.addEventListener('fetch', event => {
  // Ignorer les requêtes non-GET et les URLs externes
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Mettre en cache la nouvelle ressource
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
