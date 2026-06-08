import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { Trash2, Plus } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export function AdPricingManager() {
  const { role, user } = useAuth()
  const isAdmin =
    role === 'admin' ||
    role === 'super_admin' ||
    user?.email === 'adailtong@gmail.com'

  const [prices, setPrices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [placement, setPlacement] = useState('home_hero')
  const [billingType, setBillingType] = useState('fixed')
  const [durationDays, setDurationDays] = useState('7')
  const [price, setPrice] = useState('')

  const fetchPrices = async () => {
    try {
      const { data, error } = await supabase
        .from('ad_pricing')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setPrices(data || [])
    } catch (e: any) {
      toast.error('Erro ao buscar preços: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrices()
  }, [])

  const handleAddPricing = async () => {
    if (!isAdmin) return
    if (!price || isNaN(parseFloat(price))) {
      toast.error('Informe um valor de preço válido.')
      return
    }

    try {
      const { error } = await supabase.from('ad_pricing').insert({
        placement,
        billing_type: billingType,
        duration_days:
          billingType === 'fixed' && durationDays
            ? parseInt(durationDays, 10)
            : null,
        price: parseFloat(price),
        environment: 'production',
      })
      if (error) throw error
      toast.success('Preço configurado com sucesso')
      setPrice('')
      fetchPrices()
    } catch (e: any) {
      toast.error('Erro ao salvar configuração de preço: ' + e.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!isAdmin) return
    if (!confirm('Deseja excluir esta configuração de preço?')) return
    try {
      const { error } = await supabase.from('ad_pricing').delete().eq('id', id)
      if (error) throw error
      toast.success('Preço excluído com sucesso')
      fetchPrices()
    } catch (e: any) {
      toast.error('Erro ao excluir preço: ' + e.message)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Carregando tabela de preços...
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {isAdmin && (
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Nova Configuração
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="space-y-2">
              <Label>Placement (Espaço)</Label>
              <Select value={placement} onValueChange={setPlacement}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Publicidade
                    </SelectLabel>
                    <SelectItem value="home_hero">Home Hero</SelectItem>
                    <SelectItem value="offer_of_the_day">
                      Oferta do Dia
                    </SelectItem>
                    <SelectItem value="sponsored_push">
                      Push Notification
                    </SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-2">
                      Impulsionamento
                    </SelectLabel>
                    <SelectItem value="feed">Feed Principal</SelectItem>
                    <SelectItem value="search">Busca Patrocinada</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de Cobrança</Label>
              <Select value={billingType} onValueChange={setBillingType}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixo (Período)</SelectItem>
                  <SelectItem value="cpc">CPC (Custo por Clique)</SelectItem>
                  <SelectItem value="cpa">CPA (Custo por Aquisição)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Duração (Dias)</Label>
              <Input
                type="number"
                min="1"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                className="bg-white"
                disabled={billingType !== 'fixed'}
              />
            </div>
            <div className="space-y-2">
              <Label>Preço (R$)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-white"
                placeholder="0.00"
              />
            </div>
            <div className="md:col-span-1 flex justify-end">
              <Button onClick={handleAddPricing} className="w-full">
                <Plus className="w-4 h-4 mr-2" /> Adicionar
              </Button>
            </div>
          </div>
        </div>
      )}

      <div>
        {!isAdmin && (
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Tabela de Preços Atuais
          </h2>
        )}
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Espaço (Placement)</TableHead>
                <TableHead>Cobrança</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Preço</TableHead>
                {isAdmin && <TableHead className="text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {prices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isAdmin ? 5 : 4}
                    className="text-center py-8 text-slate-500"
                  >
                    Nenhum preço configurado.
                  </TableCell>
                </TableRow>
              ) : (
                prices.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium capitalize">
                      {p.placement === 'home_hero'
                        ? 'Home Hero (Publicidade)'
                        : p.placement === 'offer_of_the_day'
                          ? 'Oferta do Dia (Publicidade)'
                          : p.placement === 'sponsored_push'
                            ? 'Push Notification (Publicidade)'
                            : p.placement === 'feed'
                              ? 'Feed Principal (Impulsionamento)'
                              : p.placement === 'search'
                                ? 'Busca Patrocinada (Impulsionamento)'
                                : p.placement.replace(/_/g, ' ')}
                    </TableCell>
                    <TableCell className="uppercase">
                      {p.billing_type}
                    </TableCell>
                    <TableCell>
                      {p.billing_type === 'fixed'
                        ? `${p.duration_days} dias`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(p.price)}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(p.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
