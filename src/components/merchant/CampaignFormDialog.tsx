import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { PromotionCard } from '@/components/PromotionCard'

export function CampaignFormDialog({
  open,
  onOpenChange,
  companyId,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: string
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<
    { id: string; name: string; label: string }[]
  >([])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const [pricingModel, setPricingModel] = useState<
    'percentage' | 'fixed' | 'full'
  >('percentage')
  const [originalPriceStr, setOriginalPriceStr] = useState('')
  const [discountPercentageStr, setDiscountPercentageStr] = useState('')
  const [discountValueStr, setDiscountValueStr] = useState('')
  const [fullPriceStr, setFullPriceStr] = useState('')

  useEffect(() => {
    if (open) {
      setTitle('')
      setDescription('')
      setCategory('')
      setImageUrl('')
      setPricingModel('percentage')
      setOriginalPriceStr('')
      setDiscountPercentageStr('')
      setDiscountValueStr('')
      setFullPriceStr('')
    }
  }, [open])

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('categories')
        .select('id, name, label')
        .eq('status', 'active')
      if (data) setCategories(data)
    }
    fetchCategories()
  }, [])

  const parseNum = (val: string) => {
    const parsed = parseFloat(val.replace(',', '.'))
    return isNaN(parsed) ? 0 : parsed
  }

  const originalPrice = parseNum(originalPriceStr)
  const discountPercentage = parseNum(discountPercentageStr)
  const discountValue = parseNum(discountValueStr)
  const fullPrice = parseNum(fullPriceStr)

  let calculatedPrice = 0
  let calculatedOriginalPrice = 0
  let calculatedDiscountLabel = ''
  let calculatedDiscountPercentage = 0

  if (pricingModel === 'percentage') {
    calculatedOriginalPrice = originalPrice
    calculatedPrice = originalPrice * (1 - discountPercentage / 100)
    if (discountPercentage > 0)
      calculatedDiscountLabel = `${discountPercentage}% OFF`
    calculatedDiscountPercentage = discountPercentage
  } else if (pricingModel === 'fixed') {
    calculatedOriginalPrice = originalPrice
    calculatedPrice = originalPrice - discountValue
    if (discountValue > 0)
      calculatedDiscountLabel = `R$ ${discountValue.toFixed(2)} OFF`
    if (originalPrice > 0)
      calculatedDiscountPercentage = (discountValue / originalPrice) * 100
  } else if (pricingModel === 'full') {
    calculatedPrice = fullPrice
    calculatedOriginalPrice = 0
  }

  const handleSave = async () => {
    if (!title || !category) {
      toast.error('Título e Categoria são obrigatórios.')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.from('discovered_promotions').insert({
        title,
        description,
        category,
        image_url: imageUrl,
        company_id: companyId,
        original_price:
          calculatedOriginalPrice > 0 ? calculatedOriginalPrice : null,
        price: calculatedPrice > 0 ? calculatedPrice : null,
        discount: calculatedDiscountLabel || null,
        discount_percentage:
          calculatedDiscountPercentage > 0
            ? calculatedDiscountPercentage
            : null,
        status: 'pending',
        environment: 'production',
      })
      if (error) throw error
      toast.success('Promoção criada com sucesso!')
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleNumericInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void,
  ) => {
    const val = e.target.value.replace(/[^0-9.,]/g, '')
    setter(val)
  }

  const previewPromotion: any = {
    title: title || 'Título da Promoção',
    description: description,
    imageUrl: imageUrl || 'https://img.usecurling.com/p/400/300?q=shopping',
    category: category || 'Categoria',
    currentPrice: calculatedPrice > 0 ? calculatedPrice : undefined,
    originalPrice:
      calculatedOriginalPrice > 0 ? calculatedOriginalPrice : undefined,
    discountLabel: calculatedDiscountLabel,
    discountPercentage:
      calculatedDiscountPercentage > 0
        ? calculatedDiscountPercentage
        : undefined,
  }

  const hasData =
    title.length > 0 ||
    description.length > 0 ||
    originalPriceStr.length > 0 ||
    fullPriceStr.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Promoção</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
          <div className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Hambúrguer Artesanal"
              />
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhes da oferta..."
              />
            </div>

            <div>
              <Label>Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
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

            <div>
              <Label>URL da Imagem</Label>
              <Input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="border p-4 rounded-lg space-y-4">
              <Label className="text-base font-semibold">
                Modelo de Precificação
              </Label>
              <RadioGroup
                value={pricingModel}
                onValueChange={(v: any) => {
                  setPricingModel(v)
                  setOriginalPriceStr('')
                  setDiscountPercentageStr('')
                  setDiscountValueStr('')
                  setFullPriceStr('')
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="percentage" id="pm-perc" />
                  <Label htmlFor="pm-perc">Desconto Percentual (%)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fixed" id="pm-fixed" />
                  <Label htmlFor="pm-fixed">Desconto Fixo (R$)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="full" id="pm-full" />
                  <Label htmlFor="pm-full">Preço Final (Full Discount)</Label>
                </div>
              </RadioGroup>

              <div className="grid grid-cols-2 gap-4 mt-4">
                {pricingModel !== 'full' && (
                  <div>
                    <Label>Preço Original (R$)</Label>
                    <Input
                      type="text"
                      value={originalPriceStr}
                      onChange={(e) =>
                        handleNumericInput(e, setOriginalPriceStr)
                      }
                      placeholder="0.00"
                    />
                  </div>
                )}

                {pricingModel === 'percentage' && (
                  <div>
                    <Label>Desconto (%)</Label>
                    <Input
                      type="text"
                      value={discountPercentageStr}
                      onChange={(e) =>
                        handleNumericInput(e, setDiscountPercentageStr)
                      }
                      placeholder="0"
                    />
                  </div>
                )}

                {pricingModel === 'fixed' && (
                  <div>
                    <Label>Valor do Desconto (R$)</Label>
                    <Input
                      type="text"
                      value={discountValueStr}
                      onChange={(e) =>
                        handleNumericInput(e, setDiscountValueStr)
                      }
                      placeholder="0.00"
                    />
                  </div>
                )}

                {pricingModel === 'full' && (
                  <div className="col-span-2">
                    <Label>Preço Final (R$)</Label>
                    <Input
                      type="text"
                      value={fullPriceStr}
                      onChange={(e) => handleNumericInput(e, setFullPriceStr)}
                      placeholder="0.00"
                    />
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full mt-2"
            >
              {loading ? 'Salvando...' : 'Criar Promoção'}
            </Button>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl flex items-center justify-center border border-slate-100 min-h-[400px]">
            {!hasData ? (
              <div className="text-center text-slate-400 max-w-[250px]">
                <p>
                  Comece a preencher os dados para ver o preview da sua
                  promoção.
                </p>
              </div>
            ) : (
              <div className="w-[300px] pointer-events-none">
                <PromotionCard promotion={previewPromotion} />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
