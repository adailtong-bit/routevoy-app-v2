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
import {
  Layers,
  Plus,
  Search,
  Trash2,
  Loader2,
  CalendarIcon,
  Edit,
  CheckCircle,
  X,
} from 'lucide-react'
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
import { HierarchicalLocationSelector } from '@/components/HierarchicalLocationSelector'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export function AdminEnrichmentHub() {
  const { t } = useLanguage()
  const [dbCategories, setDbCategories] = useState<any[]>([])
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Filters
  const [searchTitle, setSearchTitle] = useState('')
  const [searchCategory, setSearchCategory] = useState('all')
  const [demoOnly, setDemoOnly] = useState(true)
  const [searchDate, setSearchDate] = useState<Date | undefined>()

  // Bulk Actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [editStatus, setEditStatus] = useState<string>('')
  const [editCategory, setEditCategory] = useState<string>('')

  // Generator Modal
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [genStore, setGenStore] = useState('')
  const [genCategory, setGenCategory] = useState('')
  const [genQty, setGenQty] = useState('5')
  const [genCountry, setGenCountry] = useState('')
  const [genState, setGenState] = useState('')
  const [genCity, setGenCity] = useState('')
  const [genDate, setGenDate] = useState<Date>(new Date())

  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 'active')
      if (data) setDbCategories(data)
    }
    loadCategories()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    let query = supabase
      .from('discovered_promotions')
      .select(
        'id, title, store_name, status, is_demo, created_at, city, state, country, category',
      )

    if (demoOnly) {
      query = query.eq('is_demo', true)
    }

    if (searchTitle) {
      query = query.ilike('title', `%${searchTitle}%`)
    }

    if (searchCategory && searchCategory !== 'all') {
      query = query.eq('category', searchCategory)
    }

    if (searchDate) {
      const start = new Date(searchDate)
      start.setHours(0, 0, 0, 0)
      const end = new Date(searchDate)
      end.setHours(23, 59, 59, 999)
      query = query
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
    }

    query = query.order('created_at', { ascending: false }).limit(100)

    const res = await query
    if (res.data) setData(res.data)
    setSelectedIds(new Set())
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [demoOnly, searchCategory, searchDate])

  const handleGenerate = async () => {
    if (!genCategory || !genQty) {
      toast.error(t('common.error', 'Preencha os campos obrigatórios'))
      return
    }

    setIsGenerating(true)

    const qty = parseInt(genQty)
    const newCoupons = []

    const prefixes: Record<string, string[]> = {
      food: [
        'Restaurante',
        'Bistrô',
        'Pizzaria',
        'Café',
        'Lanchonete',
        'Churrascaria',
      ],
      fashion: [
        'Boutique',
        'Loja de Roupas',
        'Vestuário',
        'Moda',
        'Estilo',
        'Closet',
      ],
      electronics: [
        'Tech',
        'Eletro',
        'Eletrônicos',
        'Gadgets',
        'Informatica',
        'Smart',
      ],
      beauty: ['Salão', 'Beleza', 'Estética', 'Cosméticos', 'Spa', 'Barbearia'],
      services: ['Serviços', 'Oficina', 'Consertos', 'Assistência', 'Express'],
      market: ['Mercado', 'Supermercado', 'Mercearia', 'Empório', 'Hortifruti'],
      leisure: ['Diversão', 'Lazer', 'Entretenimento', 'Aventura', 'Clube'],
      General: [
        'Loja',
        'Comércio',
        'Store',
        'Empresa',
        'Negócio',
        'Center',
        'Shopping',
      ],
    }

    for (let i = 0; i < qty; i++) {
      let finalStore = genStore
      if (!finalStore) {
        const catPrefixes = prefixes[genCategory] ||
          prefixes.General || ['Demo']
        const prefix =
          catPrefixes[Math.floor(Math.random() * catPrefixes.length)]
        finalStore = `${prefix} ${Math.floor(Math.random() * 1000)}`
      }

      newCoupons.push({
        title: `${t('admin.generator.demo_label', 'Demonstração')} - Oferta Especial ${i + 1}`,
        store_name: finalStore,
        category: genCategory,
        description: 'Oferta fictícia gerada automaticamente.',
        discount: '50% OFF',
        price: 9.99,
        original_price: 19.99,
        image_url: `https://img.usecurling.com/p/400/300?q=${encodeURIComponent(
          genCategory,
        )}`,
        status: 'Encerrada',
        is_demo: true,
        environment: 'production',
        country: genCountry,
        state: genState,
        city: genCity,
        created_at: genDate.toISOString(),
        start_date: new Date(genDate.getTime() - 86400000 * 5).toISOString(),
        end_date: new Date(genDate.getTime() - 86400000).toISOString(),
        code: `DEMO${Math.floor(Math.random() * 10000)}`,
        unique_hash: `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${i}`,
      })
    }

    const { error } = await supabase
      .from('discovered_promotions')
      .insert(newCoupons)

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

  const toggleSelectAll = () => {
    if (selectedIds.size === data.length && data.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(data.map((d) => d.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const handleBulkDelete = async () => {
    if (!confirm(t('common.confirm_delete', 'Tem certeza?'))) return
    const { error } = await supabase
      .from('discovered_promotions')
      .delete()
      .in('id', Array.from(selectedIds))
    if (error) toast.error(error.message)
    else {
      toast.success(t('common.success', 'Excluído com sucesso'))
      fetchData()
    }
  }

  const handleBulkPublish = async () => {
    if (
      !confirm(
        t(
          'common.confirm_publish_bulk',
          'Tem certeza que deseja publicar os itens selecionados?',
        ),
      )
    )
      return
    const { error } = await supabase
      .from('discovered_promotions')
      .update({ status: 'Ativa' })
      .in('id', Array.from(selectedIds))
    if (error) toast.error(error.message)
    else {
      toast.success('Publicado com sucesso')
      fetchData()
    }
  }

  const handleSingleAction = async (
    id: string,
    action: 'publish' | 'delete' | 'edit',
  ) => {
    if (action === 'delete') {
      if (!confirm(t('common.confirm_delete', 'Tem certeza?'))) return
      const { error } = await supabase
        .from('discovered_promotions')
        .delete()
        .eq('id', id)
      if (error) toast.error(error.message)
      else {
        toast.success(t('common.success', 'Excluído com sucesso'))
        fetchData()
      }
    } else if (action === 'publish') {
      if (
        !confirm(
          t(
            'common.confirm_publish',
            'Tem certeza que deseja publicar este item?',
          ),
        )
      )
        return
      const { error } = await supabase
        .from('discovered_promotions')
        .update({ status: 'Ativa' })
        .eq('id', id)
      if (error) toast.error(error.message)
      else {
        toast.success('Publicado com sucesso')
        fetchData()
      }
    } else if (action === 'edit') {
      const item = data.find((d) => d.id === id)
      setEditingItem(item)
      setEditStatus(item.status)
      setEditCategory(item.category || '')
      setIsEditModalOpen(true)
    }
  }

  const getCategoryLabel = (catName: string) => {
    if (!catName) return '-'
    if (catName === 'General') return 'Geral'
    const found = dbCategories?.find((c: any) => c.name === catName)
    return found ? found.label : catName
  }

  const handleBulkEdit = () => {
    setEditingItem(null)
    setEditStatus('')
    setEditCategory('')
    setIsEditModalOpen(true)
  }

  const saveEdit = async () => {
    const updates: any = {}
    if (editStatus) updates.status = editStatus
    if (editCategory) updates.category = editCategory

    if (Object.keys(updates).length === 0) {
      setIsEditModalOpen(false)
      return
    }

    const ids = editingItem ? [editingItem.id] : Array.from(selectedIds)
    const { error } = await supabase
      .from('discovered_promotions')
      .update(updates)
      .in('id', ids)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Atualizado com sucesso')
      setIsEditModalOpen(false)
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <Input
              placeholder={t('common.search', 'Buscar título...')}
              className="pl-9"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchData()}
            />
          </div>
          <div>
            <Select value={searchCategory} onValueChange={setSearchCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                {dbCategories?.map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal px-3',
                    !searchDate && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {searchDate
                    ? format(searchDate, 'dd/MM/yyyy')
                    : 'Data de Criação'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[100]">
                <Calendar
                  mode="single"
                  selected={searchDate}
                  onSelect={setSearchDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {searchDate && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-8 w-8 hover:bg-transparent"
                onClick={() => setSearchDate(undefined)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2 px-2">
            <Checkbox
              id="demoOnly"
              checked={demoOnly}
              onCheckedChange={(c) => setDemoOnly(!!c)}
            />
            <label
              htmlFor="demoOnly"
              className="text-sm font-medium cursor-pointer"
            >
              {t('admin.enrichment_hub.demo_only', 'Apenas Demonstração')}
            </label>
          </div>
          <div className="flex justify-end">
            <Button
              variant="secondary"
              onClick={fetchData}
              disabled={loading}
              className="w-full md:w-auto"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {selectedIds.size > 0 && (
          <div className="bg-primary/5 border border-primary/20 p-3 rounded-md flex items-center justify-between mb-4 animate-in fade-in slide-in-from-top-2">
            <span className="text-sm font-medium text-primary">
              {selectedIds.size} selecionados
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkEdit}
                className="h-8"
              >
                <Edit className="w-4 h-4 mr-2" /> Editar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkPublish}
                className="h-8 text-green-700 hover:text-green-800"
              >
                <CheckCircle className="w-4 h-4 mr-2" /> Publicar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkDelete}
                className="h-8"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Excluir
              </Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto border rounded-md">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedIds.size === data.length && data.length > 0
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Campanha</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(item.id)}
                      onCheckedChange={() => toggleSelect(item.id)}
                    />
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                    {format(new Date(item.created_at), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900">
                      {item.title}
                    </div>
                    <div className="text-xs text-slate-500">
                      {item.store_name} • {item.city || item.state || '-'}
                    </div>
                    {item.is_demo && (
                      <Badge
                        variant="outline"
                        className="text-[10px] mt-1 bg-slate-100 text-slate-500"
                      >
                        Demonstração
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{getCategoryLabel(item.category)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.status === 'Ativa' ? 'default' : 'secondary'
                      }
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSingleAction(item.id, 'edit')}
                        title="Editar"
                      >
                        <Edit className="w-4 h-4 text-slate-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSingleAction(item.id, 'publish')}
                        title="Publicar"
                      >
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSingleAction(item.id, 'delete')}
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
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

      {/* Generator Modal */}
      <Dialog open={isGeneratorOpen} onOpenChange={setIsGeneratorOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Gerador em Massa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-2">
            <p className="text-sm text-slate-500 mb-4">
              Crie múltiplos anúncios fictícios de uma vez. O status padrão será
              "Encerrada" por segurança e salvos como Descobertas.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Criação</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(genDate, 'dd/MM/yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[100]">
                    <Calendar
                      mode="single"
                      selected={genDate}
                      onSelect={(d) => d && setGenDate(d)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  value={genQty}
                  onChange={(e) => setGenQty(e.target.value)}
                  min="1"
                  max="100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={genCategory} onValueChange={setGenCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {dbCategories?.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.label}
                    </SelectItem>
                  ))}
                  {!dbCategories?.length && (
                    <SelectItem value="General">Geral</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nome da Loja (Opcional)</Label>
              <Input
                value={genStore}
                onChange={(e) => setGenStore(e.target.value)}
                placeholder="Deixe em branco para gerar automaticamente"
              />
            </div>

            <div className="space-y-2 pt-2">
              <Label>Localização Alvo</Label>
              <HierarchicalLocationSelector
                country={genCountry}
                state={genState}
                city={genCity}
                onChange={(c, s, ci) => {
                  setGenCountry(c)
                  setGenState(s)
                  setGenCity(ci)
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGeneratorOpen(false)}>
              Cancelar
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

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar Campanha' : 'Edição em Massa'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativa">Publicado (Ativa)</SelectItem>
                  <SelectItem value="Encerrada">
                    Encerrado (Encerrada)
                  </SelectItem>
                  <SelectItem value="Pausada">Pausado (Pausada)</SelectItem>
                  <SelectItem value="pending">Pendente (pending)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria..." />
                </SelectTrigger>
                <SelectContent>
                  {dbCategories?.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
