import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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

interface BoostCampaignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaign: any
  onBoosted: () => void
}

export function BoostCampaignDialog({
  open,
  onOpenChange,
  campaign,
  onBoosted,
}: BoostCampaignDialogProps) {
  const [loading, setLoading] = useState(false)
  const [placement, setPlacement] = useState('home_hero')

  const handleBoost = async () => {
    setLoading(true)
    try {
      const { data: settings } = await supabase
        .from('site_settings')
        .select('*')
      const basePriceSetting = settings?.find(
        (s) => s.key === 'base_boost_price',
      )?.value as any
      const commissionSetting = settings?.find(
        (s) => s.key === 'admin_commission_rate',
      )?.value as any

      const price = basePriceSetting?.value
        ? Number(basePriceSetting.value)
        : 25.0
      const commissionRate = commissionSetting?.value
        ? Number(commissionSetting.value)
        : 10

      const { error: updateErr } = await supabase
        .from('ad_campaigns')
        .update({
          billing_type: 'premium',
          priority_score: (campaign.priority_score || 0) + 10,
        })
        .eq('id', campaign.id)

      if (updateErr) throw updateErr

      const { error: invErr } = await supabase.from('ad_invoices').insert({
        ad_id: campaign.id,
        amount: price,
        reference_number: `BOOST-${Date.now()}`,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        environment: 'production',
      })

      if (invErr) throw invErr

      const adminShare = price * (commissionRate / 100)
      const franchiseShare = price - adminShare

      await supabase.from('audit_logs').insert({
        action: 'BOOST_CAMPAIGN',
        entity_type: 'ad_campaign',
        entity_id: campaign.id,
        details: `Boosted placement ${placement}. Total: ${price}. Admin Share: ${adminShare}. Franchise Share: ${franchiseShare}`,
      })

      toast.success('Campanha impulsionada com sucesso!')
      onBoosted()
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao impulsionar campanha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Impulsionar Campanha</DialogTitle>
          <DialogDescription>
            Aumente a visibilidade da sua campanha pagando por um
            impulsionamento. Seu anúncio ganhará prioridade nas buscas e
            listagens baseando-se na geolocalização e interesse do usuário.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Posicionamento Desejado</Label>
            <Select value={placement} onValueChange={setPlacement}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o posicionamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home_hero">Destaque na Home</SelectItem>
                <SelectItem value="search_top">Topo nas Buscas</SelectItem>
                <SelectItem value="category_top">Topo na Categoria</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleBoost}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Rocket className="w-4 h-4 mr-2" />
            {loading ? 'Processando...' : 'Comprar Impulsionamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
