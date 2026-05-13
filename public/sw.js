const CACHE_NAME = 'routevoy-cache-v2'
const DYNAMIC_CACHE = 'routevoy-dynamic-v2'

const urlsToCache = ['/', '/manifest.json', '/og-image.png']

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
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)

  // Network First for Navigation requests (HTML) to avoid caching old versions (Fix for the F5 issue)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const resClone = response.clone()
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, resClone)
          })
          return response
        })
        .catch(() => {
          return caches.match(event.request).then((res) => {
            if (res) return res
            return caches.match('/')
          })
        }),
    )
    return
  }

  // Supabase requests or API - Network only or fallback
  if (url.pathname.startsWith('/api') || url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request)),
    )
    return
  }

  // Stale-while-revalidate strategy for other static assets
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
          console.warn('Network request failed, using cache', err)
        })
      return cachedResponse || fetchPromise
    }),
  )
})
