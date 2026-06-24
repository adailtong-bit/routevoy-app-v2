import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Users } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function TargetGroupsTab({
  groups = [],
  refresh,
  loading = false,
  companyId,
  franchiseId,
  affiliateId,
}: any) {
  if (loading)
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    )

  const safeRenderFilters = (filters: any) => {
    if (!filters) return 'No filters applied'
    if (typeof filters === 'string') return filters
    if (typeof filters === 'object') {
      try {
        return JSON.stringify(filters)
      } catch {
        return 'Invalid filter format'
      }
    }
    return String(filters)
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-slate-800">Target Groups</h3>
          <p className="text-sm text-slate-500">
            Manage your audience segments.
          </p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Create Group
        </Button>
      </div>

      {groups.length === 0 ? (
        <Card className="border-dashed bg-slate-50/50 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">
              No groups found
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              Create your first target group to start segmenting your audience
              for better campaigns.
            </p>
            <Button className="mt-6" variant="outline" size="sm">
              Create Target Group
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((g: any) => (
            <Card
              key={g.id}
              className="hover:shadow-md transition-shadow border-slate-200"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  {g.name}
                  <div className="flex items-center gap-1 text-xs font-normal bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-100">
                    <Users className="w-3 h-3" />
                    {g.leadCount || 0} Leads
                  </div>
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {g.description || 'No description provided.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="text-xs bg-slate-50 p-3 rounded-md border border-slate-100 font-mono text-slate-600 truncate"
                  title={safeRenderFilters(g.filters)}
                >
                  {safeRenderFilters(g.filters)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
