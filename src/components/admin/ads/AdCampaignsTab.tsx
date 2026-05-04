import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Loader2,
  PlusCircle,
  Megaphone,
  Trash2,
  ShieldAlert,
} from 'lucide-react'

const AD_CATEGORIES = [
  { id: 'all', label: 'Todas as Categorias (Global)' },
  { id: 'hotel', label: 'Experiências: Hotéis / Hospedagem' },
  { id: 'car_rental', label: 'Experiências: Aluguel de Carros' },
  { id: 'activity', label: 'Experiências: Atividades / Ingressos' },
  { id: 'food', label: 'Alimentação / Restaurantes' },
  { id: 'travel', label: 'Turismo / Viagens (Geral)' },
  { id: 'retail', label: 'Varejo / Shopping' },
  { id: 'services', label: 'Serviços' },
  { id: 'entertainment', label: 'Entretenimento' },
]

const AD_PLACEMENTS = [
  { id: 'top', label: 'Topo da Página (Header Hero)' },
  { id: 'bottom', label: 'Rodapé da Página (Footer)' },
  { id: 'sidebar', label: 'Barra Lateral (Sidebar)' },
  { id: 'search', label: 'Resultados de Busca' },
  { id: 'offer_of_the_day', label: 'Destaque: Oferta do Dia' },
  { id: 'experiences_tab', label: 'Aba de Experiências (Viagens/Turismo)' },
]

export function AdCampaignsTab() {
  const [dbAds, setDbAds] = useState<any[]>([])
  const [dbAdvertisers, setDbAdvertisers] = useState<any[]>([])
  const [adPricing, setAdPricing] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, reset, watch, setValue } = useForm()
  const { t } = useLanguage()
  const { formatCurrency, formatNumber } = useRegionFormatting()

  const watchPlacement = watch('placement')
  const watchDuration = watch('durationDays')
  const watchBudget = watch('budget')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [adsRes, advRes, pricingRes] = await Promise.all([
        supabase
          .from('ad_campaigns')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('ad_advertisers')
          .select('*')
          .order('company_name', { ascending: true }),
        supabase
          .from('ad_pricing')
          .select('*')
          .order('created_at', { ascending: false }),
      ])

      if (adsRes.data) setDbAds(adsRes.data)
      if (advRes.data) setDbAdvertisers(advRes.data)
      if (pricingRes.data) {
        setAdPricing(
          pricingRes.data.map((p) => ({
            id: p.id,
            placement: p.placement,
            billingType: p.billing_type,
            durationDays: p.duration_days,
            price: p.price,
          })),
        )
      }
    } catch (err) {
      console.error('Failed to load ads data', err)
      toast.error('Erro ao carregar dados das campanhas')
    } finally {
      setIsLoading(false)
    }
  }

  const allAdvertisers = useMemo(() => {
    return dbAdvertisers.map((da) => ({
      id: da.id,
      companyName: da.company_name,
      status: da.status,
    }))
  }, [dbAdvertisers])

  const availableRules = useMemo(() => {
    if (!watchPlacement || !Array.isArray(adPricing)) return []
    return adPricing.filter((p) => p.placement === watchPlacement)
  }, [watchPlacement, adPricing])

  const selectedRule = useMemo(() => {
    if (availableRules.length === 0) return null
    if (availableRules[0].billingType === 'fixed' && watchDuration) {
      return availableRules.find(
        (r) => r.durationDays === parseInt(watchDuration),
      )
    }
    return availableRules[0]
  }, [availableRules, watchDuration])

  const calculatedPrice = useMemo(() => {
    if (!selectedRule) return 0
    if (selectedRule.billingType === 'fixed') return selectedRule.price
    return watchBudget
      ? parseFloat(watchBudget.replace(/\D/g, '') || '0') / 100
      : 0
  }, [selectedRule, watchBudget])

  const onSubmit = async (data: any) => {
    if (!selectedRule)
      return toast.error(
        'Regra de precificação não encontrada. Por favor crie uma regra na aba "Tabela de Preços".',
      )
    if (selectedRule.billingType !== 'fixed' && !data.budget)
      return toast.error('Orçamento total é obrigatório para este modelo.')

    setIsSubmitting(true)
    try {
      const now = new Date()
      const endDate = new Date()
      if (selectedRule.billingType === 'fixed') {
        endDate.setDate(now.getDate() + (selectedRule.durationDays || 30))
      } else {
        endDate.setDate(now.getDate() + 30)
      }

      const dbPayload = {
        title: data.title,
        company_id: 'admin_created',
        advertiser_id: data.advertiserId,
        region: 'Global',
        category: data.category || 'all',
        billing_type: selectedRule.billingType,
        placement: data.placement,
        status: 'active',
        views: 0,
        clicks: 0,
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
        image: data.image,
        link: data.link,
        price: selectedRule.billingType === 'fixed' ? calculatedPrice : null,
        budget:
          selectedRule.billingType !== 'fixed'
            ? parseFloat(data.budget?.replace(/\D/g, '') || '0') / 100
            : null,
        cost_per_click:
          selectedRule.billingType === 'cpc' ? selectedRule.price : null,
        currency: 'BRL',
        duration_days: selectedRule.durationDays,
      }

      const { data: insertedData, error } = await supabase
        .from('ad_campaigns')
        .insert(dbPayload)
        .select()
        .single()
      if (error) throw error

      setDbAds((prev) => [insertedData, ...prev])

      // Criar a Fatura no Banco de Dados Novo
      const dueDate = new Date()
      dueDate.setDate(now.getDate() + 15)
      const refNumber = `INV-${now.getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

      await supabase.from('ad_invoices').insert({
        reference_number: refNumber,
        ad_id: insertedData.id,
        advertiser_id: data.advertiserId,
        amount: calculatedPrice,
        issue_date: now.toISOString(),
        due_date: dueDate.toISOString(),
        status: 'draft',
      })

      toast.success('Campanha e Fatura criadas com sucesso!')
      reset()
    } catch (err: any) {
      console.error('Error creating ad campaign:', err)
      toast.error('Erro ao criar campanha. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta campanha?')) return

    try {
      const { error } = await supabase
        .from('ad_campaigns')
        .delete()
        .eq('id', id)
      if (error) throw error
      setDbAds((prev) => prev.filter((a) => a.id !== id))
      toast.success('Campanha excluída com sucesso')
    } catch (e) {
      toast.error('Erro ao excluir campanha')
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-1">
        <Card className="border-primary/20 shadow-sm sticky top-4">
          <CardHeader className="bg-slate-50/50 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
              <Megaphone className="w-5 h-5" />
              Criar Novo Anúncio
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Anunciante (Cadastro Base)</Label>
                <Select
                  onValueChange={(v) => setValue('advertiserId', v)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o anunciante" />
                  </SelectTrigger>
                  <SelectContent>
                    {allAdvertisers.length === 0 && (
                      <SelectItem value="empty" disabled>
                        Nenhum anunciante cadastrado
                      </SelectItem>
                    )}
                    {allAdvertisers.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {allAdvertisers.length === 0 && (
                  <p className="text-xs text-amber-600 font-medium">
                    Cadastre um anunciante primeiro na aba "Advertisers".
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Título / Nome da Campanha</Label>
                <Input
                  {...register('title')}
                  required
                  placeholder="Ex: Promoção de Verão"
                />
              </div>

              <div className="space-y-2">
                <Label>Onde o anúncio vai aparecer? (Localização)</Label>
                <Select
                  onValueChange={(v) => setValue('placement', v)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione onde vai aparecer" />
                  </SelectTrigger>
                  <SelectContent>
                    {AD_PLACEMENTS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipo / Categoria de Anúncio</Label>
                <Select
                  onValueChange={(v) => setValue('category', v)}
                  defaultValue="all"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {AD_CATEGORIES.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {availableRules.length > 0 &&
                availableRules[0].billingType === 'fixed' && (
                  <div className="space-y-2">
                    <Label>Tempo que aparece (Duração Fixa)</Label>
                    <Select
                      onValueChange={(v) => setValue('durationDays', v)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a duração" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRules.map((r) => (
                          <SelectItem
                            key={r.id}
                            value={r.durationDays?.toString() || ''}
                          >
                            {r.durationDays} dias - {formatCurrency(r.price)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

              {availableRules.length > 0 &&
                availableRules[0].billingType !== 'fixed' && (
                  <div className="space-y-2">
                    <Label>Orçamento Total</Label>
                    <Input
                      placeholder="Ex: R$ 1.000,00"
                      value={watchBudget || ''}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '')
                        if (!raw) {
                          setValue('budget', '')
                          return
                        }
                        const formatted = new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(parseFloat(raw) / 100)
                        setValue('budget', formatted, { shouldValidate: true })
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Taxa Aplicada:{' '}
                      {formatCurrency(availableRules[0].price || 0)} por{' '}
                      {availableRules[0].billingType?.toUpperCase() || ''}
                    </p>
                  </div>
                )}

              {watchPlacement && availableRules.length === 0 && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                  Atenção: Nenhuma Tabela de Preços configurada para{' '}
                  <strong>
                    {AD_PLACEMENTS.find((p) => p.id === watchPlacement)?.label}
                  </strong>
                  . Vá até a aba "Pricing" e crie uma regra.
                </div>
              )}

              <div className="p-4 bg-slate-50 rounded-lg text-center border border-dashed border-slate-300">
                <span className="text-sm text-slate-500 block mb-1">
                  Valor a Faturar (Preço do Anúncio)
                </span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(calculatedPrice)}
                </span>
              </div>

              <div className="space-y-2">
                <Label>Banner da Campanha (Upload de Imagem)</Label>
                <div className="flex flex-col gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0]

                        const fileExt = file.name.split('.').pop()
                        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
                        const filePath = `campaigns/${fileName}`

                        toast.loading('Enviando imagem para a nuvem...', {
                          id: 'upload-img',
                        })
                        const { error: uploadError } = await supabase.storage
                          .from('public_assets')
                          .upload(filePath, file)

                        if (uploadError) {
                          toast.error(
                            'Erro ao enviar imagem. Verifique as permissões do Storage.',
                            { id: 'upload-img' },
                          )
                          console.error('Storage Upload Error:', uploadError)
                        } else {
                          const { data: publicUrlData } = supabase.storage
                            .from('public_assets')
                            .getPublicUrl(filePath)

                          setValue('image', publicUrlData.publicUrl)
                          toast.success(
                            'Imagem armazenada com sucesso na nuvem!',
                            { id: 'upload-img' },
                          )
                        }
                      }
                    }}
                  />
                  <span className="text-xs text-muted-foreground text-center">
                    Ou cole a URL direta da imagem abaixo
                  </span>
                  <Input
                    {...register('image')}
                    placeholder="https://..."
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>URL de Redirecionamento (Link do Anúncio)</Label>
                <Input
                  {...register('link')}
                  placeholder="https://..."
                  required
                />
              </div>

              <Button
                className="w-full font-bold shadow-md"
                type="submit"
                disabled={
                  calculatedPrice === 0 ||
                  isSubmitting ||
                  availableRules.length === 0
                }
              >
                {isSubmitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Salvar Anúncio e Gerar Fatura
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="xl:col-span-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Campanhas Publicadas e Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Campanha / Anunciante</TableHead>
                      <TableHead>Onde Aparece / Categoria</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dbAds.map((a) => {
                      const adv = allAdvertisers.find(
                        (ad) => ad.id === a.advertiser_id,
                      )
                      const pLabel =
                        AD_PLACEMENTS.find((p) => p.id === a.placement)
                          ?.label || a.placement
                      const cLabel =
                        AD_CATEGORIES.find((c) => c.id === a.category)?.label ||
                        a.category

                      return (
                        <TableRow key={a.id}>
                          <TableCell>
                            <span className="font-bold text-slate-800 block">
                              {a.title}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              {adv?.companyName || 'N/A'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">{pLabel}</div>
                            <Badge
                              variant="outline"
                              className="mt-1 font-normal bg-slate-50"
                            >
                              {cLabel}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-slate-600">
                              Visualizações:{' '}
                              <strong className="text-slate-900">
                                {formatNumber(a.views || 0)}
                              </strong>
                            </div>
                            <div className="text-sm text-slate-600">
                              Cliques:{' '}
                              <strong className="text-slate-900">
                                {formatNumber(a.clicks || 0)}
                              </strong>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200">
                              {a.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:bg-red-50"
                              onClick={() => handleDelete(a.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {dbAds.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-slate-500 py-16"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Megaphone className="w-10 h-10 text-slate-300" />
                            <span className="text-lg font-medium text-slate-700">
                              Nenhum anúncio publicado.
                            </span>
                            <span>
                              Utilize o formulário para criar a primeira
                              campanha de publicidade.
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
