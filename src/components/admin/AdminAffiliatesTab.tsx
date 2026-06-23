import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import {
  DollarSign,
  Users,
  Wallet,
  Plus,
  Activity,
  RefreshCw,
  Edit2,
  Trash2,
  LayoutGrid,
} from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/stores/LanguageContext'
import { REGIONS } from '@/lib/locationData'
import { formatCurrency, formatDate } from '@/lib/utils'

import { CreateAffiliateModal } from './CreateAffiliateModal'

export function AdminAffiliatesTab({ franchiseId }: { franchiseId?: string }) {
  const { t } = useLanguage()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [affiliates, setAffiliates] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [platforms, setPlatforms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [editingAffiliate, setEditingAffiliate] = useState<any>(null)
  const [editPlatformComms, setEditPlatformComms] = useState<
    Record<string, number>
  >({})
  const [pricingConfigs, setPricingConfigs] = useState<any[]>([])

  const [newPlatName, setNewPlatName] = useState('')
  const [newPlatComm, setNewPlatComm] = useState('10')

  const savedSettings = localStorage.getItem('system_settings')
  const settings = savedSettings ? JSON.parse(savedSettings) : {}
  const customRegions = settings.customRegions || []
  const ALL_REGIONS = Array.from(new Set([...REGIONS, ...customRegions]))

  const fetchData = async () => {
    setLoading(true)
    try {
      let affQuery = supabase
        .from('affiliate_partners')
        .select('*')
        .order('created_at', { ascending: false })

      if (franchiseId) {
        affQuery = affQuery.eq('franchise_id', franchiseId)
      }

      const { data: affData, error: affErr } = await affQuery
      if (affErr) throw affErr
      setAffiliates(affData || [])

      let txQuery = supabase
        .from('affiliate_transactions')
        .select('*, affiliate_partners(name)')
        .order('created_at', { ascending: false })

      if (franchiseId) {
        const affIds = (affData || []).map((a: any) => a.id)
        if (affIds.length > 0) {
          txQuery = txQuery.in('affiliate_id', affIds)
        } else {
          setTransactions([])
          const { data: platData, error: platErr } = await supabase
            .from('affiliate_platforms')
            .select('*')
            .order('created_at', { ascending: false })
          if (platErr) throw platErr
          setPlatforms(platData || [])
          return
        }
      }

      const { data: txData, error: txErr } = await txQuery
      if (txErr) throw txErr
      setTransactions(txData || [])

      const { data: platData, error: platErr } = await supabase
        .from('affiliate_platforms')
        .select('*')
        .order('created_at', { ascending: false })
      if (platErr) throw platErr
      setPlatforms(platData || [])

      const { data: pricingData } = await supabase
        .from('platform_pricing_configs')
        .select('*')
        .eq('entity_type', 'affiliate')
      if (pricingData) setPricingConfigs(pricingData)
    } catch (error: any) {
      toast.error(t('common.error', 'An error occurred: ') + error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleUpdateAffiliate = async () => {
    if (!editingAffiliate) return
    try {
      const { error } = await supabase
        .from('affiliate_partners')
        .update({
          status: editingAffiliate.status,
          commission_model: editingAffiliate.commission_model,
          commission_rate: parseFloat(editingAffiliate.commission_rate) || 0,
          monthly_fee: parseFloat(editingAffiliate.monthly_fee) || 0,
          platform_commissions: editPlatformComms,
          pricing_config_id: editingAffiliate.pricing_config_id || null,
        } as any)
        .eq('id', editingAffiliate.id)

      if (error) throw error
      toast.success(t('common.success', 'Regras do afiliado atualizadas!'))
      setEditingAffiliate(null)
      fetchData()
    } catch (error: any) {
      toast.error(t('common.error', 'An error occurred: ') + error.message)
    }
  }

  const handleDeleteAffiliate = async (id: string) => {
    if (
      !confirm(
        t(
          'common.delete_confirm',
          'Are you sure you want to delete this affiliate?',
        ),
      )
    )
      return
    try {
      const { error } = await supabase
        .from('affiliate_partners')
        .delete()
        .eq('id', id)
      if (error) throw error
      toast.success(t('common.success', 'Afiliado removido!'))
      fetchData()
    } catch (error: any) {
      toast.error(t('common.error', 'An error occurred: ') + error.message)
    }
  }

  const handleAddPlatform = async () => {
    if (!newPlatName) return
    try {
      const { error } = await supabase.from('affiliate_platforms').insert({
        name: newPlatName,
        base_commission_rate: parseFloat(newPlatComm) || 0,
      } as any)
      if (error) throw error
      toast.success(
        t(
          'admin.affiliates.platform_added',
          'Plataforma adicionada com sucesso!',
        ),
      )
      setNewPlatName('')
      fetchData()
    } catch (e: any) {
      toast.error(
        t('admin.affiliates.platform_error', 'Erro ao adicionar plataforma: ') +
          e.message,
      )
    }
  }

  const handleDeletePlatform = async (id: string) => {
    if (
      !confirm(
        t(
          'admin.affiliates.delete_platform_confirm',
          'Deseja remover esta plataforma?',
        ),
      )
    )
      return
    try {
      const { error } = await supabase
        .from('affiliate_platforms')
        .delete()
        .eq('id', id)
      if (error) throw error
      toast.success(
        t('admin.affiliates.platform_removed', 'Plataforma removida!'),
      )
      fetchData()
    } catch (error: any) {
      toast.error(t('common.error', 'Erro: ') + error.message)
    }
  }

  const totalPlatformFee = transactions.reduce(
    (acc, curr) => acc + (Number(curr.platform_fee) || 0),
    0,
  )
  const totalSales = transactions.reduce(
    (acc, curr) => acc + (Number(curr.sale_amount) || 0),
    0,
  )

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex justify-between">
              {t('admin.affiliates.active_sub', 'Afiliados Parceiros Ativos')}
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {affiliates.filter((a) => a.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t(
                'admin.affiliates.traffic_partners',
                'Parceiros gerando tráfego qualificado',
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex justify-between">
              {t('admin.affiliates.sales_generated', 'Vendas Geradas')}
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalSales)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t(
                'admin.affiliates.total_volume',
                'Volume total (GMV) via links',
              )}
            </p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800 flex justify-between">
              {t('admin.affiliates.platform_profit', 'Lucro da Plataforma')}
              <Wallet className="h-4 w-4 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(totalPlatformFee)}
            </div>
            <p className="text-xs text-green-600">
              {t(
                'admin.affiliates.platform_fee',
                'Taxa de plataforma + Mensalidades',
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="partners" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="partners" className="gap-2">
            <Users className="w-4 h-4" />{' '}
            {t('admin.affiliates.partners_rules', 'Parceiros & Regras')}
          </TabsTrigger>
          <TabsTrigger value="platforms" className="gap-2">
            <LayoutGrid className="w-4 h-4" />{' '}
            {t('admin.nav.platforms', 'Plataformas')}
          </TabsTrigger>
          <TabsTrigger value="transactions" className="gap-2">
            <DollarSign className="w-4 h-4" />{' '}
            {t('admin.affiliates.audit', 'Auditoria de Split')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="partners" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {t(
                'admin.affiliates.manage_sub',
                'Gestão de Afiliados Parceiros',
              )}
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchData}>
                <RefreshCw className="w-4 h-4 mr-2" />{' '}
                {t('common.update', 'Atualizar')}
              </Button>
              <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />{' '}
                {t('admin.affiliates.link_affiliate', 'Adicionar Afiliado')}
              </Button>
            </div>
          </div>
          <Card>
            <div className="w-full overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="p-4 font-medium text-slate-600">
                      {t('admin.affiliates.affiliate_name', 'Afiliado')}
                    </th>
                    <th className="p-4 font-medium text-slate-600">
                      {t('admin.affiliates.commission_model', 'Modelo')}
                    </th>
                    <th className="p-4 font-medium text-slate-600">
                      {t('admin.affiliates.your_share', 'Sua Parte')}
                    </th>
                    <th className="p-4 font-medium text-slate-600">
                      {t('common.status', 'Status')}
                    </th>
                    <th className="p-4 font-medium text-slate-600 text-right">
                      {t('common.actions', 'Ações')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {affiliates.map((aff) => (
                    <tr key={aff.id} className="border-b hover:bg-slate-50/50">
                      <td className="p-4 font-medium">
                        {aff.name}
                        <div className="text-xs text-muted-foreground font-normal flex flex-col gap-0.5 mt-0.5">
                          <span>{aff.email}</span>
                          {aff.tax_id && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded w-fit font-mono">
                              Doc: {aff.tax_id}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {aff.commission_model === 'percentage' ? (
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {t(
                              'admin.affiliates.commission_split',
                              'Split de Comissão',
                            )}
                          </Badge>
                        ) : aff.commission_model === 'monthly' ? (
                          <Badge
                            variant="outline"
                            className="bg-purple-50 text-purple-700 border-purple-200"
                          >
                            {t(
                              'admin.affiliates.saas_monthly',
                              'SaaS (Mensal)',
                            )}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs italic">
                            {t(
                              'admin.affiliates.not_configured',
                              'Não configurado',
                            )}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-green-600 font-semibold">
                        {aff.commission_model === 'percentage'
                          ? `${aff.commission_rate}%`
                          : aff.commission_model === 'monthly'
                            ? `${formatCurrency(aff.monthly_fee)}/mês`
                            : '-'}
                      </td>
                      <td className="p-4">
                        <Badge
                          className={`cursor-pointer ${aff.status === 'active' ? 'bg-green-100 text-green-800 border-none' : 'bg-amber-100 text-amber-800 border-none'}`}
                          onClick={() => {
                            setEditingAffiliate(aff)
                            setEditPlatformComms(aff.platform_commissions || {})
                          }}
                        >
                          {aff.status === 'active'
                            ? t('common.active', 'Ativo')
                            : aff.status === 'pending'
                              ? t('common.pending', 'Pendente')
                              : t('admin.affiliates.suspended', 'Suspenso')}
                        </Badge>
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingAffiliate(aff)
                            setEditPlatformComms(aff.platform_commissions || {})
                          }}
                        >
                          <Edit2 className="w-4 h-4 text-slate-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAffiliate(aff.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {affiliates.length === 0 && !loading && (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-4 text-center text-muted-foreground"
                      >
                        {t(
                          'admin.approvals.no_pending_affiliates',
                          'Nenhum afiliado registrado.',
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {t('admin.nav.platforms', 'Plataformas de Afiliados')}
              </CardTitle>
              <CardDescription>
                {t(
                  'affiliate.platforms.desc',
                  'Cadastre as redes (ex: Amazon, Shopee) que os afiliados parceiros poderão utilizar.',
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-end gap-4 bg-slate-50 p-4 rounded-lg border">
                <div className="space-y-2 flex-1">
                  <Label>
                    {t('admin.affiliates.platform_name', 'Nome da Plataforma')}
                  </Label>
                  <Input
                    value={newPlatName}
                    onChange={(e) => setNewPlatName(e.target.value)}
                    placeholder="Ex: Mercado Livre"
                  />
                </div>
                <div className="space-y-2 w-full sm:w-32">
                  <Label>
                    {t('admin.affiliates.base_commission', 'Comissão Base (%)')}
                  </Label>
                  <Input
                    type="number"
                    value={newPlatComm}
                    onChange={(e) => setNewPlatComm(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleAddPlatform}
                  className="w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />{' '}
                  {t('common.add', 'Adicionar')}
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="p-4 font-medium text-slate-600">
                        {t('admin.affiliates.platform', 'Plataforma')}
                      </th>
                      <th className="p-4 font-medium text-slate-600 text-center">
                        {t('admin.affiliates.base_commission', 'Comissão Base')}
                      </th>
                      <th className="p-4 font-medium text-slate-600 text-center">
                        {t('common.status', 'Status')}
                      </th>
                      <th className="p-4 font-medium text-slate-600 text-right">
                        {t('common.actions', 'Ações')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {platforms.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-slate-50/50">
                        <td className="p-4 font-medium text-slate-800">
                          {p.name}
                        </td>
                        <td className="p-4 text-center text-green-600 font-semibold">
                          {p.base_commission_rate}%
                        </td>
                        <td className="p-4 text-center">
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            {t('common.active', 'Ativo')}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePlatform(p.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {platforms.length === 0 && !loading && (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-4 text-center text-muted-foreground"
                        >
                          {t(
                            'admin.affiliates.no_platforms',
                            'Nenhuma plataforma cadastrada.',
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <div className="w-full overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="p-4 font-medium text-slate-600">
                      {t('common.date', 'Data')}
                    </th>
                    <th className="p-4 font-medium text-slate-600">
                      {t(
                        'admin.affiliates.product_partner',
                        'Produto / Parceiro',
                      )}
                    </th>
                    <th className="p-4 font-medium text-slate-600 text-right">
                      {t('admin.affiliates.total_sale', 'Venda Total')}
                    </th>
                    <th className="p-4 font-bold text-green-700 text-right">
                      {t('admin.affiliates.your_profit', 'Seu Lucro (Fee)')}
                    </th>
                    <th className="p-4 font-medium text-slate-600 text-center">
                      {t('common.status', 'Status')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b hover:bg-slate-50/50">
                      <td className="p-4 text-muted-foreground">
                        {formatDate(tx.created_at)}
                      </td>
                      <td className="p-4 font-medium text-slate-700">
                        {tx.product_name}
                        <div className="text-xs text-muted-foreground font-normal">
                          {tx.affiliate_partners?.name || 'Desconhecido'}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        {formatCurrency(tx.sale_amount)}
                      </td>
                      <td className="p-4 text-right font-bold text-green-600 bg-green-50/30">
                        +{formatCurrency(tx.platform_fee)}
                      </td>
                      <td className="p-4 text-center">
                        <Badge
                          variant="outline"
                          className={
                            tx.status === 'paid'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }
                        >
                          {tx.status === 'paid'
                            ? t('common.paid', 'Pago')
                            : t('common.pending', 'Pendente')}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && !loading && (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-4 text-center text-muted-foreground"
                      >
                        {t(
                          'admin.affiliates.no_transactions',
                          'Nenhuma transação registrada.',
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {editingAffiliate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <CardHeader className="bg-slate-50 border-b pb-4">
              <CardTitle>
                {t('admin.affiliates.edit_rules', 'Editar Regras')}:{' '}
                {editingAffiliate.name}
              </CardTitle>
              <CardDescription>
                {t(
                  'admin.affiliates.edit_desc',
                  'Ajuste aprovação e configure as comissões específicas por plataforma para este parceiro.',
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label>
                  {t('admin.affiliates.account_status', 'Status da Conta')}
                </Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                  value={editingAffiliate.status}
                  onChange={(e) =>
                    setEditingAffiliate({
                      ...editingAffiliate,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="pending">
                    {t(
                      'admin.affiliates.pending_approval',
                      'Pendente (Aguardando)',
                    )}
                  </option>
                  <option value="active">
                    {t('admin.affiliates.active_released', 'Ativo (Aprovado)')}
                  </option>
                  <option value="suspended">
                    {t('admin.affiliates.suspended', 'Suspenso')}
                  </option>
                </select>
              </div>

              {editingAffiliate.commission_model === 'monthly' && (
                <div className="space-y-2 mt-4">
                  <Label>Plano de Preço (Mensalidade)</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                    value={editingAffiliate.pricing_config_id || 'custom'}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === 'custom') {
                        setEditingAffiliate({
                          ...editingAffiliate,
                          pricing_config_id: null,
                        })
                        return
                      }
                      const conf = pricingConfigs.find((c) => c.id === val)
                      if (conf) {
                        setEditingAffiliate({
                          ...editingAffiliate,
                          pricing_config_id: conf.id,
                          monthly_fee: conf.price,
                        })
                      }
                    }}
                  >
                    <option value="custom">Personalizado / Manual</option>
                    {pricingConfigs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.tier} - R$ {c.price}
                      </option>
                    ))}
                  </select>
                  {!editingAffiliate.pricing_config_id && (
                    <Input
                      type="number"
                      className="mt-2"
                      placeholder="Valor Mensalidade"
                      value={editingAffiliate.monthly_fee}
                      onChange={(e) =>
                        setEditingAffiliate({
                          ...editingAffiliate,
                          monthly_fee: e.target.value,
                        })
                      }
                    />
                  )}
                </div>
              )}

              <div className="space-y-4 pt-4 border-t">
                <div>
                  <Label className="text-base font-semibold text-slate-800">
                    {t(
                      'admin.affiliates.platform_commissions',
                      'Comissões por Plataforma (%)',
                    )}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t(
                      'admin.affiliates.platform_commissions_desc',
                      'Defina comissões exclusivas para este parceiro. Se em branco, usa a regra base.',
                    )}
                  </p>
                </div>

                {platforms
                  .filter((p) => p.status === 'active')
                  .map((plat) => (
                    <div
                      key={plat.id}
                      className="flex items-center justify-between gap-4 bg-slate-50 p-3 rounded-lg border"
                    >
                      <Label className="flex-1 text-sm">
                        {plat.name}{' '}
                        <span className="text-xs text-muted-foreground block font-normal">
                          Base: {plat.base_commission_rate}%
                        </span>
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          className="w-20 text-right h-9"
                          placeholder={plat.base_commission_rate.toString()}
                          value={
                            editPlatformComms[plat.name] !== undefined
                              ? editPlatformComms[plat.name]
                              : ''
                          }
                          onChange={(e) => {
                            const val = e.target.value
                            setEditPlatformComms((prev) => {
                              const next = { ...prev }
                              if (val === '') delete next[plat.name]
                              else next[plat.name] = parseFloat(val)
                              return next
                            })
                          }}
                        />
                        <span className="text-sm font-medium text-slate-500">
                          %
                        </span>
                      </div>
                    </div>
                  ))}
                {platforms.length === 0 && (
                  <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                    {t(
                      'admin.affiliates.no_platforms_active',
                      'Nenhuma plataforma cadastrada no painel.',
                    )}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3 bg-slate-50 border-t pt-4 mt-2">
              <Button variant="ghost" onClick={() => setEditingAffiliate(null)}>
                {t('common.cancel', 'Cancelar')}
              </Button>
              <Button onClick={handleUpdateAffiliate}>
                {t('common.save', 'Salvar Alterações')}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      <CreateAffiliateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchData}
        franchiseId={franchiseId}
      />
    </div>
  )
}
