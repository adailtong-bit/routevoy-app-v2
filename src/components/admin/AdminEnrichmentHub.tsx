import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/stores/LanguageContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Layers, Plus, Search, Trash2, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { useCouponStore } from '@/stores/CouponContext'

export function AdminEnrichmentHub() {
  const { t } = useLanguage()
  const { categories } = useCouponStore()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTitle, setSearchTitle] = useState('')
  const [searchLocation, setSearchLocation] = useState('')
  const [demoOnly, setDemoOnly] = useState(true)

  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const [genStore, setGenStore] = useState('')
  const [genCategory, setGenCategory] = useState('')
  const [genQty, setGenQty] = useState('5')
  const [genRegion, setGenRegion] = useState('')

  const fetchData = async () => {
    setLoading(true)
    let query = supabase
      .from('coupons')
      .select('id, title, store_name, status, is_demo, created_at, city, state')

    if (demoOnly) {
      query = query.eq('is_demo', true)
    }

    if (searchTitle) {
      query = query.ilike('title', `%${searchTitle}%`)
    }

    if (searchLocation) {
      query = query.or(
        `city.ilike.%${searchLocation}%,state.ilike.%${searchLocation}%`,
      )
    }

    query = query.order('created_at', { ascending: false }).limit(100)

    const res = await query
    if (res.data) setData(res.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [demoOnly])

  const handleGenerate = async () => {
    if (!genStore || !genCategory || !genQty) {
      toast.error(t('common.error', 'Fill required fields'))
      return
    }

    setIsGenerating(true)

    const qty = parseInt(genQty)
    const newCoupons = []

    for (let i = 0; i < qty; i++) {
      newCoupons.push({
        title: `${t('admin.generator.demo_label', 'Exemplo')} - Oferta Especial ${i + 1}`,
        store_name: genStore,
        category: genCategory,
        description:
          'Esta é uma oferta fictícia gerada para enriquecimento visual do sistema.',
        discount: '50% OFF',
        price: 9.99,
        original_price: 19.99,
        image_url: `https://img.usecurling.com/p/400/300?q=${encodeURIComponent(genCategory)}`,
        status: 'expired',
        is_demo: true,
        environment: 'production',
        city: genRegion,
        state: genRegion,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() - 86400000).toISOString(),
        code: `DEMO${Math.floor(Math.random() * 10000)}`,
      })
    }

    const { error } = await supabase.from('coupons').insert(newCoupons)

    setIsGenerating(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success(
        t('admin.generator.success', 'Anúncios gerados com sucesso!'),
      )
      setIsGeneratorOpen(false)
      fetchData()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirm_delete', 'Tem certeza?'))) return
    const { error } = await supabase.from('coupons').delete().eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success(t('common.success', 'Excluído com sucesso'))
      fetchData()
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up h-full pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" />
            {t('admin.enrichment_hub.title', 'Hub de Enriquecimento')}
          </h2>
          <p className="text-slate-500 text-sm">
            {t(
              'admin.enrichment_hub.desc',
              'Gerencie campanhas de demonstração e enriqueça o sistema.',
            )}
          </p>
        </div>
        <Button
          onClick={() => setIsGeneratorOpen(true)}
          className="gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          {t('admin.generator.generate_button', 'Gerar Anúncios')}
        </Button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <Input
              placeholder={t('common.search', 'Buscar')}
              className="pl-9"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchData()}
            />
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <Input
              placeholder="Localização..."
              className="pl-9"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchData()}
            />
          </div>
          <div className="flex items-center gap-2 px-2">
            <input
              type="checkbox"
              id="demoOnly"
              className="w-4 h-4 rounded border-slate-300"
              checked={demoOnly}
              onChange={(e) => setDemoOnly(e.target.checked)}
            />
            <label
              htmlFor="demoOnly"
              className="text-sm font-medium cursor-pointer"
            >
              {t('admin.enrichment_hub.demo_only', 'Apenas Demonstração')}
            </label>
          </div>
          <div className="flex justify-end">
            <Button variant="secondary" onClick={fetchData} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto border rounded-md">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Loja</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium text-slate-900">
                      {item.title}
                    </div>
                    {item.is_demo && (
                      <Badge
                        variant="outline"
                        className="text-[10px] mt-1 bg-slate-100 text-slate-500"
                      >
                        {t('admin.generator.demo_label', 'Exemplo')}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{item.store_name}</TableCell>
                  <TableCell>{item.city || item.state || '-'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.status === 'active' && !item.is_demo
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {item.is_demo
                        ? t(
                            'admin.public.card.demo_example_status',
                            'Demonstração',
                          )
                        : item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                      disabled={!item.is_demo}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-slate-500"
                  >
                    {t('common.none', 'Nenhum item encontrado')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isGeneratorOpen} onOpenChange={setIsGeneratorOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t('admin.generator.title', 'Gerador em Massa')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-500 mb-4">
              {t(
                'admin.generator.desc',
                'Crie múltiplos anúncios fictícios de uma vez.',
              )}
            </p>
            <div className="space-y-2">
              <Label>{t('admin.generator.store_name', 'Nome da Loja')}</Label>
              <Input
                value={genStore}
                onChange={(e) => setGenStore(e.target.value)}
                placeholder="Ex: Burguer King"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.generator.category', 'Categoria')}</Label>
              <Select value={genCategory} onValueChange={setGenCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.label}
                    </SelectItem>
                  ))}
                  {!categories?.length && (
                    <SelectItem value="Geral">Geral</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('admin.generator.region', 'Região / Público')}</Label>
              <Input
                value={genRegion}
                onChange={(e) => setGenRegion(e.target.value)}
                placeholder="Ex: São Paulo"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.generator.quantity', 'Quantidade')}</Label>
              <Input
                type="number"
                value={genQty}
                onChange={(e) => setGenQty(e.target.value)}
                min="1"
                max="50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGeneratorOpen(false)}>
              {t('common.cancel', 'Cancelar')}
            </Button>
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {t('admin.generator.generate_button', 'Gerar Anúncios')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
