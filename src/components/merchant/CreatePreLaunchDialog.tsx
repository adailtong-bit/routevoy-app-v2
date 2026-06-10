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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ImageOff, Rocket } from 'lucide-react'

export function CreatePreLaunchDialog({
  companyId,
  onCreated,
}: {
  companyId: string
  onCreated: () => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    product_link: '',
    category: '',
    is_seasonal: false,
    engagement_threshold: '',
    reward_type: '',
    reward_value: '',
    latitude: '',
    longitude: '',
    alert_radius: '',
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      supabase
        .from('categories')
        .select('*')
        .eq('status', 'active')
        .then(({ data }) => {
          if (data) setCategories(data)
        })
    }
  }, [open])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let image_url = null
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('promotions')
          .upload(fileName, imageFile)
        if (uploadError) throw uploadError
        const { data } = supabase.storage
          .from('promotions')
          .getPublicUrl(fileName)
        image_url = data.publicUrl
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        product_link: formData.product_link,
        category: formData.category,
        is_seasonal: formData.is_seasonal,
        engagement_threshold: parseInt(formData.engagement_threshold, 10),
        reward_type: formData.reward_type,
        reward_value: parseFloat(formData.reward_value),
        latitude: parseFloat(formData.latitude) || null,
        longitude: parseFloat(formData.longitude) || null,
        alert_radius: parseFloat(formData.alert_radius) || null,
        image_url,
        promotion_model: 'pre-launch',
        company_id: companyId,
        status: 'published',
        environment: 'production',
        unique_hash: `prelaunch_${Date.now()}_${companyId}`,
      }

      const { error } = await supabase
        .from('discovered_promotions')
        .insert(payload)
      if (error) throw error

      toast.success('Campanha de pré-lançamento criada!')
      setOpen(false)
      onCreated()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white">
          <Rocket className="w-4 h-4 mr-2" />
          Criar Pré-Lançamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Campanha de Pré-Lançamento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Título da Campanha</Label>
              <Input
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                required
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>URL do Produto/Fonte</Label>
            <Input
              required
              type="url"
              value={formData.product_link}
              onChange={(e) =>
                setFormData({ ...formData, product_link: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border">
            <div className="space-y-2">
              <Label>Meta de Compartilhamento</Label>
              <Input
                required
                type="number"
                min="1"
                value={formData.engagement_threshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    engagement_threshold: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Recompensa a Conceder</Label>
              <Select
                required
                value={formData.reward_type}
                onValueChange={(v) =>
                  setFormData({ ...formData, reward_type: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma recompensa cadastrada" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Store Credit">Crédito na Loja</SelectItem>
                  <SelectItem value="Compound Discount">
                    Desconto Composto
                  </SelectItem>
                  <SelectItem value="Standard Discount">
                    Desconto Padrão
                  </SelectItem>
                  <SelectItem value="Free Item">Item Grátis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor da Recompensa</Label>
              <Input
                required
                type="number"
                min="0"
                step="0.01"
                value={formData.reward_value}
                onChange={(e) =>
                  setFormData({ ...formData, reward_value: e.target.value })
                }
              />
            </div>
            <div className="space-y-2 flex items-center pt-8">
              <Checkbox
                id="seasonal"
                checked={formData.is_seasonal}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_seasonal: !!checked })
                }
              />
              <Label htmlFor="seasonal" className="ml-2 font-medium">
                Marcar como Oferta Sazonal
              </Label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-xl">
            <div className="col-span-full">
              <Label className="text-sm font-bold text-slate-700">
                Impulsionamento Geográfico (Geofencing)
              </Label>
            </div>
            <div className="space-y-2">
              <Label>Latitude</Label>
              <Input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) =>
                  setFormData({ ...formData, latitude: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Longitude</Label>
              <Input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) =>
                  setFormData({ ...formData, longitude: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Raio de Alerta (metros)</Label>
              <Input
                type="number"
                min="0"
                value={formData.alert_radius}
                onChange={(e) =>
                  setFormData({ ...formData, alert_radius: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Imagem da Campanha</Label>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded border-2 border-dashed flex items-center justify-center bg-slate-50 overflow-hidden shrink-0">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageOff className="h-6 w-6 text-slate-400" />
                )}
              </div>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
              className="mr-2"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? 'Criando...' : 'Lançar Campanha'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
