import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import {
  Loader2,
  Plus,
  AlertCircle,
  BarChart3,
  Edit,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

export default function MerchantOffers() {
  const { companyId } = useAuth()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCampaigns()
  }, [companyId])

  const isValidUUID = (uuid: string) => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  const fetchCampaigns = async () => {
    if (!companyId) {
      setLoading(false)
      return
    }

    if (!isValidUUID(companyId)) {
      setError(
        'Acesso restrito: O ID da empresa atual não é válido para operações com campanhas de anúncios (contas de demonstração não suportadas).',
      )
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('ad_campaigns')
        .select(
          `
          *,
          advertiser:ad_advertisers!ad_campaigns_advertiser_id_fkey(company_name)
        `,
        )
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setCampaigns(data || [])
    } catch (err: any) {
      console.error('Error fetching campaigns:', err)
      setError(err.message || 'Erro ao carregar campanhas.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Anúncios e Ofertas
          </h2>
          <p className="text-muted-foreground">
            Gerencie suas campanhas publicitárias ativas.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Campanha
        </Button>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Aviso</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : campaigns.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <AlertCircle className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            Nenhuma campanha encontrada
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Você ainda não possui campanhas publicitárias. Crie sua primeira
            campanha para atrair mais clientes.
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Criar Campanha
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <Card
              key={campaign.id}
              className="flex flex-col overflow-hidden transition-all hover:shadow-md"
            >
              {campaign.image && (
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  <img
                    src={campaign.image}
                    alt={campaign.title}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                </div>
              )}
              <CardHeader className="flex-1 pb-2">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge
                    variant={
                      campaign.status === 'active' ? 'default' : 'secondary'
                    }
                    className="capitalize"
                  >
                    {campaign.status === 'active'
                      ? 'Ativa'
                      : campaign.status || 'Inativa'}
                  </Badge>
                  <span
                    className="text-xs text-muted-foreground font-medium truncate max-w-[120px]"
                    title={
                      campaign.advertiser?.company_name || 'Sem anunciante'
                    }
                  >
                    {campaign.advertiser?.company_name || 'Sem anunciante'}
                  </span>
                </div>
                <CardTitle className="line-clamp-2 text-lg leading-tight">
                  {campaign.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 mt-1">
                  {campaign.description || 'Nenhuma descrição fornecida.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-3 text-sm">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">
                      Visualizações
                    </span>
                    <span className="font-bold text-base">
                      {campaign.views || 0}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center border-l border-border/50">
                    <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">
                      Cliques
                    </span>
                    <span className="font-bold text-base">
                      {campaign.clicks || 0}
                    </span>
                  </div>
                </div>
                {campaign.price && (
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Orçamento:</span>
                    <span className="font-medium">
                      {formatCurrency(
                        campaign.price,
                        campaign.currency || 'BRL',
                      )}
                    </span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0 flex gap-2">
                <Button variant="outline" className="flex-1 h-9 px-2" size="sm">
                  <BarChart3 className="mr-2 h-3.5 w-3.5" />
                  Métricas
                </Button>
                <Button
                  variant="outline"
                  className="h-9 w-9 p-0"
                  size="icon"
                  title="Editar"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-9 w-9 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                  size="icon"
                  title="Remover"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
