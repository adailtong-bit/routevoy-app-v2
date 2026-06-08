import { useState } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Edit2, Plus, Trash2, ArrowUpCircle } from 'lucide-react'
import { Advertisement } from '@/lib/types'
import { HierarchicalLocationSelector } from '@/components/HierarchicalLocationSelector'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'

export function AdCampaignsTab() {
  const { ads, updateAd, deleteAd, addAd, user } = useCouponStore()
  const { t } = useLanguage()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null)
  const { formatCurrency } = useRegionFormatting(user?.region, user?.country)

  const [formData, setFormData] = useState<Partial<Advertisement>>({
    title: '',
    description: '',
    image: '',
    link: '',
    price: 0,
    status: 'active',
    country: '',
    state: '',
    city: '',
    priorityScore: 0,
    billingType: 'fixed',
    placement: 'home_hero',
    category: 'Geral',
  })

  const handleOpenNew = () => {
    setEditingAd(null)
    setFormData({
      title: '',
      description: '',
      image: '',
      link: '',
      price: 0,
      status: 'active',
      country: '',
      state: '',
      city: '',
      priorityScore: 0,
      billingType: 'fixed',
      placement: 'home_hero',
      category: 'Geral',
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad)
    setFormData({ ...ad })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (editingAd) {
      updateAd(editingAd.id, formData)
    } else {
      const newAd: Advertisement = {
        ...formData,
        id: crypto.randomUUID(),
        views: 0,
        clicks: 0,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      } as Advertisement
      addAd(newAd)
    }
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {t('admin.ads.campaigns', 'Campaigns')}
        </h3>
        <Button onClick={handleOpenNew} className="gap-2">
          <Plus className="w-4 h-4" />
          {t('admin.ads.new_campaign', 'Nova Campanha')}
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.ads.title', 'Título')}</TableHead>
              <TableHead>{t('admin.ads.location', 'Localização')}</TableHead>
              <TableHead>{t('admin.ads.priority', 'Prioridade')}</TableHead>
              <TableHead>{t('admin.ads.status', 'Status')}</TableHead>
              <TableHead className="text-right">
                {t('common.actions', 'Ações')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ads.map((ad) => (
              <TableRow key={ad.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {ad.image && (
                      <img
                        src={ad.image}
                        alt={ad.title}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <span className="font-medium">{ad.title}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {ad.city
                    ? `${ad.city}, ${ad.state}`
                    : ad.country || t('common.global', 'Global')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <ArrowUpCircle className="w-4 h-4 text-orange-500" />
                    {ad.priorityScore || 0}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={ad.status === 'active' ? 'default' : 'secondary'}
                  >
                    {t(`admin.${ad.status}`, ad.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
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
                    onClick={() => deleteAd(ad.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {ads.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-6 text-slate-500"
                >
                  {t('common.no_data', 'Nenhum dado encontrado.')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingAd
                ? t('admin.ads.edit', 'Editar Campanha')
                : t('admin.ads.new', 'Nova Campanha')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
            <div className="space-y-2">
              <Label>{t('admin.ads.form_title', 'Título do Anúncio')}</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Ex: Oferta Especial"
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t('admin.ads.location_targeting', 'Segmentação Geográfica')}
              </Label>
              <HierarchicalLocationSelector
                country={formData.country || ''}
                state={formData.state || ''}
                city={formData.city || ''}
                onChange={(c, s, ci) =>
                  setFormData({ ...formData, country: c, state: s, city: ci })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  {t(
                    'admin.ads.priority_score',
                    'Priority Score (Impulsionar)',
                  )}
                </Label>
                <Input
                  type="number"
                  value={formData.priorityScore || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priorityScore: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.ads.billing_type', 'Tipo de Cobrança')}</Label>
                <Select
                  value={formData.billingType}
                  onValueChange={(v: any) =>
                    setFormData({ ...formData, billingType: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpc">CPC</SelectItem>
                    <SelectItem value="cpa">CPA</SelectItem>
                    <SelectItem value="fixed">Fixo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('admin.ads.form_image', 'URL da Imagem')}</Label>
                <Input
                  value={formData.image || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.ads.form_link', 'Link de Destino')}</Label>
                <Input
                  value={formData.link || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  {t('admin.ads.form_revenue', 'Valor / Orçamento')}
                </Label>
                <Input
                  type="number"
                  value={formData.price || formData.budget || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: Number(e.target.value),
                      budget: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.status', 'Status')}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v: any) =>
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
                    <SelectItem value="pending">
                      {t('admin.pending', 'Pendente')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('common.cancel', 'Cancelar')}
            </Button>
            <Button onClick={handleSave}>{t('common.save', 'Salvar')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
