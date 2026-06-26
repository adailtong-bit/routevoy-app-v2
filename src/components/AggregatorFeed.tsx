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
        .eq('environment', 'production')
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
      <div className="flex flex-col items-center justify-center p-16 bg-white rounded-xl border border-slate-200 w-full shadow-sm">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          Nenhuma promoção encontrada
        </h3>
        <p className="text-slate-500 text-center max-w-sm">
          {t(
            'common.no_campaigns',
            'Não há promoções ativas no momento. Volte mais tarde para conferir as novidades!',
          )}
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
