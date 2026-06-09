import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import {
  Image as ImageIcon,
  Loader2,
  DollarSign,
  Tag,
  Percent,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export interface CampaignFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId?: string
  onSuccess?: () => void
  coupon?: any
}

export function CampaignFormDialog({
  open,
  onOpenChange,
  companyId,
  onSuccess,
  coupon,
}: CampaignFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<
    { id: string; name: string; label: string }[]
  >([])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [storeName, setStoreName] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [category, setCategory] = useState('')
  const [isSeasonal, setIsSeasonal] = useState(false)

  const [pricingMode, setPricingMode] = useState<
    'reference' | 'fixed' | 'full'
  >('reference')
  const [originalPrice, setOriginalPrice] = useState('')
  const [discountPercentage, setDiscountPercentage] = useState('')
  const [price, setPrice] = useState('')
  const [discountText, setDiscountText] = useState('')

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, label')
      if (data && !error) setCategories(data)
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    if (open) {
      if (coupon) {
        setTitle(coupon.title || '')
        setDescription(coupon.description || '')
        setStoreName(coupon.store_name || coupon.storeName || '')
        setImageUrl(coupon.image_url || coupon.imageUrl || coupon.image || '')
        setCategory(coupon.category || '')
        setIsSeasonal(coupon.is_seasonal || false)

        if (coupon.discount && !coupon.original_price && !coupon.price) {
          setPricingMode('full')
          setDiscountText(coupon.discount)
          setOriginalPrice('')
          setDiscountPercentage('')
          setPrice('')
        } else if (coupon.original_price && coupon.discount_percentage) {
          setPricingMode('reference')
          setOriginalPrice(coupon.original_price.toString())
          setDiscountPercentage(coupon.discount_percentage.toString())
          setPrice('')
          setDiscountText('')
        } else if (coupon.price && !coupon.original_price) {
          setPricingMode('fixed')
          setPrice(coupon.price.toString())
          setOriginalPrice('')
          setDiscountPercentage('')
          setDiscountText('')
        } else {
          setPricingMode('reference')
          setOriginalPrice(
            coupon.original_price ? coupon.original_price.toString() : '',
          )
          setDiscountPercentage(
            coupon.discount_percentage
              ? coupon.discount_percentage.toString()
              : '',
          )
          setPrice(coupon.price ? coupon.price.toString() : '')
          setDiscountText(coupon.discount || '')
        }
      } else {
        // Limpeza de Estado no carregamento
        setTitle('')
        setDescription('')
        setStoreName('')
        setImageUrl('')
        setCategory('')
        setIsSeasonal(false)
        setPricingMode('reference')
        setOriginalPrice('')
        setDiscountPercentage('')
        setPrice('')
        setDiscountText('')
      }
    }
  }, [open, coupon])

  const handleModeChange = (mode: string) => {
    const newMode = mode as 'reference' | 'fixed' | 'full'
    setPricingMode(newMode)
    // Limpeza de Estado ativa (State Cleaning)
    if (newMode === 'reference') {
      setPrice('')
      setDiscountText('')
    } else if (newMode === 'fixed') {
      setOriginalPrice('')
      setDiscountPercentage('')
      setDiscountText('')
    } else if (newMode === 'full') {
      setOriginalPrice('')
      setDiscountPercentage('')
      setPrice('')
    }
  }

  const parseNumeric = (val: string) => {
    const parsed = parseFloat(val.replace(',', '.'))
    return isNaN(parsed) ? null : parsed
  }

  const handleSave = async () => {
    if (!title) return toast.error('Título é obrigatório')

    setIsLoading(true)
    try {
      const payload: any = {
        title,
        description,
        store_name: storeName,
        image_url: imageUrl,
        category,
        is_seasonal: isSeasonal,
        company_id: companyId || coupon?.company_id,
        environment: window.location.hostname.includes('routevoy.com')
          ? 'production'
          : 'development',
      }

      if (pricingMode === 'reference') {
        payload.original_price = parseNumeric(originalPrice)
        payload.discount_percentage = parseNumeric(discountPercentage)
        if (payload.original_price && payload.discount_percentage) {
          payload.price =
            payload.original_price * (1 - payload.discount_percentage / 100)
        } else {
          payload.price = null
        }
        payload.discount = null
      } else if (pricingMode === 'fixed') {
        payload.original_price = null
        payload.discount_percentage = null
        payload.price = parseNumeric(price)
        payload.discount = null
      } else if (pricingMode === 'full') {
        payload.original_price = null
        payload.discount_percentage = null
        payload.price = null
        payload.discount = discountText
      }

      if (coupon?.id) {
        const { error } = await supabase
          .from('discovered_promotions')
          .update(payload)
          .eq('id', coupon.id)
        if (error) throw error
        toast.success('Campanha atualizada com sucesso')
      } else {
        payload.status = 'published'
        const { error } = await supabase
          .from('discovered_promotions')
          .insert(payload)
        if (error) throw error
        toast.success('Campanha criada com sucesso')
      }

      onSuccess?.()
      onOpenChange(false)
    } catch (err: any) {
      toast.error('Erro ao salvar campanha: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const calcRefPrice = () => {
    const o = parseNumeric(originalPrice)
    const p = parseNumeric(discountPercentage)
    if (o && p) return (o * (1 - p / 100)).toFixed(2)
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl">
            {coupon ? 'Editar Campanha' : 'Nova Campanha'}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados da promoção ou cupom abaixo.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: 50% OFF em Tênis Nike"
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhes da oferta..."
                className="h-20 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome da Loja</Label>
                <Input
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Ex: Loja do João"
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
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
              <Label>URL da Imagem</Label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg border">
              <Switch
                id="seasonal"
                checked={isSeasonal}
                onCheckedChange={setIsSeasonal}
              />
              <Label htmlFor="seasonal" className="cursor-pointer font-medium">
                Promoção Sazonal
              </Label>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4">Modelo de Preço</h3>
              <Tabs
                value={pricingMode}
                onValueChange={handleModeChange}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="reference">
                    <Percent className="w-4 h-4 mr-2" /> Ref.
                  </TabsTrigger>
                  <TabsTrigger value="fixed">
                    <DollarSign className="w-4 h-4 mr-2" /> Fixo
                  </TabsTrigger>
                  <TabsTrigger value="full">
                    <Tag className="w-4 h-4 mr-2" /> Texto
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="reference" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Preço Original</Label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        placeholder="100.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Desconto (%)</Label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={discountPercentage}
                        onChange={(e) => setDiscountPercentage(e.target.value)}
                        placeholder="20"
                      />
                    </div>
                  </div>
                  {calcRefPrice() && (
                    <div className="text-sm text-slate-600 bg-emerald-50 p-2 rounded border border-emerald-100">
                      Preço Final Calculado:{' '}
                      <strong className="text-emerald-700">
                        R$ {calcRefPrice()}
                      </strong>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="fixed" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Preço Final Fixo</Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="89.90"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="full" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Texto de Desconto (Sem preço)</Label>
                    <Input
                      value={discountText}
                      onChange={(e) => setDiscountText(e.target.value)}
                      placeholder="Ex: Leve 2 Pague 1"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-500 uppercase text-xs font-bold tracking-wider">
                Preview
              </Label>
              <div className="border rounded-xl overflow-hidden shadow-sm flex flex-col bg-white">
                {imageUrl ? (
                  <div className="h-32 bg-slate-100 relative">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    {isSeasonal && (
                      <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm">
                        Sazonal
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="h-32 bg-slate-50 flex flex-col items-center justify-center text-slate-400">
                    <ImageIcon className="w-8 h-8 opacity-30 mb-2" />
                    <span className="text-xs font-medium">Sem imagem</span>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-base leading-tight line-clamp-2 text-slate-800">
                    {title || 'Sem título'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {storeName || 'Loja não informada'}
                  </p>
                  <div className="mt-3">
                    {pricingMode === 'reference' &&
                    originalPrice &&
                    discountPercentage &&
                    calcRefPrice() ? (
                      <div className="flex flex-col">
                        <span className="text-xs line-through text-slate-400">
                          R$ {originalPrice}
                        </span>
                        <span className="text-primary font-bold">
                          R$ {calcRefPrice()}
                        </span>
                      </div>
                    ) : pricingMode === 'fixed' && price ? (
                      <span className="text-primary font-bold">R$ {price}</span>
                    ) : pricingMode === 'full' && discountText ? (
                      <span className="text-primary font-bold">
                        {discountText}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs italic">
                        Sem preço
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-0 bg-slate-50/50 border-t mt-4 rounded-b-lg">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !title}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {coupon ? 'Salvar Alterações' : 'Criar Campanha'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
