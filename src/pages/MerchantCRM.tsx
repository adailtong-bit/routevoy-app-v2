import { CRMCampaignsTab } from '@/components/merchant/CRMCampaignsTab'

export default function MerchantCRM() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">CRM Campaigns</h1>
        <p className="text-muted-foreground">
          Manage your automated communications and targeted audience campaigns.
        </p>
      </div>
      <CRMCampaignsTab />
    </div>
  )
}
