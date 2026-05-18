import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { CampaignFormDialog } from '@/components/merchant/CampaignFormDialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ExternalLink,
  Check,
  X,
  Save,
  Copy,
  Filter,
  RotateCcw,
  Sparkles,
  Trash2,
  Clock,
  Activity,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { logAudit } from '@/services/audit'
import { useAuth } from '@/hooks/use-auth'

export function CrawlerPromotionsTab({
  pendingPromotions,
  basePendingPromotions,
  filterState,
  setFilterState,
  filterCity,
  setFilterCity,
  filterStore,
  setFilterStore,
  filterSource,
  setFilterSource,
  filterCategory,
  setFilterCategory,
  filterFetchDate,
  setFilterFetchDate,
  isLoading,
  onStatusChange,
  type = 'pending',
}: any) {
  const [isDeletingBatch, setIsDeletingBatch] = useState(false)
  const [isCheckingLinks, setIsCheckingLinks] = useState(false)

  const uniqueStates = useMemo(
    () =>
      Array.from(
        new Set(basePendingPromotions.map((p: any) => p.state).filter(Boolean)),
      ),
    [basePendingPromotions],
  )
  const uniqueCities = useMemo(
    () =>
      Array.from(
        new Set(basePendingPromotions.map((p: any) => p.city).filter(Boolean)),
      ),
    [basePendingPromotions],
  )
  const uniqueStores = useMemo(
    () =>
      Array.from(
        new Set(
          basePendingPromotions
            .map((p: any) => p.storeName || p.store_name)
            .filter(Boolean),
        ),
      ),
    [basePendingPromotions],
  )
  const uniqueSources = useMemo(
    () =>
      Array.from(
        new Set(
          basePendingPromotions
            .map((p: any) => p.source_id || p.sourceId)
            .filter(Boolean),
        ),
      ),
    [basePendingPromotions],
  )
  const uniqueCategories = useMemo(
    () =>
      Array.from(
        new Set(
          basePendingPromotions.map((p: any) => p.category).filter(Boolean),
        ),
      ),
    [basePendingPromotions],
  )
  const uniqueDates = useMemo(
    () =>
      Array.from(
        new Set(
          basePendingPromotions
            .map((p: any) => {
              const dateVal = p.captured_at || p.capturedAt
              return dateVal ? dateVal.split('T')[0] : ''
            })
            .filter(Boolean),
        ),
      ),
    [basePendingPromotions],
  )

  const { user: authUser } = useAuth()

  const handleDeleteFiltered = async () => {
    if (
      !confirm(
        'Tem certeza que deseja EXCLUIR TODAS as promoções listadas nestes filtros? Esta ação não pode ser desfeita.',
      )
    )
      return

    setIsDeletingBatch(true)
    try {
      const idsToDelete = pendingPromotions.map((p: any) => p.id)

      const chunkSize = 100
      for (let i = 0; i < idsToDelete.length; i += chunkSize) {
        const chunk = idsToDelete.slice(i, i + chunkSize)
        const { error } = await supabase
          .from('discovered_promotions')
          .delete()
          .in('id', chunk)
        if (error) throw error
      }

      await logAudit(
        'BATCH_DELETE',
        'promotion',
        'multiple',
        `${idsToDelete.length} promoções excluídas em lote pelos filtros`,
        authUser?.email,
      )
      toast.success(`${idsToDelete.length} promoções excluídas com sucesso!`)
      onStatusChange()
    } catch (err: any) {
      toast.error('Erro ao excluir: ' + err.message)
    } finally {
      setIsDeletingBatch(false)
    }
  }

  const handleExpireFiltered = async () => {
    if (
      !confirm(
        'Tem certeza que deseja marcar como EXPIRADAS as promoções filtradas?',
      )
    )
      return

    setIsDeletingBatch(true)
    try {
      const idsToUpdate = pendingPromotions.map((p: any) => p.id)

      const chunkSize = 100
      for (let i = 0; i < idsToUpdate.length; i += chunkSize) {
        const chunk = idsToUpdate.slice(i, i + chunkSize)
        const { error } = await supabase
          .from('discovered_promotions')
          .update({ status: 'expired' })
          .in('id', chunk)
        if (error) throw error
      }

      await logAudit(
        'BATCH_EXPIRE',
        'promotion',
        'multiple',
        `${idsToUpdate.length} promoções marcadas como expiradas em lote`,
        authUser?.email,
      )
      toast.success(`${idsToUpdate.length} promoções expiradas com sucesso!`)
      onStatusChange()
    } catch (err: any) {
      toast.error('Erro ao expirar: ' + err.message)
    } finally {
      setIsDeletingBatch(false)
    }
  }

  const handleRunNightlyCheck = async () => {
    if (
      !confirm(
        'Deseja rodar a varredura de links expirados agora? Isso verificará todas as ofertas aprovadas.',
      )
    )
      return

    setIsCheckingLinks(true)
    try {
      const { data, error } = await supabase.functions.invoke(
        'check-expired-promotions',
      )
      if (error) throw error
      toast.success(
        `Varredura concluída! ${data?.expiredCount || 0} ofertas foram marcadas como expiradas.`,
      )
      if (data?.expiredCount > 0) {
        onStatusChange()
      }
    } catch (err: any) {
      toast.error('Erro na varredura: ' + err.message)
    } finally {
      setIsCheckingLinks(false)
    }
  }

  return (
    <div className="space-y-4 min-w-0 w-full overflow-hidden">
      <Card className="min-w-0 w-full border-none shadow-none bg-slate-50/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Filter className="h-4 w-4" />
              Filtros de Limpeza e Curadoria
            </div>

            <div className="flex flex-wrap gap-2">
              {type === 'approved' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRunNightlyCheck}
                  disabled={isCheckingLinks}
                  className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  {isCheckingLinks ? 'Varrendo...' : 'Forçar Varredura'}
                </Button>
              )}

              {pendingPromotions.length > 0 && (
                <>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteFiltered}
                    disabled={isDeletingBatch}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Filtrados ({pendingPromotions.length})
                  </Button>

                  {type === 'approved' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleExpireFiltered}
                      disabled={isDeletingBatch}
                      className="bg-amber-100 text-amber-800 hover:bg-amber-200"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Expirar Filtrados ({pendingPromotions.length})
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Select value={filterState} onValueChange={setFilterState}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Estados</SelectItem>
                {uniqueStates.map((s: any) => (
                  <SelectItem key={s} value={s}>
                    {s as string}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCity} onValueChange={setFilterCity}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Cidades</SelectItem>
                {uniqueCities.map((s: any) => (
                  <SelectItem key={s} value={s}>
                    {s as string}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStore} onValueChange={setFilterStore}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Loja" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Lojas</SelectItem>
                {uniqueStores.map((s: any) => (
                  <SelectItem key={s} value={s}>
                    {s as string}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterSource} onValueChange={setFilterSource}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Fonte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Fontes</SelectItem>
                {uniqueSources.map((s: any) => (
                  <SelectItem key={s} value={s}>
                    {s as string}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {uniqueCategories.map((s: any) => (
                  <SelectItem key={s} value={s}>
                    {s as string}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterFetchDate} onValueChange={setFilterFetchDate}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Qualquer Data</SelectItem>
                {uniqueDates.map((s: any) => (
                  <SelectItem key={s} value={s}>
                    {s as string}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4 min-w-0 w-full overflow-x-hidden pb-4">
        {pendingPromotions.map((promo: any) => (
          <EditablePromotionCard
            key={promo.id}
            promo={promo}
            onSaved={onStatusChange}
            type={type}
          />
        ))}
        {pendingPromotions.length === 0 && (
          <div className="p-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <p className="text-slate-500 font-medium">
              Nenhuma promoção correspondente aos filtros.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function EditablePromotionCard({ promo, onSaved, type = 'pending' }: any) {
  const [title, setTitle] = useState(promo.title || '')
  const [description, setDescription] = useState(promo.description || '')
  const [storeName, setStoreName] = useState(
    promo.store_name || promo.storeName || '',
  )
  const [link, setLink] = useState(promo.product_link || promo.source_url || '')
  const [price, setPrice] = useState(promo.price || '')
  const [currency, setCurrency] = useState(promo.currency || 'BRL')
  const [isSaving, setIsSaving] = useState(false)
  const [showCampaignDialog, setShowCampaignDialog] = useState(false)
  const { user: authUser } = useAuth()

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('discovered_promotions')
        .update({
          title,
          description,
          store_name: storeName,
          product_link: link,
          price: price ? parseFloat(price) : null,
          currency: currency.toUpperCase(),
        })
        .eq('id', promo.id)

      if (error) throw error
      toast.success('Alterações salvas com sucesso!')
      onSaved()
    } catch (err: any) {
      toast.error('Erro ao salvar: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleApprove = async () => {
    try {
      const { error } = await supabase
        .from('discovered_promotions')
        .update({ status: 'approved' })
        .eq('id', promo.id)
      if (error) throw error
      toast.success('Promoção aprovada com sucesso!')
      onSaved()
    } catch (err: any) {
      toast.error('Erro ao aprovar: ' + err.message)
    }
  }

  const handleReject = async () => {
    try {
      const { error } = await supabase
        .from('discovered_promotions')
        .update({ status: 'rejected' })
        .eq('id', promo.id)
      if (error) throw error
      toast.success('Promoção rejeitada!')
      onSaved()
    } catch (err: any) {
      toast.error('Erro ao rejeitar: ' + err.message)
    }
  }

  const handlePending = async () => {
    try {
      const { error } = await supabase
        .from('discovered_promotions')
        .update({ status: 'pending' })
        .eq('id', promo.id)
      if (error) throw error
      toast.success('Promoção movida para pendentes!')
      onSaved()
    } catch (err: any) {
      toast.error('Erro ao mover: ' + err.message)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Deseja excluir esta oferta definitivamente?')) return
    try {
      const { error } = await supabase
        .from('discovered_promotions')
        .delete()
        .eq('id', promo.id)
      if (error) throw error
      await logAudit(
        'DELETE',
        'promotion',
        promo.id,
        `Oferta "${promo.title}" excluída manualmente`,
        authUser?.email,
      )
      toast.success('Promoção excluída!')
      onSaved()
    } catch (err: any) {
      toast.error('Erro ao excluir: ' + err.message)
    }
  }

  const handleExpire = async () => {
    try {
      const { error } = await supabase
        .from('discovered_promotions')
        .update({ status: 'expired' })
        .eq('id', promo.id)
      if (error) throw error
      await logAudit(
        'EXPIRE',
        'promotion',
        promo.id,
        `Oferta "${promo.title}" expirada manualmente`,
        authUser?.email,
      )
      toast.success('Promoção marcada como expirada!')
      onSaved()
    } catch (err: any) {
      toast.error('Erro ao expirar: ' + err.message)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(link)
    toast.success('Link copiado!')
  }

  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm flex flex-col xl:flex-row gap-4 w-full max-w-full overflow-hidden transition-all hover:border-primary/30">
      {/* Content Area - CRITICAL: min-w-0 prevents this flex child from blowing past 100% width and pushing buttons off screen */}
      <div className="flex-1 min-w-0 space-y-3 overflow-hidden">
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-500 block">
              Título
            </label>
          </div>
          <div className="flex gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 font-medium"
              placeholder="Título da oferta"
            />
            <Input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-24 font-mono text-sm"
              placeholder="0.00"
              type="number"
              step="0.01"
              title="Valor bruto"
            />
            <Input
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-16 font-mono text-sm uppercase text-center"
              placeholder="BRL"
              maxLength={3}
              title="Moeda Original"
            />
          </div>
          {currency && currency.toUpperCase() !== 'BRL' && (
            <div className="mt-1.5 flex items-center">
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1 border border-amber-200">
                ⚠️ Moeda Estrangeira ({currency}) - Sem Conversão Automática
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 flex items-center justify-between">
            <span>Descritivo Bruto / Original</span>
            <span className="font-mono text-[10px] bg-slate-100 px-1 py-0.5 rounded text-slate-400">
              RAW DATA
            </span>
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full resize-y min-h-[80px] text-sm font-mono bg-slate-50"
            placeholder="Descrição da oferta"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0">
          <div className="min-w-0">
            <label className="text-xs font-semibold text-slate-500 mb-1 block">
              Nome da Loja
            </label>
            <Input
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full"
              placeholder="Ex: Booking"
            />
          </div>
          <div className="min-w-0">
            <label className="text-xs font-semibold text-slate-500 mb-1 flex justify-between items-center">
              <span>Link Direto / Origem</span>
              {link && !link.startsWith('http') && (
                <span className="text-[10px] text-red-500 font-bold bg-red-50 px-1 py-0.5 rounded">
                  Inválido
                </span>
              )}
            </label>
            <div className="flex gap-2 w-full min-w-0">
              <Input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className={cn(
                  'flex-1 min-w-0 font-mono text-xs',
                  link &&
                    !link.startsWith('http') &&
                    'border-red-300 focus-visible:ring-red-500',
                )}
                placeholder="https://..."
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                title="Copiar link"
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                asChild
                title="Abrir link seguro"
                className="shrink-0"
              >
                <a href={link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - CRITICAL: shrink-0 keeps buttons fixed size. overflow-x-auto provides horizontal scroll on mobile */}
      <div className="flex flex-row xl:flex-col gap-2 shrink-0 xl:w-40 overflow-x-auto pb-2 xl:pb-0 justify-start sm:justify-end xl:justify-start pt-2 xl:pt-0 border-t xl:border-t-0 xl:border-l border-slate-100 xl:pl-4">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="whitespace-nowrap flex-1 xl:flex-none justify-start"
        >
          <Save className="h-4 w-4 mr-2 shrink-0" /> Salvar Edição
        </Button>

        {type === 'pending' && (
          <Button
            size="sm"
            onClick={handleApprove}
            variant="default"
            className="bg-green-600 hover:bg-green-700 whitespace-nowrap flex-1 xl:flex-none justify-start"
          >
            <Check className="h-4 w-4 mr-2 shrink-0" /> Aprovar
          </Button>
        )}

        {type === 'approved' && (
          <>
            <Button
              size="sm"
              onClick={() => setShowCampaignDialog(true)}
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap flex-1 xl:flex-none justify-start text-white"
            >
              <Sparkles className="h-4 w-4 mr-2 shrink-0" /> Publicar
            </Button>
            <Button
              size="sm"
              onClick={handleExpire}
              variant="secondary"
              className="bg-amber-100 text-amber-800 hover:bg-amber-200 whitespace-nowrap flex-1 xl:flex-none justify-start"
            >
              <Clock className="h-4 w-4 mr-2 shrink-0" /> Expirar
            </Button>
            <Button
              size="sm"
              onClick={handlePending}
              variant="outline"
              className="whitespace-nowrap flex-1 xl:flex-none justify-start"
            >
              <RotateCcw className="h-4 w-4 mr-2 shrink-0" /> Pendente
            </Button>
          </>
        )}

        {type !== 'approved' && (
          <Button
            size="sm"
            onClick={handleReject}
            variant="secondary"
            className="whitespace-nowrap flex-1 xl:flex-none justify-start"
          >
            <X className="h-4 w-4 mr-2 shrink-0" /> Rejeitar
          </Button>
        )}

        <Button
          size="sm"
          onClick={handleDelete}
          variant="destructive"
          className="whitespace-nowrap flex-1 xl:flex-none justify-start"
        >
          <Trash2 className="h-4 w-4 mr-2 shrink-0" /> Excluir
        </Button>
      </div>

      <CampaignFormDialog
        open={showCampaignDialog}
        onOpenChange={(open) => {
          setShowCampaignDialog(open)
          if (!open) {
            onSaved()
          }
        }}
        coupon={{
          id: promo.id,
          title: title || '',
          description: description || '',
          image: promo.image_url || '',
          externalUrl: link || '',
          link: link || '',
          companyId: promo.company_id || '',
          category: promo.category || 'Outros',
          discount:
            promo.discount ||
            (promo.original_price && price
              ? `De ${currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency} ${promo.original_price} por ${currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency} ${price}`
              : ''),
          price: price ? parseFloat(price) : null,
          startDate: promo.start_date || new Date().toISOString().split('T')[0],
          endDate:
            promo.end_date ||
            new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        }}
      />
    </div>
  )
}
