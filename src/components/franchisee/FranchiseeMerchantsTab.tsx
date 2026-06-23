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
} from '@/components/ui/dialog'
import { Plus, Edit2, Trash2, Store } from 'lucide-react'
import { toast } from 'sonner'
import { AdvancedCompanyForm } from '@/components/admin/hierarchy/AdvancedCompanyForm'

export function FranchiseeMerchantsTab({
  franchiseId,
}: {
  franchiseId: string
}) {
  const [merchants, setMerchants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMerchant, setEditingMerchant] = useState<any | null>(null)

  const fetchMerchants = async () => {
    if (!franchiseId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('franchise_id', franchiseId)
      .eq('business_type', 'merchant')

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
    } else {
      setEditingMerchant(null)
    }
    setIsDialogOpen(true)
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
        <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMerchant ? 'Editar Lojista' : 'Novo Lojista'}
            </DialogTitle>
          </DialogHeader>
          <AdvancedCompanyForm
            initialData={editingMerchant}
            onSave={() => {
              setIsDialogOpen(false)
              fetchMerchants()
            }}
            onCancel={() => setIsDialogOpen(false)}
            defaultType="merchant"
            franchiseId={franchiseId}
            isControlled={false}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
