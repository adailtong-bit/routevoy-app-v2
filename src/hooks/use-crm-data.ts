import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export function useCrmData(
  franchiseId?: string,
  companyId?: string,
  affiliateId?: string,
) {
  const [targetGroups, setTargetGroups] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [engagements, setEngagements] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)

    let tgQuery = supabase.from('crm_target_groups').select('*')
    if (companyId) tgQuery = tgQuery.eq('company_id', companyId)
    else if (franchiseId) tgQuery = tgQuery.eq('franchise_id', franchiseId)
    else if (affiliateId) tgQuery = tgQuery.eq('affiliate_id', affiliateId)
    const { data: tgData } = await tgQuery
    if (tgData) setTargetGroups(tgData.map(mapTargetGroup))

    let campQuery = supabase.from('crm_campaigns').select('*')
    if (companyId) campQuery = campQuery.eq('company_id', companyId)
    else if (franchiseId) campQuery = campQuery.eq('franchise_id', franchiseId)
    else if (affiliateId) campQuery = campQuery.eq('affiliate_id', affiliateId)
    const { data: campData } = await campQuery
    if (campData) setCampaigns(campData.map(mapCampaign))

    const { data: pData } = await supabase
      .from('profiles')
      .select('id, name, email, gender, birthday, city, state, role')
    if (pData) setProfiles(pData)

    const { data: eData } = await supabase
      .from('user_engagements')
      .select('id, user_id, action_type')
    if (eData) setEngagements(eData)

    const { data: catData } = await supabase
      .from('categories')
      .select('id, name, label')
    if (catData) setCategories(catData)

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [companyId, franchiseId, affiliateId])

  return {
    targetGroups,
    campaigns,
    profiles,
    engagements,
    categories,
    refresh: fetchData,
    loading,
  }
}

function mapTargetGroup(row: any) {
  return {
    id: row.id,
    companyId: row.company_id,
    franchiseId: row.franchise_id,
    affiliateId: row.affiliate_id,
    name: row.name,
    description: row.description,
    filters: row.filters,
    leadCount: row.lead_count,
    createdAt: row.created_at,
  }
}

function mapCampaign(row: any) {
  return {
    id: row.id,
    companyId: row.company_id,
    franchiseId: row.franchise_id,
    affiliateId: row.affiliate_id,
    name: row.name,
    targetGroupId: row.target_group_id,
    channel: row.channel,
    geographicScope: row.geographic_scope,
    randomizationType: row.randomization_type,
    randomizationValue: row.randomization_value,
    content: row.content,
    isExclusive: row.is_exclusive,
    groupingIdentifier: row.grouping_identifier,
    linkedOfferId: row.linked_offer_id,
    status: row.status,
    scheduledAt: row.scheduled_at,
    clicks: row.clicks,
    redemptions: row.redemptions,
    createdAt: row.created_at,
  }
}
