import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useCouponStore } from '@/stores/CouponContext'
import { CampaignsManager } from '@/components/shared/CampaignsManager'
import { Megaphone } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function MerchantCampaigns() {
  const { user: authUser, profile } = useAuth()
  const { user, companies } = useCouponStore()
  const { t } = useLanguage()
  const [myCompany, setMyCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const resolveCompany = async () => {
      let found =
        companies.find((c) => c.id === user?.companyId) || companies[0]

      if (!found && profile?.company_id) {
        const { data } = await supabase
          .from('merchants')
          .select('*')
          .eq('id', profile.company_id)
          .maybeSingle()
        if (data) {
          found = data
        }
      }

      if (!found && authUser?.email) {
        const { data } = await supabase
          .from('merchants')
          .select('*')
          .eq('email', authUser.email)
          .maybeSingle()
        if (data) {
          found = data
        }
      }

      setMyCompany(found || null)
      setLoading(false)
    }
    resolveCompany()
  }, [companies, user, authUser, profile])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary/40 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  const isMaster = profile?.role === 'admin' || profile?.role === 'super_admin'
  const isFranchisee = profile?.role === 'franchisee'

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Megaphone className="w-8 h-8 text-primary" />
            {t('merchant.nav.campaigns', 'Gestão de Campanhas')}
          </h1>
          <p className="text-slate-500 mt-1">
            {t(
              'merchant.campaigns.desc',
              'Crie e gerencie suas campanhas de marketing e ofertas.',
            )}
          </p>
        </div>
        <Link to="/merchant">
          <Button variant="outline">{t('common.back', 'Voltar')}</Button>
        </Link>
      </div>

      {!myCompany && !isMaster && !isFranchisee ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center flex flex-col items-center justify-center gap-4 shadow-sm">
          <Megaphone className="w-12 h-12 text-slate-300" />
          <div>
            <h3 className="text-lg font-medium text-slate-900">
              {t('merchant.campaigns.no_company', 'No company associated')}
            </h3>
            <p className="text-slate-500 max-w-md mx-auto mt-1">
              {t(
                'merchant.campaigns.no_company_desc',
                'Your profile does not have an associated establishment yet to create campaigns. Wait for approval or contact support.',
              )}
            </p>
          </div>
        </div>
      ) : (
        <ErrorBoundary>
          <div className="bg-white p-0 md:p-6 rounded-xl border-0 md:border border-slate-200 md:shadow-sm">
            <CampaignsManager
              companyId={myCompany?.id}
              companyName={myCompany?.name}
              franchiseId={profile?.franchise_id}
              role={profile?.role}
            />
          </div>
        </ErrorBoundary>
      )}
    </div>
  )
}
