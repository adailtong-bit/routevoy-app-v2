import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Rocket, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

interface CreateAdCampaignDialogProps {
  companyId: string
  environment: string
  onCreated: () => void
}

export function CreateAdCampaignDialog({
  companyId,
  environment,
  onCreated,
}: CreateAdCampaignDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [link, setLink] = useState('')
  const [image, setImage] = useState('')
  const [isSeasonal, setIsSeasonal] = useState(false)

  const [originalPrice, setOriginalPrice] = useState('')
  const [discountPercentage, setDiscountPercentage] = useState('')
  const [price, setPrice] = useState('')
  const [fullDiscount, setFullDiscount] = useState('')

  const [categories, setCategories] = useState<{ id: string; label: string }[]>(
    [],
  )
  const [loadingCategories, setLoadingCategories] = useState(false)

  useEffect(() => {
    if (open) {
      fetchCategories()
      resetForm()
    }
  }, [open])

  const fetchCategories = async () => {
    setLoadingCategories(true)
    const { data, error } = await supabase
      .from('categories')
      .select('id, label')
      .order('label')
    if (data) setCategories(data)
    setLoadingCategories(false)
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setCategory('')
    setLink('')
    setImage('')
    setIsSeasonal(false)
    setOriginalPrice('')
    setDiscountPercentage('')
    setPrice('')
    setFullDiscount('')
  }

  const handleOriginalPriceChange = (val: string) => {
    const clean = val.replace(/[^0-9.,]/g, '')
    setOriginalPrice(clean)
    if (fullDiscount) setFullDiscount('')

    const oVal = parseFloat(clean.replace(',', '.'))
    if (!isNaN(oVal) && discountPercentage) {
      const dVal = parseFloat(discountPercentage.replace(',', '.'))
      if (!isNaN(dVal)) {
        setPrice((oVal - (oVal * dVal) / 100).toFixed(2))
      }
    }
  }

  const handleDiscountPercentageChange = (val: string) => {
    const clean = val.replace(/[^0-9.,]/g, '')
    setDiscountPercentage(clean)
    if (fullDiscount) setFullDiscount('')

    const dVal = parseFloat(clean.replace(',', '.'))
    const oVal = parseFloat(originalPrice.replace(',', '.'))
    if (!isNaN(dVal) && !isNaN(oVal)) {
      setPrice((oVal - (oVal * dVal) / 100).toFixed(2))
    }
  }

  const handlePriceChange = (val: string) => {
    const clean = val.replace(/[^0-9.,]/g, '')
    setPrice(clean)
    if (fullDiscount) setFullDiscount('')

    const pVal = parseFloat(clean.replace(',', '.'))
    const oVal = parseFloat(originalPrice.replace(',', '.'))
    if (!isNaN(pVal) && !isNaN(oVal) && oVal > 0) {
      setDiscountPercentage((((oVal - pVal) / oVal) * 100).toFixed(0))
    }
  }

  const handleFullDiscountChange = (val: string) => {
    const clean = val.replace(/[^0-9.,]/g, '')
    setFullDiscount(clean)
    if (clean) {
      setOriginalPrice('')
      setDiscountPercentage('')
      setPrice('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !category) {
      toast.error('Preencha os campos obrigatórios (Título e Categoria)')
      return
    }

    setLoading(true)

    const finalPrice = fullDiscount
      ? parseFloat(fullDiscount.replace(',', '.'))
      : parseFloat(price.replace(',', '.'))
    const finalOriginalPrice = originalPrice
      ? parseFloat(originalPrice.replace(',', '.'))
      : null
    const finalDiscount = discountPercentage
      ? parseFloat(discountPercentage.replace(',', '.'))
      : null

    const isProd =
      window.location.hostname === 'routevoy.com' ||
      window.location.hostname === 'www.routevoy.com'

    const payload = {
      title,
      description,
      category,
      link,
      image,
      is_seasonal: isSeasonal,
      price: isNaN(finalPrice) ? null : finalPrice,
      original_price:
        finalOriginalPrice && !isNaN(finalOriginalPrice)
          ? finalOriginalPrice
          : null,
      discount_percentage:
        finalDiscount && !isNaN(finalDiscount) ? finalDiscount : null,
      company_id: companyId,
      environment: isProd ? 'production' : 'development',
      status: 'active',
      billing_type: 'fixed',
    }

    const { error } = await supabase.from('ad_campaigns').insert(payload)

    setLoading(false)

    if (error) {
      toast.error('Erro ao criar campanha: ' + error.message)
    } else {
      toast.success('Campanha criada com sucesso!')
      setOpen(false)
      onCreated()
    }
  }

  const hasContent =
    title || description || image || price || fullDiscount || originalPrice

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="font-semibold shadow-sm hover:shadow-md transition-all"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Campanha Ad
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Campanha Ad</DialogTitle>
          <DialogDescription>
            Crie uma nova campanha patrocinada para impulsionar suas ofertas.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
          <form
            id="campaign-form"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Oferta de Verão"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhes da campanha..."
                className="resize-none h-20"
              />
            </div>

            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingCategories
                        ? 'Carregando...'
                        : 'Selecione uma categoria'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.label}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4 border p-4 rounded-xl bg-slate-50 relative">
              <div className="col-span-2">
                <Label className="font-bold text-slate-700 text-sm">
                  Precificação Exclusiva
                </Label>
                <p className="text-xs text-slate-500 mb-2">
                  Preencha o Preço Original + Desconto OU apenas o Valor Cheio
                  (Full Discount)
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Preço Original</Label>
                <Input
                  type="text"
                  value={originalPrice}
                  onChange={(e) => handleOriginalPriceChange(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">% Desconto</Label>
                <Input
                  type="text"
                  value={discountPercentage}
                  onChange={(e) =>
                    handleDiscountPercentageChange(e.target.value)
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Preço Final</Label>
                <Input
                  type="text"
                  value={price}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2 border-l pl-4">
                <Label className="text-indigo-600 text-xs font-semibold">
                  Valor Cheio (Full Discount)
                </Label>
                <Input
                  type="text"
                  value={fullDiscount}
                  onChange={(e) => handleFullDiscountChange(e.target.value)}
                  placeholder="0.00"
                  className="border-indigo-200 focus-visible:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Link de Destino</Label>
              <Input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>URL da Imagem</Label>
              <Input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label htmlFor="seasonal" className="cursor-pointer">
                Campanha Sazonal
              </Label>
              <Switch
                id="seasonal"
                checked={isSeasonal}
                onCheckedChange={setIsSeasonal}
              />
            </div>
          </form>

          {/* Live Preview */}
          <div className="bg-slate-50 p-6 rounded-xl border flex flex-col items-center justify-center">
            <h3 className="font-bold text-slate-500 mb-4 self-start">
              Live Preview
            </h3>

            {hasContent ? (
              <div className="w-full max-w-sm bg-white border rounded-xl overflow-hidden shadow-md animate-fade-in-up">
                {image && (
                  <div className="w-full h-48 bg-slate-100 overflow-hidden relative">
                    <img
                      src={image}
                      alt="Preview"
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                    {discountPercentage && !fullDiscount && (
                      <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white font-bold px-2 py-1">
                        {discountPercentage}% OFF
                      </Badge>
                    )}
                  </div>
                )}
                <div className="p-5">
                  {category && (
                    <Badge className="mb-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none font-semibold px-2 py-0.5">
                      {category}
                    </Badge>
                  )}
                  <h4 className="font-bold text-lg text-slate-800 leading-tight">
                    {title}
                  </h4>
                  {description && (
                    <p className="text-sm text-slate-500 mt-2 line-clamp-3">
                      {description}
                    </p>
                  )}

                  <div className="mt-5 flex flex-col">
                    {originalPrice && !fullDiscount && (
                      <span className="text-sm text-slate-400 line-through">
                        R$ {originalPrice}
                      </span>
                    )}
                    {(price || fullDiscount) && (
                      <div className="flex items-center gap-1 font-bold text-primary text-xl">
                        <span className="text-sm text-slate-500 font-normal">
                          Por:{' '}
                        </span>
                        <span>R$ {fullDiscount || price}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-16 flex flex-col items-center animate-fade-in">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Rocket className="w-8 h-8 text-slate-300" />
                </div>
                <p className="font-medium">
                  Preencha os campos para ver o preview
                </p>
                <p className="text-sm mt-1">O card aparecerá aqui</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-6 border-t pt-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" form="campaign-form" disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Criar Campanha
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
