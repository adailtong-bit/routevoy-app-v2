import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Plus,
  Megaphone,
  Target,
  Link as LinkIcon,
  Edit,
  Trash2,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CRMCampaignDialog } from './CRMCampaignDialog'
import { toast } from 'sonner'

export function CRMCampaignsTab({ companyId }: { companyId?: string }) {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editData, setEditData] = useState<any>(null)

  const fetchData = async () => {
    if (!companyId) return
    setLoading(true)

    const { data: camps } = await supabase
      .from('crm_campaigns')
      .select(
        `
        *,
        crm_target_groups (
          name
        )
      `,
      )
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (camps) setCampaigns(camps)

    const { data: grps } = await supabase
      .from('crm_target_groups')
      .select('*')
      .eq('company_id', companyId)

    if (grps) setGroups(grps)

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [companyId])

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta campanha direcionada?')) return

    const { error } = await supabase.from('crm_campaigns').delete().eq('id', id)
    if (error) {
      toast.error('Erro ao excluir campanha')
      return
    }
    toast.success('Campanha excluída com sucesso')
    fetchData()
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            Campanhas Direcionadas (Exclusivas)
          </h3>
          <p className="text-sm text-slate-500">
            Crie ofertas que aparecem apenas para o grupo de leads selecionado.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditData(null)
            setIsDialogOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Nome da Campanha</TableHead>
              <TableHead>Grupo Alvo</TableHead>
              <TableHead>Canal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Engajamento</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-slate-500"
                >
                  Carregando...
                </TableCell>
              </TableRow>
            ) : campaigns.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-slate-500"
                >
                  Nenhuma campanha direcionada encontrada.
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map((camp) => (
                <TableRow key={camp.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-indigo-500" />
                    {camp.name}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm bg-slate-100 text-slate-700 px-2 py-1 rounded-md w-fit">
                      <Target className="w-3 h-3" />
                      {camp.crm_target_groups?.name || 'Sem grupo'}
                    </span>
                  </TableCell>
                  <TableCell className="capitalize">{camp.channel}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        camp.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {camp.status === 'active' ? 'Ativo' : 'Rascunho'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-4 text-sm text-slate-500">
                      <span>{camp.clicks || 0} cliques</span>
                      <span>{camp.redemptions || 0} conversões</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditData(camp)
                          setIsDialogOpen(true)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(camp.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CRMCampaignDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        companyId={companyId}
        groups={groups}
        editData={editData}
        onSuccess={fetchData}
      />
    </div>
  )
}
