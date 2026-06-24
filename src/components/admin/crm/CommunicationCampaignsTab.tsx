import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { CampaignTable } from './CampaignTable'
import { toast } from 'sonner'
import { useLanguage } from '@/stores/LanguageContext'
import { CRMCampaignDialog } from '@/components/merchant/CRMCampaignDialog'

export function CommunicationCampaignsTab({
  companyId,
  franchiseId,
  affiliateId,
}: {
  companyId?: string
  franchiseId?: string
  affiliateId?: string
}) {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [targetGroups, setTargetGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<any>(null)
  const { t } = useLanguage()

  const fetchData = async () => {
    try {
      setLoading(true)
      let campQuery = supabase
        .from('crm_campaigns')
        .select('*')
        .order('created_at', { ascending: false })
      let tgQuery = supabase.from('crm_target_groups').select('*')

      if (companyId) {
        campQuery = campQuery.eq('company_id', companyId)
        tgQuery = tgQuery.eq('company_id', companyId)
      } else if (franchiseId) {
        campQuery = campQuery.eq('franchise_id', franchiseId)
        tgQuery = tgQuery.eq('franchise_id', franchiseId)
      } else if (affiliateId) {
        campQuery = campQuery.eq('affiliate_id', affiliateId)
        tgQuery = tgQuery.eq('affiliate_id', affiliateId)
      }

      const [campRes, tgRes] = await Promise.all([campQuery, tgQuery])

      if (campRes.error) throw campRes.error
      if (tgRes.error) throw tgRes.error

      setCampaigns(campRes.data || [])
      setTargetGroups(tgRes.data || [])
    } catch (err: any) {
      console.error(err)
      toast.error(t('common.error', 'Ocorreu um erro'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [companyId, franchiseId, affiliateId])

  return (
    <div className="space-y-4 animate-fade-in">
      <CampaignTable
        campaigns={campaigns}
        targetGroups={targetGroups}
        loading={loading}
        onRefresh={fetchData}
        onEdit={(camp: any) => {
          setEditingCampaign(camp)
          setIsDialogOpen(true)
        }}
      />
      <CRMCampaignDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        companyId={companyId}
        franchiseId={franchiseId}
        affiliateId={affiliateId}
        initialData={editingCampaign}
        onSuccess={fetchData}
      />
    </div>
  )
}
