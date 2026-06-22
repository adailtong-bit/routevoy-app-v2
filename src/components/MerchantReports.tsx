import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Download, Search, Users, Activity, Banknote } from 'lucide-react'
import { format, isToday } from 'date-fns'
import { useLanguage } from '@/stores/LanguageContext'
import { exportToCSV, exportToPDF } from '@/lib/exportUtils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function MerchantReports() {
  const { companyId } = useAuth()
  const { t, formatCurrency } = useLanguage()
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Validations State
  const [validations, setValidations] = useState<any[]>([])
  const [operatorFilter, setOperatorFilter] = useState('all')
  const [validationsLoading, setValidationsLoading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      if (!companyId) return
      setLoading(true)
      let query = supabase
        .from('financial_ledger')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (dateStart)
        query = query.gte('created_at', new Date(dateStart).toISOString())
      if (dateEnd) {
        const end = new Date(dateEnd)
        end.setHours(23, 59, 59)
        query = query.lte('created_at', end.toISOString())
      }
      if (typeFilter !== 'all') {
        query = query.eq('type', typeFilter)
      }

      const { data } = await query
      if (data) {
        let filtered = data
        if (searchQuery) {
          const q = searchQuery.toLowerCase()
          filtered = data.filter(
            (d) =>
              d.description?.toLowerCase().includes(q) ||
              d.category?.toLowerCase().includes(q),
          )
        }
        setTransactions(filtered)
      }
      setLoading(false)

      // Fetch validations
      setValidationsLoading(true)
      let vQuery = supabase
        .from('merchant_validations' as any)
        .select('*, profiles(name)')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (dateStart)
        vQuery = vQuery.gte('created_at', new Date(dateStart).toISOString())
      if (dateEnd) {
        const end = new Date(dateEnd)
        end.setHours(23, 59, 59)
        vQuery = vQuery.lte('created_at', end.toISOString())
      }

      const { data: vData } = await vQuery
      if (vData) {
        setValidations(vData)
      }
      setValidationsLoading(false)
    }
    fetchData()
  }, [companyId, dateStart, dateEnd, typeFilter, searchQuery])

  const totalRevenue = transactions.reduce(
    (acc, curr) => acc + Number(curr.amount || 0),
    0,
  )

  const handleExportCSV = () => {
    const headers = [
      'Data',
      'Descrição',
      'Categoria',
      'Tipo',
      'Status',
      'Valor',
    ]
    const rows = transactions.map((tx) => [
      tx.created_at ? format(new Date(tx.created_at), 'dd/MM/yyyy HH:mm') : '',
      tx.description || '',
      tx.category || '',
      tx.type || '',
      tx.status || '',
      tx.amount?.toString() || '0',
    ])
    exportToCSV(headers, rows, 'merchant_reports.csv')
  }

  const handleExportPDF = () => {
    const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']
    const rows = transactions.map((tx) => [
      tx.created_at ? format(new Date(tx.created_at), 'dd/MM/yyyy HH:mm') : '',
      tx.description || '',
      tx.category || '',
      tx.type || '',
      formatCurrency(tx.amount || 0),
    ])
    exportToPDF(
      headers,
      rows,
      'merchant_reports.pdf',
      'Relatório de Transações do Lojista',
    )
  }

  const uniqueOperators = Array.from(
    new Map(
      validations
        .filter((v) => v.profiles?.name)
        .map((v) => [v.operator_id, v.profiles?.name]),
    ).entries(),
  )

  const filteredValidations = validations.filter(
    (v) => operatorFilter === 'all' || v.operator_id === operatorFilter,
  )

  const validationsToday = validations.filter((v) =>
    isToday(new Date(v.created_at)),
  )
  const totalSavingsToday = validationsToday.reduce(
    (acc, curr) => acc + Number(curr.discount_amount || 0),
    0,
  )
  const activeOperatorsToday = new Set(
    validationsToday.map((v) => v.profiles?.name || 'Unknown'),
  ).size

  const handleExportValidationsCSV = () => {
    const headers = [
      'Date',
      'Time',
      'Coupon Title',
      'Discount Value',
      'Operator Name',
    ]
    const rows = filteredValidations.map((v) => [
      format(new Date(v.created_at), 'yyyy-MM-dd'),
      format(new Date(v.created_at), 'HH:mm:ss'),
      v.promotion_title || 'N/A',
      v.discount_amount?.toString() || '0',
      v.profiles?.name || 'Unknown',
    ])
    exportToCSV(headers, rows, 'validation_history.csv')
  }

  const handleExportValidationsPDF = () => {
    const headers = [
      'Date',
      'Time',
      'Coupon Title',
      'Discount Value',
      'Operator Name',
    ]
    const rows = filteredValidations.map((v) => [
      format(new Date(v.created_at), 'yyyy-MM-dd'),
      format(new Date(v.created_at), 'HH:mm:ss'),
      v.promotion_title || 'N/A',
      formatCurrency(v.discount_amount || 0),
      v.profiles?.name || 'Unknown',
    ])
    exportToPDF(
      headers,
      rows,
      'validation_history.pdf',
      'Coupon Validation History',
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="validations" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 max-w-md">
          <TabsTrigger value="validations">Validations</TabsTrigger>
          <TabsTrigger value="financial">Financial Ledger</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-4 rounded-lg shadow-sm border mb-6">
          <div className="space-y-2">
            <Label>{t('reports.date_start', 'Data Inicial')}</Label>
            <Input
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('reports.date_end', 'Data Final')}</Label>
            <Input
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('common.search')}</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('common.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t('reports.method', 'Tipo')}</Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t('reports.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('reports.all', 'Todos')}</SelectItem>
                <SelectItem value="receipt">
                  {t('reports.receipt', 'Receita')}
                </SelectItem>
                <SelectItem value="payment">
                  {t('reports.payment', 'Pagamento')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="validations" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t(
                    'merchant.dashboard.total_validations_today',
                    'Total Validations Today',
                  )}
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {validationsToday.length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t(
                    'merchant.dashboard.total_savings_provided',
                    'Total Savings Provided',
                  )}
                </CardTitle>
                <Banknote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalSavingsToday)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('merchant.dashboard.active_operators', 'Active Operators')}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeOperatorsToday}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <CardTitle>Validation History</CardTitle>
                  <CardDescription>
                    Detailed logs of coupon redemptions by your staff.
                  </CardDescription>
                </div>
                <div className="w-[200px]">
                  <Select
                    value={operatorFilter}
                    onValueChange={setOperatorFilter}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t(
                          'merchant.dashboard.operator_name',
                          'Operator Name',
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t('reports.all', 'Todos')}
                      </SelectItem>
                      {uniqueOperators.map(([id, name]) => (
                        <SelectItem key={id} value={id as string}>
                          {name as string}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleExportValidationsCSV}
                >
                  <Download className="h-4 w-4" />{' '}
                  {t('merchant.dashboard.export_csv', 'Download CSV')}
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleExportValidationsPDF}
                >
                  <Download className="h-4 w-4" />{' '}
                  {t('merchant.dashboard.export_pdf', 'Download PDF')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Coupon Title</TableHead>
                    <TableHead>Operator</TableHead>
                    <TableHead className="text-right">Discount Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validationsLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        {t('common.loading')}
                      </TableCell>
                    </TableRow>
                  ) : filteredValidations.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {t('reports.no_data', 'Sem dados')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredValidations.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell>
                          {v.created_at
                            ? format(
                                new Date(v.created_at),
                                'dd/MM/yyyy HH:mm:ss',
                              )
                            : ''}
                        </TableCell>
                        <TableCell className="font-medium">
                          {v.promotion_title || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                            <Users className="w-3 h-3" />
                            {v.profiles?.name || 'Unknown'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-bold text-emerald-600">
                          {formatCurrency(v.discount_amount || 0)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-[#2196F3]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('reports.filtered_transactions', 'Transações')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#2196F3]">
                  {transactions.length}
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-[#FF5722]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('reports.financial_volume', 'Volume Financeiro')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#FF5722]">
                  {formatCurrency(totalRevenue)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>
                  {t('reports.transaction_report', 'Relatório de Transações')}
                </CardTitle>
                <CardDescription>
                  {t(
                    'reports.detailed_consumption',
                    'Detalhamento do livro caixa e consumos',
                  )}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleExportCSV}
                >
                  <Download className="h-4 w-4" /> CSV
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleExportPDF}
                >
                  <Download className="h-4 w-4" /> PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        {t('common.loading')}
                      </TableCell>
                    </TableRow>
                  ) : transactions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {t('reports.no_data', 'Sem dados')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          {tx.created_at
                            ? format(
                                new Date(tx.created_at),
                                'dd/MM/yyyy HH:mm',
                              )
                            : ''}
                        </TableCell>
                        <TableCell className="font-medium">
                          {tx.description || 'N/A'}
                        </TableCell>
                        <TableCell>{tx.category}</TableCell>
                        <TableCell className="capitalize">{tx.type}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${tx.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}
                          >
                            {tx.status}
                          </span>
                        </TableCell>
                        <TableCell
                          className={`text-right font-bold ${tx.type === 'payment' ? 'text-red-500' : 'text-green-600'}`}
                        >
                          {tx.type === 'payment' ? '-' : '+'}
                          {formatCurrency(tx.amount || 0)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
