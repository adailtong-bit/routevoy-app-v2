import { CampaignsManager } from '@/components/shared/CampaignsManager'
import { useAuth } from '@/hooks/use-auth'

export default function MerchantCampaigns() {
  const { companyId, franchiseId, affiliateId } = useAuth()

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <CampaignsManager
        companyId={companyId || undefined}
        franchiseId={franchiseId || undefined}
        affiliateId={affiliateId || undefined}
      />
    </div>
  )
}
