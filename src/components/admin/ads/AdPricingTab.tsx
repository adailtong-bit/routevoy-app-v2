import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Trash, Plus } from 'lucide-react'

export function AdPricingTab() {
  const [pricing, setPricing] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    placement: '',
    billing_type: 'fixed',
    duration_days: 7,
    price: 0,
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
    setLoading(false)
  }

  const handleAdd = async () => {
    if (!form.placement || form.price <= 0) {
      toast.error('Preencha os campos obrigatórios com valores válidos')
      return
    }
    const { error } = await supabase.from('ad_pricing').insert([
      {
        placement: form.placement,
        billing_type: form.billing_type,
        duration_days: form.duration_days,
        price: form.price,
        environment: 'production',
      },
    ])
    if (error) {
      toast.error('Erro ao adicionar preço')
    } else {
      toast.success('Preço adicionado com sucesso')
      setForm({
        placement: '',
        billing_type: 'fixed',
        duration_days: 7,
        price: 0,
      })
      fetchPricing()
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('ad_pricing').delete().eq('id', id)
    if (error) {
      toast.error('Erro ao excluir')
    } else {
      toast.success('Excluído com sucesso')
      fetchPricing()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Pacote de Preço</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label>Pacote / Posicionamento</Label>
              <Input
                value={form.placement}
                onChange={(e) =>
                  setForm({ ...form, placement: e.target.value })
                }
                placeholder="Ex: Home Destaque"
              />
            </div>
            <div className="space-y-2">
              <Label>Dias de Duração</Label>
              <Input
                type="number"
                value={form.duration_days}
                onChange={(e) =>
                  setForm({ ...form, duration_days: parseInt(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Preço de Prateleira (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: parseFloat(e.target.value) })
                }
              />
            </div>
            <Button onClick={handleAdd} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pacotes Atuais</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500">Carregando pacotes...</p>
          ) : (
            <div className="space-y-4">
              {pricing.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center p-4 border rounded-lg hover:border-indigo-200 transition-colors"
                >
                  <div>
                    <h4 className="font-bold text-slate-800">{p.placement}</h4>
                    <p className="text-sm text-slate-500">
                      Duração: {p.duration_days} dias | Tipo: {p.billing_type}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-primary">
                      R$ {p.price?.toFixed(2)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(p.id)}
                      className="text-red-500 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {pricing.length === 0 && (
                <p className="text-slate-500 text-sm">
                  Nenhum pacote configurado.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
