import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Play } from 'lucide-react'
import { startExtractionTask } from '@/lib/crawlerTask'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DialogFooter } from '@/components/ui/dialog'
import { REGIONS } from '@/lib/data'
import { CrawlerSource } from '@/lib/types'
import { useCouponStore } from '@/stores/CouponContext'

interface CrawlerSourceFormProps {
  initialData?: CrawlerSource | null
  onSave: (data: Omit<CrawlerSource, 'id' | 'status' | 'lastScan'>) => void
  userRegion: string
  isFranchisee: boolean
}

export function CrawlerSourceForm({
  initialData,
  onSave,
  userRegion,
  isFranchisee,
}: CrawlerSourceFormProps) {
  const { toast } = useToast()
  const { platformSettings } = useCouponStore()

  const defaultCategories = [
    { id: 'retail', label: 'Varejo' },
    { id: 'food', label: 'Alimentação' },
    { id: 'services', label: 'Serviços' },
    { id: 'travel', label: 'Viagens' },
    { id: 'hotels', label: 'Hotéis' },
    { id: 'rental_cars', label: 'Aluguel de Carros' },
    { id: 'tickets', label: 'Passagens' },
    { id: 'attractions', label: 'Atrações' },
    { id: 'electronics', label: 'Eletrônicos' },
    { id: 'fashion', label: 'Moda' },
    { id: 'entertainment', label: 'Entretenimento' },
    { id: 'other', label: 'Outros' },
  ]

  const categoriesList =
    platformSettings?.categories?.length > 0
      ? platformSettings.categories
      : defaultCategories

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    type: 'web',
    region: userRegion || 'Global',
    country: '',
    state: '',
    city: '',
    scanRadius: 50,
    maxResults: 200,
    category: '',
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        url: initialData.url,
        type: initialData.type,
        region: initialData.region,
        country: initialData.country || '',
        state: initialData.state || '',
        city: initialData.city || '',
        scanRadius: initialData.scanRadius || 50,
        maxResults: 200,
        category: initialData.category || '',
      })
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let finalUrl = formData.url.trim()
    if (finalUrl && finalUrl !== 'all' && !/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl
    }

    onSave({
      name: formData.name,
      url: finalUrl,
      type: formData.type as 'web' | 'api' | 'app',
      region: formData.region,
      country: formData.country,
      state: formData.state,
      city: formData.city,
      scanRadius: formData.scanRadius,
      category: formData.category,
    })
  }

  const handleStartSearch = () => {
    if (!formData.name && !formData.url) {
      toast({
        title: 'Dados Incompletos',
        description: 'Preencha o nome ou URL da fonte para iniciar a busca.',
        variant: 'destructive',
      })
      return
    }

    if (!formData.category) {
      toast({
        title: 'Categoria Obrigatória',
        description: 'Selecione uma categoria antes de iniciar a busca.',
        variant: 'destructive',
      })
      return
    }

    startExtractionTask(
      formData.name || 'ofertas',
      formData.maxResults || 200,
      formData.url || 'all',
      {
        country: formData.country,
        state: formData.state,
        city: formData.city,
        category: formData.category,
      },
    )

    toast({
      title: 'Busca Iniciada',
      description: `Iniciando rastreamento para ${formData.name || formData.url}`,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full relative">
      <div className="space-y-4 overflow-y-auto p-1 pr-4 max-h-[65vh]">
        <div className="space-y-2">
          <Label>Nome do Site</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Ex: Ofertas Locais"
          />
        </div>
        <div className="space-y-2">
          <Label>
            URL / Link da Fonte (Deixe em branco para busca Multi-fontes)
          </Label>
          <Input
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="Ex: https://site.com ou deixe vazio"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tipo de Fonte</Label>
            <Select
              value={formData.type}
              onValueChange={(v) => setFormData({ ...formData, type: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="web">Website Scraper</SelectItem>
                <SelectItem value="api">JSON API</SelectItem>
                <SelectItem value="app">Mobile App Link</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Região Alvo</Label>
            <Select
              disabled={isFranchisee}
              value={formData.region}
              onValueChange={(v) => setFormData({ ...formData, region: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                {REGIONS.map((r) => (
                  <SelectItem key={r.code} value={r.code}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>País</Label>
            <Input
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
              placeholder="Ex: Brasil"
            />
          </div>
          <div className="space-y-2">
            <Label>Estado</Label>
            <Input
              value={formData.state}
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
              placeholder="Ex: SP"
            />
          </div>
          <div className="space-y-2">
            <Label>Cidade</Label>
            <Input
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              placeholder="Ex: São Paulo"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={formData.category}
              onValueChange={(v) => setFormData({ ...formData, category: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[100] max-h-60">
                {categoriesList.length > 0 ? (
                  categoriesList.map((c: any) => (
                    <SelectItem
                      key={c.id || c.value || c.label}
                      value={c.label || c.name || c.id}
                    >
                      {c.label || c.name || c.id}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="Geral" disabled>
                    Nenhuma categoria disponível
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Raio de Busca (km)</Label>
            <Input
              type="number"
              value={formData.scanRadius}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  scanRadius: Number(e.target.value),
                })
              }
              min={1}
            />
          </div>
          <div className="space-y-2">
            <Label>Limite de Resultados</Label>
            <Input
              type="number"
              value={formData.maxResults}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxResults: Number(e.target.value),
                })
              }
              min={10}
              max={2000}
            />
          </div>
        </div>
        <div className="space-y-2 border-t border-slate-100 pt-4 mt-4">
          <Label className="text-base font-semibold text-blue-700">
            Mapeamento de Dados (De/Para)
          </Label>
          <p className="text-xs text-slate-500 mb-3">
            O Crawler fará a extração dos 10 parâmetros de campanha configurados
            abaixo:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/80 p-3 rounded-md border border-slate-200 shadow-inner">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-600">
                1. Parceiro
              </Label>
              <Input
                value={formData.name || 'Nome do Parceiro'}
                disabled
                className="h-7 text-xs bg-slate-100 text-slate-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-600">
                2. Nome da Campanha
              </Label>
              <Input
                value={`busca organica- site ${formData.url ? formData.url.replace('https://', '').replace('www.', '').split('/')[0] : 'multi-fontes'}`}
                disabled
                className="h-7 text-xs bg-slate-100 text-slate-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-600">
                3. Descrição
              </Label>
              <Input
                value="Extração automática do texto de chamada"
                disabled
                className="h-7 text-xs bg-slate-100 text-slate-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-600">
                4. Categoria (IA)
              </Label>
              <Input
                value="Classificação baseada no produto"
                disabled
                className="h-7 text-xs bg-slate-100 text-slate-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-600">
                5. Regras de Campanha
              </Label>
              <Input
                value="Conforme combinado previamente"
                disabled
                className="h-7 text-xs bg-slate-100 text-slate-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-600">
                6. URL
              </Label>
              <Input
                value="Link exato do produto (Auto)"
                disabled
                className="h-7 text-xs bg-slate-100 text-slate-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-600">
                7. Imagem
              </Label>
              <Input
                value="Primeira imagem da tela do produto"
                disabled
                className="h-7 text-xs bg-slate-100 text-slate-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-600">
                8. Abrangência
              </Label>
              <Input
                value="toda a rede"
                disabled
                className="h-7 text-xs bg-slate-100 text-slate-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-600">
                9. Regras de Desconto
              </Label>
              <Input
                value="percentual"
                disabled
                className="h-7 text-xs bg-slate-100 text-slate-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-slate-600">
                10. Desconto
              </Label>
              <Input
                value="Cálculo Automático (Atual / Anterior)"
                disabled
                className="h-7 text-xs bg-slate-100 text-slate-500"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="pt-4 pb-2 bg-background border-t mt-4 z-10 shrink-0">
        <DialogFooter className="flex flex-col sm:flex-row justify-between w-full sm:justify-between gap-3">
          <Button
            type="button"
            onClick={handleStartSearch}
            className="bg-green-600 hover:bg-green-700 text-white shadow-md transition-all w-full sm:w-auto order-last sm:order-first"
          >
            <Play className="w-4 h-4 mr-2" fill="currentColor" />
            Iniciar Busca
          </Button>
          <Button type="submit" className="w-full sm:w-auto">
            Salvar Configuração
          </Button>
        </DialogFooter>
      </div>
    </form>
  )
}
