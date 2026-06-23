import { useState } from 'react'
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
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function AdvancedCompanyForm({
  initialData,
  onSave,
  onCancel,
  defaultType = 'merchant',
  franchiseId,
}: {
  initialData?: any
  onSave: () => void
  onCancel: () => void
  defaultType?: string
  franchiseId?: string
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    businessType: initialData?.businessType || defaultType,
    status: initialData?.status || 'active',
    franchiseId: initialData?.franchiseId || franchiseId || '',
    document: initialData?.document || '',
    phone: initialData?.phone || '',
  })
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        business_type: formData.businessType,
        status: formData.status,
        franchise_id: formData.franchiseId || null,
        tax_id: formData.document,
        contact_phone: formData.phone,
      }

      if (initialData?.id) {
        const { error } = await supabase
          .from('companies')
          .update(payload)
          .eq('id', initialData.id)
        if (error) throw error
        toast.success('Registro atualizado com sucesso!')
      } else {
        const { error } = await supabase.from('companies').insert([payload])
        if (error) throw error
        toast.success('Registro criado com sucesso!')
      }
      onSave()
    } catch (err: any) {
      toast.error('Erro ao salvar: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nome / Razão Social</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
          <Label>Tipo de Negócio</Label>
          <Select
            value={formData.businessType}
            onValueChange={(val) =>
              setFormData({ ...formData, businessType: val })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="merchant">Lojista</SelectItem>
              <SelectItem value="franchise">Franqueado</SelectItem>
              <SelectItem value="advertiser">Anunciante</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(val) => setFormData({ ...formData, status: val })}
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
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          Salvar
        </Button>
      </div>
    </div>
  )
}
