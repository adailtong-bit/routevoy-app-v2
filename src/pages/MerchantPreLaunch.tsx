import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useLanguage } from '@/stores/LanguageContext'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, Rocket } from 'lucide-react'
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
import { toast } from 'sonner'
import { useCouponStore } from '@/stores/CouponContext'

export default function MerchantPreLaunch() {
  const { t } = useLanguage()
  const { user, companies } = useCouponStore()
  const { user: authUser } = useAuth()
  const [myCompany, setMyCompany] = useState<any>(null)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<any>({
    title: '',
    sharingGoal: '',
    rewardType: 'Desconto Composto',
    rewardValue: '',
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    const resolveCompany = async () => {
      const found =
        companies.find((c) => c.id === user?.companyId) || companies[0]
      if (found) {
        setMyCompany(found)
        return
      }
      if (authUser?.email) {
        const { data } = await supabase
          .from('merchants')
          .select('*')
          .eq('email', authUser.email)
          .maybeSingle()
        if (data) setMyCompany(data)
      }
    }
    resolveCompany()
  }, [companies, user, authUser])

  const fetchCampaigns = async () => {
    if (!myCompany) return
    setIsLoading(true)
    const { data } = await supabase
      .from('discovered_promotions')
      .select('*')
      .eq('promotion_model', 'pre_launch')
      .eq('company_id', myCompany.id)
      .order('created_at', { ascending: false })
    if (data) setCampaigns(data)
    setIsLoading(false)
  }

  useEffect(() => {
    if (myCompany) fetchCampaigns()
  }, [myCompany?.id])

  const handleOpen = (camp?: any) => {
    if (camp) {
      setEditingId(camp.id)
      setFormData({
        title: camp.title || '',
        sharingGoal: camp.engagement_threshold?.toString() || '',
        rewardType: camp.reward_type || 'Desconto Composto',
        rewardValue: camp.reward_value?.toString() || '',
      })
    } else {
      setEditingId(null)
      setFormData({
        title: '',
        sharingGoal: '',
        rewardType: 'Desconto Composto',
        rewardValue: '',
      })
    }
    setIsOpen(true)
  }

  const handleSave = async () => {
    if (!formData.title || !formData.sharingGoal || !formData.rewardValue) {
      return toast.error('Preencha todos os campos obrigatórios')
    }

    const payload = {
      title: formData.title,
      company_id: myCompany.id,
      promotion_model: 'pre_launch',
      enable_trigger: true,
      trigger_type: 'social_share',
      engagement_threshold: parseInt(formData.sharingGoal),
      reward_type: formData.rewardType,
      reward_value: parseFloat(formData.rewardValue),
      status: 'active',
      environment: 'production',
    }

    if (editingId) {
      const { error } = await supabase
        .from('discovered_promotions')
        .update(payload)
        .eq('id', editingId)
      if (error) toast.error('Erro ao atualizar')
      else toast.success('Atualizado com sucesso!')
    } else {
      const { error } = await supabase
        .from('discovered_promotions')
        .insert([payload])
      if (error) toast.error('Erro ao criar')
      else toast.success('Criado com sucesso!')
    }
    setIsOpen(false)
    fetchCampaigns()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza?')) return
    await supabase.from('discovered_promotions').delete().eq('id', id)
    toast.success('Excluído')
    fetchCampaigns()
  }

  if (!myCompany) return <div className="p-8">Carregando...</div>

  return (
    <div className="container py-8 px-4 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
            <Rocket className="h-6 w-6 text-primary" />
            Campanhas de Pré-lançamento
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Crie campanhas com metas de engajamento e recompensas ativadas
            automaticamente.
          </p>
        </div>
        <Button
          onClick={() => handleOpen()}
          className="font-bold shadow-md hover:-translate-y-0.5 transition-transform"
        >
          <Plus className="w-4 h-4 mr-2" /> Criar Pré-lançamento
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto w-full custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Meta de Compartilhamento</th>
                <th className="px-6 py-4">Recompensa</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((camp) => (
                <tr
                  key={camp.id}
                  className="border-b last:border-0 hover:bg-slate-50/50"
                >
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {camp.title}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono bg-slate-100 px-2 py-1 rounded text-xs">
                      {camp.engagement_threshold} shares
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                      {camp.reward_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-emerald-600">
                    {camp.reward_type === 'Desconto Padrão' ||
                    camp.reward_type === 'Desconto Composto'
                      ? `${camp.reward_value}%`
                      : `R$ ${camp.reward_value}`}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpen(camp)}
                    >
                      <Edit className="w-4 h-4 mr-1" /> Editar
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      size="sm"
                      onClick={() => handleDelete(camp.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Excluir
                    </Button>
                  </td>
                </tr>
              ))}
              {campaigns.length === 0 && !isLoading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    Nenhuma campanha de pré-lançamento encontrada. Clique em
                    "Criar Pré-lançamento" para começar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Pré-lançamento' : 'Criar Pré-lançamento'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Ex: Lançamento Coleção Inverno"
              />
            </div>
            <div className="space-y-2">
              <Label>Meta de Compartilhamento *</Label>
              <Input
                type="number"
                value={formData.sharingGoal}
                onChange={(e) =>
                  setFormData({ ...formData, sharingGoal: e.target.value })
                }
                placeholder="Ex: 50"
              />
              <p className="text-xs text-muted-foreground">
                Número de compartilhamentos necessários para liberar a
                recompensa.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Recompensa a Conceder *</Label>
              <Select
                value={formData.rewardType}
                onValueChange={(v) =>
                  setFormData({ ...formData, rewardType: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Desconto Composto">
                    Desconto Composto
                  </SelectItem>
                  <SelectItem value="Desconto Padrão">
                    Desconto Padrão
                  </SelectItem>
                  <SelectItem value="Crédito na Loja">
                    Crédito na Loja
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor da Recompensa *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.rewardValue}
                onChange={(e) =>
                  setFormData({ ...formData, rewardValue: e.target.value })
                }
                placeholder="Ex: 20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
