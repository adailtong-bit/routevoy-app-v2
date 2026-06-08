import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { HierarchicalLocationSelector } from '@/components/HierarchicalLocationSelector'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { useEnvironment } from '@/hooks/use-environment'

export function CreateAdCampaignDialog({
  companyId,
  onCreated,
}: {
  companyId: string
  onCreated: () => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { environment } = useEnvironment()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    link: '',
    placement: '',
    country: '',
    state: '',
    city: '',
  })

  const [pricingOptions, setPricingOptions] = useState<any[]>([])

  useEffect(() => {
    if (open) {
      fetchPricing()
    }
  }, [open])

  const fetchPricing = async () => {
    const { data } = await supabase.from('ad_pricing').select('*')
    if (data) setPricingOptions(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const selectedPricing = pricingOptions.find(
      (p) => p.placement === formData.placement,
    )

    const { error } = await supabase.from('ad_campaigns').insert([
      {
        company_id: companyId,
        title: formData.title,
        description: formData.description,
        image: formData.image,
        link: formData.link,
        placement: formData.placement,
        billing_type: selectedPricing?.billing_type || 'fixed',
        price: selectedPricing?.price || 0,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        status: 'pending',
        environment: environment || 'production',
      },
    ])

    setLoading(false)

    if (error) {
      toast.error('Erro ao criar campanha: ' + error.message)
    } else {
      toast.success('Campanha criada com sucesso!')
      setOpen(false)
      onCreated()
      setFormData({
        title: '',
        description: '',
        image: '',
        link: '',
        placement: '',
        country: '',
        state: '',
        city: '',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
          <Plus className="w-4 h-4 mr-2" /> Nova Campanha Ads
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Campanha de Publicidade</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Ex: Super Desconto de Verão"
            />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Descreva a oferta em detalhes..."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Link de Destino</Label>
              <Input
                required
                type="url"
                value={formData.link}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
                placeholder="https://sua-oferta.com"
              />
            </div>
            <div className="space-y-2">
              <Label>URL da Imagem</Label>
              <Input
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Posicionamento (Placement)</Label>
            <Select
              required
              value={formData.placement}
              onValueChange={(v) => setFormData({ ...formData, placement: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o local de exibição" />
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
          <div className="space-y-2">
            <Label>Segmentação Geográfica (Opcional)</Label>
            <HierarchicalLocationSelector
              country={formData.country}
              state={formData.state}
              city={formData.city}
              onChange={(country, state, city) =>
                setFormData({ ...formData, country, state, city })
              }
            />
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? 'Salvando...' : 'Salvar Campanha'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
