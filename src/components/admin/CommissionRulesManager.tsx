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
import { Trash2, Plus, Percent } from 'lucide-react'
import { CommissionRule } from '@/lib/types'

export function CommissionRulesManager() {
  const [rules, setRules] = useState<CommissionRule[]>([])
  const [franchises, setFranchises] = useState<{ id: string; name: string }[]>(
    [],
  )
  const [loading, setLoading] = useState(true)

  const [serviceType, setServiceType] = useState<
    'publicidade' | 'impulsionamento'
  >('publicidade')
  const [franchiseId, setFranchiseId] = useState<string>('global')
  const [percentage, setPercentage] = useState<string>('10')
  const [validFrom, setValidFrom] = useState<string>('')
  const [validUntil, setValidUntil] = useState<string>('')

  const fetchRules = async () => {
    try {
      const { data, error } = await supabase
        .from('commission_rules')
        .select(
          `
          id,
          franchise_id,
          service_type,
          percentage,
          valid_from,
          valid_until,
          created_at,
          franchises ( name )
        `,
        )
        .order('valid_from', { ascending: false })

      if (error) throw error

      setRules(
        (data || []).map((r: any) => ({
          id: r.id,
          franchiseId: r.franchise_id,
          serviceType: r.service_type,
          percentage: Number(r.percentage),
          validFrom: r.valid_from,
          validUntil: r.valid_until,
          createdAt: r.created_at,
          franchiseName: r.franchises?.name || 'Global',
        })),
      )
    } catch (e: any) {
      toast.error('Erro ao buscar regras: ' + e.message)
    }
  }

  const fetchFranchises = async () => {
    try {
      const { data, error } = await supabase
        .from('franchises')
        .select('id, name')
        .order('name')
      if (error) throw error
      setFranchises(data || [])
    } catch (e: any) {
      toast.error('Erro ao buscar franquias')
    }
  }

  useEffect(() => {
    Promise.all([fetchRules(), fetchFranchises()]).finally(() =>
      setLoading(false),
    )
  }, [])

  const handleAddRule = async () => {
    if (!validFrom) {
      toast.error('A Data de Início é obrigatória')
      return
    }

    const pct = parseFloat(percentage)
    if (isNaN(pct) || pct < 0 || pct > 100) {
      toast.error('A porcentagem deve estar entre 0 e 100')
      return
    }

    if (validUntil && new Date(validFrom) >= new Date(validUntil)) {
      toast.error('A Data de Fim deve ser posterior à Data de Início')
      return
    }

    const actualFranchiseId = franchiseId === 'global' ? null : franchiseId

    const overlapping = rules.some((r) => {
      if (r.serviceType !== serviceType) return false
      if ((r.franchiseId || null) !== actualFranchiseId) return false

      const start1 = new Date(validFrom).getTime()
      const end1 = validUntil ? new Date(validUntil).getTime() : Infinity
      const start2 = new Date(r.validFrom).getTime()
      const end2 = r.validUntil ? new Date(r.validUntil).getTime() : Infinity

      return start1 < end2 && start2 < end1
    })

    if (overlapping) {
      toast.error(
        'Já existe uma regra conflitante nesse período para este serviço e franquia.',
      )
      return
    }

    try {
      const { error } = await supabase.from('commission_rules').insert({
        franchise_id: actualFranchiseId,
        service_type: serviceType,
        percentage: pct,
        valid_from: new Date(validFrom).toISOString(),
        valid_until: validUntil ? new Date(validUntil).toISOString() : null,
      })

      if (error) throw error

      toast.success('Regra adicionada com sucesso')
      setValidFrom('')
      setValidUntil('')
      setPercentage('10')
      fetchRules()
    } catch (e: any) {
      toast.error('Erro ao salvar regra: ' + e.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir esta regra?')) return
    try {
      const { error } = await supabase
        .from('commission_rules')
        .delete()
        .eq('id', id)
      if (error) throw error
      toast.success('Regra excluída com sucesso')
      fetchRules()
    } catch (e: any) {
      toast.error('Erro ao excluir regra: ' + e.message)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Carregando gerenciador de comissões...
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-800">
          Nova Regra de Comissão
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Defina as taxas de comissão para Publicidade ou Impulsionamento de
          ofertas.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="space-y-2">
            <Label>Tipo de Serviço</Label>
            <Select
              value={serviceType}
              onValueChange={(val: any) => setServiceType(val)}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="publicidade">Publicidade</SelectItem>
                <SelectItem value="impulsionamento">Impulsionamento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Franquia</Label>
            <Select value={franchiseId} onValueChange={setFranchiseId}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Todas (Global)</SelectItem>
                {franchises.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Porcentagem (%)</Label>
            <div className="relative">
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={percentage}
                onChange={(e) => {
                  let val = parseFloat(e.target.value)
                  if (val < 0) val = 0
                  if (val > 100) val = 100
                  setPercentage(e.target.value ? String(val) : '')
                }}
                className="bg-white pl-8"
              />
              <Percent className="w-4 h-4 absolute left-2.5 top-3 text-slate-400" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Data de Início</Label>
            <Input
              type="date"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label>Data de Fim (Opcional)</Label>
            <Input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="bg-white"
            />
          </div>

          <div className="md:col-span-5 flex justify-end mt-2">
            <Button onClick={handleAddRule}>
              <Plus className="w-4 h-4 mr-2" /> Adicionar Regra
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Regras Ativas e Agendadas
        </h2>
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Serviço</TableHead>
                <TableHead>Franquia</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-slate-500"
                  >
                    Nenhuma regra de comissão configurada.
                  </TableCell>
                </TableRow>
              ) : (
                rules.map((rule) => {
                  const isActive =
                    new Date(rule.validFrom) <= new Date() &&
                    (!rule.validUntil ||
                      new Date(rule.validUntil) >= new Date())

                  return (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium capitalize">
                        {rule.serviceType}
                        {isActive && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                            Ativa
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{rule.franchiseName || 'Global'}</TableCell>
                      <TableCell>{rule.percentage}%</TableCell>
                      <TableCell className="text-sm">
                        De: {new Date(rule.validFrom).toLocaleDateString()}{' '}
                        <br />
                        Até:{' '}
                        {rule.validUntil
                          ? new Date(rule.validUntil).toLocaleDateString()
                          : 'Indeterminado'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(rule.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
