import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Loader2, UploadCloud, Image as ImageIcon } from 'lucide-react'

export function CampaignFormDialog({
  open,
  onOpenChange,
  franchiseId,
  companyId,
  affiliateId,
  onSuccess,
  editData,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  franchiseId?: string
  companyId?: string
  affiliateId?: string
  onSuccess: () => void
  editData?: any
}) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Geral',
    status: 'active',
    image: '',
    link: '',
    start_date: '',
    end_date: '',
    promotion_model: 'standard',
    discount_percentage: 0,
    price: 0,
    is_demo: false,
    country: 'BR',
  })

  useEffect(() => {
    if (open) {
      if (editData) {
        setFormData({
          title: editData.title || '',
          description: editData.description || '',
          category: editData.category || 'Geral',
          status: editData.status || 'active',
          image: editData.image || '',
          link: editData.link || '',
          start_date: editData.start_date
            ? new Date(editData.start_date).toISOString().split('T')[0]
            : '',
          end_date: editData.end_date
            ? new Date(editData.end_date).toISOString().split('T')[0]
            : '',
          promotion_model: editData.promotion_model || 'standard',
          discount_percentage: editData.discount_percentage || 0,
          price: editData.price || 0,
          is_demo: !!editData.is_demo,
          country: editData.country || 'BR',
        })
      } else {
        setFormData({
          title: '',
          description: '',
          category: 'Geral',
          status: 'active',
          image: '',
          link: '',
          start_date: '',
          end_date: '',
          promotion_model: 'standard',
          discount_percentage: 0,
          price: 0,
          is_demo: false,
          country: 'BR',
        })
      }
    }
  }, [open, editData])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('O tamanho da imagem deve ser menor que 5MB')
      return
    }

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('promotions')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('promotions')
        .getPublicUrl(filePath)

      setFormData((prev) => ({ ...prev, image: urlData.publicUrl }))
      toast.success('Imagem enviada com sucesso!')
    } catch (err: any) {
      console.error('Error uploading image:', err)
      toast.error(
        err.message ||
          'Falha ao enviar imagem. Verifique se o bucket "promotions" existe.',
      )
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) {
      toast.error('O título é obrigatório')
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...formData,
        company_id: companyId || null,
        franchise_id: franchiseId || null,
        affiliate_id: affiliateId || null,
        start_date: formData.start_date
          ? new Date(formData.start_date).toISOString()
          : null,
        end_date: formData.end_date
          ? new Date(formData.end_date).toISOString()
          : null,
      }

      if (editData?.id) {
        const { error } = await supabase
          .from('ad_campaigns')
          .update(payload)
          .eq('id', editData.id)
        if (error) throw error
        toast.success('Campanha atualizada com sucesso!')
      } else {
        const { error } = await supabase.from('ad_campaigns').insert([payload])
        if (error) throw error
        toast.success('Campanha criada com sucesso!')
      }

      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      console.error('Error saving campaign:', err)
      toast.error(err.message || 'Falha ao salvar campanha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editData ? 'Editar Campanha' : 'Criar Campanha'}
          </DialogTitle>
          <DialogDescription>
            {editData
              ? 'Modifique os detalhes da sua campanha abaixo.'
              : 'Preencha os dados para criar uma nova campanha.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="col-span-2">
              <Label>Imagem da Campanha / Banner</Label>
              <div className="mt-2 flex items-center gap-4">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-400" />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Label
                    htmlFor="image-upload"
                    className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
                  >
                    <UploadCloud className="w-4 h-4 mr-2" />
                    Selecionar Imagem
                  </Label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Formatos suportados: JPG, PNG. Tamanho máximo: 5MB.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Título *</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Ex: Oferta de Verão"
                required
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Detalhes da sua campanha..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Input
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                placeholder="Ex: Alimentação"
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, status: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="paused">Pausado</SelectItem>
                  <SelectItem value="ended">Encerrado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Modelo de Promoção</Label>
              <Select
                value={formData.promotion_model}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, promotion_model: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Padrão</SelectItem>
                  <SelectItem value="discount">
                    Desconto (Percentual)
                  </SelectItem>
                  <SelectItem value="fixed_discount">Desconto Fixo</SelectItem>
                  <SelectItem value="free">Grátis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>% de Desconto</Label>
              <Input
                type="number"
                value={formData.discount_percentage}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    discount_percentage: Number(e.target.value),
                  }))
                }
                min="0"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label>Preço Final</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    price: Number(e.target.value),
                  }))
                }
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label>Link da Loja / Destino</Label>
              <Input
                value={formData.link}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, link: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>Data de Início</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    start_date: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Data de Término</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, end_date: e.target.value }))
                }
              />
            </div>

            <div className="flex items-center space-x-2 col-span-2 pt-2">
              <Switch
                id="is-demo"
                checked={formData.is_demo}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_demo: checked }))
                }
              />
              <Label htmlFor="is-demo">Campanha de Demonstração</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {editData ? 'Salvar Alterações' : 'Criar Campanha'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
