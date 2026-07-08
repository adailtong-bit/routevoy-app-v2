import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdvertisersTab } from '@/components/admin/ads/AdvertisersTab'
import { AdPricingTab } from '@/components/admin/ads/AdPricingTab'
import { AdBillingTab } from '@/components/admin/ads/AdBillingTab'

export function AdminAdsManager() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Cadastro de Anunciantes
        </h2>
        <p className="text-muted-foreground">
          Manage advertiser profiles, pricing configurations, and billing.
        </p>
      </div>

      <Tabs defaultValue="advertisers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="advertisers">Advertisers</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

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
