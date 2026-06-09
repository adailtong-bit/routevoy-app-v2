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
import { Plus } from 'lucide-react'

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
  const [categories, setCategories] = useState<
    { id: string; name: string; label: string }[]
  >([])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [link, setLink] = useState('')
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
      setLink('')
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
  let calculatedDiscountPercentage = 0

  if (pricingModel === 'percentage') {
    calculatedOriginalPrice = originalPrice
    calculatedPrice = originalPrice * (1 - discountPercentage / 100)
    calculatedDiscountPercentage = discountPercentage
  } else if (pricingModel === 'fixed') {
    calculatedOriginalPrice = originalPrice
    calculatedPrice = originalPrice - discountValue
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
      const { error } = await supabase.from('ad_campaigns').insert({
        title,
        description,
        category,
        link,
        image: imageUrl,
        company_id: companyId,
        original_price:
          calculatedOriginalPrice > 0 ? calculatedOriginalPrice : null,
        price: calculatedPrice > 0 ? calculatedPrice : null,
        discount_percentage:
          calculatedDiscountPercentage > 0
            ? calculatedDiscountPercentage
            : null,
        status: 'active',
        billing_type: 'cpc',
        placement: 'feed',
        environment,
      })
      if (error) throw error
      toast.success('Campanha de Ad criada com sucesso!')
      onCreated()
      setOpen(false)
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="font-bold">
          <Plus className="w-4 h-4 mr-2" />
          Nova Campanha de Ad
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Campanha Pagada (Ad Engine)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label>Título do Ad</Label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Super Promoção de Tênis"
            />
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes que chamam atenção..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
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
              <Label>Link de Destino</Label>
              <Input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://..."
              />
            </div>
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
              Modelo de Precificação (Exibição)
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
                <RadioGroupItem value="percentage" id="ad-pm-perc" />
                <Label htmlFor="ad-pm-perc">Desconto Percentual (%)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed" id="ad-pm-fixed" />
                <Label htmlFor="ad-pm-fixed">Desconto Fixo (R$)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="full" id="ad-pm-full" />
                <Label htmlFor="ad-pm-full">Preço Final (Full Discount)</Label>
              </div>
            </RadioGroup>

            <div className="grid grid-cols-2 gap-4 mt-4">
              {pricingModel !== 'full' && (
                <div>
                  <Label>Preço Original (R$)</Label>
                  <Input
                    type="text"
                    value={originalPriceStr}
                    onChange={(e) => handleNumericInput(e, setOriginalPriceStr)}
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
                    onChange={(e) => handleNumericInput(e, setDiscountValueStr)}
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
            className="w-full mt-6"
          >
            {loading ? 'Criando Ad...' : 'Criar Campanha Pagada'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
