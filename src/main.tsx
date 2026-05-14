/* Main entry point for the application - renders the root React component */
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './main.css'

// 1. Limpeza agressiva de Service Workers antigos (Forçar busca no servidor e resolver F5)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then(() => {
          console.log('[App] ServiceWorker antigo removido com sucesso.')
        })
      }
    })
    .catch((err) => console.error('[App] Erro ao remover SW:', err))
}

// 2. Limpeza agressiva do Cache Storage do navegador (Remover arquivos estáticos em cache)
if ('caches' in window) {
  caches
    .keys()
    .then((names) => {
      for (const name of names) {
        caches.delete(name).then(() => {
          console.log(`[App] Cache storage '${name}' deletado com sucesso.`)
        })
      }
    })
    .catch((err) => console.error('[App] Erro ao limpar caches:', err))
}

// 3. Captura erros de carregamento de chunk do Vite (ocorre quando a versão da aplicação muda durante o uso)
window.addEventListener('vite:preloadError', (event) => {
  console.warn(
    '[App] Erro ao carregar chunk do Vite (nova versão detectada). Recarregando a página...',
    event,
  )
  window.location.reload()
})

// 4. Prevenção do bfcache (Safari/Chrome Mobile mantendo estado ao voltar a página)
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    console.log(
      '[App] Página restaurada via bfcache, forçando reload para versão atualizada...',
    )
    window.location.reload()
  }
})

createRoot(document.getElementById('root')!).render(<App />)
