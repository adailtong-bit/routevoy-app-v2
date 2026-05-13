/* Main entry point for the application - renders the root React component */
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './main.css'

// Forçar a desinstalação de qualquer Service Worker antigo para resolver o problema de exigir F5
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => {
      for (const registration of registrations) {
        registration.unregister()
      }
    })
    .catch((err) => console.error('Erro ao desregistrar Service Worker:', err))
}

// Limpar ativamente o cache do navegador via Cache API
if ('caches' in window) {
  caches
    .keys()
    .then((names) => {
      for (const name of names) {
        caches.delete(name)
      }
    })
    .catch(() => {})
}

createRoot(document.getElementById('root')!).render(<App />)
