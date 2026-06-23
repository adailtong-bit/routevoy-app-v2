import { useState, useMemo } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import { DollarSign, Edit2, Trash2, Plus } from 'lucide-react'
import { Advertisement } from '@/lib/types'
import { HierarchicalLocationSelector } from '@/components/HierarchicalLocationSelector'

export function AdminNetworkAdsTab() {
  const { ads, updateAd, deleteAd, createAd, user } = useCouponStore()
  const { t } = useLanguage()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null)

  const [adFormData, setAdFormData] = useState<Partial<Advertisement>>({
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
  })

  const { formatCurrency } = useRegionFormatting(user?.region, user?.country)

  const globalAds = useMemo(() => {
    return ads.filter(
      (a) =>
        !a.franchiseId ||
        a.franchiseId === 'global' ||
        a.franchiseId === 'admin',
    )
  }, [ads])

  const totalRevenue = globalAds.reduce(
    (sum, ad) => sum + (ad.price || ad.budget || 0),
    0,
  )

  const handleOpenDialog = (ad?: Advertisement) => {
    if (ad) {
      setEditingAd(ad)
      setAdFormData({
        title: ad.title,
        description: ad.description || '',
        image: ad.image,
        link: ad.link,
        price: ad.price || ad.budget || 0,
        status: ad.status,
        country: ad.country || '',
        state: ad.state || '',
        city: ad.city || '',
        priorityScore: ad.priorityScore || 0,
        billingType: ad.billingType || 'fixed',
      })
    } else {
      setEditingAd(null)
      setAdFormData({
        title: '',
        description: '',
        image: 'https://img.usecurling.com/p/800/400?q=ad',
        link: '',
        price: 0,
        status: 'active',
        country: '',
        state: '',
        city: '',
        priorityScore: 0,
        billingType: 'fixed',
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (editingAd) {
      updateAd(editingAd.id, adFormData)
    } else {
      createAd({
        id: Math.random().toString(),
        title: adFormData.title || 'Global Ad',
        description: adFormData.description,
        image: adFormData.image || '',
        link: adFormData.link || '',
        price: adFormData.price,
        franchiseId: 'global',
        companyId: 'admin_created',
        region: 'Global',
        country: adFormData.country,
        state: adFormData.state,
        city: adFormData.city,
        category: 'Others',
        billingType: (adFormData.billingType as any) || 'fixed',
        placement: 'home_hero',
        status: (adFormData.status as any) || 'pending',
        views: 0,
        clicks: 0,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        priorityScore: adFormData.priorityScore || 0,
      })
    }
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {t(
                'admin.network_ads.revenue',
                'Receita Total de Anúncios Globais',
              )}
            </p>
            <h3 className="text-2xl font-bold">
              {formatCurrency(totalRevenue)}
            </h3>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>
              {t('admin.network_ads', 'Publicidade de Rede')}
            </CardTitle>
            <CardDescription>
              {t(
                'admin.network_ads_desc',
                'Gerencie campanhas globais que são distribuídas para todas as franquias da rede.',
              )}
            </CardDescription>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="shrink-0 w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />{' '}
            {t('admin.network_ads.create', 'Criar Campanha Global')}
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('franchisee.ads.ad', 'Anúncio')}</TableHead>
                <TableHead>{t('admin.ads.scope', 'Escopo')}</TableHead>
                <TableHead>{t('franchisee.ads.status', 'Status')}</TableHead>
                <TableHead>
                  {t('franchisee.ads.revenue_col', 'Receita')}
                </TableHead>
                <TableHead className="text-right">
                  {t('franchisee.ads.actions', 'Ações')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {globalAds.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={ad.image}
                        alt={ad.title}
                        className="w-12 h-8 rounded object-cover"
                      />
                      <span className="font-medium block">{ad.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <Badge variant="outline">Global</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={ad.status === 'active' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {t(`admin.${ad.status}`, ad.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(ad.price || ad.budget || 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(ad)}
                    >
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteAd(ad.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {globalAds.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {t(
                      'admin.network_ads.no_ads',
                      'Nenhuma campanha global encontrada.',
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAd
                ? t('admin.network_ads.edit', 'Editar Campanha Global')
                : t('admin.network_ads.create_title', 'Criar Campanha Global')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
            <div className="space-y-2">
              <Label>
                {t('franchisee.ads.form_title', 'Título do Anúncio')}
              </Label>
              <Input
                value={adFormData.title}
                onChange={(e) =>
                  setAdFormData({ ...adFormData, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t(
                  'admin.ads.location_targeting',
                  'Segmentação Geográfica (Opcional)',
                )}
              </Label>
              <HierarchicalLocationSelector
                country={adFormData.country || ''}
                state={adFormData.state || ''}
                city={adFormData.city || ''}
                onChange={(c: string, s: string, ci: string) =>
                  setAdFormData({
                    ...adFormData,
                    country: c,
                    state: s,
                    city: ci,
                  })
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
                  value={adFormData.priorityScore || 0}
                  onChange={(e) =>
                    setAdFormData({
                      ...adFormData,
                      priorityScore: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.ads.billing_type', 'Tipo de Cobrança')}</Label>
                <Select
                  value={adFormData.billingType}
                  onValueChange={(v: any) =>
                    setAdFormData({ ...adFormData, billingType: v })
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

            <div className="space-y-2">
              <Label>{t('franchisee.ads.form_desc', 'Descrição')}</Label>
              <Textarea
                value={adFormData.description}
                onChange={(e) =>
                  setAdFormData({ ...adFormData, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('franchisee.ads.form_image', 'URL da Imagem')}</Label>
              <Input
                value={adFormData.image}
                onChange={(e) =>
                  setAdFormData({ ...adFormData, image: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>
                {t('franchisee.ads.form_link', 'URL de Destino (Link)')}
              </Label>
              <Input
                value={adFormData.link}
                onChange={(e) =>
                  setAdFormData({ ...adFormData, link: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('franchisee.ads.form_revenue', 'Receita')}</Label>
                <Input
                  type="number"
                  value={adFormData.price}
                  onChange={(e) =>
                    setAdFormData({
                      ...adFormData,
                      price: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.status', 'Status')}</Label>
                <Select
                  value={adFormData.status}
                  onValueChange={(v: any) =>
                    setAdFormData({ ...adFormData, status: v })
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
