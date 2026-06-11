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
import { Rocket, Loader2 } from 'lucide-react'

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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
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

              return (
                <div
                  key={p.id}
                  className="border border-slate-200 rounded-md p-3 flex flex-col h-full bg-white shadow-sm hover:border-indigo-300 hover:shadow transition-all duration-200"
                >
                  <div className="flex-1 flex flex-col">
                    <h4 className="text-[11px] font-semibold text-slate-800 mb-1">
                      {formattedPlacement}
                    </h4>
                    <p className="text-[9px] text-slate-500 font-normal mb-2 uppercase tracking-wide">
                      Billing: {p.billing_type}
                    </p>
                    <div className="mt-auto mb-3">
                      <span className="text-[13px] font-bold text-slate-900">
                        ${p.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleBuy(p)}
                    disabled={isLoading || loadingId !== null}
                    size="sm"
                    className="w-full h-7 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 transition-colors"
                  >
                    {isLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    ) : null}
                    {isLoading ? 'Processing...' : 'Buy'}
                  </Button>
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
