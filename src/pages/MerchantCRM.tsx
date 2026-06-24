import { CRMCampaignsTab } from '@/components/merchant/CRMCampaignsTab'

export default function MerchantCRM() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CRM & Automation</h1>
        <p className="text-muted-foreground">
          Manage your automated communications and CRM campaigns.
        </p>
      </div>
      <CRMCampaignsTab />
    </div>
  )
}
