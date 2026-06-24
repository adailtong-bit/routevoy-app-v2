import { useAuth } from '@/hooks/use-auth'
import { AdminCRM } from '@/components/admin/crm/AdminCRM'
import { UsersRound } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function MerchantCRM() {
  const { companyId, franchiseId, affiliateId, profile } = useAuth()
  const { t } = useLanguage()

  const resolvedCompanyId = companyId || undefined
  const resolvedFranchiseId =
    profile?.role === 'franchisee' ? franchiseId || undefined : undefined
  const resolvedAffiliateId =
    profile?.role === 'affiliate' ? affiliateId || undefined : undefined

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <UsersRound className="w-8 h-8 text-primary" />
            {t('admin.crm', 'CRM e Leads')}
          </h1>
          <p className="text-slate-500 mt-1">
            {t(
              'merchant.crm.desc',
              'Gerencie seus grupos de segmentação e campanhas de comunicação.',
            )}
          </p>
        </div>
        <Link to="/merchant">
          <Button variant="outline">{t('common.back', 'Voltar')}</Button>
        </Link>
      </div>

      <div className="bg-white p-0 md:p-6 rounded-xl border-0 md:border border-slate-200 md:shadow-sm">
        <AdminCRM
          companyId={resolvedCompanyId}
          franchiseId={resolvedFranchiseId}
          affiliateId={resolvedAffiliateId}
          defaultTab="performance"
        />
      </div>
    </div>
  )
}
