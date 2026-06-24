import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/stores/LanguageContext'
import { Megaphone, Plus, Search, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CampaignFormDialog } from '@/components/merchant/CampaignFormDialog'
import { PromotionCard } from '@/components/PromotionCard'
import { DiscoveredPromotion } from '@/lib/types'
import { cn } from '@/lib/utils'

export function CampaignsManager({
  companyId,
  companyName,
  franchiseId,
  affiliateId,
  role,
}: {
  companyId?: string
  companyName?: string
  franchiseId?: string
  affiliateId?: string
  role?: string
}) {
  const { t } = useLanguage()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openForm, setOpenForm] = useState(false)
  const [search, setSearch] = useState('')
  const [editData, setEditData] = useState<any>(null)

  const fetchCampaigns = async () => {
    setLoading(true)

    let query = supabase
      .from('ad_campaigns')
      .select('*')
      .neq('placement', 'organic')
      .order('created_at', { ascending: false })

    const isMaster = role === 'admin' || role === 'super_admin'

    if (!isMaster) {
      if (role === 'franchisee' && franchiseId) {
        query = query.eq('franchise_id', franchiseId)
      } else if (role === 'affiliate' && affiliateId) {
        query = query.eq('affiliate_id', affiliateId)
      } else if (companyId) {
        query = query.eq('company_id', companyId)
      } else {
        setCampaigns([])
        setLoading(false)
        return
      }
    }

    const { data } = await query

    if (data) setCampaigns(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchCampaigns()
  }, [companyId, franchiseId, affiliateId, role])

  const mapToPromotion = (dbRow: any): DiscoveredPromotion => ({
    id: dbRow.id,
    sourceId: 'merchant',
    title: dbRow.title,
    description: dbRow.description,
    price: dbRow.price,
    originalPrice: dbRow.original_price,
    discount: dbRow.discount_percentage
      ? `${dbRow.discount_percentage}% OFF`
      : undefined,
    imageUrl: dbRow.image,
    storeName: companyName || 'Local Store',
    category: dbRow.category,
    status: dbRow.status,
    currency: dbRow.currency || 'BRL',
    region: dbRow.country || 'BR',
    productLink: dbRow.link,
    externalUrl: dbRow.link,
    isVerified: true,
    usageCount: dbRow.clicks || 0,
    promotionModel: dbRow.promotion_model || 'standard',
    rewardDescription: dbRow.reward_description,
    coordinates: { lat: dbRow.latitude, lng: dbRow.longitude },
  })

  const filteredCampaigns = campaigns.filter(
    (c) =>
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase()),
  )

  const isMaster = role === 'admin' || role === 'super_admin'
  const isFranchisee = role === 'franchisee'
  const isAffiliate = role === 'affiliate'

  if (!companyId && !isMaster && !isFranchisee && !isAffiliate) {
    return (
      <div className="text-center py-12 bg-white border border-dashed rounded-xl text-slate-500">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-slate-100 rounded-full">
            <Megaphone className="w-8 h-8 text-slate-400" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          Configure seu Perfil
        </h3>
        <p className="text-slate-500 max-w-md mx-auto mb-6">
          É necessário ter uma empresa associada ao seu perfil para gerenciar
          campanhas.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {t('merchant.campaigns.title', 'Campanhas')}
            </h1>
            <p className="text-slate-500">
              {companyName || 'Gestão de ofertas e campanhas ativas'}
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={() => {
            setEditData(null)
            setOpenForm(true)
          }}
          className="font-semibold shadow-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('campaign_form.create_title', 'Criar Nova Campanha')}
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          className="pl-10 h-12 bg-white"
          placeholder={t('common.search', 'Buscar')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary/40 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="text-center py-12 bg-white border border-dashed rounded-xl text-slate-500">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Megaphone className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            {t('merchant.campaigns.empty_title', 'Nenhuma campanha encontrada')}
          </h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            {t(
              'merchant.campaigns.empty_desc',
              'Você ainda não possui nenhuma campanha. Crie sua primeira campanha para atrair mais clientes.',
            )}
          </p>
          <Button
            onClick={() => {
              setEditData(null)
              setOpenForm(true)
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('campaign_form.create_title', 'Criar Nova Campanha')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((c) => (
            <div
              key={c.id}
              className={cn(
                'relative group flex flex-col gap-2 transition-all duration-300',
                (c.status === 'inactive' || c.status === 'deleted') &&
                  'opacity-60 grayscale',
              )}
            >
              <PromotionCard promotion={mapToPromotion(c)} />
              <div className="flex items-center justify-between mt-2 px-1 text-xs text-slate-500">
                <div className="flex gap-3">
                  <span>
                    <strong className="text-slate-700">{c.views || 0}</strong>{' '}
                    Views
                  </span>
                  <span>
                    <strong className="text-slate-700">{c.clicks || 0}</strong>{' '}
                    Clicks
                  </span>
                </div>
                <div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${c.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                  >
                    {(c.status || 'draft').toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setEditData(c)
                    setOpenForm(true)
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" /> {t('common.edit', 'Editar')}
                </Button>
                {c.status !== 'inactive' && c.status !== 'deleted' ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={async () => {
                      if (
                        confirm(
                          'Tem certeza que deseja desativar esta campanha?',
                        )
                      ) {
                        await supabase
                          .from('ad_campaigns')
                          .update({ status: 'inactive' })
                          .eq('id', c.id)
                        fetchCampaigns()
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Desativar
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 bg-slate-200 text-slate-700 hover:bg-slate-300"
                    onClick={async () => {
                      if (confirm('Deseja reativar esta campanha?')) {
                        await supabase
                          .from('ad_campaigns')
                          .update({ status: 'active' })
                          .eq('id', c.id)
                        fetchCampaigns()
                      }
                    }}
                  >
                    Reativar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {(companyId || isMaster || isFranchisee || isAffiliate) && (
        <CampaignFormDialog
          open={openForm}
          onOpenChange={(v) => {
            setOpenForm(v)
            if (!v) setEditData(null)
          }}
          companyId={companyId}
          franchiseId={franchiseId}
          affiliateId={affiliateId}
          onSuccess={() => fetchCampaigns()}
          editData={editData}
        />
      )}
    </div>
  )
}
