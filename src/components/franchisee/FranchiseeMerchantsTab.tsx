import { MerchantsTab } from '@/components/admin/hierarchy/MerchantsTab'

export function FranchiseeMerchantsTab({
  franchiseId,
}: {
  franchiseId: string
}) {
  return <MerchantsTab franchiseId={franchiseId} />
}
