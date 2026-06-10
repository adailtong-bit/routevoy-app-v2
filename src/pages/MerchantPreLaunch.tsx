import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { CreatePreLaunchDialog } from '@/components/merchant/CreatePreLaunchDialog'
import { Rocket, Eye, MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function MerchantPreLaunch() {
  const { user } = useAuth()
  const companyId = user?.id
  const [promotions, setPromotions] = useState<any[]>([])

  const fetchPromotions = async () => {
    if (!companyId) return
    const { data } = await supabase
      .from('discovered_promotions')
      .select('*')
      .eq('promotion_model', 'pre-launch')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
    if (data) setPromotions(data)
  }

  useEffect(() => {
    fetchPromotions()
  }, [companyId])

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border shadow-sm mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <Rocket className="w-6 h-6 text-primary" /> Campanhas de
            Pré-lançamento
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Crie expectativa e capture leads antes do lançamento oficial com
            metas de compartilhamento e geofencing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {companyId && (
            <CreatePreLaunchDialog
              companyId={companyId}
              onCreated={fetchPromotions}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions.map((promo) => (
          <Card
            key={promo.id}
            className="overflow-hidden bg-white shadow-sm border-slate-200"
          >
            {promo.image_url && (
              <div className="aspect-video w-full relative bg-slate-100">
                <img
                  src={promo.image_url}
                  alt={promo.title}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-2 right-2 bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-sm">
                  Pré-lançamento
                </Badge>
              </div>
            )}
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-lg line-clamp-1">
                {promo.title}
              </h3>
              <p className="text-sm text-slate-500 line-clamp-2">
                {promo.description}
              </p>

              <div className="flex flex-col gap-2 pt-2 text-sm text-slate-600">
                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-md">
                  <Eye className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium">
                    Meta: {promo.engagement_threshold} shares
                  </span>
                </div>
                {promo.enable_proximity_alerts && (
                  <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-md text-blue-700">
                    <MapPin className="w-4 h-4" />
                    <span>Raio: {promo.alert_radius}m</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {promotions.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white border border-dashed rounded-xl">
            Nenhuma campanha de pré-lançamento encontrada.
          </div>
        )}
      </div>
    </div>
  )
}
