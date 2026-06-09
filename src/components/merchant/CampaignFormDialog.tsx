import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
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
import { supabase } from '@/lib/supabase/client'
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<
    { id: string; name: string; label: string }[]
  >([])

  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    category: '',
    original_price: '',
    price: '',
    discount_percentage: '',
  })

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, label')
        .order('label')
      if (data) {
        setCategories(data)
      } else if (error) {
        console.error('Failed to fetch categories:', error.message)
      }
    }
    if (open) {
      fetchCategories()
    }
  }, [open])

  useEffect(() => {
    if (formData.original_price && formData.price) {
      const orig = parseFloat(formData.original_price)
      const sale = parseFloat(formData.price)
      if (orig > 0 && sale >= 0 && orig >= sale) {
        const perc = Math.round(((orig - sale) / orig) * 100)
        setFormData((prev) => ({
          ...prev,
          discount_percentage: perc.toString(),
        }))
      }
    }
  }, [formData.original_price, formData.price])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
    }
  }

  const removeImage = () => {
    setFile(null)
    setPreviewUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      link: '',
      category: '',
      original_price: '',
      price: '',
      discount_percentage: '',
    })
    removeImage()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.category) {
      toast.error('Preencha os campos obrigatórios (Título e Categoria)')
      return
    }

    setLoading(true)
    try {
      let uploadedImageUrl = ''

      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
        const filePath = `${companyId}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('campaigns')
          .upload(filePath, file, { upsert: true })

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('campaigns')
          .getPublicUrl(filePath)

        uploadedImageUrl = publicUrlData.publicUrl
      }

      const { error: dbError } = await supabase.from('ad_campaigns').insert({
        company_id: companyId,
        title: formData.title,
        description: formData.description,
        link: formData.link,
        category: formData.category,
        original_price: formData.original_price
          ? parseFloat(formData.original_price)
          : null,
        price: formData.price ? parseFloat(formData.price) : null,
        discount_percentage: formData.discount_percentage
          ? parseFloat(formData.discount_percentage)
          : null,
        image: uploadedImageUrl || null,
        status: 'active',
        environment: 'production',
      })

      if (dbError) throw dbError

      toast.success('Campanha criada com sucesso!')
      onSuccess?.()
      resetForm()
      onOpenChange(false)
    } catch (error: any) {
      toast.error('Erro ao criar campanha: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) resetForm()
        onOpenChange(val)
      }}
    >
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-slate-50">
        <div className="bg-white px-6 py-4 border-b border-slate-100">
          <DialogTitle className="text-xl font-bold text-slate-800">
            Criar Nova Campanha
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Preencha os dados abaixo para criar e visualizar sua nova promoção.
          </DialogDescription>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 max-h-[80vh] overflow-y-auto">
          <div className="md:col-span-7 p-6 bg-white space-y-6">
            <form
              id="campaign-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="title"
                    className="text-slate-700 font-semibold"
                  >
                    Título da Promoção *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Ex: 50% OFF em Tênis de Corrida"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label
                    htmlFor="description"
                    className="text-slate-700 font-semibold"
                  >
                    Descrição
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Detalhes adicionais da sua campanha..."
                    className="mt-1 resize-none h-20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="category"
                      className="text-slate-700 font-semibold"
                    >
                      Categoria *
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(val) =>
                        setFormData({ ...formData, category: val })
                      }
                      required
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>
                            {cat.label}
                          </SelectItem>
                        ))}
                        {categories.length === 0 && (
                          <div className="p-2 text-sm text-slate-500 text-center">
                            Nenhuma categoria encontrada
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label
                      htmlFor="link"
                      className="text-slate-700 font-semibold"
                    >
                      URL da Promoção (Link)
                    </Label>
                    <Input
                      id="link"
                      type="url"
                      value={formData.link}
                      onChange={(e) =>
                        setFormData({ ...formData, link: e.target.value })
                      }
                      placeholder="https://sualoja.com.br/produto"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4">
                  Modelos de Desconto
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label
                      htmlFor="original_price"
                      className="text-slate-700 text-sm"
                    >
                      Preço Original
                    </Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-2.5 text-slate-500 text-sm">
                        R$
                      </span>
                      <Input
                        id="original_price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.original_price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            original_price: e.target.value,
                          })
                        }
                        placeholder="0.00"
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="price" className="text-slate-700 text-sm">
                      Preço com Desconto
                    </Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-2.5 text-slate-500 text-sm">
                        R$
                      </span>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        placeholder="0.00"
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div>
                    <Label
                      htmlFor="discount_percentage"
                      className="text-slate-700 text-sm"
                    >
                      Desconto (%)
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="discount_percentage"
                        type="number"
                        step="1"
                        min="0"
                        max="100"
                        value={formData.discount_percentage}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            discount_percentage: e.target.value,
                          })
                        }
                        placeholder="0"
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-2.5 text-slate-500 text-sm">
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4">
                  Imagem da Campanha
                </h3>

                {!previewUrl ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-slate-400" />
                      <p className="text-sm text-slate-500">
                        <span className="font-semibold text-primary">
                          Clique para enviar
                        </span>{' '}
                        ou arraste uma imagem
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                ) : (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-200">
                    <img
                      src={previewUrl}
                      alt="Upload preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-sm transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>

          <div className="md:col-span-5 bg-slate-50 p-6 border-l border-slate-100 flex flex-col items-center">
            <h3 className="w-full text-left font-bold text-slate-500 uppercase tracking-wider text-xs mb-4">
              Live Preview
            </h3>

            <div className="w-full max-w-[320px] bg-white rounded-xl shadow-md overflow-hidden border border-slate-200 transition-all duration-300 hover:shadow-lg">
              <div className="relative h-[200px] w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-12 h-12 text-slate-300" />
                )}

                {formData.discount_percentage &&
                  parseFloat(formData.discount_percentage) > 0 && (
                    <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white font-bold px-2 py-1 shadow-sm border-none z-10">
                      {formData.discount_percentage}% OFF
                    </Badge>
                  )}

                {formData.category && (
                  <Badge className="absolute bottom-3 left-3 bg-white/90 text-slate-800 font-semibold px-2 py-1 shadow-sm border-none z-10 backdrop-blur-sm">
                    {categories.find((c) => c.name === formData.category)
                      ?.label || formData.category}
                  </Badge>
                )}
              </div>

              <div className="p-4 flex flex-col h-[140px]">
                <h3
                  className="font-bold text-lg leading-tight line-clamp-2 text-slate-800"
                  title={formData.title}
                >
                  {formData.title || 'Título da Promoção'}
                </h3>

                <div className="mt-auto">
                  {formData.price && parseFloat(formData.price) > 0 ? (
                    <div className="flex flex-col">
                      {formData.original_price &&
                        parseFloat(formData.original_price) >
                          parseFloat(formData.price) && (
                          <span className="text-sm text-slate-400 line-through decoration-slate-400">
                            R${' '}
                            {parseFloat(formData.original_price)
                              .toFixed(2)
                              .replace('.', ',')}
                          </span>
                        )}
                      <div className="flex items-center gap-1 font-bold text-primary text-xl">
                        <span className="text-sm text-slate-500 font-normal">
                          Por:{' '}
                        </span>
                        <span>
                          R${' '}
                          {parseFloat(formData.price)
                            .toFixed(2)
                            .replace('.', ',')}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col justify-end h-7">
                      <span className="text-sm font-semibold text-slate-500">
                        Valor não informado
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 text-center text-xs text-slate-400 max-w-[280px]">
              Esta é uma prévia de como sua campanha aparecerá para os usuários
              na plataforma.
            </div>
          </div>
        </div>

        <div className="bg-white px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="campaign-form"
            disabled={loading}
            className="min-w-[140px]"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {loading ? 'Salvando...' : 'Salvar Campanha'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
