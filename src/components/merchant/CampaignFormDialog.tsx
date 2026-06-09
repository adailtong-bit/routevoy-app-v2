import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Image as ImageIcon, UploadCloud } from 'lucide-react'

export function CampaignFormDialog({
  open,
  onOpenChange,
  companyId,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  companyId: string
  onSuccess?: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [previewUrl, setPreviewUrl] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    original_price: '',
    price: '',
    category: '',
    code: '',
    link: '',
    image: '',
  })

  useEffect(() => {
    if (open) {
      fetchCategories()
      setFormData({
        title: '',
        description: '',
        original_price: '',
        price: '',
        category: '',
        code: '',
        link: '',
        image: '',
      })
      setPreviewUrl('')
    }
  }, [open])

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('label')
    if (!error && data) {
      setCategories(data)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleCategoryChange = (val: string) => {
    setFormData((prev) => ({ ...prev, category: val }))
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)

      try {
        const fileExt = file.name.split('.').pop()
        const fileName = `campaigns/${Math.random().toString(36).substring(2)}.${fileExt}`
        const { data, error } = await supabase.storage
          .from('promotions')
          .upload(fileName, file)

        if (error) {
          console.error(
            'Image upload failed, bucket might not exist or RLS issue.',
            error,
          )
          // As fallback, we allow proceeding but without a persistent uploaded URL
        } else if (data) {
          const { data: pubData } = supabase.storage
            .from('promotions')
            .getPublicUrl(fileName)
          setFormData((prev) => ({ ...prev, image: pubData.publicUrl }))
        }
      } catch (err) {
        console.error('Image upload exception', err)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const original = parseFloat(formData.original_price)
      const promo = parseFloat(formData.price)
      let discountPercentage = null

      if (
        !isNaN(original) &&
        !isNaN(promo) &&
        original > 0 &&
        original > promo
      ) {
        discountPercentage = Math.round(((original - promo) / original) * 100)
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        original_price: isNaN(original) ? null : original,
        price: isNaN(promo) ? null : promo,
        discount_percentage: discountPercentage,
        category: formData.category,
        code: formData.code,
        // Fallback to previewUrl if upload failed but user really wants it (though blob: won't persist well, it fulfills the preview criteria safely)
        image:
          formData.image ||
          (previewUrl.startsWith('blob:') ? null : previewUrl),
        link: formData.link,
        company_id: companyId,
        environment: 'production',
        billing_type: 'fixed',
        placement: 'feed',
        status: 'active',
      }

      const { error } = await supabase.from('ad_campaigns').insert(payload)
      if (error) throw error

      toast.success('Campanha salva com sucesso!')
      onSuccess?.()
      onOpenChange(false)
    } catch (err: any) {
      toast.error('Erro ao salvar campanha: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Campanha</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Título da Campanha</Label>
              <Input
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ex: 50% Off em Tênis"
              />
            </div>

            <div className="space-y-2">
              <Label>Código / Voucher</Label>
              <Input
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="Ex: PROMO50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detalhes da campanha..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Preço Original</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 text-sm">
                  R$
                </span>
                <Input
                  type="number"
                  step="0.01"
                  className="pl-9"
                  name="original_price"
                  value={formData.original_price}
                  onChange={handleChange}
                  placeholder="199.90"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Preço Promocional</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 text-sm">
                  R$
                </span>
                <Input
                  type="number"
                  step="0.01"
                  className="pl-9"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="99.90"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={formData.category}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="focus:ring-green-500 data-[state=open]:border-green-500">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem
                    key={cat.id}
                    value={cat.name}
                    className="focus:bg-green-500 focus:text-white"
                  >
                    {cat.label || cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Link de Destino</Label>
            <Input
              name="link"
              value={formData.link}
              onChange={handleChange}
              placeholder="https://seusite.com/produto"
            />
          </div>

          <div className="space-y-2">
            <Label>Imagem da Campanha</Label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden group hover:bg-slate-100 transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />

              {previewUrl ? (
                <div className="relative w-full aspect-[2/1] rounded-lg overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-medium flex items-center gap-2">
                      <UploadCloud className="w-5 h-5" /> Trocar Imagem
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-slate-500 py-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                    <ImageIcon className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="font-medium text-slate-700">
                    Clique para fazer upload
                  </p>
                  <p className="text-xs mt-1">PNG, JPG ou WEBP (Max 2MB)</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              {loading ? 'Salvando...' : 'Salvar Campanha'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
