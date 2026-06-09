import { useState, useEffect } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import { Button } from '@/components/ui/button'
import { Megaphone, Plus, Rocket } from 'lucide-react'
import { VendorCampaignsTab } from '@/components/vendor/VendorCampaignsTab'
import { CampaignFormDialog } from '@/components/merchant/CampaignFormDialog'
import { BoostCampaignDialog } from '@/components/merchant/BoostCampaignDialog'
import { CreateAdCampaignDialog } from '@/components/merchant/CreateAdCampaignDialog'
import { supabase } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'

export default function MerchantCampaigns() {
  const { coupons, user, companies } = useCouponStore()
  const { user: authUser, profile } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [adCampaigns, setAdCampaigns] = useState<any[]>([])
  const [isBoostOpen, setIsBoostOpen] = useState(false)
  const [selectedAd, setSelectedAd] = useState<any>(null)
  const [myCompany, setMyCompany] = useState<any>(null)
  const [isLoadingCompany, setIsLoadingCompany] = useState(true)

  useEffect(() => {
    const resolveCompany = async () => {
      const found =
        companies.find((c) => c.id === user?.companyId) || companies[0]
      if (found) {
        setMyCompany(found)
        setIsLoadingCompany(false)
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
        } else if (
          profile?.role === 'admin' ||
          profile?.role === 'super_admin'
        ) {
          setMyCompany({ id: 'admin-global', name: 'Admin Global' })
        }
      }
      setIsLoadingCompany(false)
    }
    resolveCompany()
  }, [companies, user, authUser, profile])

  const fetchAds = async () => {
    if (!myCompany || myCompany.id === 'admin-global') return
    const { data } = await supabase
      .from('ad_campaigns')
      .select('*')
      .eq('company_id', myCompany.id)
      .order('created_at', { ascending: false })
    if (data) setAdCampaigns(data)
  }

  useEffect(() => {
    if (myCompany) fetchAds()
  }, [myCompany?.id])

  if (isLoadingCompany) {
    return (
      <div className="container py-8 px-4 max-w-6xl mx-auto">Carregando...</div>
    )
  }

  if (!myCompany) {
    return (
      <div className="container py-8 px-4 max-w-6xl mx-auto space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
              <Megaphone className="h-6 w-6 text-primary" />
              Minhas Promoções
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Nenhuma empresa associada ao seu perfil. Por favor, cadastre seu
              estabelecimento ou aguarde aprovação para criar promoções.
            </p>
          </div>
          <Button
            disabled
            className="w-full sm:w-auto font-bold shadow-md opacity-50 cursor-not-allowed"
          >
            <Plus className="w-4 h-4 mr-2" /> Nova Promoção
          </Button>
        </div>
      </div>
    )
  }

  const myCoupons = coupons.filter((c) => c.companyId === myCompany.id)

  return (
    <div className="container py-8 px-4 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
            <Megaphone className="h-6 w-6 text-primary" />
            Minhas Promoções
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Crie, gerencie e acompanhe o desempenho das suas ofertas com uma
            visão detalhada.
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="w-full sm:w-auto font-bold shadow-md hover:-translate-y-0.5 transition-transform"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Promoção
        </Button>
      </div>

      <VendorCampaignsTab coupons={myCoupons} company={myCompany} />

      {/* Ads Engine List */}
      <div className="mt-12 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <Rocket className="h-5 w-5 text-indigo-500" />
            Minhas Campanhas Pagas (Ads Engine)
          </h2>
          <CreateAdCampaignDialog
            companyId={myCompany.id}
            environment={myCompany.franchiseId || 'global'}
            onCreated={fetchAds}
          />
        </div>
        {adCampaigns.length === 0 ? (
          <p className="text-slate-500">
            Você ainda não possui campanhas rodando no Ad Engine.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adCampaigns.map((ad) => (
              <div
                key={ad.id}
                className="border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition-colors"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3
                      className="font-bold text-slate-800 truncate"
                      title={ad.title}
                    >
                      {ad.title}
                    </h3>
                    {ad.billing_type === 'premium' && (
                      <Badge className="bg-indigo-500 hover:bg-indigo-600">
                        Premium
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                    {ad.description}
                  </p>
                  <div className="text-xs text-slate-500 mb-1">
                    <strong>Score de Prioridade:</strong>{' '}
                    {ad.priority_score || 0}
                  </div>
                  <div className="text-xs text-slate-500">
                    <strong>Cliques:</strong> {ad.clicks || 0} /{' '}
                    <strong>Views:</strong> {ad.views || 0}
                  </div>
                </div>
                <Button
                  className="mt-4 w-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-semibold"
                  variant="secondary"
                  onClick={() => {
                    setSelectedAd(ad)
                    setIsBoostOpen(true)
                  }}
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Impulsionar
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <CampaignFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        companyId={myCompany.id}
        onSuccess={fetchAds}
      />

      {selectedAd && (
        <BoostCampaignDialog
          open={isBoostOpen}
          onOpenChange={setIsBoostOpen}
          campaign={selectedAd}
          onBoosted={fetchAds}
        />
      )}
    </div>
  )
}
