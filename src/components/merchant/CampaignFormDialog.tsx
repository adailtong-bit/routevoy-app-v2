import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { supabase } from '@/lib/supabase/client'
import { fetchCategories } from '@/lib/api'

export function CampaignFormDialog({
  open,
  onOpenChange,
  companyId,
  onSuccess,
  campaignToEdit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: string
  onSuccess: () => void
  campaignToEdit?: any
}) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    original_price: '',
    price: '',
    image_url: '',
    start_date: '',
    end_date: '',
    code: '',
  })

  useEffect(() => {
    if (open) {
      loadCategories()
      if (campaignToEdit) {
        setFormData({
          title: campaignToEdit.title || '',
          description: campaignToEdit.description || '',
          category: campaignToEdit.category || '',
          original_price: campaignToEdit.original_price?.toString() || '',
          price: campaignToEdit.price?.toString() || '',
          image_url: campaignToEdit.image_url || '',
          start_date: campaignToEdit.start_date?.split('T')[0] || '',
          end_date: campaignToEdit.end_date?.split('T')[0] || '',
          code: campaignToEdit.code || '',
        })
      } else {
        setFormData({
          title: '',
          description: '',
          category: '',
          original_price: '',
          price: '',
          image_url: '',
          start_date: '',
          end_date: '',
          code: '',
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
        title: formData.title,
        description: formData.description,
        category: formData.category,
        original_price: formData.original_price
          ? parseFloat(formData.original_price)
          : null,
        price: formData.price ? parseFloat(formData.price) : null,
        image_url: formData.image_url,
        start_date: formData.start_date
          ? new Date(formData.start_date).toISOString()
          : null,
        end_date: formData.end_date
          ? new Date(formData.end_date).toISOString()
          : null,
        company_id: companyId,
        code: formData.code,
        environment: 'production',
        status: 'active',
      }

      let error
      if (campaignToEdit?.id) {
        const res = await supabase
          .from('coupons')
          .update(payload)
          .eq('id', campaignToEdit.id)
        error = res.error
      } else {
        const res = await supabase.from('coupons').insert([payload])
        error = res.error
      }

      if (error) throw error

      onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      alert('Erro ao salvar promoção')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {campaignToEdit ? 'Editar Promoção' : 'Criar Nova Promoção'}
          </DialogTitle>
          <DialogDescription>
            Configure sua promoção com layout clássico.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Promoção</Label>
            <Input
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: 50% OFF em Todos os Sanduíches"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detalhes e regras da promoção..."
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
              <Label htmlFor="code">Código do Cupom (Opcional)</Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="Ex: VERAO50"
              />
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

          <div className="space-y-2">
            <Label htmlFor="image_url">URL da Imagem</Label>
            <Input
              id="image_url"
              name="image_url"
              type="url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://sua-loja.com/imagem-promo.png"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="start_date">Data de Início</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Data de Encerramento</Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Promoção'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
