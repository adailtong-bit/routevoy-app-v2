import { AggregatorFeed } from '@/components/AggregatorFeed'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { MapPin, Tag, Compass, Loader2 } from 'lucide-react'

export default function IndexPage() {
  const { user, loading, profile } = useAuth()

  // Guard to prevent premature rendering before auth/profile sync is complete,
  // preventing null-reference crashes (like undefined arrays for .filter())
  if (loading || (user && !profile)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">
          Carregando plataforma...
        </p>
      </div>
    )
  }

  // Defensive array checks to avoid runtime errors like "Cannot read properties of undefined (reading 'filter')"
  const safeUser = user || null

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <section className="bg-blue-700 text-white py-16 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
            Descubra as Melhores Ofertas Locais
          </h1>
          <p
            className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            Encontre cupons exclusivos, promoções imperdíveis e experiências
            incríveis com base na sua localização.
          </p>

          {!safeUser && (
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up"
              style={{ animationDelay: '200ms' }}
            >
              <Link to="/login">
                <Button
                  size="lg"
                  className="bg-white text-blue-700 hover:bg-gray-100 w-full sm:w-auto font-bold px-8"
                >
                  Entrar na Plataforma
                </Button>
              </Link>
              <Link to="/explore">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-blue-600 w-full sm:w-auto px-8"
                >
                  Explorar Ofertas
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white border-b border-gray-200 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Geolocalização
              </h3>
              <p className="text-gray-600">
                Encontre as oportunidades mais próximas de você em tempo real.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <Tag className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Cupons Exclusivos
              </h3>
              <p className="text-gray-600">
                Acesse descontos que você só encontra aqui na Routevoy.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
                <Compass className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Experiências
              </h3>
              <p className="text-gray-600">
                Descubra novos lugares e vivencie momentos inesquecíveis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Destaques da Semana
            </h2>
            <p className="text-gray-600">
              As ofertas mais quentes selecionadas para você.
            </p>
          </div>
        </div>

        <AggregatorFeed />
      </main>
    </div>
  )
}
