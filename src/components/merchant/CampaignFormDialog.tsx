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
import { supabase } from '@/lib/supabase/client'
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function CampaignFormDialog({
  open,
  onOpenChange,
  companyId,
  onSuccess,
  campaignToEdit = null,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: string
  onSuccess?: () => void
  campaignToEdit?: any
}) {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [categoriesError, setCategoriesError] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    price: '',
    original_price: '',
    category: '',
    image: '',
    billing_type: 'fixed',
    placement: 'feed',
  })

  useEffect(() => {
    if (open) {
      fetchCategories()
      if (campaignToEdit) {
        setFormData({
          title: campaignToEdit.title || '',
          description: campaignToEdit.description || '',
          link: campaignToEdit.link || '',
          price: campaignToEdit.price?.toString() || '',
          original_price: campaignToEdit.original_price?.toString() || '',
          category: campaignToEdit.category || '',
          image: campaignToEdit.image || '',
          billing_type: campaignToEdit.billing_type || 'fixed',
          placement: campaignToEdit.placement || 'feed',
        })
      } else {
        setFormData({
          title: '',
          description: '',
          link: '',
          price: '',
          original_price: '',
          category: '',
          image: '',
          billing_type: 'fixed',
          placement: 'feed',
        })
      }
    }
  }, [open, campaignToEdit])

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true)
      setCategoriesError(false)
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, label')
        .eq('status', 'active')
        .order('name')
      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      setCategoriesError(true)
      toast.error('Erro ao carregar categorias.')
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${companyId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('campaigns')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('campaigns').getPublicUrl(filePath)

      setFormData((prev) => ({ ...prev, image: data.publicUrl }))
      toast.success('Imagem enviada com sucesso!')
    } catch (error: any) {
      toast.error('Erro ao fazer upload: ' + error.message)
    } finally {
      setIsUploading(false)
      if (e.target) e.target.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const priceVal = parseFloat(formData.price) || null
      const originalPriceVal = parseFloat(formData.original_price) || null

      let discountPercentage = null
      if (originalPriceVal && priceVal && originalPriceVal > priceVal) {
        discountPercentage = Math.round(
          ((originalPriceVal - priceVal) / originalPriceVal) * 100,
        )
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        link: formData.link,
        price: priceVal,
        original_price: originalPriceVal,
        category: formData.category,
        image: formData.image,
        billing_type: formData.billing_type,
        placement: formData.placement,
        company_id: companyId,
        environment: 'production',
        discount_percentage: discountPercentage,
      }

      if (campaignToEdit?.id) {
        const { error } = await supabase
          .from('ad_campaigns')
          .update(payload)
          .eq('id', campaignToEdit.id)
        if (error) throw error
        toast.success('Campanha atualizada com sucesso!')
      } else {
        const { error } = await supabase.from('ad_campaigns').insert(payload)
        if (error) throw error
        toast.success('Campanha criada com sucesso!')
      }

      onSuccess?.()
      onOpenChange(false)
    } catch (error: any) {
      toast.error('Erro ao salvar campanha: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 max-h-[90vh] overflow-y-auto">
          {/* Formulário */}
          <div className="p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-slate-100">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold text-slate-800">
                {campaignToEdit ? 'Editar Campanha' : 'Nova Campanha'}
              </DialogTitle>
              <DialogDescription className="text-slate-500">
                Preencha os dados abaixo para configurar sua campanha.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-700 font-semibold">
                  Título da Campanha
                </Label>
                <Input
                  id="title"
                  placeholder="Ex: 50% OFF em Tênis Nike"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  className="bg-slate-50 border-slate-200 focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-slate-700 font-semibold"
                >
                  Descrição
                </Label>
                <Textarea
                  id="description"
                  placeholder="Descreva os detalhes da oferta..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="resize-none h-24 bg-slate-50 border-slate-200 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="original_price"
                    className="text-slate-700 font-semibold"
                  >
                    Preço Original
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500 text-sm">
                      R$
                    </span>
                    <Input
                      id="original_price"
                      type="number"
                      step="0.01"
                      placeholder="199.90"
                      value={formData.original_price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          original_price: e.target.value,
                        })
                      }
                      className="pl-9 bg-slate-50 border-slate-200 focus:bg-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="price"
                    className="text-slate-700 font-semibold"
                  >
                    Preço Promocional
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500 text-sm">
                      R$
                    </span>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="99.90"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="pl-9 bg-slate-50 border-slate-200 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="category"
                  className="text-slate-700 font-semibold"
                >
                  Categoria
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) =>
                    setFormData({ ...formData, category: val })
                  }
                  disabled={isLoadingCategories || categoriesError}
                >
                  <SelectTrigger
                    id="category"
                    className={cn(
                      'bg-slate-50 border-slate-200 focus:bg-white',
                      categoriesError &&
                        'border-red-500 text-red-500 focus:ring-red-500',
                    )}
                  >
                    <SelectValue
                      placeholder={
                        isLoadingCategories
                          ? 'Carregando categorias...'
                          : categoriesError
                            ? 'Erro ao carregar categorias'
                            : 'Selecione uma categoria'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.label || cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {categoriesError && (
                  <p className="text-xs text-red-500 mt-1 font-medium animate-fade-in">
                    Não foi possível carregar as categorias. Tente novamente
                    mais tarde.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="link" className="text-slate-700 font-semibold">
                  Link da Oferta (Opcional)
                </Label>
                <Input
                  id="link"
                  placeholder="https://seu-site.com/produto"
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  className="bg-slate-50 border-slate-200 focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">
                  Imagem da Campanha
                </Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full relative overflow-hidden bg-slate-50 hover:bg-slate-100 border-dashed border-2 border-slate-300 h-12"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin text-primary" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2 text-primary" />
                    )}
                    <span
                      className={
                        isUploading
                          ? 'text-primary font-semibold'
                          : 'text-slate-600 font-semibold'
                      }
                    >
                      {isUploading
                        ? 'Enviando Imagem...'
                        : 'Selecionar e Fazer Upload'}
                    </span>
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                  </Button>
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="font-semibold"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="font-bold shadow-md"
                >
                  {isSaving && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {campaignToEdit ? 'Atualizar' : 'Salvar Campanha'}
                </Button>
              </div>
            </form>
          </div>

          {/* Preview */}
          <div className="bg-slate-50/50 p-6 md:p-8 flex flex-col justify-center items-center relative">
            <div className="absolute top-6 left-6 flex items-center gap-2 text-indigo-500/80 font-bold tracking-wide uppercase text-sm">
              <ImageIcon className="w-4 h-4" /> Live Preview
            </div>

            <div className="w-full max-w-[340px] mt-10">
              {/* Preview Card */}
              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200 hover:-translate-y-1">
                <div className="relative h-48 bg-slate-100 w-full overflow-hidden group">
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100/80 backdrop-blur-sm">
                      <ImageIcon className="w-12 h-12 mb-3 text-slate-300" />
                      <span className="text-sm font-medium">
                        Preview da Imagem
                      </span>
                    </div>
                  )}

                  {formData.category && (
                    <Badge className="absolute bottom-3 left-3 bg-white/95 text-slate-800 border-none shadow-sm backdrop-blur-md font-semibold px-3 py-1">
                      {formData.category}
                    </Badge>
                  )}

                  {formData.original_price &&
                    formData.price &&
                    parseFloat(formData.original_price) >
                      parseFloat(formData.price) && (
                      <Badge className="absolute top-3 right-3 bg-red-500 text-white border-none shadow-md font-bold px-2 py-1 z-10">
                        {Math.round(
                          ((parseFloat(formData.original_price) -
                            parseFloat(formData.price)) /
                            parseFloat(formData.original_price)) *
                            100,
                        )}
                        % OFF
                      </Badge>
                    )}
                </div>

                <div className="p-5">
                  <h4 className="font-bold text-lg text-slate-800 line-clamp-2 min-h-[3.5rem] mb-2 leading-tight">
                    {formData.title ||
                      'Título atraente da sua campanha promocional'}
                  </h4>

                  <p className="text-sm text-slate-500 line-clamp-2 min-h-[2.5rem] mb-5 leading-relaxed">
                    {formData.description ||
                      'Uma descrição detalhada sobre a sua oferta e por que os clientes devem aproveitá-la...'}
                  </p>

                  <div className="flex items-end justify-between mt-auto">
                    <div className="flex flex-col">
                      {formData.original_price &&
                        parseFloat(formData.original_price) >
                          parseFloat(formData.price || '0') && (
                          <span className="text-sm text-slate-400 line-through decoration-slate-400 font-medium">
                            R${' '}
                            {parseFloat(formData.original_price)
                              .toFixed(2)
                              .replace('.', ',')}
                          </span>
                        )}
                      <div className="font-extrabold text-primary text-2xl flex items-center gap-1 leading-none mt-1">
                        {formData.price ? (
                          <>
                            <span className="text-sm font-normal text-slate-500 tracking-wide">
                              Por
                            </span>
                            <span>R$</span>
                            <span>
                              {parseFloat(formData.price)
                                .toFixed(2)
                                .replace('.', ',')}
                            </span>
                          </>
                        ) : (
                          <span className="text-base text-slate-400 font-normal mt-1">
                            Preço a definir
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      variant={formData.link ? 'default' : 'secondary'}
                      size="sm"
                      className="font-bold rounded-lg shadow-sm"
                      disabled
                    >
                      {formData.link ? 'Ver Oferta' : 'Indisponível'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-slate-400 mt-8 max-w-[280px]">
              O design final pode variar levemente dependendo do dispositivo do
              usuário.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
