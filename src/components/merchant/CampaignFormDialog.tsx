import { useState, useEffect } from 'react'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { supabase } from '@/lib/supabase/client'
import { fetchCategories, saveDiscoveredPromotion } from '@/lib/api'
import { UploadCloud, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { DiscoveredPromotion } from '@/lib/types'

interface CampaignFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: string
  onSuccess?: () => void
}

export function CampaignFormDialog({
  open,
  onOpenChange,
  companyId,
  onSuccess,
}: CampaignFormDialogProps) {
  const { toast } = useToast()
  const [categories, setCategories] = useState<any[]>([])

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [url, setUrl] = useState('')
  const [discountModel, setDiscountModel] = useState('pure')

  const [originalPrice, setOriginalPrice] = useState('')
  const [price, setPrice] = useState('')
  const [discountPercentage, setDiscountPercentage] = useState('')

  const [spendAmount, setSpendAmount] = useState('')
  const [rewardAmount, setRewardAmount] = useState('')

  const [isSeasonal, setIsSeasonal] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')

  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open) {
      loadCategories()
      resetForm()
    }
  }, [open])

  const loadCategories = async () => {
    const data = await fetchCategories()
    setCategories(data)
  }

  const resetForm = () => {
    setTitle('')
    setCategory('')
    setUrl('')
    setDiscountModel('pure')
    setOriginalPrice('')
    setPrice('')
    setDiscountPercentage('')
    setSpendAmount('')
    setRewardAmount('')
    setIsSeasonal(false)
    setImageFile(null)
    setImagePreview('')
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('promotions')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('promotions').getPublicUrl(filePath)
    return data.publicUrl
  }

  const handleSave = async () => {
    if (!category) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione uma categoria.',
        variant: 'destructive',
      })
      return
    }
    if (!title) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira o título da promoção.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    try {
      let uploadedImageUrl = ''
      if (imageFile) {
        uploadedImageUrl = await uploadImage(imageFile)
      }

      const payload: Partial<DiscoveredPromotion> = {
        title,
        category,
        sourceUrl: url,
        productLink: url,
        isSeasonal,
        companyId,
        imageUrl: uploadedImageUrl,
        status: 'active',
      }

      if (discountModel === 'pure') {
        payload.originalPrice = originalPrice
          ? parseFloat(originalPrice)
          : undefined
        payload.price = price ? parseFloat(price) : undefined
        payload.discountPercentage = discountPercentage
          ? parseFloat(discountPercentage)
          : undefined
        if (
          payload.originalPrice &&
          payload.price &&
          !payload.discountPercentage
        ) {
          payload.discountPercentage = Math.round(
            ((payload.originalPrice - payload.price) / payload.originalPrice) *
              100,
          )
        }
        payload.rewardType = 'Standard Discount'
      } else {
        payload.triggerThreshold = spendAmount
          ? parseFloat(spendAmount)
          : undefined
        payload.rewardValue = rewardAmount
          ? parseFloat(rewardAmount)
          : undefined
        payload.rewardType = 'Spend X, Get Y'
      }

      await saveDiscoveredPromotion(payload)
      toast({ title: 'Sucesso', description: 'Campanha criada com sucesso!' })
      onSuccess?.()
      onOpenChange(false)
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Falha ao salvar campanha.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden bg-white">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle className="text-xl font-bold">
            Criar Nova Campanha
          </DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para criar e visualizar sua nova promoção.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Column */}
          <div className="p-6 space-y-6 border-r border-slate-100 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id || c.name} value={c.name}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>URL da Promoção (Link)</Label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://sualoja.com.br/produto"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Modelos de Desconto
              </Label>
              <Tabs
                value={discountModel}
                onValueChange={setDiscountModel}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="pure">Desconto Puro</TabsTrigger>
                  <TabsTrigger value="spend_get">Compre X, Ganhe Y</TabsTrigger>
                </TabsList>
                <TabsContent value="pure" className="mt-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Preço Original</Label>
                      <Input
                        type="number"
                        placeholder="R$ 0.00"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Preço com Desconto</Label>
                      <Input
                        type="number"
                        placeholder="R$ 0.00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Desconto (%)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={discountPercentage}
                        onChange={(e) => setDiscountPercentage(e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="spend_get" className="mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Valor de Compra (X)</Label>
                      <Input
                        type="number"
                        placeholder="R$ 100.00"
                        value={spendAmount}
                        onChange={(e) => setSpendAmount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Desconto/Recompensa (Y)</Label>
                      <Input
                        type="number"
                        placeholder="R$ 20.00"
                        value={rewardAmount}
                        onChange={(e) => setRewardAmount(e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="flex items-center justify-between border p-4 rounded-lg bg-slate-50">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold">
                  Campanha Sazonal
                </Label>
                <p className="text-xs text-slate-500">
                  Marque se for uma data comemorativa
                </p>
              </div>
              <Switch checked={isSeasonal} onCheckedChange={setIsSeasonal} />
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">
                Imagem da Campanha
              </Label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-slate-400 transition-colors cursor-pointer relative bg-slate-50/50">
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <UploadCloud className="w-8 h-8 mb-3 text-slate-400" />
                <span className="text-sm font-medium text-slate-600">
                  Clique para enviar ou arraste uma imagem
                </span>
              </div>
            </div>
          </div>

          {/* Right Column (Preview) */}
          <div className="p-6 bg-slate-50/50 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100 transition-all duration-300 hover:shadow-md">
              <div className="relative w-full aspect-video bg-slate-100 flex items-center justify-center">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-slate-400 font-medium">Sem imagem</span>
                )}
                {discountModel === 'pure' && discountPercentage && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                    {discountPercentage}% OFF
                  </div>
                )}
              </div>

              <div className="p-5 space-y-3">
                <Input
                  className="text-xl font-bold border-none shadow-none px-0 h-auto focus-visible:ring-0 placeholder:text-slate-300 p-0 rounded-none bg-transparent"
                  placeholder="Título da Promoção"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <div className="text-slate-500 font-medium flex items-center gap-2">
                  {discountModel === 'pure' ? (
                    price ? (
                      <>
                        <span className="text-sm text-slate-400 line-through">
                          {originalPrice ? `R$ ${originalPrice}` : ''}
                        </span>
                        <span className="text-primary text-lg font-bold">
                          R$ {price}
                        </span>
                      </>
                    ) : (
                      'Valor não informado'
                    )
                  ) : spendAmount && rewardAmount ? (
                    <span className="text-primary font-bold">
                      Compre R$ {spendAmount}, ganhe R$ {rewardAmount} OFF
                    </span>
                  ) : (
                    'Valor não informado'
                  )}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 text-center mt-6 max-w-xs">
              Esta é uma prévia de como sua campanha aparecerá para os usuários
              na plataforma.
            </p>
          </div>
        </div>

        <DialogFooter className="p-4 border-t bg-slate-50/80">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="font-semibold px-8"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...
              </>
            ) : (
              'Salvar Campanha'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
