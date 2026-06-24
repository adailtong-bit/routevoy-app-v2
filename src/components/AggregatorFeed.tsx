import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { CampaignPreview } from '@/components/merchant/CampaignPreview'
import { useLanguage } from '@/stores/LanguageContext'

export function AggregatorFeed() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setCampaigns(data || [])
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-12 w-full">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center p-12 bg-white rounded-xl border border-slate-200 w-full">
        <p className="text-slate-500">
          {t('common.no_campaigns', 'No campaigns available at the moment.')}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {campaigns.map((c) => (
        <div key={c.id} className="flex justify-center w-full">
          <CampaignPreview
            title={c.title}
            description={c.description}
            image={c.image}
            startDate={c.start_date}
            endDate={c.end_date}
            companyUrl={c.link}
            discountPercentage={c.discount_percentage}
            originalPrice={c.original_price}
            price={c.price}
            currency={c.currency}
            promotionModel={c.promotion_model}
            rewardDescription={c.reward_description}
            minimumPurchase={c.trigger_threshold}
            isOnline={!c.latitude || !c.longitude}
          />
        </div>
      ))}
    </div>
  )
}
