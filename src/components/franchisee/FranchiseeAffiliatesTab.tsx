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
import { Plus, Edit2, Trash2, Share2 } from 'lucide-react'
import { toast } from 'sonner'

export function FranchiseeAffiliatesTab({
  franchiseId,
}: {
  franchiseId: string
}) {
  const [affiliates, setAffiliates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAffiliate, setEditingAffiliate] = useState<any | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active',
  })

  const fetchAffiliates = async () => {
    if (!franchiseId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('franchise_id', franchiseId)
      .eq('is_affiliate', true)

    if (error) {
      toast.error('Erro ao carregar afiliados: ' + error.message)
    } else {
      setAffiliates(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAffiliates()
  }, [franchiseId])

  const handleOpenDialog = (affiliate?: any) => {
    if (affiliate) {
      setEditingAffiliate(affiliate)
      setFormData({
        name: affiliate.name || '',
        email: affiliate.email || '',
        phone: affiliate.phone || '',
        status: affiliate.status || 'active',
      })
    } else {
      setEditingAffiliate(null)
      setFormData({
        name: '',
        email: '',
        phone: '',
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
        phone: formData.phone,
        status: formData.status,
        franchise_id: franchiseId,
        is_affiliate: true,
        role: 'affiliate',
      }

      if (editingAffiliate) {
        const { error } = await supabase
          .from('profiles')
          .update(payload)
          .eq('id', editingAffiliate.id)
        if (error) throw error
        toast.success('Afiliado atualizado com sucesso!')
      } else {
        const tempId = crypto.randomUUID()
        const { error } = await supabase
          .from('profiles')
          .insert([{ id: tempId, ...payload }])
        if (error) throw error
        toast.success('Afiliado criado com sucesso!')
      }
      setIsDialogOpen(false)
      fetchAffiliates()
    } catch (err: any) {
      toast.error('Erro ao salvar afiliado: ' + err.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este afiliado?')) return
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id)
      if (error) throw error
      toast.success('Afiliado excluído com sucesso!')
      fetchAffiliates()
    } catch (err: any) {
      toast.error('Erro ao excluir afiliado: ' + err.message)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" /> Gestão de Afiliados
            </CardTitle>
            <CardDescription>
              Gerencie a rede de afiliados vinculada à sua região.
            </CardDescription>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="shrink-0 w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" /> Novo Afiliado
          </Button>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
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
                ) : affiliates.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-slate-500"
                    >
                      Nenhum afiliado encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  affiliates.map((aff) => (
                    <TableRow key={aff.id}>
                      <TableCell className="font-medium">{aff.name}</TableCell>
                      <TableCell>{aff.email}</TableCell>
                      <TableCell>{aff.phone || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            aff.status === 'active' || aff.status === 'approved'
                              ? 'default'
                              : 'secondary'
                          }
                          className="capitalize"
                        >
                          {aff.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(aff)}
                        >
                          <Edit2 className="h-4 w-4 text-slate-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(aff.id)}
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
              {editingAffiliate ? 'Editar Afiliado' : 'Novo Afiliado'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Afiliado</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: João Silva"
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
                placeholder="joao@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="(00) 00000-0000"
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
