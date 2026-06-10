import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Rocket, Check, Megaphone } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

export default function MerchantAdsPage() {
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const { user, profile } = useAuth()

  useEffect(() => {
    supabase
      .from('ad_pricing')
      .select('*')
      .eq('environment', 'production')
      .order('price')
      .then(({ data }) => {
        setPlans(data || [])
        setLoading(false)
      })
  }, [])

  const handlePurchase = async (plan: any) => {
    if (!profile?.company_id && !user?.id) {
      toast.error(
        'Merchant identity not found. Por favor atualize as configurações da loja.',
      )
      return
    }

    setProcessing(true)
    const advertiserId = profile?.company_id || user?.id

    // Ensure ad_advertiser exists for foreign key mapping
    await supabase.from('ad_advertisers').upsert(
      {
        id: advertiserId,
        company_name: profile?.name || user?.email || 'Merchant',
        environment: 'production',
      },
      { onConflict: 'id' },
    )

    // Create Ad Campaign with pending payment status
    const { data: campaign, error: campaignError } = await supabase
      .from('ad_campaigns')
      .insert({
        title: `Impulsionamento: ${plan.placement}`,
        company_id: advertiserId,
        placement: plan.placement,
        billing_type: plan.billing_type,
        price: plan.price,
        status: 'pending_payment',
        environment: 'production',
      })
      .select()
      .single()

    if (campaignError) {
      toast.error('Erro ao criar campanha: ' + campaignError.message)
      setProcessing(false)
      return
    }

    const { error } = await supabase.from('ad_invoices').insert({
      ad_id: campaign.id,
      advertiser_id: advertiserId,
      reference_number: `BOOST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      amount: plan.price,
      issue_date: new Date().toISOString(),
      due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
      status: 'pending',
      environment: 'production',
    })

    setProcessing(false)

    if (error) {
      toast.error('Erro ao gerar fatura: ' + error.message)
    } else {
      toast.success(
        `Plano "${plan.placement}" adquirido com sucesso! Fatura gerada na aba Financeiro.`,
      )
    }
  }

  return (
    <div className="container py-8 px-4 max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
        <div className="mx-auto w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
          <Rocket className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
          Marketplace de Impulsionamento
        </h1>
        <p className="text-slate-500 text-lg">
          Aumente a visibilidade das suas ofertas e alcance mais clientes na
          região com nossos planos de destaque exclusivos.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16 px-4 text-slate-500 bg-white rounded-xl border border-dashed shadow-sm">
          Nenhum plano disponível no momento para sua região.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className="relative flex flex-col overflow-hidden hover:shadow-xl transition-shadow border-slate-200 bg-white"
            >
              <CardHeader className="text-center pb-6 pt-8 bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-2xl font-bold text-slate-800 capitalize">
                  {plan.placement}
                </CardTitle>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-black text-indigo-600">
                    R$ {plan.price}
                  </span>
                  <span className="text-slate-500 font-medium">
                    /
                    {plan.billing_type === 'fixed'
                      ? 'único'
                      : plan.billing_type}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 pt-8 px-6 pb-8">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-slate-700 font-medium">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Alta prioridade nas buscas</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-700 font-medium">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      Destaque fixo em <strong>{plan.placement}</strong>
                    </span>
                  </li>
                  {plan.duration_days && (
                    <li className="flex items-start gap-3 text-slate-700 font-medium">
                      <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>
                        Duração estendida de{' '}
                        <strong>{plan.duration_days} dias</strong>
                      </span>
                    </li>
                  )}
                </ul>
              </CardContent>
              <CardFooter className="p-6 pt-0 mt-auto bg-slate-50/30">
                <Button
                  className="w-full h-14 text-base font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all"
                  onClick={() => handlePurchase(plan)}
                  disabled={processing}
                >
                  <Megaphone className="w-5 h-5 mr-2" />
                  {processing ? 'Processando...' : 'Comprar Destaque'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
