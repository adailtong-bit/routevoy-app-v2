import { useEffect, useState } from 'react'
import { CouponCard } from '@/components/CouponCard'
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { Coupon } from '@/lib/types'

export function AggregatorFeed() {
  const [promotions, setPromotions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    let isMounted = true
    const fetchPromos = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('discovered_promotions')
          .select('*')
          .in('status', ['published', 'active', 'approved'])
          .order('created_at', { ascending: false })
          .limit(12)

        if (error) throw error
        if (isMounted) {
          setPromotions(data || [])
        }
      } catch (err) {
        console.error('Error fetching promotions:', err)
        if (isMounted) setPromotions([])
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchPromos()
    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const safePromotions = promotions ?? []

  if (safePromotions.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl">
        <p>
          {t('feed.no_promotions', 'Nenhuma oferta encontrada no momento.')}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {safePromotions.map((promo) => {
        const couponData: Coupon = {
          id: promo?.id ?? '',
          title: promo?.title ?? 'Oferta',
          description: promo?.description ?? '',
          discount:
            promo?.discount ??
            (promo?.discount_percentage ? `${promo.discount_percentage}%` : ''),
          price: promo?.price,
          originalPrice: promo?.original_price,
          image: promo?.image_url ?? '',
          storeName: promo?.store_name ?? 'Loja Parceira',
          category: promo?.category ?? 'geral',
          distance: 0,
          expiryDate:
            promo?.end_date ?? new Date(Date.now() + 86400000).toISOString(),
          code: promo?.code ?? '',
          coordinates: {
            lat: promo?.latitude ?? 0,
            lng: promo?.longitude ?? 0,
          },
        }
        return (
          <CouponCard
            key={promo?.id ?? Math.random().toString()}
            coupon={couponData}
          />
        )
      })}
    </div>
  )
}
