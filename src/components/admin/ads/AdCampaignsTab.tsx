import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Edit2, Plus, Trash2, Loader2 } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'

const PLACEMENT_OPTIONS = [
  { value: 'top_ranking', label: 'Top Ranking' },
  { value: 'lateral_highlight', label: 'Destaque Lateral' },
  { value: 'main_banner', label: 'Banner Principal' },
  { value: 'home_featured', label: 'Destaque Home' },
  { value: 'home_hero', label: 'Home Hero' },
  { value: 'global_search', label: 'Busca Global' },
  { value: 'offer_of_the_day', label: 'Oferta do Dia' },
  { value: 'sponsored_push', label: 'Push Notification' },
]

const BILLING_OPTIONS = [
  { value: 'internal_boost', label: 'Impulsionamento Interno (Cupom)' },
  { value: 'internal', label: 'Impulsionamento Interno (Legado)' },
  { value: 'cpc', label: 'CPC (Custo por Clique)' },
  { value: 'cpm', label: 'CPM (Custo por Mil)' },
  { value: 'external', label: 'Publicidade Externa' },
  { value: 'fixed', label: 'Fixo (Período)' },
]

export function AdCampaignsTab({
  environment = 'production',
  companyId,
}: {
  environment?: string
  companyId?: string
}) {
  const { t } = useLanguage()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [advertisers, setAdvertisers] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const defaultForm = {
    title: '',
    advertiser_id: 'none',
    category: '',
    description: '',
    image: '',
    link: '',
    price: '',
    placement: 'home_hero',
    billing_type: 'fixed',
    start_date: '',
    end_date: '',
    priority_score: '0',
    status: 'active',
  }

  const [formData, setFormData] = useState(defaultForm)

  useEffect(() => {
    fetchCampaigns()
    fetchAdvertisers()
  }, [environment, companyId])

  const fetchCampaigns = async () => {
    let query = supabase
      .from('ad_campaigns')
      .select('*, ad_advertisers(company_name)')
      .eq('environment', environment)
      .order('created_at', { ascending: false })

    if (companyId) {
      query = query.eq('company_id', companyId)
    }

    const { data } = await query
    if (data) setCampaigns(data)
  }

  const fetchAdvertisers = async () => {
    const { data } = await supabase
      .from('ad_advertisers')
      .select('id, company_name')
      .eq('environment', environment)
      .order('company_name', { ascending: true })
    if (data) setAdvertisers(data)
  }

  const handleEdit = (camp: any) => {
    setEditingId(camp.id)
    setFormData({
      title: camp.title || '',
      advertiser_id: camp.advertiser_id || 'none',
      category: camp.category || '',
      description: camp.description || '',
      image: camp.image || '',
      link: camp.link || '',
      price: camp.price?.toString() || '',
      placement: camp.placement || 'home_hero',
      billing_type: camp.billing_type || 'fixed',
      start_date: camp.start_date ? camp.start_date.split('T')[0] : '',
      end_date: camp.end_date ? camp.end_date.split('T')[0] : '',
      priority_score: camp.priority_score?.toString() || '0',
      status: camp.status || 'active',
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirm_delete', 'Tem certeza que deseja excluir?')))
      return
    const { error } = await supabase.from('ad_campaigns').delete().eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success(t('common.success', 'Excluído com sucesso'))
      fetchCampaigns()
    }
  }

  const handleSave = async () => {
    if (!formData.title) {
      toast.error(t('common.error', 'O título é obrigatório'))
      return
    }

    setIsLoading(true)
    const payload = {
      title: formData.title,
      advertiser_id:
        formData.advertiser_id === 'none' ? null : formData.advertiser_id,
      category: formData.category,
      description: formData.description,
      image: formData.image,
      link: formData.link,
      price: formData.price ? parseFloat(formData.price) : null,
      placement: formData.placement,
      billing_type: formData.billing_type,
      start_date: formData.start_date
        ? new Date(formData.start_date).toISOString()
        : null,
      end_date: formData.end_date
        ? new Date(formData.end_date).toISOString()
        : null,
      priority_score: parseInt(formData.priority_score) || 0,
      status: formData.status,
      environment,
      company_id: companyId || null,
    }

    let error
    if (editingId) {
      const res = await supabase
        .from('ad_campaigns')
        .update(payload)
        .eq('id', editingId)
      error = res.error
    } else {
      const res = await supabase.from('ad_campaigns').insert(payload)
      error = res.error
    }

    setIsLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success(t('common.success', 'Salvo com sucesso'))
      setIsDialogOpen(false)
      fetchCampaigns()
    }
  }

  return (
    <div className="space-y-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in-up">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-800">
          {t('admin.ad_manager.campaigns', 'Campanhas')}
        </h3>
        <Button
          onClick={() => {
            setEditingId(null)
            setFormData(defaultForm)
            setIsDialogOpen(true)
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />{' '}
          {t('ads.create_campaign', 'Criar Campanha')}
        </Button>
      </div>

      <div className="overflow-x-auto border rounded-md">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>{t('admin.ads.title', 'Título')}</TableHead>
              <TableHead>{t('ads.advertiser', 'Anunciante')}</TableHead>
              <TableHead>{t('admin.ads.placement', 'Placement')}</TableHead>
              <TableHead>{t('admin.ads.status', 'Status')}</TableHead>
              <TableHead className="text-right">
                {t('common.actions', 'Ações')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((ad) => (
              <TableRow key={ad.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {ad.image && (
                      <img
                        src={ad.image}
                        alt=""
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">
                        {ad.title}
                      </span>
                      <span className="text-xs text-slate-500">
                        {BILLING_OPTIONS.find(
                          (o) => o.value === ad.billing_type,
                        )?.label || ad.billing_type}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{ad.ad_advertisers?.company_name || '-'}</TableCell>
                <TableCell>
                  {PLACEMENT_OPTIONS.find((o) => o.value === ad.placement)
                    ?.label || ad.placement}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={ad.status === 'active' ? 'default' : 'secondary'}
                  >
                    {ad.status === 'active'
                      ? t('admin.active', 'Ativo')
                      : ad.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(ad)}
                  >
                    <Edit2 className="w-4 h-4 text-slate-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(ad.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {campaigns.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-6 text-slate-500"
                >
                  {t('common.none', 'Nenhum dado encontrado')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>
              {editingId
                ? t('common.edit', 'Editar Campanha')
                : t('ads.create_campaign', 'Criar Campanha')}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6 pb-6">
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    {t('admin.ads.form_title', 'Título do Anúncio')} *
                  </Label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Ex: Super Promoção"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('ads.advertiser', 'Anunciante vinculado')}</Label>
                  <Select
                    value={formData.advertiser_id}
                    onValueChange={(v) =>
                      setFormData({ ...formData, advertiser_id: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum / Uso Interno</SelectItem>
                      {advertisers.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>
                    {t('admin.ads.placement', 'Posicionamento (Placement)')}
                  </Label>
                  <Select
                    value={formData.placement}
                    onValueChange={(v) =>
                      setFormData({ ...formData, placement: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLACEMENT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>
                    {t('admin.ads.billing_type', 'Tipo de Cobrança')}
                  </Label>
                  <Select
                    value={formData.billing_type}
                    onValueChange={(v) =>
                      setFormData({ ...formData, billing_type: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BILLING_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('admin.ads.price', 'Preço / Orçamento')}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('common.category', 'Categoria')}</Label>
                  <Input
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="Ex: Moda, Alimentação"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('admin.startDate', 'Data Início')}</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('admin.endDate', 'Data Fim')}</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    {t(
                      'admin.ads.priority_score',
                      'Priority Score (Relevância)',
                    )}
                  </Label>
                  <Input
                    type="number"
                    value={formData.priority_score}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority_score: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('admin.status', 'Status')}</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) =>
                      setFormData({ ...formData, status: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        {t('admin.active', 'Ativo')}
                      </SelectItem>
                      <SelectItem value="paused">
                        {t('admin.paused', 'Pausado')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('admin.ads.form_link', 'Link de Destino')}</Label>
                <Input
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label>{t('admin.ads.form_image', 'URL da Imagem')}</Label>
                <Input
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  placeholder="https://..."
                />
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="mt-2 h-32 w-full object-cover rounded-md border"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>{t('common.description', 'Descrição')}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </ScrollArea>

          <div className="p-6 pt-4 border-t flex justify-end gap-3 bg-slate-50/50 rounded-b-lg">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('common.cancel', 'Cancelar')}
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t('common.save', 'Salvar')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
