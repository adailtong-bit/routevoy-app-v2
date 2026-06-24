import { AdCampaignsTab } from '@/components/admin/ads/AdCampaignsTab'
import { useAuth } from '@/hooks/use-auth'

export function VendorCampaignsTab() {
  const { companyId } = useAuth()
  return (
    <div className="space-y-6">
      <AdCampaignsTab companyId={companyId || undefined} />
    </div>
  )
}
