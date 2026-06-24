import { useAuth } from '@/hooks/use-auth'
import { AdminCRM } from '@/components/admin/crm/AdminCRM'
import { Megaphone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function MerchantCRM() {
  const { companyId, franchiseId, affiliateId, profile } = useAuth()

  const resolvedCompanyId = companyId || undefined
  const resolvedFranchiseId =
    profile?.role === 'franchisee' ? franchiseId || undefined : undefined
  const resolvedAffiliateId =
    profile?.role === 'affiliate' ? affiliateId || undefined : undefined

  if (!profile && !companyId && !franchiseId && !affiliateId) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Megaphone className="w-8 h-8 text-primary" />
            Campaigns
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your segmentation groups and communication campaigns.
          </p>
        </div>
        <Link to="/merchant">
          <Button variant="outline">Back</Button>
        </Link>
      </div>

      <ErrorBoundary>
        <div className="bg-white p-0 md:p-6 rounded-xl border-0 md:border border-slate-200 md:shadow-sm">
          <AdminCRM
            companyId={resolvedCompanyId}
            franchiseId={resolvedFranchiseId}
            affiliateId={resolvedAffiliateId}
            defaultTab="performance"
          />
        </div>
      </ErrorBoundary>
    </div>
  )
}
