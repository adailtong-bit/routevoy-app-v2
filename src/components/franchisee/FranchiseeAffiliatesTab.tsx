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
  DialogDescription,
} from '@/components/ui/dialog'
import { Plus, Edit2, Trash2, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { AdvancedCompanyForm } from '@/components/admin/hierarchy/AdvancedCompanyForm'

export function FranchiseeAffiliatesTab({
  franchiseId,
}: {
  franchiseId: string
}) {
  const [affiliates, setAffiliates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAffiliate, setEditingAffiliate] = useState<any | null>(null)

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
    } else {
      setEditingAffiliate(null)
    }
    setIsDialogOpen(true)
  }

  const handleSave = async (formData: any) => {
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        status: formData.status,
        franchise_id: franchiseId,
        is_affiliate: true,
        role: 'affiliate',
        documentNumber: formData.document,
        city: formData.addressCity,
        state: formData.addressState,
        country: formData.country,
        zipCode: formData.addressZip,
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
        <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAffiliate ? 'Editar Afiliado' : 'Novo Afiliado'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Formulário para adicionar ou atualizar dados do afiliado.
            </DialogDescription>
          </DialogHeader>
          <AdvancedCompanyForm
            initialData={editingAffiliate}
            onSave={handleSave}
            onCancel={() => setIsDialogOpen(false)}
            defaultType="affiliate"
            franchiseId={franchiseId}
            isControlled={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
