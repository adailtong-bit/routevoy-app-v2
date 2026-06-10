import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Calendar, Rocket, Users, Target, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function MerchantPreLaunch() {
  const { user } = useAuth()
  const companyId = user?.id

  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    launchDate: '',
    earlyBirdDiscount: '',
    goal: '',
  })

  const fetchCampaigns = async () => {
    if (!companyId) return
    setLoading(true)
    const { data } = await supabase
      .from('crm_campaigns')
      .select('*')
      .eq('company_id', companyId)
      .eq('channel', 'pre_launch')
      .order('created_at', { ascending: false })

    if (data) setCampaigns(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchCampaigns()
  }, [companyId])

  const handleCreate = async () => {
    if (!formData.name || !formData.launchDate) {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    const { error } = await supabase.from('crm_campaigns').insert([
      {
        name: formData.name,
        content: formData.description,
        channel: 'pre_launch',
        company_id: companyId,
        scheduled_at: new Date(formData.launchDate).toISOString(),
        status: 'active',
        geographic_scope: formData.earlyBirdDiscount,
        grouping_identifier: formData.goal,
      },
    ])

    if (error) {
      toast.error('Erro ao criar campanha')
      console.error(error)
    } else {
      toast.success('Campanha de pré-lançamento criada com sucesso!')
      setFormData({
        name: '',
        description: '',
        launchDate: '',
        earlyBirdDiscount: '',
        goal: '',
      })
      fetchCampaigns()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta campanha de pré-lançamento?')) return
    const { error } = await supabase.from('crm_campaigns').delete().eq('id', id)
    if (!error) {
      toast.success('Campanha excluída')
      fetchCampaigns()
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
          <Rocket className="w-6 h-6 text-primary" /> Campanhas de
          Pré-lançamento
        </h2>
        <p className="text-slate-500 text-sm">
          Crie expectativa e capture leads antes do lançamento oficial de seus
          produtos ou serviços. Interface restaurada.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Nova Campanha</CardTitle>
            <CardDescription>
              Configure os detalhes do seu pré-lançamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Campanha *</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Lançamento Coleção Verão"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição / Benefícios</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descreva o que os clientes ganham ao se inscrever antecipadamente"
                className="resize-none h-24"
              />
            </div>
            <div className="space-y-2">
              <Label>Data de Lançamento *</Label>
              <Input
                type="datetime-local"
                value={formData.launchDate}
                onChange={(e) =>
                  setFormData({ ...formData, launchDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Incentivo Early-Bird (Desconto)</Label>
              <Input
                value={formData.earlyBirdDiscount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    earlyBirdDiscount: e.target.value,
                  })
                }
                placeholder="Ex: 30% OFF nas primeiras 24h"
              />
            </div>
            <div className="space-y-2">
              <Label>Meta de Leads</Label>
              <Input
                type="number"
                value={formData.goal}
                onChange={(e) =>
                  setFormData({ ...formData, goal: e.target.value })
                }
                placeholder="Ex: 500"
              />
            </div>
            <Button
              onClick={handleCreate}
              className="w-full mt-4"
              disabled={!formData.name || !formData.launchDate}
            >
              <Rocket className="w-4 h-4 mr-2" /> Iniciar Pré-lançamento
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Campanhas Ativas</CardTitle>
            <CardDescription>
              Acompanhe o engajamento das suas campanhas de pré-lançamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-center py-8">
                Carregando...
              </p>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed">
                <Rocket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">
                  Nenhuma campanha de pré-lançamento
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  Crie sua primeira campanha para começar a captar leads.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((camp) => {
                  const isActive =
                    camp.scheduled_at &&
                    new Date(camp.scheduled_at) > new Date()
                  return (
                    <div
                      key={camp.id}
                      className="border rounded-lg p-4 bg-white shadow-sm flex flex-col sm:flex-row justify-between gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-800">
                            {camp.name}
                          </h3>
                          <Badge variant={isActive ? 'default' : 'secondary'}>
                            {isActive ? 'Em Captação' : 'Lançado'}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">
                          {camp.content}
                        </p>

                        <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500">
                          {camp.scheduled_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(camp.scheduled_at).toLocaleDateString(
                                'pt-BR',
                              )}{' '}
                              as{' '}
                              {new Date(camp.scheduled_at).toLocaleTimeString(
                                'pt-BR',
                                { hour: '2-digit', minute: '2-digit' },
                              )}
                            </span>
                          )}
                          {camp.geographic_scope && (
                            <span className="flex items-center gap-1 text-emerald-600">
                              <Target className="w-3.5 h-3.5" />
                              Incentivo: {camp.geographic_scope}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-blue-600">
                            <Users className="w-3.5 h-3.5" />
                            {camp.redemptions || 0} inscritos{' '}
                            {camp.grouping_identifier
                              ? `/ Meta: ${camp.grouping_identifier}`
                              : ''}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col gap-2 shrink-0 items-end sm:items-stretch">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto"
                        >
                          Ver Leads
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive sm:ml-auto"
                          onClick={() => handleDelete(camp.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
