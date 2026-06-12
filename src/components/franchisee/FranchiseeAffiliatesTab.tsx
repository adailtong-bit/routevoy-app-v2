import { AdminAffiliatesTab } from '@/components/admin/AdminAffiliatesTab'

export function FranchiseeAffiliatesTab({
  franchiseId,
}: {
  franchiseId: string
}) {
  return <AdminAffiliatesTab franchiseId={franchiseId} />
}
