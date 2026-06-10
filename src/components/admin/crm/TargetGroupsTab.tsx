import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Target, Plus, Trash2, Megaphone } from 'lucide-react'
import { toast } from 'sonner'
import { CRMCampaignDialog } from '@/components/merchant/CRMCampaignDialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function TargetGroupsTab({ companyId }: { companyId?: string }) {
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<any>(null)

  const fetchGroups = async () => {
    setLoading(true)
    let query = supabase.from('crm_target_groups').select('*')
    if (companyId) {
      query = query.eq('company_id', companyId)
    }
    const { data } = await query.order('created_at', { ascending: false })
    if (data) setGroups(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchGroups()
  }, [companyId])

  const deleteGroup = async (id: string) => {
    if (!confirm('Excluir este grupo?')) return
    await supabase.from('crm_target_groups').delete().eq('id', id)
    fetchGroups()
    toast.success('Grupo excluído!')
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Grupos Alvo</h3>
          <p className="text-sm text-slate-500">
            Gerencie agrupamentos de leads para campanhas exclusivas.
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Plus className="w-4 h-4" /> Novo Grupo
        </Button>
      </div>

      {loading ? (
        <p className="text-slate-500">Carregando grupos...</p>
      ) : groups.length === 0 ? (
        <div className="border border-dashed rounded-lg p-8 text-center text-slate-500">
          Nenhum grupo alvo criado ainda.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((g) => (
            <Card key={g.id} className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  {g.name}
                </CardTitle>
                <CardDescription className="line-clamp-1">
                  {g.description || 'Sem descrição'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800 mb-4">
                  {g.lead_count || 0}{' '}
                  <span className="text-sm font-normal text-slate-500">
                    leads
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={() => {
                      setSelectedGroup(g)
                      setDialogOpen(true)
                    }}
                  >
                    <Megaphone className="w-4 h-4" /> Criar Campanha
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2"
                    onClick={() => deleteGroup(g.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {dialogOpen && (
        <CRMCampaignDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          companyId={companyId}
          groups={groups}
          editData={{ target_group_id: selectedGroup?.id }}
          onSuccess={() => {}}
        />
      )}
    </div>
  )
}
