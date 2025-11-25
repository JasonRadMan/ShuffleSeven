const CACHE_NAME = 'shuffle7-v6-card-size-fix';
const urlsToCache = [
  '/cards.json',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/manifest.webmanifest'
];

self.addEventListener('install', function(event) {
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  const url = new URL(event.request.url);
  
  if (event.request.mode === 'navigate' || 
      url.pathname === '/' || 
      url.pathname.endsWith('.html') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css')) {
    event.respondWith(
      fetch(event.request)
        .then(function(response) {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(function() {
          return caches.match(event.request);
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request).then(function(response) {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          var responseToCache = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseToCache);
          });
          return response;
        });
      })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    Promise.all([
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      clients.claim()
    ]).then(function() {
      return clients.matchAll().then(function(clientList) {
        clientList.forEach(function(client) {
          client.postMessage({ type: 'SW_UPDATED' });
        });
      });
    })
  );
});

self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  const title = data.title || 'Shuffle 7';
  const options = {
    body: data.body || 'New message!',
    icon: '/assets/icon-192.png',
    badge: '/assets/icon-192.png',
    image: data.image || null,
    tag: data.tag || 'shuffle7-notification',
    data: data.data || {},
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
    vibrate: data.vibrate || [200, 100, 200],
    sound: data.sound || null
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const data = event.notification.data || {};
  const url = data.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

self.addEventListener('notificationclose', event => {
  const data = event.notification.data || {};
  if (data.trackClose) {
    console.log('Notification closed:', data);
  }
});
