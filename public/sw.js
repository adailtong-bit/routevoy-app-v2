self.addEventListener('install', (e) => {
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        // Delete all caches to ensure no old files are served
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName)),
        )
      })
      .then(() => {
        self.clients.claim()
        // Unregister this service worker itself
        return self.registration.unregister()
      }),
  )
})

self.addEventListener('fetch', (event) => {
  // No-op fetch handler to bypass service worker completely
  // This guarantees network requests go straight to the server
})
