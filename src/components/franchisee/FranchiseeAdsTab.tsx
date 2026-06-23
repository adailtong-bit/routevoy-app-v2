import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DollarSign, Plus, Edit2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCouponStore } from '@/stores/CouponContext'

export function FranchiseeAdsTab({
  franchiseId,
  isNetwork = false,
}: {
  franchiseId: string
  isNetwork?: boolean
}) {
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAd, setEditingAd] = useState<any | null>(null)

  const [searchParams] = useSearchParams()
  const searchQuery = (searchParams.get('q') || '').toLowerCase()

  const { platformSettings } = useCouponStore()
  const royaltyRate = platformSettings?.franchiseRoyaltyRate || 15

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    link: '',
    price: 0,
  })

  const fetchAds = async () => {
    setLoading(true)
    let query = supabase.from('advertisements').select('*')

    if (isNetwork) {
      query = query.is('franchise_id', null)
    } else {
      query = query.eq('franchise_id', franchiseId)
    }

    const { data, error } = await query

    if (error) {
      toast.error('Erro ao carregar anúncios: ' + error.message)
    } else {
      setAds(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAds()
  }, [franchiseId, isNetwork])

  const filteredAds = ads.filter((a) => {
    if (!searchQuery) return true
    return (
      a.title?.toLowerCase().includes(searchQuery) ||
      a.description?.toLowerCase().includes(searchQuery)
    )
  })

  const totalRevenue = filteredAds.reduce(
    (sum, ad) => sum + (ad.price || ad.budget || 0),
    0,
  )
  const totalRoyalties = totalRevenue * (royaltyRate / 100)

  const handleOpenDialog = (ad?: any) => {
    if (ad) {
      setEditingAd(ad)
      setFormData({
        title: ad.title || '',
        description: ad.description || '',
        image: ad.image || ad.image_url || '',
        link: ad.link || '',
        price: ad.price || ad.budget || 0,
      })
    } else {
      setEditingAd(null)
      setFormData({
        title: '',
        description: '',
        image: 'https://img.usecurling.com/p/800/400?q=ad',
        link: '',
        price: 0,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        image_url: formData.image,
        link: formData.link,
        price: formData.price,
        franchise_id: franchiseId,
        status: 'active',
      }

      if (editingAd) {
        const { error } = await supabase
          .from('advertisements')
          .update(payload)
          .eq('id', editingAd.id)
        if (error) throw error
        toast.success('Anúncio atualizado com sucesso!')
      } else {
        const { error } = await supabase
          .from('advertisements')
          .insert([payload])
        if (error) throw error
        toast.success('Anúncio criado com sucesso!')
      }
      setIsDialogOpen(false)
      fetchAds()
    } catch (err: any) {
      toast.error('Erro ao salvar anúncio: ' + err.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este anúncio?')) return
    try {
      const { error } = await supabase
        .from('advertisements')
        .delete()
        .eq('id', id)
      if (error) throw error
      toast.success('Anúncio excluído com sucesso!')
      fetchAds()
    } catch (err: any) {
      toast.error('Erro ao excluir anúncio: ' + err.message)
    }
  }

  return (
    <div className="space-y-6">
      {!isNetwork && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500">
                Receita Total Regional
              </p>
              <h3 className="text-2xl font-bold">${totalRevenue.toFixed(2)}</h3>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-full text-orange-600">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500">
                Royalties Devidos ({royaltyRate}%)
              </p>
              <h3 className="text-2xl font-bold">
                ${totalRoyalties.toFixed(2)}
              </h3>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>
              {isNetwork ? 'Publicidade de Rede' : 'Publicidade Regional'}
            </CardTitle>
            <CardDescription>
              {isNetwork
                ? 'Visualize anúncios globais que rodam em toda a rede.'
                : 'Crie e gerencie anúncios exibidos exclusivamente em sua região.'}
            </CardDescription>
          </div>
          {!isNetwork && (
            <Button
              onClick={() => handleOpenDialog()}
              className="shrink-0 w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" /> Criar Anúncio
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Anúncio</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Receita</TableHead>
                {!isNetwork && <TableHead>Royalties</TableHead>}
                {!isNetwork && (
                  <TableHead className="text-right">Ações</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={isNetwork ? 3 : 5}
                    className="text-center py-8"
                  >
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredAds.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isNetwork ? 3 : 5}
                    className="text-center py-8 text-slate-500"
                  >
                    Nenhum anúncio encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAds.map((ad) => {
                  const revenue = ad.price || ad.budget || 0
                  const royalties = revenue * (royaltyRate / 100)
                  return (
                    <TableRow key={ad.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              ad.image ||
                              ad.image_url ||
                              'https://img.usecurling.com/p/200/100?q=ad'
                            }
                            alt={ad.title}
                            className="w-12 h-8 rounded object-cover"
                          />
                          <span className="font-medium truncate max-w-[150px]">
                            {ad.title || 'Sem título'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            ad.status === 'active' ? 'default' : 'secondary'
                          }
                          className="capitalize"
                        >
                          {ad.status || 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${revenue.toFixed(2)}
                      </TableCell>
                      {!isNetwork && (
                        <TableCell className="font-bold text-orange-600">
                          ${royalties.toFixed(2)}
                        </TableCell>
                      )}
                      {!isNetwork && (
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(ad)}
                          >
                            <Edit2 className="h-4 w-4 text-slate-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(ad.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {!isNetwork && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAd
                  ? 'Editar Anúncio Regional'
                  : 'Criar Anúncio Regional'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Título do Anúncio</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Ex: Oferta de Inverno"
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Detalhes adicionais..."
                />
              </div>
              <div className="space-y-2">
                <Label>URL da Imagem</Label>
                <Input
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Link de Destino</Label>
                <Input
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Receita Esperada (Para cálculo de Royalties)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-100 mt-2">
                <p className="text-sm font-medium text-orange-800">
                  Royalties Devidos: $
                  {((formData.price || 0) * (royaltyRate / 100)).toFixed(2)}
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  A taxa padrão aplicada é de {royaltyRate}%.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
