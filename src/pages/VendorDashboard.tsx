import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useLanguage } from '@/stores/LanguageContext'
import { Button } from '@/components/ui/button'
import { ScanLine, Rocket, Plus, Store } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCouponStore } from '@/stores/CouponContext'
import { CampaignFormDialog } from '@/components/merchant/CampaignFormDialog'

export default function VendorDashboard() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { user, companies } = useCouponStore()
  const { user: authUser, profile } = useAuth()

  const [myCompany, setMyCompany] = useState<any>(null)
  const [isCampaignFormOpen, setIsCampaignFormOpen] = useState(false)

  const [isSyncing, setIsSyncing] = useState(false)

  const resolveCompany = async (forceSync = false) => {
    setIsSyncing(true)
    try {
      if (forceSync && authUser) {
        // Auto-heal logic
        const { data: p } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', authUser.id)
          .maybeSingle()
        if (!p?.company_id) {
          const newCompanyId = crypto.randomUUID()
          const { data: newMerch } = await supabase
            .from('merchants')
            .insert({
              id: newCompanyId,
              name: authUser.user_metadata?.name
                ? `${authUser.user_metadata.name} Store`
                : 'Nova Loja',
              email: authUser.email,
              status: 'active',
            })
            .select()
            .single()
          if (newMerch) {
            await supabase
              .from('profiles')
              .update({ company_id: newCompanyId })
              .eq('id', authUser.id)
            setMyCompany(newMerch)
            return
          }
        }
      }

      const pCompanyId = profile?.company_id || user?.companyId
      if (pCompanyId) {
        const { data } = await supabase
          .from('merchants')
          .select('*')
          .eq('id', pCompanyId)
          .maybeSingle()
        if (data) {
          setMyCompany(data)
          return
        }
      }

      if (authUser?.email) {
        const { data } = await supabase
          .from('merchants')
          .select('*')
          .ilike('email', authUser.email)
          .maybeSingle()
        if (data) {
          setMyCompany(data)
        } else if (
          profile?.role === 'admin' ||
          profile?.role === 'super_admin' ||
          authUser.email?.toLowerCase() === 'adailtong@gmail.com'
        ) {
          setMyCompany({
            id: 'admin-global',
            name: 'Empresa Teste (Visão Admin) - Global',
          })
        } else if (forceSync) {
          // Provide a clear state if really missing
          setMyCompany(null)
        }
      }
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    resolveCompany()
  }, [authUser, profile])

  if (!myCompany && !isSyncing) {
    return (
      <div className="container py-16 text-center animate-fade-in flex flex-col items-center justify-center min-h-[60vh]">
        <Store className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          {t('merchant.no_store', 'No Store Associated')}
        </h2>
        <p className="text-slate-500 mb-6 max-w-md">
          {t(
            'merchant.no_store_desc',
            'Your profile is configured as a Merchant, but there is no store linked to your email yet. Please sync your profile or contact support.',
          )}
        </p>
        <div className="flex gap-4 mt-4">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="px-8 font-bold"
          >
            {t('common.back_home', 'Back to Home')}
          </Button>
          <Button
            onClick={() => resolveCompany(true)}
            className="px-8 font-bold"
          >
            {t('common.sync_profile', 'Sync Profile')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col items-center gap-6">
        <div className="text-center flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 w-full">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight whitespace-nowrap">
            {t('merchant.dashboard.title', 'Painel do Lojista')}
          </h1>
          <div className="hidden sm:block h-6 w-px bg-slate-300"></div>
          <p className="text-slate-600 flex items-center justify-center gap-2 text-sm md:text-base font-medium whitespace-nowrap">
            <Store className="w-5 h-5 shrink-0 text-primary" />
            <span className="truncate max-w-[200px] sm:max-w-[300px]">
              {myCompany?.name || 'Carregando...'}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          <Button
            variant="outline"
            className="font-semibold whitespace-nowrap h-11"
            onClick={() => navigate('/merchant/scanner')}
          >
            <ScanLine className="w-4 h-4 mr-2" />
            Scanner PDV
          </Button>
          <Button
            className="font-semibold whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white h-11 shadow-md"
            onClick={() => navigate('/merchant/pre-launch')}
          >
            <Rocket className="w-4 h-4 mr-2" />
            Criar Pré-lançamento
          </Button>
          <Button
            className="font-semibold whitespace-nowrap h-11 shadow-md"
            onClick={() => setIsCampaignFormOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Campanha
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[160px] hover:border-primary/30 transition-colors cursor-pointer group"
          onClick={() => navigate('/merchant/campaigns')}
        >
          <h3 className="text-lg font-bold text-slate-700 mb-2 group-hover:text-primary transition-colors text-center">
            {t('merchant.nav.campaigns', 'Campanhas')}
          </h3>
          <p className="text-2xl font-extrabold text-primary">-</p>
        </div>
        <div
          className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[160px] hover:border-emerald-500/30 transition-colors cursor-pointer group"
          onClick={() => navigate('/merchant/leads')}
        >
          <h3 className="text-lg font-bold text-slate-700 mb-2 group-hover:text-emerald-600 transition-colors text-center">
            {t('merchant.nav.leads', 'Leads/CRM')}
          </h3>
          <p className="text-2xl font-extrabold text-emerald-600">-</p>
        </div>
        <div
          className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[160px] hover:border-amber-500/30 transition-colors cursor-pointer group"
          onClick={() => navigate('/merchant/finance')}
        >
          <h3 className="text-lg font-bold text-slate-700 mb-2 group-hover:text-amber-600 transition-colors text-center">
            {t('merchant.nav.finance', 'Gestão Financeira')}
          </h3>
          <p className="text-2xl font-extrabold text-amber-600">-</p>
        </div>
        <div
          className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[160px] hover:border-purple-500/30 transition-colors cursor-pointer group"
          onClick={() => navigate('/merchant/people')}
        >
          <h3 className="text-lg font-bold text-slate-700 mb-2 group-hover:text-purple-600 transition-colors text-center">
            {t('merchant.nav.people', 'Gestão de Pessoas')}
          </h3>
          <p className="text-2xl font-extrabold text-purple-600">-</p>
        </div>
        <div
          className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[160px] hover:border-blue-500/30 transition-colors cursor-pointer group"
          onClick={() => navigate('/merchant/ads')}
        >
          <h3 className="text-lg font-bold text-slate-700 mb-2 group-hover:text-blue-600 transition-colors text-center">
            {t('merchant.nav.ads', 'Gestão de Anúncios')}
          </h3>
          <p className="text-2xl font-extrabold text-blue-600">-</p>
        </div>
      </div>

      <CampaignFormDialog
        open={isCampaignFormOpen}
        onOpenChange={setIsCampaignFormOpen}
        companyId={myCompany?.id}
        onSuccess={() => navigate('/merchant/campaigns')}
      />
    </div>
  )
}
