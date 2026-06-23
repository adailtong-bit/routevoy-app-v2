import { useState, useEffect } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Edit2, Trash2, Store } from 'lucide-react'
import { toast } from 'sonner'

export function FranchiseeMerchantsTab({
  franchiseId,
}: {
  franchiseId: string
}) {
  const [merchants, setMerchants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMerchant, setEditingMerchant] = useState<any | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    tax_id: '',
    status: 'active',
  })

  const fetchMerchants = async () => {
    if (!franchiseId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('franchise_id', franchiseId)

    if (error) {
      toast.error('Erro ao carregar lojistas: ' + error.message)
    } else {
      setMerchants(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchMerchants()
  }, [franchiseId])

  const handleOpenDialog = (merchant?: any) => {
    if (merchant) {
      setEditingMerchant(merchant)
      setFormData({
        name: merchant.name || '',
        email: merchant.email || '',
        tax_id: merchant.tax_id || '',
        status: merchant.status || 'active',
      })
    } else {
      setEditingMerchant(null)
      setFormData({
        name: '',
        email: '',
        tax_id: '',
        status: 'active',
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        tax_id: formData.tax_id,
        status: formData.status,
        franchise_id: franchiseId,
      }

      if (editingMerchant) {
        const { error } = await supabase
          .from('companies')
          .update(payload)
          .eq('id', editingMerchant.id)
        if (error) throw error
        toast.success('Lojista atualizado com sucesso!')
      } else {
        const { error } = await supabase
          .from('companies')
          .insert([{ ...payload, business_type: 'merchant' }])
        if (error) throw error
        toast.success('Lojista criado com sucesso!')
      }
      setIsDialogOpen(false)
      fetchMerchants()
    } catch (err: any) {
      toast.error('Erro ao salvar lojista: ' + err.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este lojista?')) return
    try {
      const { error } = await supabase.from('companies').delete().eq('id', id)
      if (error) throw error
      toast.success('Lojista excluído com sucesso!')
      fetchMerchants()
    } catch (err: any) {
      toast.error('Erro ao excluir lojista: ' + err.message)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" /> Gestão de Lojistas
            </CardTitle>
            <CardDescription>
              Gerencie os lojistas vinculados à sua região.
            </CardDescription>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="shrink-0 w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" /> Novo Lojista
          </Button>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : merchants.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-slate-500"
                    >
                      Nenhum lojista encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  merchants.map((merchant) => (
                    <TableRow key={merchant.id}>
                      <TableCell className="font-medium">
                        {merchant.name}
                      </TableCell>
                      <TableCell>{merchant.email}</TableCell>
                      <TableCell>{merchant.tax_id || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            merchant.status === 'active'
                              ? 'default'
                              : 'secondary'
                          }
                          className="capitalize"
                        >
                          {merchant.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(merchant)}
                        >
                          <Edit2 className="h-4 w-4 text-slate-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(merchant.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md w-[90vw]">
          <DialogHeader>
            <DialogTitle>
              {editingMerchant ? 'Editar Lojista' : 'Novo Lojista'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Lojista</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Loja Central"
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
                placeholder="loja@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Documento (CNPJ/CPF)</Label>
              <Input
                value={formData.tax_id}
                onChange={(e) =>
                  setFormData({ ...formData, tax_id: e.target.value })
                }
                placeholder="00.000.000/0001-00"
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
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                </SelectContent>
              </Select>
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
    </div>
  )
}
