import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
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
} from '@/components/ui/dialog'
import { Edit2, Plus, Trash2, Loader2 } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'

export function AdvertisersTab({
  environment = 'production',
}: {
  environment?: string
}) {
  const { t } = useLanguage()
  const [advertisers, setAdvertisers] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const defaultForm = {
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    tax_id: '',
    street: '',
    address_number: '',
    city: '',
    state: '',
    zip: '',
  }

  const [formData, setFormData] = useState(defaultForm)

  useEffect(() => {
    fetchAdv()
  }, [environment])

  const fetchAdv = async () => {
    const { data } = await supabase
      .from('ad_advertisers')
      .select('*')
      .eq('environment', environment)
      .order('created_at', { ascending: false })
    if (data) setAdvertisers(data)
  }

  const handleEdit = (adv: any) => {
    setEditingId(adv.id)
    setFormData({
      company_name: adv.company_name || '',
      contact_name: adv.contact_name || '',
      email: adv.email || '',
      phone: adv.phone || '',
      tax_id: adv.tax_id || '',
      street: adv.street || '',
      address_number: adv.address_number || '',
      city: adv.city || '',
      state: adv.state || '',
      zip: adv.zip || '',
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirm_delete', 'Tem certeza que deseja excluir?')))
      return
    const { error } = await supabase
      .from('ad_advertisers')
      .delete()
      .eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success(t('common.success', 'Excluído com sucesso'))
      fetchAdv()
    }
  }

  const handleSave = async () => {
    if (!formData.company_name) {
      toast.error(t('common.error', 'O nome da empresa é obrigatório'))
      return
    }

    setIsLoading(true)
    const payload = {
      ...formData,
      environment,
      status: 'active',
    }

    let error
    if (editingId) {
      const res = await supabase
        .from('ad_advertisers')
        .update(payload)
        .eq('id', editingId)
      error = res.error
    } else {
      const res = await supabase.from('ad_advertisers').insert(payload)
      error = res.error
    }

    setIsLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success(t('common.success', 'Salvo com sucesso'))
      setIsDialogOpen(false)
      fetchAdv()
    }
  }

  return (
    <div className="space-y-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in-up">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-800">
          {t('admin.ad_manager.advertisers', 'Anunciantes')}
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
          {t('ads.new_advertiser', 'Novo Anunciante')}
        </Button>
      </div>

      <div className="overflow-x-auto border rounded-md">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>{t('ads.company_name', 'Nome da Empresa')}</TableHead>
              <TableHead>{t('ads.contact', 'Contato')}</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>CNPJ / Doc</TableHead>
              <TableHead>{t('admin.status', 'Status')}</TableHead>
              <TableHead className="text-right">
                {t('common.actions', 'Ações')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {advertisers.map((adv) => (
              <TableRow key={adv.id}>
                <TableCell className="font-medium">
                  {adv.company_name}
                </TableCell>
                <TableCell>{adv.contact_name || '-'}</TableCell>
                <TableCell>{adv.email || '-'}</TableCell>
                <TableCell>{adv.tax_id || '-'}</TableCell>
                <TableCell>
                  <Badge
                    variant={adv.status === 'active' ? 'default' : 'secondary'}
                  >
                    {adv.status || 'Ativo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(adv)}
                  >
                    <Edit2 className="w-4 h-4 text-slate-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(adv.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {advertisers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-6 text-slate-500"
                >
                  {t('ads.no_advertisers', 'Nenhum anunciante cadastrado')}
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
                ? t('common.edit', 'Editar Anunciante')
                : t('ads.new_advertiser', 'Novo Anunciante')}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6 pb-6">
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    {t('ads.company_name', 'Razão Social / Nome Fantasia')} *
                  </Label>
                  <Input
                    value={formData.company_name}
                    onChange={(e) =>
                      setFormData({ ...formData, company_name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('ads.contact', 'Nome do Contato')}</Label>
                  <Input
                    value={formData.contact_name}
                    onChange={(e) =>
                      setFormData({ ...formData, contact_name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>{t('ads.tax_id', 'CNPJ / CPF')}</Label>
                  <Input
                    value={formData.tax_id}
                    onChange={(e) =>
                      setFormData({ ...formData, tax_id: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <h4 className="font-semibold text-sm text-slate-700">
                  Endereço
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2 md:col-span-3">
                    <Label>Rua / Logradouro</Label>
                    <Input
                      value={formData.street}
                      onChange={(e) =>
                        setFormData({ ...formData, street: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Número</Label>
                    <Input
                      value={formData.address_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address_number: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Cidade</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Input
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CEP</Label>
                    <Input
                      value={formData.zip}
                      onChange={(e) =>
                        setFormData({ ...formData, zip: e.target.value })
                      }
                    />
                  </div>
                </div>
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
