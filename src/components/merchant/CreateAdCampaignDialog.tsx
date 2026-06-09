import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
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
import {
  Rocket,
  Percent,
  BadgeDollarSign,
  Eye,
  ExternalLink,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { fetchCategories } from '@/lib/api'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

export function CreateAdCampaignDialog({
  companyId,
  environment,
  onCreated,
}: {
  companyId: string
  environment: string
  onCreated: () => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [link, setLink] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [category, setCategory] = useState('')
  const [isSeasonal, setIsSeasonal] = useState(false)
  const [discountModel, setDiscountModel] = useState<'percentage' | 'fixed'>(
    'percentage',
  )
  const [discountPercentage, setDiscountPercentage] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [price, setPrice] = useState('')

  useEffect(() => {
    if (open) {
      fetchCategories().then((cats) => {
        setCategories(cats)
      })
    }
  }, [open])

  const handleSave = async () => {
    if (!title) {
      toast.error('O título é obrigatório.')
      return
    }
    setLoading(true)

    const payload = {
      title,
      description,
      link,
      image: imageUrl,
      category,
      is_seasonal: isSeasonal,
      company_id: companyId,
      environment: environment === 'global' ? 'production' : environment,
      status: 'active',
      placement: 'sponsored_push',
      billing_type: 'cpc',
      priority_score: 10,
    }

    if (discountModel === 'percentage') {
      Object.assign(payload, {
        discount_percentage: Number(discountPercentage) || null,
        original_price: null,
        price: null,
      })
    } else {
      Object.assign(payload, {
        discount_percentage: null,
        original_price: Number(originalPrice) || null,
        price: Number(price) || null,
      })
    }

    const { error } = await supabase.from('ad_campaigns').insert(payload)

    setLoading(false)
    if (error) {
      console.error(error)
      toast.error('Erro ao criar campanha: ' + error.message)
    } else {
      toast.success('Campanha criada com sucesso!')
      onCreated()
      setOpen(false)
      setTitle('')
      setDescription('')
      setLink('')
      setImageUrl('')
      setCategory('')
      setIsSeasonal(false)
      setDiscountPercentage('')
      setOriginalPrice('')
      setPrice('')
    }
  }

  const previewImg =
    imageUrl || 'https://img.usecurling.com/p/400/300?q=shopping'
  const finalDiscountLabel =
    discountModel === 'percentage' && discountPercentage
      ? `${discountPercentage}% OFF`
      : discountModel === 'fixed' &&
          originalPrice &&
          price &&
          Number(originalPrice) > Number(price)
        ? `${Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)}% OFF`
        : null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md hover:-translate-y-0.5 transition-transform">
          <Rocket className="w-4 h-4 mr-2" /> Nova Campanha Ad
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Rocket className="w-6 h-6 text-indigo-500" />
            Criar Campanha Patrocinada
          </DialogTitle>
          <DialogDescription>
            Configure sua campanha com opções de desconto, sazonalidade e
            visualize em tempo real.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-4">
          <div className="lg:col-span-3 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Título da Campanha *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Queima de Estoque"
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={category} onValueChange={setCategory}>
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

            <div className="space-y-2">
              <Label>Descrição / Instruções</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Compre 2 e leve 3, válido apenas nesta sexta."
                className="resize-none h-20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>URL da Imagem</Label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Link da Promoção</Label>
                <Input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://seu-site.com/oferta"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 border border-slate-200 p-4 rounded-xl bg-slate-50">
              <Switch
                checked={isSeasonal}
                onCheckedChange={setIsSeasonal}
                id="seasonal"
              />
              <div className="space-y-0.5">
                <Label
                  htmlFor="seasonal"
                  className="text-base font-semibold cursor-pointer"
                >
                  Campanha Sazonal
                </Label>
                <p className="text-xs text-slate-500">
                  Marque se esta oferta for vinculada a um evento sazonal (Black
                  Friday, Natal).
                </p>
              </div>
            </div>

            <div className="border border-slate-200 p-5 rounded-xl bg-white space-y-5 shadow-sm">
              <div>
                <Label className="text-base font-bold text-slate-800">
                  Modelo de Desconto
                </Label>
                <p className="text-xs text-slate-500 mb-3">
                  Escolha a mecânica de desconto que deseja aplicar na oferta.
                </p>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant={
                      discountModel === 'percentage' ? 'default' : 'outline'
                    }
                    onClick={() => setDiscountModel('percentage')}
                    className="flex-1 font-semibold"
                  >
                    <Percent className="w-4 h-4 mr-2" /> Percentual
                  </Button>
                  <Button
                    type="button"
                    variant={discountModel === 'fixed' ? 'default' : 'outline'}
                    onClick={() => setDiscountModel('fixed')}
                    className="flex-1 font-semibold"
                  >
                    <BadgeDollarSign className="w-4 h-4 mr-2" /> Fixo / Especial
                  </Button>
                </div>
              </div>

              {discountModel === 'percentage' ? (
                <div className="space-y-2 animate-in fade-in duration-300">
                  <Label>Percentual de Desconto (%)</Label>
                  <Input
                    type="number"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    placeholder="Ex: 50"
                    className="max-w-[200px]"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <Label>Preço Original (Opcional)</Label>
                    <Input
                      type="number"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="Ex: 150.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Preço Promocional</Label>
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Ex: 99.90"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-4 space-y-3">
              <Label className="flex items-center gap-2 text-slate-600 font-semibold mb-2">
                <Eye className="w-4 h-4" /> Pré-visualização
              </Label>

              <div className="flex flex-col overflow-hidden rounded-xl shadow-lg border border-slate-200 bg-white">
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden group">
                  <img
                    src={previewImg}
                    alt={title || 'Preview'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src =
                        'https://img.usecurling.com/p/400/300?q=shopping'
                    }}
                  />
                  {finalDiscountLabel && (
                    <Badge className="absolute top-3 right-3 bg-red-500 text-white font-bold px-2 py-1 shadow-sm border-none z-10">
                      {finalDiscountLabel}
                    </Badge>
                  )}
                  {isSeasonal && (
                    <Badge className="absolute bottom-3 right-3 bg-indigo-500 text-white font-bold px-2 py-1 shadow-sm border-none z-10">
                      Sazonal
                    </Badge>
                  )}
                  {category && (
                    <Badge className="absolute bottom-3 left-3 bg-white/90 text-slate-800 font-semibold px-2 py-1 shadow-sm border-none z-10 backdrop-blur-sm">
                      {categories.find((c) => c.name === category)?.label ||
                        category}
                    </Badge>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg leading-tight line-clamp-2 text-slate-800 break-words">
                    {title || 'Título da Promoção'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 min-h-[2rem]">
                    {description ||
                      'A descrição detalhada da sua promoção aparecerá aqui...'}
                  </p>

                  <div className="mt-4 flex flex-col justify-end min-h-[3rem]">
                    {discountModel === 'fixed' && price ? (
                      <div className="flex flex-col">
                        {originalPrice &&
                          Number(originalPrice) > Number(price) && (
                            <span className="text-sm text-slate-400 line-through decoration-slate-400">
                              R${' '}
                              {Number(originalPrice)
                                .toFixed(2)
                                .replace('.', ',')}
                            </span>
                          )}
                        <div className="flex items-center gap-1 font-bold text-primary text-xl">
                          <span className="text-sm text-slate-500 font-normal">
                            Por:{' '}
                          </span>
                          <span>R$</span>
                          <span>
                            {Number(price).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-start">
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-600"
                        >
                          {discountModel === 'percentage' && discountPercentage
                            ? `Desconto de ${discountPercentage}%`
                            : 'Oferta Especial'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4 pt-0 mt-auto">
                  <Button
                    className="w-full font-semibold pointer-events-none"
                    variant={link ? 'default' : 'secondary'}
                  >
                    {link ? 'Ver Oferta' : 'Link Indisponível'}
                    {link && <ExternalLink className="w-4 h-4 ml-2" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-8 border-t pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? 'Salvando...' : 'Criar Campanha'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
