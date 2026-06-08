import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { useEnvironment } from '@/hooks/use-environment'

export function AdPricingTab() {
  const [pricing, setPricing] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { environment } = useEnvironment()

  const [formData, setFormData] = useState({
    placement: '',
    billing_type: 'fixed',
    price: '',
    duration_days: '30',
  })

  useEffect(() => {
    fetchPricing()
  }, [])

  const fetchPricing = async () => {
    const { data } = await supabase
      .from('ad_pricing')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setPricing(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('ad_pricing').insert([
      {
        placement: formData.placement,
        billing_type: formData.billing_type,
        price: parseFloat(formData.price),
        duration_days: parseInt(formData.duration_days),
        environment: environment || 'production',
      },
    ])

    setLoading(false)
    if (error) {
      toast.error('Erro ao adicionar preço: ' + error.message)
    } else {
      toast.success('Preço configurado com sucesso')
      setFormData({
        placement: '',
        billing_type: 'fixed',
        price: '',
        duration_days: '30',
      })
      fetchPricing()
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('ad_pricing').delete().eq('id', id)
    if (error) {
      toast.error('Erro ao deletar: ' + error.message)
    } else {
      toast.success('Removido com sucesso')
      fetchPricing()
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold mb-4 text-slate-800">
          Adicionar Configuração de Preços
        </h3>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
        >
          <div className="space-y-2">
            <Label>Posicionamento (Placement)</Label>
            <Input
              required
              value={formData.placement}
              onChange={(e) =>
                setFormData({ ...formData, placement: e.target.value })
              }
              placeholder="Ex: home_hero, sidebar"
            />
          </div>
          <div className="space-y-2">
            <Label>Tipo de Cobrança</Label>
            <select
              required
              className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.billing_type}
              onChange={(e) =>
                setFormData({ ...formData, billing_type: e.target.value })
              }
            >
              <option value="fixed">Fixo (Premium)</option>
              <option value="cpc">CPC (Custo por Clique)</option>
              <option value="cpa">CPA (Custo por Aquisição)</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Preço (R$)</Label>
            <Input
              required
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label>Duração (Dias)</Label>
            <Input
              type="number"
              value={formData.duration_days}
              onChange={(e) =>
                setFormData({ ...formData, duration_days: e.target.value })
              }
              placeholder="30"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Adicionar
          </Button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Posicionamento</TableHead>
              <TableHead>Tipo de Cobrança</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead className="w-16">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pricing.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.placement}</TableCell>
                <TableCell className="uppercase">{p.billing_type}</TableCell>
                <TableCell className="font-semibold text-emerald-600">
                  R$ {p.price.toFixed(2)}
                </TableCell>
                <TableCell>
                  {p.duration_days ? `${p.duration_days} dias` : '-'}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(p.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {pricing.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-8"
                >
                  Nenhuma configuração de preço definida.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
