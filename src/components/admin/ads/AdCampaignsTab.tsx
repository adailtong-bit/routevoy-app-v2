import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { HierarchicalLocationSelector } from '@/components/HierarchicalLocationSelector'

export function AdCampaignsTab() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [searchCountry, setSearchCountry] = useState('')
  const [searchState, setSearchState] = useState('')
  const [searchCity, setSearchCity] = useState('')

  useEffect(() => {
    fetchCampaigns()
  }, [searchCountry, searchState, searchCity])

  const fetchCampaigns = async () => {
    setLoading(true)
    let query = supabase
      .from('ad_campaigns')
      .select('*')
      .order('created_at', { ascending: false })

    if (searchCountry) query = query.eq('country', searchCountry)
    if (searchState) query = query.eq('state', searchState)
    if (searchCity) query = query.eq('city', searchCity)

    const { data } = await query
    if (data) setCampaigns(data)
    setLoading(false)
  }

  const updatePriority = async (id: string, score: number) => {
    const { error } = await supabase
      .from('ad_campaigns')
      .update({ priority_score: score })
      .eq('id', id)
    if (error) {
      toast.error('Erro ao atualizar prioridade')
    } else {
      toast.success('Prioridade atualizada com sucesso')
      fetchCampaigns()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4 text-slate-800 text-sm uppercase tracking-wider">
            Filtro Geográfico de Campanhas
          </h3>
          <HierarchicalLocationSelector
            country={searchCountry}
            state={searchState}
            city={searchCity}
            onChange={(c, s, ci) => {
              setSearchCountry(c)
              setSearchState(s)
              setSearchCity(ci)
            }}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <p className="text-slate-500">Carregando campanhas...</p>
        ) : campaigns.length === 0 ? (
          <p className="text-slate-500">
            Nenhuma campanha encontrada com os filtros selecionados.
          </p>
        ) : (
          campaigns.map((camp) => (
            <Card
              key={camp.id}
              className="hover:border-primary/30 transition-colors"
            >
              <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h4
                    className="font-bold text-lg text-slate-800 truncate"
                    title={camp.title}
                  >
                    {camp.title}
                  </h4>
                  <p className="text-sm text-slate-500 truncate">
                    Local: {camp.city || 'Todas as Cidades'} -{' '}
                    {camp.state || 'Todos os Estados'} -{' '}
                    {camp.country || 'Todos os Países'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Cliques: {camp.clicks || 0} | Views: {camp.views || 0}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <Badge
                    variant={camp.status === 'active' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {camp.status}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Priority Score:
                    </span>
                    <Input
                      type="number"
                      className="w-24 text-center font-bold text-primary"
                      defaultValue={camp.priority_score || 0}
                      onBlur={(e) =>
                        updatePriority(camp.id, parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
