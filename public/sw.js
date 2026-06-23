const CACHE_NAME = 'routevoy-pwa-v2'

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/og-image.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Supabase API or other backends -> Network Only
  if (url.origin.includes('supabase.co') || url.hostname.includes('supabase')) {
    event.respondWith(fetch(event.request))
    return
  }

  // Navigation requests (HTML) - Network first, fallback to cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone()
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, responseClone))
          return response
        })
        .catch(() =>
          caches.match('/index.html').then((res) => res || caches.match('/')),
        ),
    )
    return
  }

  // Static assets (Stale-While-Revalidate)
  const isStaticAsset =
    url.origin === self.location.origin ||
    url.origin.includes('fonts.googleapis.com') ||
    url.origin.includes('fonts.gstatic.com') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css')

  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (
              networkResponse &&
              networkResponse.status === 200 &&
              (networkResponse.type === 'basic' ||
                networkResponse.type === 'cors')
            ) {
              const responseToCache = networkResponse.clone()
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache)
              })
            }
            return networkResponse
          })
          .catch(() => {
            // Fetch failed (e.g. offline)
          })

        return cachedResponse || fetchPromise
      }),
    )
  }
})
