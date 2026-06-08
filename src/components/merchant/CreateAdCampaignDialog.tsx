import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HierarchicalLocationSelector } from '@/components/HierarchicalLocationSelector'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

export function CreateAdCampaignDialog({
  companyId,
  onCreated,
}: {
  companyId: string
  onCreated: () => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    link: '',
    country: '',
    state: '',
    city: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title) {
      toast.error('O título é obrigatório')
      return
    }
    setLoading(true)

    const { error } = await supabase.from('ad_campaigns').insert([
      {
        company_id: companyId,
        title: form.title,
        description: form.description,
        link: form.link,
        country: form.country || null,
        state: form.state || null,
        city: form.city || null,
        environment: 'production',
        status: 'active',
      },
    ])

    setLoading(false)
    if (error) {
      toast.error('Erro ao criar campanha de anúncios')
    } else {
      toast.success('Campanha de anúncios criada com sucesso')
      setOpen(false)
      onCreated()
      setForm({
        title: '',
        description: '',
        link: '',
        country: '',
        state: '',
        city: '',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:-translate-y-0.5 transition-transform">
          <Plus className="w-4 h-4 mr-2" /> Nova Campanha Ads
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Criar Campanha Publicitária Direcionada
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label className="text-slate-700">Título do Anúncio</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: Grande Queima de Estoque"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700">Descrição (Opcional)</Label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Breve descrição da oferta..."
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700">Link de Destino</Label>
            <Input
              type="url"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              placeholder="https://seusite.com.br/promocao"
            />
          </div>

          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <Label className="text-slate-800 font-bold">
              Público Alvo (Geolocalização)
            </Label>
            <p className="text-xs text-slate-500 mb-2">
              Selecione para restringir a exibição. Deixe em branco para
              veicular globalmente.
            </p>
            <HierarchicalLocationSelector
              country={form.country}
              state={form.state}
              city={form.city}
              onChange={(c, s, ci) =>
                setForm({ ...form, country: c, state: s, city: ci })
              }
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full font-bold"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Criando...' : 'Publicar Campanha'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
