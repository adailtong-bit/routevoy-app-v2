import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { fetchCategories } from '@/lib/api'

export function CreateAdCampaignDialog({
  companyId,
  environment = 'production',
  onCreated,
  campaignToEdit,
}: {
  companyId: string
  environment?: string
  onCreated: () => void
  campaignToEdit?: any
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    image: '',
    category: '',
    budget: '',
    duration_days: '7',
    placement: 'home_hero',
    billing_type: 'cpc',
    price: '',
    original_price: '',
  })

  useEffect(() => {
    if (open) {
      loadCategories()
      if (campaignToEdit) {
        setFormData({
          title: campaignToEdit.title || '',
          description: campaignToEdit.description || '',
          link: campaignToEdit.link || '',
          image: campaignToEdit.image || '',
          category: campaignToEdit.category || '',
          budget: campaignToEdit.budget?.toString() || '',
          duration_days: campaignToEdit.duration_days?.toString() || '7',
          placement: campaignToEdit.placement || 'home_hero',
          billing_type: campaignToEdit.billing_type || 'cpc',
          price: campaignToEdit.price?.toString() || '',
          original_price: campaignToEdit.original_price?.toString() || '',
        })
      }
    }
  }, [open, campaignToEdit])

  const loadCategories = async () => {
    const cats = await fetchCategories()
    setCategories(cats.filter((c) => c.status === 'active'))
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        company_id: companyId,
        environment,
        title: formData.title,
        description: formData.description,
        link: formData.link,
        image: formData.image,
        category: formData.category,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        duration_days: parseInt(formData.duration_days),
        placement: formData.placement,
        billing_type: formData.billing_type,
        price: formData.price ? parseFloat(formData.price) : null,
        original_price: formData.original_price
          ? parseFloat(formData.original_price)
          : null,
        status: 'active',
      }

      let error
      if (campaignToEdit?.id) {
        const res = await supabase
          .from('ad_campaigns')
          .update(payload)
          .eq('id', campaignToEdit.id)
        error = res.error
      } else {
        const res = await supabase.from('ad_campaigns').insert([payload])
        error = res.error
      }

      if (error) throw error

      setOpen(false)
      onCreated()
      if (!campaignToEdit) {
        setFormData({
          title: '',
          description: '',
          link: '',
          image: '',
          category: '',
          budget: '',
          duration_days: '7',
          placement: 'home_hero',
          billing_type: 'cpc',
          price: '',
          original_price: '',
        })
      }
    } catch (err) {
      console.error(err)
      alert('Erro ao salvar campanha ads')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {campaignToEdit ? (
          <Button variant="outline" size="sm">
            Editar
          </Button>
        ) : (
          <Button className="font-bold shadow-md hover:-translate-y-0.5 transition-transform bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nova Campanha Ads
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {campaignToEdit
              ? 'Editar Campanha Ads'
              : 'Criar Campanha Ads Engine'}
          </DialogTitle>
          <DialogDescription>
            Configure sua campanha patrocinada com layout clássico.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Campanha</Label>
            <Input
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: Oferta Especial de Verão"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detalhes da sua campanha..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(val) => handleSelectChange('category', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.name || c.label}>
                      {c.label || c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="placement">Posicionamento</Label>
              <Select
                value={formData.placement}
                onValueChange={(val) => handleSelectChange('placement', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home_hero">
                    Home Hero (Destaque principal)
                  </SelectItem>
                  <SelectItem value="sidebar">
                    Sidebar (Barra lateral)
                  </SelectItem>
                  <SelectItem value="feed">Feed (Entre os cupons)</SelectItem>
                  <SelectItem value="search">
                    Busca (Resultados de pesquisa)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="original_price">Preço Original (R$)</Label>
              <Input
                id="original_price"
                name="original_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.original_price}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Preço Promocional (R$)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="link">Link de Destino</Label>
              <Input
                id="link"
                name="link"
                type="url"
                value={formData.link}
                onChange={handleChange}
                placeholder="https://sua-loja.com/oferta"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">URL da Imagem</Label>
              <Input
                id="image"
                name="image"
                type="url"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://sua-loja.com/imagem.png"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="billing_type">Tipo de Cobrança</Label>
              <Select
                value={formData.billing_type}
                onValueChange={(val) => handleSelectChange('billing_type', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpc">CPC (Custo por Clique)</SelectItem>
                  <SelectItem value="cpa">CPA (Custo por Aquisição)</SelectItem>
                  <SelectItem value="fixed">Fixo Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Orçamento Máximo (R$)</Label>
              <Input
                id="budget"
                name="budget"
                type="number"
                step="0.01"
                min="0"
                value={formData.budget}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_days">Duração (Dias)</Label>
              <Input
                id="duration_days"
                name="duration_days"
                type="number"
                min="1"
                value={formData.duration_days}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-6">
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
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
