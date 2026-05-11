const CACHE_NAME = 'routevoy-cache-v1'
const DYNAMIC_CACHE = 'routevoy-dynamic-v1'

const urlsToCache = ['/', '/index.html', '/manifest.json', '/og-image.png']

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE) {
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  if (event.request.method !== 'GET') return

  // Supabase requests or API
  if (url.pathname.startsWith('/api') || url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const resClone = response.clone()
          caches
            .open(DYNAMIC_CACHE)
            .then((cache) => cache.put(event.request, resClone))
          return response
        })
        .catch(() => caches.match(event.request)),
    )
    return
  }

  // Stale-while-revalidate strategy for static and navigational assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic'
          ) {
            const responseToCache = networkResponse.clone()
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(event.request, responseToCache)
            })
          }
          return networkResponse
        })
        .catch((err) => {
          // network failure, handled by fallback to cachedResponse below
          console.warn('Network request failed, using cache', err)
        })
      return cachedResponse || fetchPromise
    }),
  )
})
