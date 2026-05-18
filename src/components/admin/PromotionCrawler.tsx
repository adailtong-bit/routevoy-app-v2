import { useLocation } from 'react-router-dom'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Globe,
  Box,
  History,
  Square,
  Loader2,
  Settings2,
  Check,
  Edit,
} from 'lucide-react'
import { CrawlerSourcesTab } from './CrawlerSourcesTab'
import { CrawlerPromotionsTab } from './CrawlerPromotionsTab'
import { CrawlerHistoryTab } from './CrawlerHistoryTab'
import { CrawlerMappingsTab } from './CrawlerMappingsTab'
import { ApifyIntegrationTab } from './ApifyIntegrationTab'
import { cn } from '@/lib/utils'
import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  getCrawlerProgress,
  subscribeCrawler,
  stopExtractionTask,
} from '@/lib/crawlerTask'
import { supabase } from '@/lib/supabase/client'
import { fetchCrawlerPromotions } from '@/services/crawler'
import { DiscoveredPromotion } from '@/lib/types'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

function EditPromotionModal({
  promo,
  onClose,
  onSuccess,
}: {
  promo: any
  onClose: () => void
  onSuccess: () => void
}) {
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    const formData = new FormData(e.currentTarget)
    const status = formData.get('status') as string

    let category = formData.get('category') as string
    const partner = formData.get('company_id') as string

    if (!partner && (!category || category.trim() === '')) {
      category = 'Geral'
    }

    const updates = {
      title: formData.get('title'),
      description: formData.get('description'),
      category: category,
      image_url: formData.get('image_url'),
      product_link: formData.get('product_link'),
      store_name: formData.get('store_name'),
      company_id: partner || null,
      status: status,
      price: formData.get('price')
        ? parseFloat(formData.get('price') as string)
        : null,
      currency: formData.get('currency')
        ? (formData.get('currency') as string).toUpperCase()
        : 'BRL',
    }

    const { error } = await supabase
      .from('discovered_promotions')
      .update(updates)
      .eq('id', promo.id)
    setIsSaving(false)

    if (!error) {
      toast({ title: 'Sucesso', description: 'Oferta atualizada com sucesso!' })
      onSuccess()
    } else {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar: ' + error.message,
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-slate-900">
            Editar e Publicar Oferta
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Revise os detalhes da oferta antes de publicá-la. Ofertas sem
            parceiro serão publicadas como "Orgânicas".
          </p>
        </div>

        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Título</label>
            <Input name="title" defaultValue={promo.title} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Descrição
            </label>
            <textarea
              name="description"
              defaultValue={promo.description || ''}
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Categoria (ex: Eletrônicos)
              </label>
              <Input
                name="category"
                defaultValue={promo.category || ''}
                placeholder="Ex: Eletrônicos"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Loja / Marca
              </label>
              <Input
                name="store_name"
                defaultValue={promo.store_name || promo.storeName || ''}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Preço e Moeda
              </label>
              <div className="flex gap-2">
                <Input
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={promo.price || ''}
                  className="flex-1"
                  placeholder="0.00"
                />
                <Input
                  name="currency"
                  defaultValue={promo.currency || 'BRL'}
                  className="w-20 uppercase font-mono text-center"
                  placeholder="BRL"
                  maxLength={3}
                />
              </div>
              {promo.currency && promo.currency.toUpperCase() !== 'BRL' && (
                <p className="text-[10px] text-amber-600 font-bold mt-1">
                  ⚠️ Oferta em moeda estrangeira ({promo.currency}). O valor
                  exibido é o original.
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Parceiro (opcional)
              </label>
              <Input
                name="company_id"
                defaultValue={promo.company_id || ''}
                placeholder="ID do Parceiro"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              URL da Imagem
            </label>
            <Input
              name="image_url"
              defaultValue={promo.image_url || promo.imageUrl || ''}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Link do Produto/Oferta
            </label>
            <Input
              name="product_link"
              defaultValue={promo.product_link || promo.productLink || ''}
              required
            />
          </div>

          <div className="pt-4 border-t mt-6">
            <label className="text-sm font-medium text-slate-900 block mb-3">
              Status de Publicação
            </label>
            <div className="flex flex-col gap-3">
              <label className="flex items-start gap-3 cursor-pointer p-4 border rounded-lg hover:border-primary/50 hover:bg-slate-50 transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  defaultChecked={promo.status === 'published'}
                  className="accent-primary mt-1 w-4 h-4"
                />
                <div>
                  <span className="text-sm font-semibold block text-slate-900">
                    Publicar na Página Principal
                  </span>
                  <span className="text-xs text-slate-500">
                    A oferta ficará visível para todos os usuários no menu
                    Explorar.
                  </span>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer p-4 border rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-all has-[:checked]:border-slate-400 has-[:checked]:bg-slate-50">
                <input
                  type="radio"
                  name="status"
                  value="approved"
                  defaultChecked={promo.status !== 'published'}
                  className="accent-primary mt-1 w-4 h-4"
                />
                <div>
                  <span className="text-sm font-semibold block text-slate-900">
                    Manter apenas Aprovada (Oculta)
                  </span>
                  <span className="text-xs text-slate-500">
                    A oferta fica guardada no painel, mas não aparece para o
                    público.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Salvar e Atualizar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ApprovedOffersManager({ promotions, onStatusChange }: any) {
  const [editingPromo, setEditingPromo] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = promotions.filter((p: any) => {
    if (!searchTerm) return true
    const q = searchTerm.toLowerCase()
    return (
      p.title?.toLowerCase().includes(q) ||
      p.store_name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Buscar por título, loja ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-slate-500 font-medium">
          {filtered.length} {filtered.length === 1 ? 'oferta' : 'ofertas'}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((promo: any) => (
          <div
            key={promo.id}
            className="border rounded-xl bg-white overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow group"
          >
            <div className="relative h-40 bg-slate-100 flex-shrink-0">
              {promo.image_url || promo.imageUrl ? (
                <img
                  src={promo.image_url || promo.imageUrl}
                  className="w-full h-full object-cover"
                  alt={promo.title}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Box className="w-8 h-8" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm bg-slate-100 text-slate-700">
                  Aprovada
                </span>
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start gap-2 mb-1">
                <h4 className="font-semibold text-slate-900 line-clamp-2 text-sm">
                  {promo.title}
                </h4>
                {promo.price && (
                  <span
                    className={cn(
                      'text-xs font-bold whitespace-nowrap',
                      promo.currency !== 'BRL'
                        ? 'text-amber-600'
                        : 'text-green-600',
                    )}
                  >
                    {promo.currency === 'USD'
                      ? '$'
                      : promo.currency === 'EUR'
                        ? '€'
                        : promo.currency === 'GBP'
                          ? '£'
                          : promo.currency === 'BRL'
                            ? 'R$'
                            : promo.currency}{' '}
                    {promo.price}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 line-clamp-2 mb-3 flex-1">
                {promo.description || 'Sem descrição'}
              </p>

              <div className="flex flex-wrap gap-1 mb-4">
                {promo.category && (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
                    {promo.category}
                  </span>
                )}
                {promo.store_name && (
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-medium">
                    {promo.store_name}
                  </span>
                )}
                {promo.currency && promo.currency !== 'BRL' && (
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-bold">
                    {promo.currency}
                  </span>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full group-hover:border-primary group-hover:text-primary transition-colors"
                onClick={() => setEditingPromo(promo)}
              >
                <Edit className="w-3.5 h-3.5 mr-2" /> Editar e Publicar
              </Button>
            </div>
          </div>
        ))}
      </div>

      {editingPromo && (
        <EditPromotionModal
          promo={editingPromo}
          onClose={() => setEditingPromo(null)}
          onSuccess={() => {
            setEditingPromo(null)
            onStatusChange()
          }}
        />
      )}
    </div>
  )
}

function PromotionCrawlerContent({ franchiseId }: { franchiseId?: string }) {
  const store = useCouponStore() || {}
  const { user } = store
  const franchises = Array.isArray(store.franchises) ? store.franchises : []
  const { t } = useLanguage()
  const location = useLocation()
  const isFranchisee = location.pathname.includes('/franchisee')

  const safeFranchises = Array.isArray(franchises) ? franchises : []
  const franchise = safeFranchises.find((f) => f.id === franchiseId)
  const { formatNumber } = useRegionFormatting(franchise?.region)

  const [crawlerState, setCrawlerState] = useState(getCrawlerProgress())

  useEffect(() => {
    // Prevent stuck state from previous sessions
    if (sessionStorage.getItem('crawler_isScanning') === 'true') {
      stopExtractionTask()
    }

    return subscribeCrawler(() => {
      setCrawlerState({ ...getCrawlerProgress() })
    })
  }, [])

  // Persist active tab
  const [activeTab, setActiveTab] = useState<string>(
    () => sessionStorage.getItem('crawler_activeTab') || 'sources',
  )

  useEffect(() => {
    sessionStorage.setItem('crawler_activeTab', activeTab)
  }, [activeTab])

  // Filters
  const [filterState, setFilterState] = useState<string>(
    () => sessionStorage.getItem('crawler_filterState') || 'all',
  )
  const [filterCity, setFilterCity] = useState<string>(
    () => sessionStorage.getItem('crawler_filterCity') || 'all',
  )
  const [filterStore, setFilterStore] = useState<string>(
    () => sessionStorage.getItem('crawler_filterStore') || 'all',
  )
  const [filterSource, setFilterSource] = useState<string>(
    () => sessionStorage.getItem('crawler_filterSource') || 'all',
  )
  const [filterCategory, setFilterCategory] = useState<string>(
    () => sessionStorage.getItem('crawler_filterCategory') || 'all',
  )
  const [filterFetchDate, setFilterFetchDate] = useState<string>(
    () => sessionStorage.getItem('crawler_filterFetchDate') || 'all',
  )

  useEffect(() => {
    sessionStorage.setItem('crawler_filterState', filterState)
    sessionStorage.setItem('crawler_filterCity', filterCity)
    sessionStorage.setItem('crawler_filterStore', filterStore)
    sessionStorage.setItem('crawler_filterSource', filterSource)
    sessionStorage.setItem('crawler_filterCategory', filterCategory)
    sessionStorage.setItem('crawler_filterFetchDate', filterFetchDate)
  }, [
    filterState,
    filterCity,
    filterStore,
    filterSource,
    filterCategory,
    filterFetchDate,
  ])

  const [dbPromotions, setDbPromotions] = useState<DiscoveredPromotion[]>([])
  const [dbApprovedPromotions, setDbApprovedPromotions] = useState<
    DiscoveredPromotion[]
  >([])
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(false)

  const loadPromotions = useCallback(async () => {
    setIsLoadingPromotions(true)
    try {
      const response = await fetchCrawlerPromotions({ limit: 500, franchiseId })
      const data = response?.data || []
      setDbPromotions(Array.isArray(data) ? data : [])

      const { data: approvedData } = await supabase
        .from('discovered_promotions')
        .select('*')
        .eq('status', 'approved')
        .order('captured_at', { ascending: false })
        .limit(500)

      setDbApprovedPromotions(approvedData || [])
    } catch (e) {
      console.error('Failed to load promotions', e)
      setDbPromotions([])
      setDbApprovedPromotions([])
    } finally {
      setIsLoadingPromotions(false)
    }
  }, [franchiseId])

  useEffect(() => {
    if (activeTab === 'promotions' || activeTab === 'approved') {
      loadPromotions()
    }
  }, [activeTab, loadPromotions])

  useEffect(() => {
    if (
      !crawlerState.isScanning &&
      (activeTab === 'promotions' || activeTab === 'approved')
    ) {
      loadPromotions()
    }
  }, [crawlerState.isScanning, activeTab, loadPromotions])

  const basePendingPromotions = useMemo(() => {
    const allPromos = Array.isArray(dbPromotions) ? dbPromotions : []
    return allPromos.filter((p) => p && p.status === 'pending')
  }, [dbPromotions])

  const baseApprovedPromotions = useMemo(() => {
    return Array.isArray(dbApprovedPromotions) ? dbApprovedPromotions : []
  }, [dbApprovedPromotions])

  const pendingPromotions = useMemo(() => {
    const safeDbPromotions = Array.isArray(dbPromotions) ? dbPromotions : []
    if (
      !Array.isArray(basePendingPromotions) ||
      (safeDbPromotions.length === 0 && basePendingPromotions.length === 0)
    )
      return []
    return basePendingPromotions.filter((p) => {
      if (!p) return false
      if (filterState !== 'all' && p.state !== filterState) return false
      if (filterCity !== 'all' && p.city !== filterCity) return false
      if (
        filterStore !== 'all' &&
        p.storeName !== filterStore &&
        p.store_name !== filterStore
      )
        return false
      if (filterCategory !== 'all' && p.category !== filterCategory)
        return false
      if (filterSource !== 'all' && p.sourceId !== filterSource) return false
      if (filterFetchDate !== 'all') {
        const pDate = p.capturedAt ? p.capturedAt.split('T')[0] : ''
        if (pDate !== filterFetchDate) return false
      }
      return true
    })
  }, [
    basePendingPromotions,
    filterState,
    filterCity,
    filterStore,
    filterSource,
    filterCategory,
    filterFetchDate,
  ])

  const approvedPromotionsCount = baseApprovedPromotions.length
  const pendingPromotionsCount = pendingPromotions.length

  return (
    <div
      className={cn('space-y-6 w-full', !isFranchisee && 'min-w-0 max-w-full')}
    >
      <Card className="min-w-0 overflow-hidden w-full max-w-full">
        <CardHeader className="min-w-0 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <CardTitle className="truncate">
                {t('franchisee.crawler.title', 'Gerenciamento de Crawler')}
              </CardTitle>
              <CardDescription className="truncate">
                {t(
                  'franchisee.crawler.desc',
                  'Configure fontes externas para capturar e importar ofertas para a plataforma.',
                )}
              </CardDescription>
            </div>
            {crawlerState.isScanning && (
              <Button
                variant="destructive"
                size="sm"
                onClick={stopExtractionTask}
              >
                <Square className="w-4 h-4 mr-2" fill="currentColor" />
                Parar Busca
              </Button>
            )}
          </div>

          {crawlerState.isScanning && (
            <div className="p-4 bg-slate-50 border rounded-lg space-y-3 animate-in fade-in slide-in-from-top-4">
              <div className="flex justify-between text-sm font-medium">
                <span className="flex items-center text-blue-600">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Buscando ofertas...
                </span>
                <span>
                  {crawlerState.current} / {crawlerState.total}
                </span>
              </div>
              <Progress
                value={
                  (crawlerState.current / Math.max(crawlerState.total, 1)) * 100
                }
                className="h-2"
              />
              <div className="flex gap-4 text-xs font-medium text-slate-500">
                <span>
                  Encontrados:{' '}
                  <strong className="text-slate-900">
                    {crawlerState.found}
                  </strong>
                </span>
                <span className="text-green-600">
                  Importados: <strong>{crawlerState.imported}</strong>
                </span>
                <span className="text-red-500">
                  Descartados: <strong>{crawlerState.errors}</strong>
                </span>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-4 sm:p-6 min-w-0 overflow-x-hidden pt-0 sm:pt-0">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="min-w-0 w-full"
          >
            <TabsList className="mb-6 w-full justify-start h-auto p-1 bg-slate-100 flex-wrap overflow-x-auto hide-scrollbar">
              <TabsTrigger
                value="sources"
                className="py-2 px-4 whitespace-nowrap"
              >
                <Globe className="h-4 w-4 mr-2 shrink-0" />
                {t('franchisee.crawler.sources', 'Fontes de Dados')}
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="py-2 px-4 whitespace-nowrap"
              >
                <History className="h-4 w-4 mr-2 shrink-0" />
                {t('franchisee.crawler.history', 'Histórico de Buscas')}
              </TabsTrigger>
              <TabsTrigger
                value="promotions"
                className="py-2 px-4 whitespace-nowrap"
              >
                <Box className="h-4 w-4 mr-2 shrink-0" />
                {t('franchisee.crawler.promotions', 'Ofertas Pendentes')} (
                {formatNumber(pendingPromotionsCount)})
              </TabsTrigger>
              <TabsTrigger
                value="approved"
                className="py-2 px-4 whitespace-nowrap"
              >
                <Check className="h-4 w-4 mr-2 shrink-0" />
                Aprovadas ({formatNumber(approvedPromotionsCount)})
              </TabsTrigger>
              <TabsTrigger
                value="mappings"
                className="py-2 px-4 whitespace-nowrap"
              >
                <Settings2 className="h-4 w-4 mr-2 shrink-0" />
                Mapeamentos (De/Para)
              </TabsTrigger>
              <TabsTrigger
                value="integrations"
                className="py-2 px-4 whitespace-nowrap"
              >
                <Box className="h-4 w-4 mr-2 shrink-0" />
                Integrações API
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="sources"
              className="animate-in fade-in-50 min-w-0 w-full"
            >
              <CrawlerSourcesTab />
            </TabsContent>

            <TabsContent
              value="history"
              className="animate-in fade-in-50 min-w-0 w-full"
            >
              <CrawlerHistoryTab isScanning={crawlerState.isScanning} />
            </TabsContent>

            <TabsContent
              value="mappings"
              className="animate-in fade-in-50 min-w-0 w-full"
            >
              <CrawlerMappingsTab />
            </TabsContent>

            <TabsContent
              value="integrations"
              className="animate-in fade-in-50 min-w-0 w-full"
            >
              <ApifyIntegrationTab onImportCompleted={loadPromotions} />
            </TabsContent>

            <TabsContent
              value="approved"
              className="animate-in fade-in-50 min-w-0 w-full overflow-x-hidden"
            >
              {isLoadingPromotions ? (
                <div className="p-8 space-y-4">
                  <div className="flex justify-center mb-6">
                    <div className="flex flex-col items-center space-y-2">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-slate-500 font-medium">
                        Carregando promoções...
                      </p>
                    </div>
                  </div>
                </div>
              ) : !isLoadingPromotions &&
                baseApprovedPromotions.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <p className="text-slate-500 font-medium">
                    Nenhuma promoção aprovada encontrada.
                  </p>
                </div>
              ) : (
                <ApprovedOffersManager
                  promotions={baseApprovedPromotions}
                  onStatusChange={loadPromotions}
                />
              )}
            </TabsContent>

            <TabsContent
              value="promotions"
              className="animate-in fade-in-50 min-w-0 w-full overflow-x-hidden"
            >
              {isLoadingPromotions ? (
                <div className="p-8 space-y-4">
                  <div className="flex justify-center mb-6">
                    <div className="flex flex-col items-center space-y-2">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-slate-500 font-medium">
                        Carregando promoções...
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="flex flex-col sm:flex-row gap-4 w-full p-4 border rounded-lg bg-white/50 animate-pulse"
                      >
                        <div className="h-20 w-20 bg-slate-200 rounded-md shrink-0"></div>
                        <div className="flex-1 space-y-2 py-1">
                          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                          <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : !isLoadingPromotions &&
                pendingPromotions.length === 0 &&
                basePendingPromotions.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <p className="text-slate-500 font-medium">
                    {t(
                      'franchisee.crawler.empty',
                      'Nenhuma promoção pendente encontrada no momento.',
                    )}
                  </p>
                </div>
              ) : (
                <CrawlerPromotionsTab
                  pendingPromotions={pendingPromotions}
                  basePendingPromotions={basePendingPromotions}
                  filterState={filterState}
                  setFilterState={setFilterState}
                  filterCity={filterCity}
                  setFilterCity={setFilterCity}
                  filterStore={filterStore}
                  setFilterStore={setFilterStore}
                  filterSource={filterSource}
                  setFilterSource={setFilterSource}
                  filterCategory={filterCategory}
                  setFilterCategory={setFilterCategory}
                  filterFetchDate={filterFetchDate}
                  setFilterFetchDate={setFilterFetchDate}
                  isLoading={isLoadingPromotions}
                  onStatusChange={loadPromotions}
                  type="pending"
                />
              )}
            </TabsContent>
          </Tabs>{' '}
        </CardContent>
      </Card>
    </div>
  )
}

export function PromotionCrawler(props: { franchiseId?: string }) {
  return (
    <ErrorBoundary>
      <PromotionCrawlerContent {...props} />
    </ErrorBoundary>
  )
}
