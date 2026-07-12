import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { AddressForm } from '@/components/AddressForm'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useLanguage } from '@/stores/LanguageContext'
import { getRegionFormatting } from '@/stores/RegionContext'

const getCurrencyForCountry = (country: string): string => {
  return getRegionFormatting(country).currency
}

export function CreateAffiliateModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    document: '',
    phone: '',
    country: 'Brasil',
    status: 'active',

    // Addressing
    addressZip: '',
    addressStreet: '',
    addressNumber: '',
    addressComplement: '',
    addressNeighborhood: '',
    addressCity: '',
    addressState: '',
    lat: '',
    lng: '',

    // Contacts
    contactPerson: '',
    contactDepartment: '',
    contactEmail: '',
    contactPhone: '',

    // Billing
    billingEmail: '',
    paymentMethod: '',
    billingFrequency: '',
    bankName: '',
    bankAgency: '',
    bankAccount: '',
  })

  const handleAddressChange = (data: any) => {
    setFormData((prev) => ({
      ...prev,
      country: data.country || '',
      addressState: data.state || '',
      addressCity: data.city || '',
      addressZip: data.zip || '',
      addressStreet: data.street || '',
      addressNumber: data.number || '',
      addressNeighborhood: data.neighborhood || '',
      lat: data.lat ?? '',
      lng: data.lng ?? '',
    }))
  }

  // Ensure useEffect works without reference errors
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        email: '',
        document: '',
        phone: '',
        country: 'Brasil',
        status: 'active',
        addressZip: '',
        addressStreet: '',
        addressNumber: '',
        addressComplement: '',
        addressNeighborhood: '',
        addressCity: '',
        addressState: '',
        lat: '',
        lng: '',
        contactPerson: '',
        contactDepartment: '',
        contactEmail: '',
        contactPhone: '',
        billingEmail: '',
        paymentMethod: '',
        billingFrequency: '',
        bankName: '',
        bankAgency: '',
        bankAccount: '',
      })
    }
  }, [isOpen])

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      toast.error(
        t(
          'common.fill_fields',
          'Por favor, preencha os campos obrigatórios (Nome e Email).',
        ),
      )
      return
    }
    setLoading(true)

    const preferredCurrency = getCurrencyForCountry(formData.country)

    const contacts = [
      {
        contact_person: formData.contactPerson,
        contact_department: formData.contactDepartment,
        contact_email: formData.contactEmail,
        contact_phone: formData.contactPhone,
      },
    ]

    const { error: profileError } = await supabase.from('profiles').insert({
      id: crypto.randomUUID(),
      name: formData.name,
      email: formData.email,
      tax_id: formData.document,
      phone: formData.phone,
      country: formData.country,
      city: formData.addressCity,
      state: formData.addressState,
      status: formData.status,
      is_affiliate: true,
      role: 'affiliate',
      preferred_currency: preferredCurrency,
    })

    if (profileError) {
      setLoading(false)
      toast.error(profileError.message)
      return
    }

    const { error: affiliateError } = await supabase
      .from('affiliate_partners')
      .insert({
        name: formData.name,
        email: formData.email,
        tax_id: formData.document,
        phone: formData.phone,
        address_country: formData.country,
        address_state: formData.addressState,
        address_city: formData.addressCity,
        status: formData.status === 'active' ? 'active' : 'pending',
        contacts,
      })

    setLoading(false)

    if (affiliateError) {
      console.error('Error creating affiliate partner record:', affiliateError)
    }

    toast.success(t('admin.affiliate_created', 'Afiliado criado com sucesso!'))
    onSuccess()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t('admin.add_affiliate', 'Adicionar Afiliado')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Tabs defaultValue="geral" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
              <TabsTrigger value="geral" className="py-2">
                Dados Gerais
              </TabsTrigger>
              <TabsTrigger value="contatos" className="py-2">
                Contatos
              </TabsTrigger>
              <TabsTrigger value="faturamento" className="py-2">
                Faturamento
              </TabsTrigger>
              <TabsTrigger value="enderecamento" className="py-2">
                Endereçamento
              </TabsTrigger>
            </TabsList>

            <TabsContent value="geral" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome / Razão Social</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
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
                  <Label>Documento (CNPJ/CPF)</Label>
                  <Input
                    value={formData.document}
                    onChange={(e) =>
                      setFormData({ ...formData, document: e.target.value })
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
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) =>
                      setFormData({ ...formData, status: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contatos" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-slate-50">
                <h4 className="col-span-full font-medium mb-2">
                  Contato Principal
                </h4>
                <div className="space-y-2">
                  <Label>Nome do Contato</Label>
                  <Input
                    value={formData.contactPerson}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactPerson: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cargo / Departamento</Label>
                  <Input
                    value={formData.contactDepartment}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactDepartment: e.target.value,
                      })
                    }
                    placeholder="Ex: Financeiro, Marketing"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactEmail: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={formData.contactPhone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactPhone: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="faturamento" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email de Faturamento</Label>
                  <Input
                    type="email"
                    value={formData.billingEmail}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        billingEmail: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Método de Pagamento</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(val) =>
                      setFormData({ ...formData, paymentMethod: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="boleto">Boleto</SelectItem>
                      <SelectItem value="credit_card">
                        Cartão de Crédito
                      </SelectItem>
                      <SelectItem value="transfer">
                        Transferência Bancária
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Frequência de Faturamento</Label>
                  <Select
                    value={formData.billingFrequency}
                    onValueChange={(val) =>
                      setFormData({ ...formData, billingFrequency: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="quarterly">Trimestral</SelectItem>
                      <SelectItem value="annual">Anual</SelectItem>
                      <SelectItem value="per_campaign">Por Campanha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg mt-2">
                  <h4 className="col-span-full font-medium text-sm text-slate-500">
                    Dados Bancários
                  </h4>
                  <div className="space-y-2">
                    <Label>Banco</Label>
                    <Input
                      value={formData.bankName}
                      onChange={(e) =>
                        setFormData({ ...formData, bankName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Agência</Label>
                    <Input
                      value={formData.bankAgency}
                      onChange={(e) =>
                        setFormData({ ...formData, bankAgency: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Conta</Label>
                    <Input
                      value={formData.bankAccount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bankAccount: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="enderecamento" className="space-y-4 mt-4">
              <AddressForm
                country={formData.country}
                state={formData.addressState}
                city={formData.addressCity}
                zip={formData.addressZip}
                street={formData.addressStreet}
                number={formData.addressNumber}
                neighborhood={formData.addressNeighborhood}
                lat={formData.lat ? Number(formData.lat) : undefined}
                lng={formData.lng ? Number(formData.lng) : undefined}
                onChange={handleAddressChange}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Complemento</Label>
                  <Input
                    value={formData.addressComplement}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        addressComplement: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {t('common.cancel', 'Cancelar')}
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {t('common.save', 'Salvar')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
