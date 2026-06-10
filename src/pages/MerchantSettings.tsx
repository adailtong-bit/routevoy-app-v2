import { useState, useEffect } from 'react'
import { Settings, Save, Building2, MapPin, Receipt, Users } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function MerchantSettings() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [merchantData, setMerchantData] = useState<any>({
    name: '',
    email: '',
    business_phone: '',
    address_street: '',
    address_number: '',
    address_city: '',
    address_state: '',
    address_zip: '',
    billing_name: '',
    billing_email: '',
    contacts: [],
  })

  useEffect(() => {
    const fetchMerchant = async () => {
      if (profile?.company_id) {
        const { data, error } = await supabase
          .from('merchants')
          .select('*')
          .eq('id', profile.company_id)
          .single()

        if (data && !error) {
          setMerchantData({
            name: data.name || '',
            email: data.email || '',
            business_phone: data.business_phone || '',
            address_street: data.address_street || '',
            address_number: data.address_number || '',
            address_city: data.address_city || '',
            address_state: data.address_state || '',
            address_zip: data.address_zip || '',
            billing_name: data.billing_name || '',
            billing_email: data.billing_email || '',
            contacts: Array.isArray(data.contacts) ? data.contacts : [],
          })
        }
      }
      setLoading(false)
    }

    fetchMerchant()
  }, [profile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMerchantData({ ...merchantData, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    if (!profile?.company_id) {
      toast.error('Merchant identity not linked.')
      return
    }

    setSaving(true)
    const { error } = await supabase
      .from('merchants')
      .update(merchantData)
      .eq('id', profile.company_id)

    setSaving(false)

    if (error) {
      toast.error('Erro ao salvar configurações: ' + error.message)
    } else {
      toast.success('Configurações atualizadas com sucesso!')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-10 h-10 border-4 border-primary/40 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 text-primary rounded-xl">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Configurações da Loja
          </h1>
          <p className="text-slate-500">
            Gerencie o perfil do seu negócio e faturamento.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Perfil da Empresa */}
        <Card>
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-slate-500" />
              Perfil do Negócio
            </CardTitle>
            <CardDescription>
              Informações públicas que aparecem nas suas ofertas.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome da Loja</Label>
              <Input
                name="name"
                value={merchantData.name}
                onChange={handleChange}
                placeholder="Nome fantasia"
              />
            </div>
            <div className="space-y-2">
              <Label>Email Comercial</Label>
              <Input
                type="email"
                name="email"
                value={merchantData.email}
                onChange={handleChange}
                placeholder="contato@loja.com"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Telefone / WhatsApp</Label>
              <Input
                name="business_phone"
                value={merchantData.business_phone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
              />
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-slate-500" />
              Endereço Físico
            </CardTitle>
            <CardDescription>
              Localização utilizada para geolocalização dos cupons.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Rua / Logradouro</Label>
              <Input
                name="address_street"
                value={merchantData.address_street}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label>Número</Label>
              <Input
                name="address_number"
                value={merchantData.address_number}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input
                name="address_city"
                value={merchantData.address_city}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Input
                name="address_state"
                value={merchantData.address_state}
                onChange={handleChange}
                placeholder="Ex: SP"
              />
            </div>
            <div className="space-y-2">
              <Label>CEP</Label>
              <Input
                name="address_zip"
                value={merchantData.address_zip}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Faturamento */}
        <Card>
          <CardHeader className="pb-4 border-b bg-slate-50">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
              <Receipt className="w-5 h-5 text-indigo-500" />
              Destinatários de Faturamento
            </CardTitle>
            <CardDescription>
              Para onde devemos enviar as faturas de impulsionamento.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Responsável Financeiro</Label>
              <Input
                name="billing_name"
                value={merchantData.billing_name}
                onChange={handleChange}
                placeholder="Financeiro da Loja"
              />
            </div>
            <div className="space-y-2">
              <Label>Email de Faturamento</Label>
              <Input
                type="email"
                name="billing_email"
                value={merchantData.billing_email}
                onChange={handleChange}
                placeholder="financeiro@loja.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contatos Adicionais */}
        <Card>
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-500" />
              Contatos (Recebimento de Faturas)
            </CardTitle>
            <CardDescription>
              Defina contatos adicionais que receberão cópias das faturas.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {merchantData.contacts.map((contact: any, idx: number) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-lg bg-slate-50 relative"
              >
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={contact.name || ''}
                    onChange={(e) => {
                      const newContacts = [...merchantData.contacts]
                      newContacts[idx].name = e.target.value
                      setMerchantData({
                        ...merchantData,
                        contacts: newContacts,
                      })
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={contact.email || ''}
                    onChange={(e) => {
                      const newContacts = [...merchantData.contacts]
                      newContacts[idx].email = e.target.value
                      setMerchantData({
                        ...merchantData,
                        contacts: newContacts,
                      })
                    }}
                  />
                </div>
                <div className="space-y-2 relative">
                  <Label>Cargo / Setor</Label>
                  <div className="flex gap-2">
                    <Input
                      value={contact.position || ''}
                      onChange={(e) => {
                        const newContacts = [...merchantData.contacts]
                        newContacts[idx].position = e.target.value
                        setMerchantData({
                          ...merchantData,
                          contacts: newContacts,
                        })
                      }}
                    />
                    <Button
                      variant="destructive"
                      onClick={() => {
                        const newContacts = merchantData.contacts.filter(
                          (_: any, i: number) => i !== idx,
                        )
                        setMerchantData({
                          ...merchantData,
                          contacts: newContacts,
                        })
                      }}
                    >
                      X
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => {
                setMerchantData({
                  ...merchantData,
                  contacts: [
                    ...merchantData.contacts,
                    { name: '', email: '', position: '' },
                  ],
                })
              }}
            >
              + Adicionar Contato
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button
            size="lg"
            className="px-8 font-bold"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>
    </div>
  )
}
