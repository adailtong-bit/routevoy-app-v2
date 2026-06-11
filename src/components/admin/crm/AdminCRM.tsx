import { TargetGroupsTab } from './TargetGroupsTab'

export function AdminCRM({
  affiliateId,
  companyId,
  franchiseId,
}: {
  affiliateId?: string
  companyId?: string
  franchiseId?: string
}) {
  return (
    <div className="w-full space-y-4">
      <TargetGroupsTab
        affiliateId={affiliateId}
        companyId={companyId}
        franchiseId={franchiseId}
      />
    </div>
  )
}
