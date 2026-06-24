import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Megaphone, Calendar, MousePointerClick } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'

export function CommunicationCampaignsTab({
  campaigns = [],
  groups = [],
  refresh,
  loading = false,
  companyId,
  franchiseId,
  affiliateId,
}: any) {
  if (loading)
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    )

  const safeRenderContent = (content: any) => {
    if (!content) return 'No content'
    if (typeof content === 'string') return content
    if (typeof content === 'object') {
      try {
        return JSON.stringify(content)
      } catch {
        return 'Invalid content format'
      }
    }
    return String(content)
  }

  const getGroupName = (id: string) => {
    const group = groups.find((g: any) => g.id === id)
    return group ? group.name : 'Unknown Group'
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-slate-800">
            Communication Campaigns
          </h3>
          <p className="text-sm text-slate-500">
            Manage and track your outreach campaigns.
          </p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card className="border-dashed bg-slate-50/50 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Megaphone className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">
              No campaigns found
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              Create your first communication campaign to start engaging with
              your leads.
            </p>
            <Button className="mt-6" variant="outline" size="sm">
              Create Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c: any) => (
            <Card
              key={c.id}
              className="flex flex-col hover:shadow-md transition-shadow border-slate-200"
            >
              <CardHeader className="pb-3 flex-none">
                <div className="flex justify-between items-start mb-2">
                  <Badge
                    variant={c.status === 'active' ? 'default' : 'secondary'}
                    className="capitalize font-medium"
                  >
                    {c.status || 'draft'}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="capitalize text-[10px] px-2 h-5"
                  >
                    {c.channel}
                  </Badge>
                </div>
                <CardTitle className="text-base line-clamp-1" title={c.name}>
                  {c.name}
                </CardTitle>
                <CardDescription className="text-xs flex items-center gap-1 mt-1 text-slate-500">
                  <span className="font-medium text-slate-700">Target:</span>{' '}
                  {getGroupName(c.targetGroupId)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div
                  className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-md border border-slate-100 mb-4 line-clamp-3 h-[60px]"
                  title={safeRenderContent(c.content)}
                >
                  {safeRenderContent(c.content)}
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500 border-t border-slate-100 pt-3 mt-auto">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {c.scheduledAt
                      ? formatDate(c.scheduledAt)
                      : 'Not scheduled'}
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-primary">
                    <MousePointerClick className="w-3.5 h-3.5" />
                    {c.clicks || 0}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
