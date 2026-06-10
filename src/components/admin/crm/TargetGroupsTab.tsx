import { useState } from 'react'
import { Plus, Users, Target, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TargetGroupDialog } from './TargetGroupDialog'
import { useCrmData } from '@/hooks/use-crm-data'

export function TargetGroupsTab({ companyId }: { companyId?: string }) {
  const { targetGroups, profiles, engagements, categories, refresh, loading } =
    useCrmData(undefined, companyId)
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<any>(null)

  const filteredGroups = targetGroups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Buscar grupos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        <Button
          onClick={() => {
            setEditingGroup(null)
            setIsDialogOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Criar Grupo
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-500">
          <div className="w-8 h-8 border-4 border-primary/40 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="text-center py-16 px-4 border border-dashed rounded-xl bg-white flex flex-col items-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
            <Target className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            Nenhum grupo encontrado
          </h3>
          <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto leading-relaxed">
            Organize seus leads por perfil de consumo, localização ou frequência
            de uso. Crie seu primeiro grupo para direcionar campanhas mais
            eficientes.
          </p>
          <Button
            onClick={() => {
              setEditingGroup(null)
              setIsDialogOpen(true)
            }}
            className="mt-6 shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Meu Primeiro Grupo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="bg-white border rounded-xl p-5 hover:shadow-md transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <h3
                  className="font-bold text-slate-800 line-clamp-1"
                  title={group.name}
                >
                  {group.name}
                </h3>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0">
                  <Users className="w-3.5 h-3.5" /> {group.leadCount || 0}
                </span>
              </div>
              <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">
                {group.description || 'Sem descrição'}
              </p>
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingGroup(group)
                    setIsDialogOpen(true)
                  }}
                >
                  Editar Perfil do Grupo
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isDialogOpen && (
        <TargetGroupDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingGroup={editingGroup}
          profiles={profiles}
          engagements={engagements}
          categories={categories}
          companyId={companyId}
          onSaved={refresh}
        />
      )}
    </div>
  )
}
