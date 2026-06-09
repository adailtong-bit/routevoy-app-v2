import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Loader2,
  UploadCloud,
  X,
  Tag,
  Gift,
  Link as LinkIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function CampaignFormDialog({
  open,
  onOpenChange,
  companyId,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: string
  onSuccess?: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [promotionModel, setPromotionModel] = useState('standard')
  const [originalPrice, setOriginalPrice] = useState('')
  const [price, setPrice] = useState('')
  const [discountPercentage, setDiscountPercentage] = useState('')
  const [purchaseThreshold, setPurchaseThreshold] = useState('')
  const [rewardValue, setRewardValue] = useState('')
  const [link, setLink] = useState('')
  const [category, setCategory] = useState('')
  const [isSeasonal, setIsSeasonal] = useState(false)
  const [image, setImage] = useState('')

  useEffect(() => {
    if (open) {
      fetchCategories()
    }
  }, [open])

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name, label')
      .eq('status', 'active')
      .order('label')
    if (data) {
      setCategories(data)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !category) {
      toast.error(
        'Por favor, preencha os campos obrigatórios (Título e Categoria).',
      )
      return
    }

    setLoading(true)
    try {
      const payload: any = {
        title,
        description: description || null,
        promotion_model: promotionModel,
        original_price: originalPrice ? parseFloat(originalPrice) : null,
        price: price ? parseFloat(price) : null,
        discount_percentage: discountPercentage
          ? parseFloat(discountPercentage)
          : null,
        trigger_threshold: purchaseThreshold
          ? parseFloat(purchaseThreshold)
          : null,
        reward_value: rewardValue ? parseFloat(rewardValue) : null,
        product_link: link || null,
        category,
        is_seasonal: isSeasonal,
        image_url: image || null,
        company_id: companyId,
        status: 'published',
        environment: 'production',
        captured_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('discovered_promotions')
        .insert(payload)

      if (error) throw error

      toast.success('Promoção criada com sucesso!')
      onSuccess?.()
      onOpenChange(false)
      resetForm()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Erro ao criar promoção.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setPromotionModel('standard')
    setOriginalPrice('')
    setPrice('')
    setDiscountPercentage('')
    setPurchaseThreshold('')
    setRewardValue('')
    setLink('')
    setCategory('')
    setIsSeasonal(false)
    setImage('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Promoção</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da sua nova campanha ou oferta.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            {/* Image Upload */}
            <div>
              <Label className="mb-2 block">Imagem da Promoção</Label>
              <div className="flex items-center gap-4">
                {image ? (
                  <div className="relative h-24 w-24 rounded-lg overflow-hidden border">
                    <img
                      src={image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImage('')}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-[10px] text-slate-500">Upload</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
                <div className="text-sm text-slate-500 flex-1">
                  Adicione uma imagem chamativa para sua oferta. Resolução
                  recomendada: 800x800px.
                </div>
              </div>
            </div>

            {/* Title & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título da Promoção *</Label>
                <Input
                  id="title"
                  placeholder="Ex: 50% OFF em Tênis"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.name}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Link */}
            <div className="space-y-2">
              <Label htmlFor="link">Link da URL da Promoção</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="link"
                  className="pl-9"
                  placeholder="https://sua-loja.com/oferta"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descritivo</Label>
              <Textarea
                id="description"
                placeholder="Detalhes adicionais, regras ou condições..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Discount Models */}
            <div className="space-y-4 pt-2 border-t">
              <Label className="text-base font-semibold">
                Modelo de Desconto
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPromotionModel('pure_discount')}
                  className={cn(
                    'border rounded-xl p-3 text-left hover:border-primary transition-colors',
                    promotionModel === 'pure_discount' &&
                      'border-primary bg-primary/5 ring-1 ring-primary',
                  )}
                >
                  <Tag className="w-5 h-5 mb-2 text-primary" />
                  <div className="font-semibold text-sm">Desconto Puro</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Desconto direto no produto
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPromotionModel('buy_get')}
                  className={cn(
                    'border rounded-xl p-3 text-left hover:border-primary transition-colors',
                    promotionModel === 'buy_get' &&
                      'border-primary bg-primary/5 ring-1 ring-primary',
                  )}
                >
                  <Gift className="w-5 h-5 mb-2 text-primary" />
                  <div className="font-semibold text-sm">Compre X, Ganhe Y</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Brinde por valor gasto
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPromotionModel('standard')}
                  className={cn(
                    'border rounded-xl p-3 text-left hover:border-primary transition-colors',
                    promotionModel === 'standard' &&
                      'border-primary bg-primary/5 ring-1 ring-primary',
                  )}
                >
                  <LinkIcon className="w-5 h-5 mb-2 text-primary" />
                  <div className="font-semibold text-sm">Voucher Padrão</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Apenas link ou cupom
                  </div>
                </button>
              </div>

              {/* Dynamic Fields */}
              <div className="bg-slate-50 p-4 rounded-lg border mt-4">
                {promotionModel === 'pure_discount' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
                    <div className="space-y-2">
                      <Label>Preço Original (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Preço com Desconto (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Porcentagem (%)</Label>
                      <Input
                        type="number"
                        placeholder="Ex: 20"
                        value={discountPercentage}
                        onChange={(e) => setDiscountPercentage(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {promotionModel === 'buy_get' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                    <div className="space-y-2">
                      <Label>Valor de Compra (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 100.00"
                        value={purchaseThreshold}
                        onChange={(e) => setPurchaseThreshold(e.target.value)}
                      />
                      <p className="text-xs text-slate-500">
                        Gastando este valor...
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Valor de Desconto/Brinde (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 20.00"
                        value={rewardValue}
                        onChange={(e) => setRewardValue(e.target.value)}
                      />
                      <p className="text-xs text-slate-500">
                        Ganha este desconto.
                      </p>
                    </div>
                  </div>
                )}

                {promotionModel === 'standard' && (
                  <div className="text-sm text-slate-500 py-2 animate-fade-in">
                    Neste modelo, apenas o título, descrição e link da oferta
                    serão exibidos ao usuário. Ideal para vouchers genéricos.
                  </div>
                )}
              </div>
            </div>

            {/* Seasonal Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-xl bg-white shadow-sm mt-4">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold">
                  Campanha Sazonal
                </Label>
                <div className="text-sm text-slate-500">
                  Destaque esta oferta em datas comemorativas (Ex: Black
                  Friday).
                </div>
              </div>
              <Switch checked={isSeasonal} onCheckedChange={setIsSeasonal} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar Promoção
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
