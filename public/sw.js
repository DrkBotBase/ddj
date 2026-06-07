const CACHE_NAME = 'mjfood-cache-v1-1';
const rutaBase = '/ddj';

const ASSETS_TO_CACHE = [
  rutaBase,
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://back.vinapp.co//store/1000x500245093-2025-08-06-16-47-12.webp',
  'https://back.vinapp.co//store/200x117240923-2025-08-06-16-47-12.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  if (url.pathname === '/') {
    event.respondWith(
      caches.match(rutaBase).then((response) => {
        if (response) {
          return response;
        }
        return fetch(rutaBase);
      })
    );
    return;
  }
  
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          if (event.request.method === 'GET') {
            cache.put(event.request, responseToCache);
          }
        });

        return response;
      }).catch(() => {
        if (request.mode === 'navigate') {
          return caches.match(rutaBase);
        }
        return caches.match('/');
      });
    })
  );
});

self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: data.icon || 'https://back.vinapp.co//store/200x117240923-2025-08-06-16-47-12.webp',
    badge: 'https://back.vinapp.co//store/1000x500245093-2025-08-06-16-47-12.webp',
    data: data.data
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || rutaBase)
  );
});