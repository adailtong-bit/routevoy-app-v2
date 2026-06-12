import { AdminApprovalsTab } from '@/components/admin/AdminApprovalsTab'

export function FranchiseeApprovalsTab({
  franchiseId,
}: {
  franchiseId: string
}) {
  return <AdminApprovalsTab franchiseId={franchiseId} />
}
