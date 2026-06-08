import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Rocket } from 'lucide-react'

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
  const [loading, setLoading] = useState(false)
  const [placement, setPlacement] = useState('')
  const [pricingOptions, setPricingOptions] = useState<any[]>([])

  useEffect(() => {
    if (open) {
      setPlacement(campaign?.placement || '')
      fetchPricing()
    }
  }, [open, campaign])

  const fetchPricing = async () => {
    const { data } = await supabase.from('ad_pricing').select('*')
    if (data) setPricingOptions(data)
  }

  const handleBoost = async () => {
    setLoading(true)

    const selectedPricing = pricingOptions.find(
      (p) => p.placement === placement,
    )
    const newPriorityScore = selectedPricing ? selectedPricing.price * 10 : 50

    const { error } = await supabase
      .from('ad_campaigns')
      .update({
        placement,
        billing_type: selectedPricing?.billing_type || 'fixed',
        priority_score: newPriorityScore,
      })
      .eq('id', campaign.id)

    setLoading(false)

    if (error) {
      toast.error('Erro ao impulsionar: ' + error.message)
    } else {
      toast.success('Campanha impulsionada com sucesso!')
      onOpenChange(false)
      onBoosted()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-indigo-500" />
            Impulsionar Oferta
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg shadow-inner">
            <p className="font-semibold text-slate-800 text-lg mb-1">
              {campaign?.title}
            </p>
            <p className="text-sm text-slate-500 flex items-center gap-1">
              Score atual:{' '}
              <strong className="text-indigo-600">
                {campaign?.priority_score || 0}
              </strong>
            </p>
          </div>

          <div className="space-y-2">
            <Label>Novo Posicionamento / Plano de Impulsionamento</Label>
            <Select value={placement} onValueChange={setPlacement}>
              <SelectTrigger className="border-indigo-100 focus:ring-indigo-500">
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                {pricingOptions.map((p) => (
                  <SelectItem key={p.id} value={p.placement}>
                    {p.placement} - R$ {p.price} ({p.billing_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="bg-indigo-50 text-indigo-800 p-3 rounded-md text-xs leading-relaxed mt-2">
            <strong>Dica:</strong> Impulsionar aumentará significativamente o
            seu score de prioridade, garantindo mais visibilidade e melhor
            posicionamento para sua campanha na plataforma.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={handleBoost}
            disabled={loading || !placement}
          >
            {loading ? 'Processando...' : 'Confirmar Impulsionamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
