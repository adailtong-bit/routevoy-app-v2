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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Plus, Edit2, Trash2, Megaphone } from 'lucide-react'
import { toast } from 'sonner'
import { AdvancedCompanyForm } from '@/components/admin/hierarchy/AdvancedCompanyForm'

export function FranchiseeAdvertisersTab({
  franchiseId,
}: {
  franchiseId: string
}) {
  const [advertisers, setAdvertisers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAdvertiser, setEditingAdvertiser] = useState<any | null>(null)

  const fetchAdvertisers = async () => {
    if (!franchiseId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('advertisers')
      .select('*')
      .eq('franchise_id', franchiseId)

    if (error) {
      toast.error('Erro ao carregar anunciantes: ' + error.message)
    } else {
      setAdvertisers(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAdvertisers()
  }, [franchiseId])

  const handleOpenDialog = (advertiser?: any) => {
    if (advertiser) {
      setEditingAdvertiser({
        ...advertiser,
        name: advertiser.company_name,
        document: advertiser.tax_id,
        addressStreet: advertiser.address?.street || '',
        addressNumber: advertiser.address?.number || '',
        addressCity: advertiser.address?.city || '',
        addressState: advertiser.address?.state || '',
        addressZip: advertiser.address?.zip || '',
      })
    } else {
      setEditingAdvertiser(null)
    }
    setIsDialogOpen(true)
  }

  const handleSave = async (formData: any) => {
    try {
      const payload = {
        company_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        tax_id: formData.document,
        franchise_id: franchiseId,
        address: {
          street: formData.addressStreet,
          number: formData.addressNumber,
          city: formData.addressCity,
          state: formData.addressState,
          zip: formData.addressZip,
        },
      }

      if (editingAdvertiser) {
        const { error } = await supabase
          .from('advertisers')
          .update(payload)
          .eq('id', editingAdvertiser.id)
        if (error) throw error
        toast.success('Anunciante atualizado com sucesso!')
      } else {
        const { error } = await supabase.from('advertisers').insert([payload])
        if (error) throw error
        toast.success('Anunciante criado com sucesso!')
      }
      setIsDialogOpen(false)
      fetchAdvertisers()
    } catch (err: any) {
      toast.error('Erro ao salvar anunciante: ' + err.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este anunciante?'))
      return
    try {
      const { error } = await supabase.from('advertisers').delete().eq('id', id)
      if (error) throw error
      toast.success('Anunciante excluído com sucesso!')
      fetchAdvertisers()
    } catch (err: any) {
      toast.error('Erro ao excluir anunciante: ' + err.message)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" /> Gestão de
              Anunciantes
            </CardTitle>
            <CardDescription>
              Gerencie os anunciantes vinculados à sua região.
            </CardDescription>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="shrink-0 w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" /> Novo Anunciante
          </Button>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome da Empresa</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Documento</TableHead>
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
                ) : advertisers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-slate-500"
                    >
                      Nenhum anunciante encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  advertisers.map((adv) => (
                    <TableRow key={adv.id}>
                      <TableCell className="font-medium">
                        {adv.company_name}
                      </TableCell>
                      <TableCell>{adv.email}</TableCell>
                      <TableCell>{adv.phone || '-'}</TableCell>
                      <TableCell>{adv.tax_id || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(adv)}
                        >
                          <Edit2 className="h-4 w-4 text-slate-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(adv.id)}
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
              {editingAdvertiser ? 'Editar Anunciante' : 'Novo Anunciante'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Formulário para adicionar ou atualizar dados do anunciante.
            </DialogDescription>
          </DialogHeader>
          <AdvancedCompanyForm
            initialData={editingAdvertiser}
            onSave={handleSave}
            onCancel={() => setIsDialogOpen(false)}
            defaultType="advertiser"
            franchiseId={franchiseId}
            isControlled={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
