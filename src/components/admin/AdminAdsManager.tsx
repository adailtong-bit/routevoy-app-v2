import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdCampaignsTab } from '@/components/admin/ads/AdCampaignsTab'
import { AdvertisersTab } from '@/components/admin/ads/AdvertisersTab'
import { AdPricingTab } from '@/components/admin/ads/AdPricingTab'
import { AdBillingTab } from '@/components/admin/ads/AdBillingTab'

export function AdminAdsManager() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Advertisement Campaigns
        </h2>
        <p className="text-muted-foreground">
          Manage network-wide ads, pricing, and billing using the standard
          visual editor.
        </p>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="advertisers">Advertisers</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <AdCampaignsTab />
        </TabsContent>

        <TabsContent value="advertisers" className="space-y-4">
          <AdvertisersTab />
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <AdPricingTab />
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <AdBillingTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
