// Força a instalação imediata do novo Service Worker
self.addEventListener('install', (e) => {
  self.skipWaiting()
})

// Na ativação, deleta ativamente todos os caches existentes e se desregistra
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName)),
        )
      })
      .then(() => {
        return self.clients.claim()
      })
      .then(() => {
        // Desregistra o Service Worker ativamente para parar de interceptar requisições
        return self.registration.unregister()
      }),
  )
})

// Interceptador de fetch transparente: ignora qualquer cache local e vai direto para a rede
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => Response.error()))
  } else {
    event.respondWith(fetch(event.request).catch(() => Response.error()))
  }
})
