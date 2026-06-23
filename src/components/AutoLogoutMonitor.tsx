import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useLanguage } from '@/stores/LanguageContext'
import { toast } from 'sonner'

export function AutoLogoutMonitor() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useLanguage()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!user) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      return
    }

    const INACTIVITY_LIMIT = 600 * 1000 // 10 minutes

    const handleLogout = async () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)

      if (location.pathname.includes('/scanner')) {
        resetTimer()
        return
      }

      await signOut()
      toast.error(
        t(
          'auth.session_expired',
          'Sua sessão expirou por inatividade. Por favor, faça login novamente.',
        ),
      )
      navigate('/login', { replace: true })
    }

    const resetTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(handleLogout, INACTIVITY_LIMIT)
    }

    let lastActivity = Date.now()
    const onActivity = () => {
      const now = Date.now()
      // Throttle resets to avoid performance issues from spamming events
      if (now - lastActivity > 1000) {
        lastActivity = now
        resetTimer()
      }
    }

    const events = [
      'mousemove',
      'mousedown',
      'click',
      'keydown',
      'touchstart',
      'scroll',
    ]

    events.forEach((event) => {
      window.addEventListener(event, onActivity, { passive: true })
    })

    resetTimer()

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      events.forEach((event) => {
        window.removeEventListener(event, onActivity)
      })
    }
  }, [user, signOut, navigate, t])

  return null
}
