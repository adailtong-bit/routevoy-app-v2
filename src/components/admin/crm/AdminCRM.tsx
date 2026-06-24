import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TargetGroupsTab } from './TargetGroupsTab'
import { CommunicationCampaignsTab } from './CommunicationCampaignsTab'
import { CRMPerformanceDashboard } from './CRMPerformanceDashboard'
import { Users, Megaphone, LineChart } from 'lucide-react'
import { ErrorBoundary } from '@/components/ErrorBoundary'

interface AdminCRMProps {
  companyId?: string
  franchiseId?: string
  affiliateId?: string
  defaultTab?: string
}

export function AdminCRM({
  companyId,
  franchiseId,
  affiliateId,
  defaultTab = 'performance',
}: AdminCRMProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger
              value="performance"
              className="flex items-center gap-2"
            >
              <LineChart className="w-4 h-4" />
              <span className="hidden md:inline">Performance</span>
            </TabsTrigger>
            <TabsTrigger
              value="target-groups"
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span className="hidden md:inline">Target Groups</span>
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <Megaphone className="w-4 h-4" />
              <span className="hidden md:inline">CRM Campaigns</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance">
            <ErrorBoundary>
              <CRMPerformanceDashboard
                companyId={companyId}
                franchiseId={franchiseId}
                affiliateId={affiliateId}
              />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="target-groups">
            <ErrorBoundary>
              <TargetGroupsTab
                companyId={companyId}
                franchiseId={franchiseId}
                affiliateId={affiliateId}
              />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="campaigns">
            <ErrorBoundary>
              <CommunicationCampaignsTab
                companyId={companyId}
                franchiseId={franchiseId}
                affiliateId={affiliateId}
              />
            </ErrorBoundary>
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  )
}
