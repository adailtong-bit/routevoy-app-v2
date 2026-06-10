import { useAuth } from '@/hooks/use-auth'
import { LeadsProfileTab } from '@/components/admin/crm/LeadsProfileTab'
import { Users } from 'lucide-react'

export default function MerchantLeads() {
  const { user } = useAuth()
  const companyId = user?.id

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl border shadow-sm mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" /> Gestão de Leads
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Analise o perfil de consumo e o comportamento dos seus clientes sem
          interferências de campanhas neste módulo.
        </p>
      </div>

      <div className="mt-6">
        <LeadsProfileTab companyId={companyId} />
      </div>
    </div>
  )
}
