import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AddressForm } from '@/components/AddressForm'
import { PhoneInput } from '@/components/PhoneInput'

const formatTaxId = (v: string) => {
  v = v.replace(/\D/g, '')
  if (v.length <= 11) {
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  } else {
    v = v.replace(/^(\d{2})(\d)/, '$1.$2')
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    v = v.replace(/\.(\d{3})(\d)/, '.$1/$2')
    v = v.replace(/(\d{4})(\d)/, '$1-$2')
  }
  return v.substring(0, 18)
}

const formatPhone = (v: string) => {
  v = v.replace(/\D/g, '')
  v = v.replace(/^(\d{2})(\d)/g, '($1) $2')
  v = v.replace(/(\d)(\d{4})$/, '$1-$2')
  return v.substring(0, 15)
}

export function CreateAffiliateModal({
  isOpen,
  onClose,
  onSuccess,
  franchiseId,
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  franchiseId?: string
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    tax_id: '',
    phone: '',
    commission_model: 'percentage',
    commission_rate: '30',
    monthly_fee: '0',
    address_country: 'Brasil',
    address_state: '',
    address_city: '',
    region_id: 'global',
    coverage_scope: 'national',
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      toast.error('Preencha os campos obrigatórios (Nome e E-mail)')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.from('affiliate_partners').insert({
        name: formData.name,
        email: formData.email,
        tax_id: formData.tax_id.replace(/\D/g, ''),
        commission_model: formData.commission_model,
        commission_rate: parseFloat(formData.commission_rate) || 0,
        monthly_fee: parseFloat(formData.monthly_fee) || 0,
        franchise_id: franchiseId || null,
        region_id: formData.region_id,
        phone: formData.phone.replace(/\D/g, ''),
        address_country: formData.address_country,
        address_state: formData.address_state,
        address_city: formData.address_city,
        coverage_scope: formData.coverage_scope,
        status: 'active',
      } as any)

      if (error) {
        if (error.code === '23505') throw new Error('E-mail já cadastrado.')
        throw error
      }

      toast.success('Afiliado cadastrado com sucesso!')
      onSuccess()
      onClose()

      setFormData({
        name: '',
        email: '',
        tax_id: '',
        phone: '',
        commission_model: 'percentage',
        commission_rate: '30',
        monthly_fee: '0',
        address_country: 'Brasil',
        address_state: '',
        address_city: '',
        region_id: 'global',
        coverage_scope: 'national',
      })
    } catch (err: any) {
      toast.error(err.message || 'Erro ao cadastrar afiliado')
    } finally {
      setLoading(false)
    }
  }

  const isFormValid =
    formData.name.trim().length > 0 && formData.email.trim().length > 0

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Afiliado</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para registrar um novo parceiro afiliado no
            sistema.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full mt-4">
          <TabsList className="w-full flex justify-start overflow-x-auto">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="contacts">Contatos</TabsTrigger>
            <TabsTrigger value="billing">Faturamento</TabsTrigger>
            <TabsTrigger value="addressing">Endereço</TabsTrigger>
            <TabsTrigger value="coverage">Cobertura</TabsTrigger>
          </TabsList>

          <div className="mt-6 space-y-4 min-h-[300px]">
            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Afiliado *</Label>
                  <Input
                    placeholder="Ex: Afiliado Silva"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-mail (Login) *</Label>
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Documento (CPF/CNPJ)</Label>
                  <Input
                    placeholder="000.000.000-00"
                    value={formData.tax_id}
                    onChange={(e) =>
                      handleChange('tax_id', formatTaxId(e.target.value))
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contacts" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telefone Comercial</Label>
                  <PhoneInput
                    value={formData.phone}
                    onChange={(val) => handleChange('phone', val)}
                    countryCode={
                      formData.address_country === 'USA' ? 'US' : 'BR'
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="billing" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Modelo de Comissão</Label>
                  <Select
                    value={formData.commission_model}
                    onValueChange={(val) =>
                      handleChange('commission_model', val)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">
                        Split de Comissão (%)
                      </SelectItem>
                      <SelectItem value="monthly">
                        Mensalidade SaaS (R$)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.commission_model === 'percentage' ? (
                  <div className="space-y-2">
                    <Label>Taxa de Comissão (%)</Label>
                    <Input
                      type="number"
                      placeholder="Ex: 30"
                      value={formData.commission_rate}
                      onChange={(e) =>
                        handleChange('commission_rate', e.target.value)
                      }
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Valor Mensalidade (R$)</Label>
                    <Input
                      type="number"
                      placeholder="Ex: 199.90"
                      value={formData.monthly_fee}
                      onChange={(e) =>
                        handleChange('monthly_fee', e.target.value)
                      }
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="addressing" className="space-y-4">
              <AddressForm
                country={formData.address_country}
                state={formData.address_state}
                city={formData.address_city}
                onChange={(data) => {
                  setFormData((prev) => ({
                    ...prev,
                    address_country: data.country || prev.address_country,
                    address_state: data.state,
                    address_city: data.city,
                  }))
                }}
              />
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>Região Atribuída</Label>
                  <Input
                    placeholder="Ex: Sudeste"
                    value={formData.region_id}
                    onChange={(e) => handleChange('region_id', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="coverage" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Escopo de Cobertura</Label>
                  <Select
                    value={formData.coverage_scope}
                    onValueChange={(val) => handleChange('coverage_scope', val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="national">Nacional</SelectItem>
                      <SelectItem value="state">Estadual</SelectItem>
                      <SelectItem value="city">Municipal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="mt-6 border-t pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading || !isFormValid}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
