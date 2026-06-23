import { useState, useMemo } from 'react'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Play, Settings2, FileText, AlertCircle, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import { extractContactInfo, formatAddress } from '@/lib/utils'

export function BillingGenerationTab({
  franchiseId,
}: {
  franchiseId?: string
}) {
  const { t } = useLanguage()
  const { generatePartnerInvoice, companies, partnerInvoices, franchises } =
    useCouponStore()
  const [period, setPeriod] = useState('last_month')
  const [targetType, setTargetType] = useState('all')

  const availableCompanies = useMemo(
    () =>
      franchiseId
        ? companies.filter((c) => c.franchiseId === franchiseId)
        : companies,
    [companies, franchiseId],
  )

  const { start, end } = useMemo(() => {
    const now = new Date()
    if (period === 'last_month') {
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59),
      }
    }
    if (period === 'current_month') {
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: now,
      }
    }
    // For custom, defaults to now
    return { start: now, end: now }
  }, [period])

  const pendingCompanies = useMemo(() => {
    const startMonth = start.getMonth()
    const startYear = start.getFullYear()
    return availableCompanies.filter((c) => {
      const hasInvoice = partnerInvoices.some((inv) => {
        const invDate = new Date(inv.periodStart)
        return (
          inv.companyId === c.id &&
          invDate.getMonth() === startMonth &&
          invDate.getFullYear() === startYear
        )
      })
      return !hasInvoice
    })
  }, [availableCompanies, partnerInvoices, start])

  const isBlocked =
    pendingCompanies.length === 0 && availableCompanies.length > 0

  const handleGenerate = () => {
    if (isBlocked) return
    if (pendingCompanies.length === 0) {
      toast.error(
        t(
          'franchisee.billing.no_partners_error',
          'Nenhum parceiro disponível para gerar faturas.',
        ),
      )
      return
    }

    const franchise = franchises.find((f) => f.id === franchiseId)

    const billerInfo = extractContactInfo(franchise)
    const billerName = franchise
      ? franchise.legalName || franchise.name
      : 'Deal Voy Platform'
    const billerTaxId = franchise?.taxId || '00.000.000/0001-00'
    const billerStateReg = franchise?.stateRegistration || 'Isento'
    const billerEmail = billerInfo.email || 'billing@dealvoy.com'
    const billerContact = billerInfo.name
    const billerPhone = billerInfo.phone
    const billerAddress = franchise
      ? formatAddress(franchise)
      : 'Sede da Plataforma'

    const paymentInstructions = franchise?.bankAccount
      ? `Banco: ${franchise.bankName || ''}\nAgência: ${franchise.bankAgency || ''}\nConta: ${franchise.bankAccount || ''}\nPIX: ${franchise.taxId || ''}`
      : 'PIX (Chave CNPJ): 00.000.000/0001-00\nPrazo para compensação: D+1'

    pendingCompanies.forEach((targetCompany) => {
      const customerInfo = extractContactInfo(targetCompany)
      const customerName = targetCompany.legalName || targetCompany.name
      const customerTaxId = targetCompany.taxId || ''
      const customerStateReg = targetCompany.stateRegistration || ''
      const customerEmail = customerInfo.email
      const customerContact = customerInfo.name
      const customerPhone = customerInfo.phone
      const customerAddress = formatAddress(targetCompany)

      const cpaCpcCommission = Math.floor(Math.random() * 2000) + 150
      let fixedFee = 0
      const isValidFee =
        targetCompany.monthlyFixedFee &&
        targetCompany.feeValidFrom &&
        new Date(targetCompany.feeValidFrom) <= end

      if (isValidFee) {
        fixedFee = Number(targetCompany.monthlyFixedFee) || 0
      }

      const totalCommission = cpaCpcCommission + fixedFee

      const items = []
      if (cpaCpcCommission > 0) {
        items.push({
          description: t(
            'admin.billing.cpa_cpc_commissions',
            'Comissões sobre Vendas (CPA/CPC)',
          ),
          amount: cpaCpcCommission,
          type: 'commission',
        })
      }
      if (fixedFee > 0) {
        items.push({
          description: `Monthly Maintenance Fee - ${targetCompany.businessSize || 'N/A'}`,
          amount: fixedFee,
          type: 'maintenance_fee',
          category: 'maintenance_fee',
        })
      }

      generatePartnerInvoice({
        franchiseId,
        companyId: targetCompany.id,
        totalCommission: totalCommission,
        totalCashback: Math.floor(Math.random() * 500) + 50,
        totalSales: Math.floor(Math.random() * 10000) + 1000,
        transactionCount: Math.floor(Math.random() * 100) + 10,
        status: 'draft',
        periodStart: start.toISOString(),
        periodEnd: end.toISOString(),
        targetType: 'merchant',
        items,
        billerName,
        billerTaxId,
        billerStateReg,
        billerEmail,
        billerAddress,
        billerContact,
        billerPhone,
        customerName,
        customerTaxId,
        customerStateReg,
        customerEmail,
        customerAddress,
        customerContact,
        customerPhone,
        paymentInstructions,
      })
    })

    toast.success(
      t(
        'franchisee.billing.generation_success',
        'Processo de geração concluído. Faturas adicionadas à Área de Preparação.',
      ),
    )
  }

  const currentFranchise = franchises.find((f) => f.id === franchiseId)
  const currentBillerInfo = extractContactInfo(currentFranchise)
  const currentBillerAddress = formatAddress(currentFranchise)

  return (
    <Card className="w-full min-w-0 overflow-hidden shadow-sm border-slate-200 max-w-4xl">
      <CardHeader className="min-w-0 pb-4 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <CardTitle className="truncate text-lg sm:text-xl text-slate-800">
              {t('franchisee.billing.generation_title', 'Geração de Faturas')}
            </CardTitle>
            <CardDescription className="truncate text-slate-500">
              {t(
                'franchisee.billing.generation_desc',
                'Gere faturas consolidadas para os parceiros com base no consumo do período.',
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 w-full bg-white space-y-6">
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-3">
            <Building2 className="h-5 w-5 text-blue-500" />
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              {t(
                'franchisee.billing.biller_info',
                'Dados do Emissor (Cobrador)',
              )}
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-base font-bold text-slate-900 mb-2">
                {currentFranchise?.legalName ||
                  currentFranchise?.name ||
                  'Deal Voy Platform'}
              </p>
              <p className="text-sm text-slate-600 mb-1">
                <span className="font-semibold text-slate-700">CNPJ/CPF:</span>{' '}
                {currentFranchise?.taxId || '00.000.000/0001-00'}
                {currentFranchise?.stateRegistration && (
                  <span className="ml-2 text-slate-400">
                    | <span className="font-semibold text-slate-700">IE:</span>{' '}
                    {currentFranchise.stateRegistration}
                  </span>
                )}
              </p>
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-700">Endereço:</span>{' '}
                {currentBillerAddress || 'Endereço não cadastrado'}
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                Contato Financeiro
              </p>
              <p className="text-sm text-slate-700 font-medium mb-1">
                {currentBillerInfo.name}
              </p>
              <p className="text-sm text-slate-600 mb-1">
                {currentBillerInfo.email || 'Email não informado'}
              </p>
              <p className="text-sm text-slate-600">
                {currentBillerInfo.phone || 'Telefone não informado'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label className="text-slate-700 font-semibold">
              {t('franchisee.billing.generation_period', 'Período de Apuração')}
            </Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                <SelectValue placeholder={t('common.select', 'Selecione')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_month">
                  {t('franchisee.billing.period_last_month', 'Mês Passado')}
                </SelectItem>
                <SelectItem value="current_month">
                  {t(
                    'franchisee.billing.period_current_month',
                    'Mês Atual (Parcial)',
                  )}
                </SelectItem>
                <SelectItem value="custom">
                  {t(
                    'franchisee.billing.period_custom',
                    'Período Personalizado',
                  )}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-slate-700 font-semibold">
              {t('franchisee.billing.generation_scope', 'Escopo de Lojistas')}
            </Label>
            <Select value={targetType} onValueChange={setTargetType}>
              <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                <SelectValue placeholder={t('common.select', 'Selecione')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t(
                    'franchisee.billing.scope_all',
                    'Todos os Lojistas Ativos',
                  )}
                </SelectItem>
                <SelectItem value="cpa_only">
                  {t('franchisee.billing.scope_cpa', 'Apenas Modelo CPA')}
                </SelectItem>
                <SelectItem value="cpc_only">
                  {t('franchisee.billing.scope_cpc', 'Apenas Modelo CPC')}
                </SelectItem>
                <SelectItem value="fixed_only">
                  {t('franchisee.billing.scope_fixed', 'Apenas Taxa Fixa')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {period === 'custom' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100 animate-fade-in">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500 uppercase">
                {t('franchisee.billing.start_date', 'Data Inicial')}
              </Label>
              <Input type="date" className="bg-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500 uppercase">
                {t('franchisee.billing.end_date', 'Data Final')}
              </Label>
              <Input type="date" className="bg-white" />
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 text-sm text-blue-800">
          <Settings2 className="h-5 w-5 shrink-0 text-blue-500" />
          <p>
            {t(
              'franchisee.billing.generation_info',
              'O processo de geração varre as políticas de parceiros configuradas e o volume transacionado no período selecionado.',
            )}
            <strong>
              {' '}
              {t(
                'franchisee.billing.generation_info_bold',
                'As faturas geradas serão enviadas para a "Área de Preparação" e não serão cobradas automaticamente até a sua aprovação.',
              )}
            </strong>
          </p>
        </div>

        {isBlocked && (
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex gap-3 text-sm text-amber-800">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
            <p>
              <strong>
                {t(
                  'franchisee.billing.already_generated',
                  'Faturas já geradas.',
                )}
              </strong>{' '}
              {t(
                'franchisee.billing.already_generated_desc',
                'Todas as faturas para os lojistas ativos neste período já foram criadas e estão na área de preparação ou histórico.',
              )}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-6 pt-0 bg-white border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3 mt-6">
        <Button
          variant="outline"
          className="font-semibold text-slate-600 w-full sm:w-auto"
        >
          {t('franchisee.billing.schedule_routine', 'Agendar Rotina')}
        </Button>
        <Button
          onClick={handleGenerate}
          disabled={isBlocked}
          className="font-bold shadow-md w-full sm:w-auto"
        >
          <Play className="h-4 w-4 mr-2 fill-current" />
          {t('franchisee.billing.process_generation', 'Processar Geração')}
        </Button>
      </CardFooter>
    </Card>
  )
}
