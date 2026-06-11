import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Rocket, Loader2, Check, Zap } from 'lucide-react'

export function BoostCampaignDialog({
  open,
  onOpenChange,
  campaign,
  onBoosted,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaign: any
  onBoosted: () => void
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [pricingOptions, setPricingOptions] = useState<any[]>([])

  useEffect(() => {
    if (open) {
      fetchPricing()
    }
  }, [open, campaign])

  const fetchPricing = async () => {
    const { data } = await supabase
      .from('ad_pricing')
      .select('*')
      .order('price', { ascending: true })
    if (data) setPricingOptions(data)
  }

  const handleBuy = async (plan: any) => {
    setLoadingId(plan.id)

    const newPriorityScore = plan ? plan.price * 10 : 50

    const { error } = await supabase
      .from('ad_campaigns')
      .update({
        placement: plan.placement,
        billing_type: plan.billing_type || 'fixed',
        priority_score: newPriorityScore,
      })
      .eq('id', campaign.id)

    setLoadingId(null)

    if (error) {
      toast.error('Error boosting campaign: ' + error.message)
    } else {
      toast.success('Campaign boosted successfully!')
      onOpenChange(false)
      onBoosted()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] gap-0">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <Rocket className="h-4 w-4 text-indigo-500" />
            Boost Offer
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-md shadow-inner">
            <p className="font-semibold text-slate-800 text-[11px] mb-1">
              {campaign?.title}
            </p>
            <p className="text-[10px] text-slate-500 flex items-center gap-1 font-normal">
              Current score:{' '}
              <strong className="text-indigo-600 font-bold">
                {campaign?.priority_score || 0}
              </strong>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-stretch">
            {pricingOptions.map((p) => {
              const formattedPlacement =
                p.placement.toLowerCase() === 'search_top'
                  ? 'Search Top'
                  : p.placement.toLowerCase() === 'search'
                    ? 'Search'
                    : p.placement
                        .replace('_', ' ')
                        .replace(/\b\w/g, (c: string) => c.toUpperCase())

              const isLoading = loadingId === p.id

              const formattedPrice = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(p.price)

              const isPopular =
                p.placement.toLowerCase() === 'search_top' ||
                p.placement.toLowerCase() === 'search top'

              return (
                <div
                  key={p.id}
                  className={`border rounded-lg flex flex-col bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
                    isPopular
                      ? 'border-indigo-500 relative'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {isPopular && (
                    <div className="bg-indigo-500 text-white text-[10px] font-bold py-1.5 flex items-center justify-center gap-1 w-full">
                      <Zap className="w-3 h-3 fill-current" />
                      MOST POPULAR
                    </div>
                  )}
                  <div
                    className={`flex-1 flex flex-col items-center text-center p-4 ${isPopular ? 'pt-3' : ''}`}
                  >
                    <div className="text-[10px] font-bold text-slate-800 uppercase mb-3">
                      {formattedPlacement}
                    </div>
                    <div className="text-[10px] text-slate-500 font-normal mb-5 flex items-center justify-center gap-1">
                      <span className="font-bold text-slate-900">
                        {formattedPrice}
                      </span>
                      <span>
                        /
                        {p.billing_type === 'fixed' && p.duration_days
                          ? `${p.duration_days}D`
                          : p.billing_type === 'cpc'
                            ? 'CPC'
                            : p.billing_type === 'cpa'
                              ? 'CPA'
                              : 'ONCE'}
                      </span>
                    </div>

                    <div className="w-full space-y-3 mb-4 text-left">
                      <div className="flex items-start gap-2">
                        <div className="w-3.5 h-3.5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Check
                            className="w-2.5 h-2.5 text-emerald-600"
                            strokeWidth={3}
                          />
                        </div>
                        <span className="text-[10px] font-normal text-slate-600">
                          High priority in searches
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-3.5 h-3.5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Check
                            className="w-2.5 h-2.5 text-emerald-600"
                            strokeWidth={3}
                          />
                        </div>
                        <span className="text-[10px] font-normal text-slate-600">
                          Fixed highlight on{' '}
                          <strong className="font-bold text-slate-800">
                            {formattedPlacement}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto p-4 pt-0 w-full">
                    <Button
                      onClick={() => handleBuy(p)}
                      disabled={isLoading || loadingId !== null}
                      size="sm"
                      className={`w-full h-8 text-[10px] font-bold text-white transition-colors ${
                        isPopular
                          ? 'bg-indigo-600 hover:bg-indigo-700'
                          : 'bg-slate-900 hover:bg-slate-800'
                      }`}
                    >
                      {isLoading && (
                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      )}
                      Buy
                    </Button>
                  </div>
                </div>
              )
            })}
            {pricingOptions.length === 0 && (
              <div className="col-span-1 sm:col-span-2 md:col-span-3 text-center py-6 text-[10px] text-slate-500 border border-dashed border-slate-200 rounded-md font-normal">
                No pricing plans available.
              </div>
            )}
          </div>

          <div className="bg-indigo-50 text-indigo-800 p-2 rounded-md text-[9px] leading-relaxed mt-2 font-normal">
            <strong className="font-bold">Tip:</strong> Boosting will
            significantly increase your priority score, ensuring more visibility
            and better positioning for your campaign on the platform.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
