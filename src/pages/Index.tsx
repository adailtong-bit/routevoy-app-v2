import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { useEffect } from 'react'
import { MapPin, Tag, Shield, Search } from 'lucide-react'

export default function Index() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/explore')
    }
  }, [user, navigate])

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-primary/5">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Encontre as melhores ofertas perto de você
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Routevoy conecta você com descontos e promoções exclusivas por
                  geolocalização. Faça login para acessar.
                </p>
              </div>
              <div className="space-x-4">
                <Link to="/login">
                  <Button size="lg">Começar Agora</Button>
                </Link>
                <Link to="/explore">
                  <Button variant="outline" size="lg">
                    Explorar Ofertas
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Baseado em Localização</h2>
                <p className="text-muted-foreground">
                  Encontre ofertas e experiências ao seu redor na sua região.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Tag className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Cupons Exclusivos</h2>
                <p className="text-muted-foreground">
                  Acesso a descontos especiais dos seus lojistas favoritos.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Seguro e Fácil</h2>
                <p className="text-muted-foreground">
                  Resgate suas ofertas de forma rápida e segura na plataforma.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
