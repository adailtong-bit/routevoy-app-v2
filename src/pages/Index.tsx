import { useAuth } from '@/hooks/use-auth'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Navigate, Link } from 'react-router-dom'
import { useLanguage } from '@/stores/LanguageContext'
import { AggregatorFeed } from '@/components/AggregatorFeed'
import { Button } from '@/components/ui/button'
import { Compass, Gift, MapPin } from 'lucide-react'

export function IndexContent() {
  const { t } = useLanguage()

  return (
    <div className="h-full w-full overflow-y-auto bg-slate-50 animate-fade-in">
      <div className="bg-primary/5 py-12 md:py-20 px-4 text-center border-b border-primary/10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight max-w-4xl mx-auto">
          {t('home.title', 'Descubra as Melhores Ofertas e Experiências')}
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-8 font-medium">
          {t(
            'home.subtitle',
            'Explore cupons, restaurantes e descontos exclusivos na sua região através da nossa plataforma inteligente.',
          )}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" asChild className="font-bold rounded-full px-8">
            <Link to="/explore">
              <Compass className="w-5 h-5 mr-2" />
              {t('nav.explore', 'Explorar Agora')}
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="font-bold rounded-full px-8 bg-white"
          >
            <Link to="/seasonal-calendar">
              <Gift className="w-5 h-5 mr-2" />
              {t('nav.seasonal_calendar', 'Ofertas Sazonais')}
            </Link>
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <MapPin className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-slate-900">
            {t('home.feed_title', 'Recomendados para Você')}
          </h2>
        </div>
        <AggregatorFeed />
      </div>
    </div>
  )
}

export default function Index() {
  const { role, user, loading } = useAuth()

  if (loading || (user && role === null))
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-primary/40 border-t-primary rounded-full animate-spin mb-4"></div>
      </div>
    )

  if (user) {
    if (role === 'admin' || role === 'super_admin')
      return <Navigate to="/admin" replace />
    if (role === 'franchisee') return <Navigate to="/franchisee" replace />
    if (role === 'merchant' || role === 'shopkeeper')
      return <Navigate to="/merchant" replace />
    if (role === 'affiliate') return <Navigate to="/affiliate" replace />

    // If authenticated but no matching role, redirect to profile gracefully
    return <Navigate to="/profile" replace />
  }

  return (
    <ErrorBoundary>
      <IndexContent />
    </ErrorBoundary>
  )
}
