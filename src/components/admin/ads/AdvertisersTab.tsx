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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Edit2,
  Plus,
  Trash2,
  Loader2,
  Building2,
  MapPin,
  Users,
} from 'lucide-react'
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
  const [activeTab, setActiveTab] = useState('general')

  const defaultForm = {
    company_name: '',
    tax_id: '',
    street: '',
    address_number: '',
    city: '',
    state: '',
    zip: '',
    contacts: [{ name: '', position: '', phone: '', email: '' }],
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

    // Ensure contacts is correctly populated or migrated from old single format
    const advContacts = adv.contacts?.length
      ? adv.contacts
      : [
          {
            name: adv.contact_name || '',
            position: '',
            phone: adv.phone || '',
            email: adv.email || '',
          },
        ]

    setFormData({
      company_name: adv.company_name || '',
      tax_id: adv.tax_id || '',
      street: adv.street || '',
      address_number: adv.address_number || '',
      city: adv.city || '',
      state: adv.state || '',
      zip: adv.zip || '',
      contacts: advContacts,
    })
    setActiveTab('general')
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
      setActiveTab('general')
      return
    }

    if (formData.contacts.length === 0 || !formData.contacts[0].name) {
      toast.error(t('common.error', 'Adicione pelo menos um contato'))
      setActiveTab('contacts')
      return
    }

    setIsLoading(true)

    // Financial Invoicing Logic: Find the contact with "Financial" position
    const financialContact =
      formData.contacts.find(
        (c: any) =>
          c.position?.toLowerCase().includes('financeiro') ||
          c.position?.toLowerCase().includes('financial') ||
          c.position?.toLowerCase().includes('financiero'),
      ) || formData.contacts[0]

    // Maintain backwards compatibility by setting the root email to the financial contact email
    const payload = {
      company_name: formData.company_name,
      tax_id: formData.tax_id,
      street: formData.street,
      address_number: formData.address_number,
      city: formData.city,
      state: formData.state,
      zip: formData.zip,
      contacts: formData.contacts,
      contact_name: financialContact?.name || '',
      email: financialContact?.email || '',
      phone: financialContact?.phone || '',
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
            setActiveTab('general')
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
              <TableHead>
                {t('ads.contact_name', 'Contato Principal')}
              </TableHead>
              <TableHead>
                {t('ads.billing_email', 'Email de Faturamento')}
              </TableHead>
              <TableHead>{t('ads.tax_id', 'CNPJ / Doc')}</TableHead>
              <TableHead>{t('admin.status', 'Status')}</TableHead>
              <TableHead className="text-right">
                {t('common.actions', 'Ações')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {advertisers.map((adv) => (
              <TableRow key={adv.id}>
                <TableCell className="font-medium text-slate-800">
                  {adv.company_name}
                </TableCell>
                <TableCell className="text-slate-600">
                  {adv.contact_name || '-'}
                </TableCell>
                <TableCell className="text-slate-600">
                  {adv.email || '-'}
                </TableCell>
                <TableCell className="text-slate-600">
                  {adv.tax_id || '-'}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={adv.status === 'active' ? 'default' : 'secondary'}
                  >
                    {adv.status === 'active'
                      ? t('admin.active', 'Ativo')
                      : adv.status}
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
                  className="text-center py-8 text-slate-500"
                >
                  {t('ads.no_advertisers', 'Nenhum anunciante cadastrado')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 bg-slate-50 overflow-hidden">
          <DialogHeader className="p-6 pb-4 bg-white border-b border-slate-100">
            <DialogTitle className="text-xl">
              {editingId
                ? t('common.edit', 'Editar Anunciante')
                : t('ads.new_advertiser', 'Novo Anunciante')}
            </DialogTitle>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col min-h-0 bg-white"
          >
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1">
                <TabsTrigger
                  value="general"
                  className="flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {t('ads.company_data', 'Dados da Empresa')}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="address"
                  className="flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {t('ads.full_address', 'Endereçamento')}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="contacts"
                  className="flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {t('ads.contacts_billing', 'Contatos e Faturamento')}
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1 px-6 pb-6 mt-4">
              <TabsContent
                value="general"
                className="space-y-4 m-0 focus-visible:outline-none"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-slate-700">
                      {t('ads.company_name', 'Razão Social / Nome Fantasia')} *
                    </Label>
                    <Input
                      className="bg-white"
                      value={formData.company_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          company_name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-slate-700">
                      {t('ads.tax_id', 'CNPJ / CPF')}
                    </Label>
                    <Input
                      className="bg-white"
                      value={formData.tax_id}
                      onChange={(e) =>
                        setFormData({ ...formData, tax_id: e.target.value })
                      }
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="address"
                className="space-y-4 m-0 focus-visible:outline-none"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  <div className="space-y-2 md:col-span-3">
                    <Label className="text-slate-700">
                      {t('ads.street', 'Rua / Logradouro')}
                    </Label>
                    <Input
                      className="bg-white"
                      value={formData.street}
                      onChange={(e) =>
                        setFormData({ ...formData, street: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">
                      {t('ads.number', 'Número')}
                    </Label>
                    <Input
                      className="bg-white"
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
                    <Label className="text-slate-700">
                      {t('ads.city', 'Cidade')}
                    </Label>
                    <Input
                      className="bg-white"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">
                      {t('ads.state', 'Estado')}
                    </Label>
                    <Input
                      className="bg-white"
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">
                      {t('ads.zip', 'CEP')}
                    </Label>
                    <Input
                      className="bg-white"
                      value={formData.zip}
                      onChange={(e) =>
                        setFormData({ ...formData, zip: e.target.value })
                      }
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="contacts"
                className="space-y-5 m-0 focus-visible:outline-none"
              >
                <div className="space-y-4">
                  {formData.contacts.map((contact, index) => (
                    <div
                      key={index}
                      className="border p-5 rounded-lg relative bg-slate-50/50 shadow-sm border-slate-200"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 text-slate-400 hover:text-red-500 hover:bg-red-50"
                        onClick={() => {
                          const newContacts = [...formData.contacts]
                          newContacts.splice(index, 1)
                          setFormData({ ...formData, contacts: newContacts })
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                        <div className="space-y-2">
                          <Label className="text-slate-700">
                            {t('ads.contact_name', 'Nome do Contato')} *
                          </Label>
                          <Input
                            className="bg-white"
                            value={contact.name}
                            onChange={(e) => {
                              const newContacts = [...formData.contacts]
                              newContacts[index].name = e.target.value
                              setFormData({
                                ...formData,
                                contacts: newContacts,
                              })
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-700 flex items-center justify-between">
                            {t('ads.position', 'Cargo')} *
                            {contact.position
                              .toLowerCase()
                              .includes('financ') && (
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200 ml-2"
                              >
                                {t('ads.financial', 'Financeiro')}
                              </Badge>
                            )}
                          </Label>
                          <Input
                            className="bg-white"
                            value={contact.position}
                            placeholder={t(
                              'ads.contact_position_ph',
                              'Ex: Financeiro, Marketing',
                            )}
                            onChange={(e) => {
                              const newContacts = [...formData.contacts]
                              newContacts[index].position = e.target.value
                              setFormData({
                                ...formData,
                                contacts: newContacts,
                              })
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-700">
                            {t('auth.email', 'E-mail')}
                          </Label>
                          <Input
                            className="bg-white"
                            type="email"
                            value={contact.email}
                            onChange={(e) => {
                              const newContacts = [...formData.contacts]
                              newContacts[index].email = e.target.value
                              setFormData({
                                ...formData,
                                contacts: newContacts,
                              })
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-700">
                            {t('profile.phone', 'Telefone')}
                          </Label>
                          <Input
                            className="bg-white"
                            value={contact.phone}
                            onChange={(e) => {
                              const newContacts = [...formData.contacts]
                              newContacts[index].phone = e.target.value
                              setFormData({
                                ...formData,
                                contacts: newContacts,
                              })
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        contacts: [
                          ...formData.contacts,
                          { name: '', position: '', phone: '', email: '' },
                        ],
                      })
                    }
                    className="w-full border-dashed border-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 py-6"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('ads.add_contact', 'Adicionar Contato')}
                  </Button>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <div className="p-6 border-t flex justify-end gap-3 bg-white rounded-b-lg shrink-0">
            <Button
              variant="ghost"
              onClick={() => setIsDialogOpen(false)}
              className="hover:bg-slate-100"
            >
              {t('common.cancel', 'Cancelar')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t('common.save', 'Salvar')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
