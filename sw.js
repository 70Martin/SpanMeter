const CACHE_NAME = 'vytycovani-bodu-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Instalace service workeru
self.addEventListener('install', function(event) {
  console.log('SW: Instalace');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('SW: Cache otevřen');
        return cache.addAll(urlsToCache);
      })
  );
});

// Aktivace service workeru
self.addEventListener('activate', function(event) {
  console.log('SW: Aktivace');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Mazání starého cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch události - obsluha požadavků
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Vrátit z cache pokud existuje
        if (response) {
          console.log('SW: Vráceno z cache:', event.request.url);
          return response;
        }

        // Jinak fetchnout ze sítě
        console.log('SW: Fetchování ze sítě:', event.request.url);
        return fetch(event.request).then(function(response) {
          // Zkontrolovat jestli je odpověď validní
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Klonovat odpověď
          var responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});