const CACHE_NAME = 'shuffle7-v3';
const urlsToCache = [
  '/',
  '/cards.json',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/shuffle7-card-back.svg',
  '/manifest.webmanifest',
  '/sw.js'
];

// Install event
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

// Update event
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push event - handle incoming push notifications
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

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event - handle when user clicks on notification
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const data = event.notification.data || {};
  const url = data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If not found, open new window/tab
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Notification close event - handle when user dismisses notification
self.addEventListener('notificationclose', event => {
  const data = event.notification.data || {};
  
  // Optional: Send analytics or tracking data when notification is dismissed
  if (data.trackClose) {
    // Could send a request to track notification dismissal
    console.log('Notification closed:', data);
  }
});
