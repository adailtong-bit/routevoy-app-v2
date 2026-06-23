import { AdvertisersTab } from '@/components/admin/ads/AdvertisersTab'

export function FranchiseeAdvertisersTab({
  franchiseId,
}: {
  franchiseId: string
}) {
  return <AdvertisersTab franchiseId={franchiseId} />
}
