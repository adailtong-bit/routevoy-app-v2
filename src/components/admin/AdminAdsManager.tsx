import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useCouponStore } from '@/stores/CouponContext'
import { supabase } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import {
  Megaphone,
  Trash2,
  Settings,
  Building2,
  Receipt,
  Percent,
} from 'lucide-react'
import { CreateAdCampaignDialog } from '@/components/merchant/CreateAdCampaignDialog'
import { useLanguage } from '@/stores/LanguageContext'
import { CommissionRulesManager } from '@/components/admin/CommissionRulesManager'

export function AdminAdsManager() {
  const { user, role } = useAuth()
  const { franchises } = useCouponStore()
  const { t } = useLanguage()

  const isFranchisee = role === 'franchisee'
  const isAdmin = role === 'admin' || role === 'super_admin'
  const myFranchise = franchises.find(
    (f) => f.ownerId === user?.id || f.email === user?.email,
  )
  const environment = isFranchisee && myFranchise ? myFranchise.id : 'global'

  const [pricingList, setPricingList] = useState<any[]>([])
  const [placement, setPlacement] = useState('')
  const [billingType, setBillingType] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('30')
  const [campaigns, setCampaigns] = useState<any[]>([])

  useEffect(() => {
    fetchPricing()
    fetchCampaigns()
  }, [environment])

  const fetchPricing = async () => {
    const { data } = await supabase
      .from('ad_pricing')
      .select('*')
      .eq('environment', environment)
      .order('created_at', { ascending: false })
    if (data) setPricingList(data)
  }

  const fetchCampaigns = async () => {
    let query = supabase
      .from('ad_campaigns')
      .select('*')
      .order('created_at', { ascending: false })
    if (isFranchisee) {
      query = query.eq('environment', environment)
    }
    const { data } = await query
    if (data) setCampaigns(data)
  }

  const handleAddPricing = async () => {
    if (!placement || !billingType || !price || !duration) {
      return toast.error('Preencha todos os campos')
    }

    const { error } = await supabase.from('ad_pricing').insert({
      placement,
      billing_type: billingType,
      price: parseFloat(price),
      duration_days: parseInt(duration),
      environment,
    })

    if (error) {
      toast.error('Erro ao adicionar preço')
    } else {
      toast.success('Preço adicionado')
      setPlacement('')
      setBillingType('')
      setPrice('')
      setDuration('30')
      fetchPricing()
    }
  }

  const handleDeletePricing = async (id: string) => {
    const { error } = await supabase.from('ad_pricing').delete().eq('id', id)
    if (error) toast.error('Erro ao excluir')
    else {
      toast.success('Excluído com sucesso')
      fetchPricing()
    }
  }

  const PLACEMENT_OPTIONS = [
    { value: 'top_ranking', label: 'Top Ranking' },
    { value: 'lateral_highlight', label: 'Destaque Lateral' },
    { value: 'main_banner', label: 'Banner Principal' },
    { value: 'home_featured', label: 'Destaque Home' },
    { value: 'home_hero', label: 'Home Hero' },
    { value: 'global_search', label: 'Busca Global' },
    { value: 'offer_of_the_day', label: 'Oferta do Dia' },
    { value: 'sponsored_push', label: 'Push Notification' },
  ]

  const BILLING_OPTIONS = [
    { value: 'internal_boost', label: 'Impulsionamento Interno (Cupom)' },
    { value: 'internal', label: 'Impulsionamento Interno (Legado)' },
    { value: 'cpc', label: 'CPC (Custo por Clique)' },
    { value: 'cpm', label: 'CPM (Custo por Mil)' },
    { value: 'external', label: 'Publicidade Externa' },
    { value: 'fixed', label: 'Fixo (Período)' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-primary" />
            {t('admin.ads', 'Publicidade & Anúncios')}
          </h2>
          <p className="text-slate-500">
            Gerencie campanhas, preços e anúncios locais e globais.
          </p>
        </div>
      </div>

      <Tabs defaultValue="pricing" className="w-full">
        <TabsList className="bg-white border mb-6 flex-wrap h-auto w-full sm:w-auto overflow-x-auto justify-start shadow-sm">
          <TabsTrigger value="campaigns" className="gap-2">
            <Megaphone className="w-4 h-4" /> Campanhas
          </TabsTrigger>
          <TabsTrigger value="advertisers" className="gap-2">
            <Building2 className="w-4 h-4" /> Anunciantes
          </TabsTrigger>
          <TabsTrigger value="pricing" className="gap-2">
            <Settings className="w-4 h-4" /> Configuração de Preços
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <Receipt className="w-4 h-4" /> Faturamento de Anúncios
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="commissions" className="gap-2">
              <Percent className="w-4 h-4" /> Comissões
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="pricing" className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 animate-fade-in-up">
            <h3 className="text-lg font-bold text-slate-800">
              Adicionar Configuração de Preços
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Posicionamento (Placement)
                </label>
                <Select value={placement} onValueChange={setPlacement}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PLACEMENT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Tipo de Cobrança
                </label>
                <Select value={billingType} onValueChange={setBillingType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {BILLING_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Preço (R$)
                </label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Duração (Dias)
                </label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
              <Button onClick={handleAddPricing} className="w-full">
                Adicionar
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden animate-fade-in-up">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="font-semibold text-slate-700">
                    Posicionamento
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Tipo de Cobrança
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Preço
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Duração
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricingList.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-slate-500 py-8"
                    >
                      Nenhum preço configurado.
                    </TableCell>
                  </TableRow>
                ) : (
                  pricingList.map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-slate-800">
                        {PLACEMENT_OPTIONS.find(
                          (o) => o.value === item.placement,
                        )?.label || item.placement}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {BILLING_OPTIONS.find(
                          (o) => o.value === item.billing_type,
                        )?.label || item.billing_type}
                      </TableCell>
                      <TableCell className="text-emerald-600 font-medium">
                        R$ {Number(item.price).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {item.duration_days} dias
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeletePricing(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="campaigns">
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-lg font-bold text-slate-800">
                Campanhas de Anúncios
              </h3>
              <CreateAdCampaignDialog
                environment={environment}
                onCreated={fetchCampaigns}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.length === 0 ? (
                <p className="text-slate-500 col-span-full py-8 text-center border-2 border-dashed rounded-lg">
                  Nenhuma campanha cadastrada.
                </p>
              ) : (
                campaigns.map((camp) => (
                  <div
                    key={camp.id}
                    className="border border-slate-200 p-4 rounded-lg shadow-sm flex flex-col gap-2 bg-slate-50/30 hover:border-slate-300 transition-colors"
                  >
                    <h4
                      className="font-bold text-slate-800 line-clamp-1"
                      title={camp.title}
                    >
                      {camp.title}
                    </h4>
                    <p className="text-sm text-slate-500 line-clamp-2">
                      {camp.description}
                    </p>
                    <div className="text-xs text-slate-600 space-y-1 mt-2">
                      <p>
                        <strong>Posicionamento:</strong>{' '}
                        {PLACEMENT_OPTIONS.find(
                          (o) => o.value === camp.placement,
                        )?.label || camp.placement}
                      </p>
                      <p>
                        <strong>Cobrança:</strong>{' '}
                        {BILLING_OPTIONS.find(
                          (o) => o.value === camp.billing_type,
                        )?.label || camp.billing_type}
                      </p>
                      <p>
                        <strong>Priority Score:</strong>{' '}
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-bold ml-1">
                          {camp.priority_score || 0}
                        </span>
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advertisers">
          <div className="bg-white p-8 rounded-xl border shadow-sm text-center animate-fade-in-up">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              Anunciantes
            </h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              Módulo de gerenciamento de empresas anunciantes e parceiros em
              construção.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="billing">
          <div className="bg-white p-8 rounded-xl border shadow-sm text-center animate-fade-in-up">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              Faturamento de Anúncios
            </h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              Acompanhamento e faturamento das campanhas compradas ativas em
              construção.
            </p>
          </div>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="commissions">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in-up">
              <CommissionRulesManager />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
