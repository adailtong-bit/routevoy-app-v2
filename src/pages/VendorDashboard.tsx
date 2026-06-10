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

  useEffect(() => {
    const resolveCompany = async () => {
      const found =
        companies.find((c) => c.id === user?.companyId) || companies[0]
      if (found) {
        setMyCompany(found)
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
          setMyCompany({
            id: 'admin-global',
            name: 'Empresa Teste (Visão Admin) - Global',
          })
        }
      }
    }
    resolveCompany()
  }, [companies, user, authUser, profile])

  return (
    <div className="container py-8 px-4 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
        <div className="text-center md:text-left flex flex-col items-center md:items-start w-full md:w-auto min-w-0">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight whitespace-nowrap truncate w-full">
            {t('merchant.dashboard.title', 'Painel do Lojista')}
          </h1>
          <p className="text-slate-500 mt-2 flex items-center justify-center md:justify-start gap-2 text-sm md:text-base whitespace-nowrap truncate w-full">
            <Store className="w-4 h-4 shrink-0" />
            <span className="truncate">
              {myCompany?.name || 'Carregando...'}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto shrink-0">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[200px] hover:border-primary/30 transition-colors cursor-pointer group"
          onClick={() => navigate('/merchant/campaigns')}
        >
          <h3 className="text-lg font-bold text-slate-700 mb-2 group-hover:text-primary transition-colors">
            {t('merchant.nav.campaigns', 'Campanhas')}
          </h3>
          <p className="text-3xl font-extrabold text-primary">-</p>
        </div>
        <div
          className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[200px] hover:border-emerald-500/30 transition-colors cursor-pointer group"
          onClick={() => navigate('/merchant/leads')}
        >
          <h3 className="text-lg font-bold text-slate-700 mb-2 group-hover:text-emerald-600 transition-colors">
            {t('merchant.nav.leads', 'Leads')}
          </h3>
          <p className="text-3xl font-extrabold text-emerald-600">-</p>
        </div>
        <div
          className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[200px] hover:border-blue-500/30 transition-colors cursor-pointer group"
          onClick={() => navigate('/merchant/ads')}
        >
          <h3 className="text-lg font-bold text-slate-700 mb-2 group-hover:text-blue-600 transition-colors">
            {t('merchant.nav.ads', 'Gestão de Anúncios')}
          </h3>
          <p className="text-3xl font-extrabold text-blue-600">-</p>
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
