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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { PromotionCard } from '@/components/PromotionCard'
import { fetchCategories, saveDiscoveredPromotion } from '@/lib/api'
import { useCouponStore } from '@/stores/CouponContext'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { Loader2, UploadCloud } from 'lucide-react'
import { DiscoveredPromotion } from '@/lib/types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: string
  onSuccess: () => void
}

export function CampaignFormDialog({
  open,
  onOpenChange,
  companyId,
  onSuccess,
}: Props) {
  const { companies } = useCouponStore()
  const [categories, setCategories] = useState<any[]>([])

  const company = companies.find((c) => c.id === companyId)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [pricingMode, setPricingMode] = useState<'discount' | 'fixed' | 'full'>(
    'discount',
  )
  const [originalPrice, setOriginalPrice] = useState('')
  const [discountPercentage, setDiscountPercentage] = useState('')
  const [fixedPrice, setFixedPrice] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [isSeasonal, setIsSeasonal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [productLink, setProductLink] = useState('')

  useEffect(() => {
    if (open) {
      fetchCategories().then(setCategories)
      setTitle('')
      setDescription('')
      setCategory('')
      setPricingMode('discount')
      setOriginalPrice('')
      setDiscountPercentage('')
      setFixedPrice('')
      setImageFile(null)
      setImagePreview('')
      setIsSeasonal(false)
      setProductLink('')
    }
  }, [open])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
    const { data, error } = await supabase.storage
      .from('promotions')
      .upload(fileName, file)
    if (error) throw error
    const { data: publicUrlData } = supabase.storage
      .from('promotions')
      .getPublicUrl(fileName)
    return publicUrlData.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !category) {
      toast.error('Preencha os campos obrigatórios.')
      return
    }

    setIsSubmitting(true)
    try {
      let imageUrl = ''
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      let pOriginal: number | undefined = undefined
      let pCurrent: number | undefined = undefined
      let pDiscountPct: number | undefined = undefined
      let pDiscountStr: string | undefined = undefined

      if (pricingMode === 'discount') {
        pOriginal = parseFloat(originalPrice)
        pDiscountPct = parseFloat(discountPercentage)
        if (!isNaN(pOriginal) && !isNaN(pDiscountPct)) {
          pCurrent = pOriginal - pOriginal * (pDiscountPct / 100)
        }
      } else if (pricingMode === 'fixed') {
        pCurrent = parseFloat(fixedPrice)
      } else if (pricingMode === 'full') {
        pCurrent = 0
        pDiscountStr = 'GRÁTIS'
        pDiscountPct = 100
      }

      const payload: Partial<DiscoveredPromotion> = {
        title,
        description,
        category,
        imageUrl: imageUrl || undefined,
        status: 'published',
        isSeasonal,
        companyId,
        storeName: company?.name || 'Admin Global',
        originalPrice: isNaN(pOriginal as number) ? undefined : pOriginal,
        price: isNaN(pCurrent as number) ? undefined : pCurrent,
        discountPercentage: isNaN(pDiscountPct as number)
          ? undefined
          : pDiscountPct,
        discount: pDiscountStr,
        productLink: productLink || undefined,
      }

      await saveDiscoveredPromotion(payload)
      toast.success('Promoção criada com sucesso!')
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error('Erro ao criar promoção: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasData =
    title ||
    description ||
    imagePreview ||
    originalPrice ||
    discountPercentage ||
    fixedPrice ||
    pricingMode === 'full'

  const previewCurrentPrice =
    pricingMode === 'discount'
      ? parseFloat(originalPrice) && parseFloat(discountPercentage)
        ? parseFloat(originalPrice) -
          (parseFloat(originalPrice) * parseFloat(discountPercentage)) / 100
        : undefined
      : pricingMode === 'fixed'
        ? parseFloat(fixedPrice)
        : pricingMode === 'full'
          ? 0
          : undefined

  const previewPromotion: any = {
    title: title || '',
    description: description || '',
    category: category || 'Geral',
    imageUrl: imagePreview || '',
    storeName: company?.name || 'Admin Global',
    originalPrice: parseFloat(originalPrice) || undefined,
    currentPrice: isNaN(previewCurrentPrice as number)
      ? undefined
      : previewCurrentPrice,
    discountPercentage:
      pricingMode === 'discount'
        ? parseFloat(discountPercentage) || undefined
        : pricingMode === 'full'
          ? 100
          : undefined,
    discount: pricingMode === 'full' ? 'GRÁTIS' : undefined,
    productLink: productLink || undefined,
    isVerified: true,
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-full p-0 overflow-hidden bg-slate-50 border-none">
        <div className="flex flex-col md:flex-row h-[85vh] md:h-[650px]">
          {/* Formulário */}
          <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto bg-white border-r border-slate-100 hide-scrollbar flex flex-col">
            <DialogHeader className="mb-6 shrink-0 text-left">
              <DialogTitle className="text-2xl font-bold text-slate-800">
                Nova Promoção
              </DialogTitle>
              <DialogDescription>
                Crie uma nova oferta para o seu estabelecimento de forma simples
                e direta.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 flex-1 flex flex-col"
            >
              <div className="space-y-5 flex-1">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">
                    Título da Promoção *
                  </Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Hambúrguer Artesanal com 50% OFF"
                    required
                    className="bg-slate-50 border-slate-200 focus-visible:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">
                    Descrição
                  </Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalhes da oferta, regras, validade..."
                    rows={3}
                    className="bg-slate-50 border-slate-200 focus-visible:ring-primary/20 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">
                    Categoria *
                  </Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger className="bg-slate-50 border-slate-200">
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

                <div className="p-5 bg-slate-50/80 rounded-xl border border-slate-100 space-y-4">
                  <Label className="text-base font-semibold text-slate-800">
                    Modelo de Precificação
                  </Label>
                  <Select
                    value={pricingMode}
                    onValueChange={(v: any) => setPricingMode(v)}
                  >
                    <SelectTrigger className="bg-white border-slate-200 font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="discount">
                        Preço Original + Desconto
                      </SelectItem>
                      <SelectItem value="fixed">Preço Fixo Final</SelectItem>
                      <SelectItem value="full">
                        Totalmente Grátis (100% OFF)
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {pricingMode === 'discount' && (
                    <div className="grid grid-cols-2 gap-4 animate-fade-in-up">
                      <div className="space-y-2">
                        <Label className="text-slate-600">
                          Preço Original (R$)
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          className="bg-white border-slate-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          value={originalPrice}
                          onChange={(e) => setOriginalPrice(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600">Desconto (%)</Label>
                        <Input
                          type="number"
                          step="1"
                          min="0"
                          max="100"
                          className="bg-white border-slate-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          value={discountPercentage}
                          onChange={(e) =>
                            setDiscountPercentage(e.target.value)
                          }
                          placeholder="Ex: 20"
                        />
                      </div>
                    </div>
                  )}

                  {pricingMode === 'fixed' && (
                    <div className="space-y-2 animate-fade-in-up">
                      <Label className="text-slate-600">Preço Final (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        className="bg-white border-slate-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={fixedPrice}
                        onChange={(e) => setFixedPrice(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  )}

                  {pricingMode === 'full' && (
                    <div className="p-3 bg-green-50 text-green-700 text-sm font-medium rounded-lg animate-fade-in-up border border-green-100 flex items-center">
                      Esta oferta será marcada como totalmente gratuita.
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">
                    Imagem da Promoção
                  </Label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors bg-white group">
                      <UploadCloud className="w-8 h-8 text-slate-400 mb-2 group-hover:text-primary transition-colors" />
                      <span className="text-sm text-slate-600 font-medium text-center px-4">
                        {imageFile
                          ? imageFile.name
                          : 'Clique para fazer upload da imagem'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                    {imagePreview && (
                      <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border-2 border-slate-100 shadow-sm relative group">
                        <img
                          src={imagePreview}
                          className="w-full h-full object-cover"
                          alt="Preview"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <span className="text-white text-xs font-medium">
                            Preview
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">
                    Link da Oferta (Opcional)
                  </Label>
                  <Input
                    type="url"
                    value={productLink}
                    onChange={(e) => setProductLink(e.target.value)}
                    placeholder="https://..."
                    className="bg-slate-50 border-slate-200 focus-visible:ring-primary/20"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="space-y-1">
                    <Label className="text-slate-800 font-semibold text-base">
                      Promoção Sazonal
                    </Label>
                    <p className="text-sm text-slate-500">
                      Destacar em datas comemorativas ou especiais.
                    </p>
                  </div>
                  <Switch
                    checked={isSeasonal}
                    onCheckedChange={setIsSeasonal}
                  />
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3 shrink-0 mt-auto border-t border-slate-100 pb-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                  className="font-semibold"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !title || !category}
                  className="font-semibold px-6 shadow-md hover:-translate-y-0.5 transition-transform"
                >
                  {isSubmitting && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Publicar Oferta
                </Button>
              </div>
            </form>
          </div>

          {/* Preview */}
          <div className="w-full md:w-1/2 bg-slate-100/50 p-8 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Decoração de fundo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="z-10 w-full flex flex-col items-center">
              <div className="flex items-center gap-2 mb-8 self-start w-full max-w-[340px] mx-auto">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                  Live Preview
                </h3>
              </div>

              <div className="w-full max-w-[340px] relative transition-all duration-500">
                {!hasData ? (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-100/90 backdrop-blur-sm rounded-xl border-2 border-dashed border-slate-300 shadow-sm transition-all duration-300">
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mb-3">
                      <UploadCloud className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-600 font-semibold">
                      Preencha os dados
                    </p>
                    <p className="text-slate-400 text-sm mt-1 text-center px-6">
                      Para visualizar como sua oferta aparecerá no aplicativo
                    </p>
                  </div>
                ) : null}

                <div
                  className={`transition-all duration-500 ${
                    !hasData
                      ? 'opacity-30 scale-95 pointer-events-none'
                      : 'scale-100 shadow-xl rounded-xl'
                  }`}
                >
                  <PromotionCard promotion={previewPromotion} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
