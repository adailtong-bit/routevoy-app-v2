import { useLanguage } from '@/stores/LanguageContext'
import { AdminCRM } from '@/components/admin/crm/AdminCRM'

export function CRMCampaignsTab({ companyId }: { companyId?: string }) {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">
            {t('crm.campaigns.title', 'Gerenciamento de Campanhas')}
          </h3>
          <p className="text-sm text-slate-500">
            {t(
              'crm.campaigns.subtitle',
              'Envie campanhas exclusivas e gerencie seus grupos de leads.',
            )}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-0 md:p-6">
        <AdminCRM companyId={companyId} defaultTab="performance" />
      </div>
    </div>
  )
}
