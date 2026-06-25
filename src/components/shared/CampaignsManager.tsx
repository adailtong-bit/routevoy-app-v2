import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, PlusCircle, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { CampaignFormDialog } from '@/components/merchant/CampaignFormDialog'
import { format } from 'date-fns'
import { useLanguage } from '@/stores/LanguageContext'

export function CampaignsManager({
  franchiseId,
  companyId,
  affiliateId,
  onEdit,
}: {
  franchiseId?: string
  companyId?: string
  affiliateId?: string
  onEdit?: (data: any) => void
}) {
  const { t } = useLanguage()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<any>(null)

  useEffect(() => {
    fetchCampaigns()
  }, [companyId, franchiseId, affiliateId])

  const isValidUUID = (id: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      id,
    )

  const fetchCampaigns = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('ad_campaigns')
        .select('*')
        .eq('environment', 'production')
        .order('created_at', { ascending: false })

      if (companyId) {
        if (isValidUUID(companyId)) {
          query = query.eq('company_id', companyId)
        } else {
          setCampaigns([])
          setLoading(false)
          return
        }
      }
      if (franchiseId) {
        query = query.eq('franchise_id', franchiseId)
      }
      if (affiliateId) {
        if (isValidUUID(affiliateId)) {
          query = query.eq('affiliate_id', affiliateId)
        } else {
          setCampaigns([])
          setLoading(false)
          return
        }
      }

      const { data, error } = await query

      if (error) throw error
      setCampaigns(data || [])
    } catch (err) {
      console.error('Error fetching campaigns:', err)
      toast.error('Failed to load campaigns')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        t(
          'admin.offers.confirm_delete',
          'Tem certeza que deseja excluir esta campanha?',
        ),
      )
    )
      return
    try {
      const { error, count } = await supabase
        .from('ad_campaigns')
        .delete({ count: 'exact' })
        .eq('id', id)

      if (error) {
        throw new Error(
          error.message || 'Erro ao executar a operação de exclusão.',
        )
      }

      if (count === 0) {
        throw new Error(
          t(
            'admin.offers.delete_error_permission',
            'A campanha não pôde ser excluída. Pode estar bloqueada por registros vinculados ou você não tem permissão.',
          ),
        )
      }

      toast.success(
        t('admin.offers.deleted_success', 'Campanha excluída com sucesso'),
      )
      fetchCampaigns()
    } catch (err: any) {
      console.error('Error deleting campaign:', err)
      const errorMsg =
        err.message ||
        t('admin.offers.delete_error', 'Falha ao excluir campanha')
      toast.error(errorMsg)
    }
  }

  const handleEdit = (campaign: any) => {
    if (onEdit) {
      onEdit(campaign)
    } else {
      setEditingCampaign(campaign)
      setIsSheetOpen(true)
    }
  }

  const handleCreate = () => {
    if (onEdit) {
      onEdit(null)
    } else {
      setEditingCampaign(null)
      setIsSheetOpen(true)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t('admin.ad_manager.campaigns', 'Campanhas')}
          </h2>
          <p className="text-muted-foreground">
            {t(
              'merchant.campaigns.desc',
              'Crie, gerencie e acompanhe o desempenho de suas ofertas com uma visão detalhada.',
            )}
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <PlusCircle className="w-4 h-4" />
          {t('common.create_campaign', 'Criar Campanha')}
        </Button>
      </div>

      {loading ? (
        <div className="text-center p-12 text-muted-foreground border rounded-xl bg-slate-50/50">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          {t('common.loading', 'Carregando...')}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="border rounded-xl p-5 bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-[360px]"
            >
              <div className="h-32 -mx-5 -mt-5 mb-4 bg-slate-100 relative shrink-0 border-b">
                <img
                  src={
                    campaign.image ||
                    'https://img.usecurling.com/p/400/300?q=sale'
                  }
                  alt={campaign.title || 'Campaign'}
                  className="w-full h-full object-cover rounded-t-xl"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src =
                      'https://img.usecurling.com/p/400/300?q=sale'
                  }}
                />
                <Badge
                  variant={
                    campaign.status === 'active' ? 'default' : 'secondary'
                  }
                  className="absolute top-3 right-3 capitalize shadow-sm"
                >
                  {campaign.status === 'active'
                    ? 'Ativo'
                    : campaign.status || 'Ativo'}
                </Badge>
              </div>

              <div className="flex flex-col flex-1">
                <h3
                  className="font-semibold text-lg line-clamp-1 mb-1"
                  title={campaign.title}
                >
                  {campaign.title}
                </h3>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {campaign.description ||
                    t(
                      'merchant.pre_launch.no_desc',
                      'Nenhuma descrição fornecida.',
                    )}
                </p>

                <div className="space-y-2 mb-4 mt-auto">
                  {(campaign.start_date || campaign.end_date) && (
                    <div className="flex items-center text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      {campaign.start_date
                        ? format(new Date(campaign.start_date), 'MMM d, yyyy')
                        : '...'}{' '}
                      -
                      {campaign.end_date
                        ? format(new Date(campaign.end_date), 'MMM d, yyyy')
                        : '...'}
                    </div>
                  )}
                  {campaign.category && (
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {campaign.category}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md w-fit">
                    {campaign.views || 0} {t('common.views', 'visualizações')}
                  </span>
                  {campaign.budget !== null &&
                    campaign.budget !== undefined && (
                      <span className="text-xs font-bold text-emerald-600">
                        {t('ads.budget', 'Orçamento')}: $
                        {Number(campaign.budget).toLocaleString()}
                      </span>
                    )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(campaign)}
                    className="h-8 px-2.5"
                  >
                    <Edit className="w-4 h-4 mr-1.5" />{' '}
                    {t('common.edit', 'Editar')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(campaign.id)}
                    className="h-8 px-2.5 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {campaigns.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground border border-dashed rounded-xl bg-slate-50/50">
              <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <PlusCircle className="w-6 h-6 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">
                {t(
                  'merchant.campaigns.empty_title',
                  'Nenhuma campanha encontrada',
                )}
              </h3>
              <p className="text-slate-500 mb-4 max-w-sm mx-auto">
                {t(
                  'merchant.campaigns.empty_desc',
                  'Crie sua primeira campanha para começar a alcançar mais clientes.',
                )}
              </p>
              <Button onClick={handleCreate}>
                {t('common.create_campaign', 'Criar Campanha')}
              </Button>
            </div>
          )}
        </div>
      )}

      {!onEdit && (
        <CampaignFormDialog
          open={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          franchiseId={franchiseId}
          companyId={companyId}
          affiliateId={affiliateId}
          onSuccess={fetchCampaigns}
          editData={editingCampaign}
        />
      )}
    </div>
  )
}
