/* Dreamy Doorsteps — service worker
   Bump CACHE_VERSION whenever you ship a meaningful update;
   that forces every device to fetch the new files. */

const CACHE_VERSION = 'dreamy-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/style.css',
  '/data.js',
  '/games.js',
  '/app.js',
  '/manifest.json',
  '/favicon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
  '/assets/characters/frilly_dress.png',
  '/assets/characters/graphic_tee.png',
  '/assets/characters/streetwear.png',
  '/assets/characters/casual_graphic.png',
  '/assets/characters/denim_overalls.png'
];

// Install: pre-cache the shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activate: drop old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for same-origin, fall back to network
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Don't try to cache cross-origin (e.g. Google Fonts) — let the browser handle them
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          // Cache successful same-origin responses for next time
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => {
          // If offline and not cached, fall back to the shell
          if (req.mode === 'navigate') return caches.match('/index.html');
        });
    })
  );
});
