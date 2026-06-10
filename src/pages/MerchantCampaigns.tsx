import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/stores/LanguageContext'
import { useAuth } from '@/hooks/use-auth'
import { Megaphone, Plus, Search, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCouponStore } from '@/stores/CouponContext'
import { CampaignFormDialog } from '@/components/merchant/CampaignFormDialog'
import { PromotionCard } from '@/components/PromotionCard'
import { DiscoveredPromotion } from '@/lib/types'

export default function MerchantCampaigns() {
  const { t } = useLanguage()
  const { user: authUser, profile } = useAuth()
  const { user, companies } = useCouponStore()

  const [myCompany, setMyCompany] = useState<any>(null)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openForm, setOpenForm] = useState(false)
  const [search, setSearch] = useState('')
  const [editData, setEditData] = useState<any>(null)

  const fetchCampaigns = async (companyId: string) => {
    setLoading(true)
    const { data } = await supabase
      .from('ad_campaigns')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (data) setCampaigns(data)
    setLoading(false)
  }
  useEffect(() => {
    const resolveCompany = async () => {
      const found =
        companies.find((c) => c.id === user?.companyId) || companies[0]
      if (found) {
        setMyCompany(found)
        fetchCampaigns(found.id)
        return
      }
      if (authUser?.email) {
        const { data } = await supabase
          .from('merchants')
          .select('*')
          .eq('email', authUser.email)
          .maybeSingle()
        if (data) {
          setMyCompany(data)
          fetchCampaigns(data.id)
        }
      }
      setLoading(false)
    }
    resolveCompany()
  }, [companies, user, authUser, profile])

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
    storeName: myCompany?.name || 'Local Store',
    category: dbRow.category,
    status: dbRow.status,
    currency: dbRow.currency || 'BRL',
    region: dbRow.country || 'BR',
    productLink: dbRow.link,
    isVerified: true,
    usageCount: dbRow.clicks || 0,
    promotionModel: dbRow.promotion_model,
  })
  const filteredCampaigns = campaigns.filter(
    (c) =>
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="container py-8 px-4 max-w-7xl mx-auto space-y-6 animate-fade-in">
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
              {myCompany?.name || 'Gestão de ofertas e campanhas ativas'}
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
          Criar Campanha
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          className="pl-10 h-12 bg-white"
          placeholder="Buscar campanhas..."
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
          Nenhuma campanha encontrada.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((c) => (
            <div key={c.id} className="relative group flex flex-col gap-2">
              <PromotionCard promotion={mapToPromotion(c)} />
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
                  <Edit className="w-4 h-4 mr-2" /> Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={async () => {
                    if (
                      confirm('Tem certeza que deseja excluir esta campanha?')
                    ) {
                      await supabase
                        .from('ad_campaigns')
                        .delete()
                        .eq('id', c.id)
                      fetchCampaigns(myCompany.id)
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Excluir
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {myCompany && (
        <CampaignFormDialog
          open={openForm}
          onOpenChange={(v) => {
            setOpenForm(v)
            if (!v) setEditData(null)
          }}
          companyId={myCompany.id}
          onSuccess={() => fetchCampaigns(myCompany.id)}
          editData={editData}
        />
      )}
    </div>
  )
}
