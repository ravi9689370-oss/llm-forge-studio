const CACHE_NAME = 'llm-forge-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        './',
        './index.html',
        './manifest.webmanifest',
        './icon.svg'
      ]).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Cache-first falling back to network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((res) => {
        if (res.status === 200 && event.request.method === 'GET') {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, resClone));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
