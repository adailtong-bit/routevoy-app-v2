import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function CreateAdCampaignDialog({
  environment = 'global',
  companyId,
  onCreated,
}: {
  environment?: string
  companyId?: string
  onCreated?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [pricingId, setPricingId] = useState('')
  const [pricingList, setPricingList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) fetchPricing()
  }, [open, environment])

  const fetchPricing = async () => {
    const { data } = await supabase
      .from('ad_pricing')
      .select('*')
      .eq('environment', environment)
    if (data) setPricingList(data)
  }

  const getPriorityScore = (placement: string, billingType: string) => {
    let score = 0
    if (placement === 'home_hero') score += 100
    if (placement === 'home_featured') score += 80
    if (placement === 'top_ranking') score += 90
    if (placement === 'global_search') score += 70
    if (placement === 'category_sidebar') score += 50

    if (billingType === 'fixed') score += 20
    if (billingType === 'internal') score += 10

    return score
  }

  const PLACEMENT_OPTIONS: Record<string, string> = {
    home_featured: 'Destaque Home',
    global_search: 'Busca Global',
    top_ranking: 'Top Ranking',
    home_hero: 'Home Hero',
    category_sidebar: 'Lateral da Categoria',
  }
  const BILLING_OPTIONS: Record<string, string> = {
    fixed: 'Fixo (Premium)',
    cpc: 'CPC (Custo por Clique)',
    cpm: 'CPM (Custo por Mil)',
    internal: 'Anúncio Interno',
  }

  const handleCreate = async () => {
    if (!title || !pricingId)
      return toast.error('Preencha os campos obrigatórios')

    const selectedPricing = pricingList.find((p) => p.id === pricingId)
    if (!selectedPricing) return

    setLoading(true)
    const pScore = getPriorityScore(
      selectedPricing.placement,
      selectedPricing.billing_type,
    )

    const { error } = await supabase.from('ad_campaigns').insert({
      title,
      description,
      company_id: companyId || null,
      environment,
      placement: selectedPricing.placement,
      billing_type: selectedPricing.billing_type,
      priority_score: pScore,
      duration_days: selectedPricing.duration_days,
      price: selectedPricing.price,
    })

    setLoading(false)
    if (error) {
      toast.error('Erro ao criar campanha')
    } else {
      toast.success('Campanha criada com sucesso!')
      setOpen(false)
      setTitle('')
      setDescription('')
      setPricingId('')
      if (onCreated) onCreated()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="font-bold">
          <Plus className="w-4 h-4 mr-2" /> Nova Campanha
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Campanha de Anúncio</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Título da Campanha
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Oferta de Verão"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Descrição
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descrição do anúncio..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Pacote de Preço / Posicionamento
            </label>
            <Select value={pricingId} onValueChange={setPricingId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um pacote..." />
              </SelectTrigger>
              <SelectContent>
                {pricingList.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {PLACEMENT_OPTIONS[p.placement] || p.placement} -{' '}
                    {BILLING_OPTIONS[p.billing_type] || p.billing_type} (R${' '}
                    {Number(p.price).toFixed(2)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              A prioridade da sua campanha será definida automaticamente pelo
              pacote escolhido.
            </p>
          </div>
          <Button
            onClick={handleCreate}
            disabled={loading}
            className="w-full mt-4"
          >
            {loading ? 'Criando...' : 'Finalizar Criação'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
