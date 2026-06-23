import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { useLanguage } from '@/stores/LanguageContext'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function AdminPricingPage() {
  const { t } = useLanguage()
  const [pricingConfigs, setPricingConfigs] = useState<any[]>([])
  const [franchises, setFranchises] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<any>({
    entity_type: 'merchant',
    tier: 'small',
    price: '',
    franchise_id: 'general',
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: '',
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    const [pricesRes, franchisesRes] = await Promise.all([
      supabase
        .from('platform_pricing_configs')
        .select('*, franchises(name)')
        .order('created_at', { ascending: false }),
      supabase.from('franchises').select('id, name'),
    ])
    if (pricesRes.data) setPricingConfigs(pricesRes.data)
    if (franchisesRes.data) setFranchises(franchisesRes.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSave = async () => {
    const payload = {
      entity_type: formData.entity_type,
      tier: formData.tier,
      price: parseFloat(formData.price),
      franchise_id:
        formData.franchise_id === 'general' ? null : formData.franchise_id,
      valid_from: formData.valid_from
        ? new Date(formData.valid_from).toISOString()
        : new Date().toISOString(),
      valid_until: formData.valid_until
        ? new Date(formData.valid_until).toISOString()
        : null,
      environment: 'production',
    }

    let error
    if (editingId) {
      const res = await supabase
        .from('platform_pricing_configs')
        .update(payload)
        .eq('id', editingId)
      error = res.error
    } else {
      const res = await supabase
        .from('platform_pricing_configs')
        .insert(payload)
      error = res.error
    }

    if (error) {
      toast.error(error.message)
    } else {
      toast.success(t('common.success', 'Preço salvo com sucesso'))
      setIsModalOpen(false)
      fetchData()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza?')) return
    const { error } = await supabase
      .from('platform_pricing_configs')
      .delete()
      .eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success(t('common.success', 'Removido com sucesso'))
      fetchData()
    }
  }

  const generalPrices = pricingConfigs.filter((p) => !p.franchise_id)
  const franchisePrices = pricingConfigs.filter((p) => p.franchise_id)

  const PriceTable = ({ data }: { data: any[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tipo</TableHead>
          <TableHead>Nível (Tier)</TableHead>
          <TableHead>Preço</TableHead>
          <TableHead>Vigência</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((p) => (
          <TableRow key={p.id}>
            <TableCell>
              <Badge variant="outline">
                {p.entity_type === 'merchant' ? 'Lojista' : 'Afiliado'}
              </Badge>
            </TableCell>
            <TableCell className="capitalize">{p.tier}</TableCell>
            <TableCell className="font-medium text-green-600">
              {formatCurrency(p.price)}
            </TableCell>
            <TableCell className="text-xs text-slate-500">
              {formatDate(p.valid_from)} até{' '}
              {p.valid_until ? formatDate(p.valid_until) : 'Indeterminado'}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setEditingId(p.id)
                  setFormData({
                    entity_type: p.entity_type,
                    tier: p.tier,
                    price: p.price.toString(),
                    franchise_id: p.franchise_id || 'general',
                    valid_from: p.valid_from ? p.valid_from.split('T')[0] : '',
                    valid_until: p.valid_until
                      ? p.valid_until.split('T')[0]
                      : '',
                  })
                  setIsModalOpen(true)
                }}
              >
                <Edit2 className="w-4 h-4 text-slate-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(p.id)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {data.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-center text-muted-foreground py-6"
            >
              Nenhum registro encontrado.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Gestão de Mensalidades (Pricing)
          </h2>
          <p className="text-muted-foreground">
            Configure os preços de manutenção para lojistas e afiliados.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingId(null)
            setFormData({
              entity_type: 'merchant',
              tier: 'small',
              price: '',
              franchise_id: 'general',
              valid_from: new Date().toISOString().split('T')[0],
              valid_until: '',
            })
            setIsModalOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Preço
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">Preços Gerais</TabsTrigger>
          <TabsTrigger value="franchises">Preços por Franquia</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tabela Geral</CardTitle>
              <CardDescription>
                Preços aplicados quando não há regra específica para a franquia.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PriceTable data={generalPrices} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="franchises" className="mt-4">
          {Object.entries(
            franchisePrices.reduce(
              (acc, curr) => {
                const fName = curr.franchises?.name || 'Desconhecida'
                if (!acc[fName]) acc[fName] = []
                acc[fName].push(curr)
                return acc
              },
              {} as Record<string, any[]>,
            ),
          ).map(([franchiseName, items]) => (
            <Card key={franchiseName} className="mb-4">
              <CardHeader className="py-4">
                <CardTitle className="text-lg">{franchiseName}</CardTitle>
              </CardHeader>
              <CardContent>
                <PriceTable data={items} />
              </CardContent>
            </Card>
          ))}
          {franchisePrices.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                Nenhum preço específico por franquia configurado.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Preço' : 'Novo Preço'}
            </DialogTitle>
            <DialogDescription>
              Configure as regras e valores da mensalidade.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Entidade</Label>
                <Select
                  value={formData.entity_type}
                  onValueChange={(v) =>
                    setFormData({ ...formData, entity_type: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="merchant">Lojista</SelectItem>
                    <SelectItem value="affiliate">Afiliado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nível (Porte)</Label>
                <Select
                  value={formData.tier}
                  onValueChange={(v) => setFormData({ ...formData, tier: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Pequeno</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="large">Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Valor Mensal (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Escopo (Franquia)</Label>
              <Select
                value={formData.franchise_id}
                onValueChange={(v) =>
                  setFormData({ ...formData, franchise_id: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">
                    Geral (Todas as Franquias)
                  </SelectItem>
                  {franchises.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Válido a partir de</Label>
                <Input
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) =>
                    setFormData({ ...formData, valid_from: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Válido até (Opcional)</Label>
                <Input
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) =>
                    setFormData({ ...formData, valid_until: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
