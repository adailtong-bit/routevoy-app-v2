import { AdCampaignsTab } from '@/components/admin/ads/AdCampaignsTab'
import { useAuth } from '@/hooks/use-auth'

export default function MerchantCampaigns() {
  const { companyId } = useAuth()

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
        <p className="text-muted-foreground">
          Manage your advertising campaigns here.
        </p>
      </div>
      <AdCampaignsTab companyId={companyId || undefined} />
    </div>
  )
}
