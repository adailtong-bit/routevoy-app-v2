import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/stores/LanguageContext'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useFinanceLedger } from '@/hooks/use-finance-ledger'
import { exportToCSV } from '@/lib/exportUtils'
import {
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Calendar as CalendarIcon,
  Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TransactionsListProps {
  franchiseId?: string
  companyId?: string
  affiliateId?: string
}

export function TransactionsList({
  franchiseId,
  companyId,
  affiliateId,
}: TransactionsListProps) {
  const { t } = useLanguage()

  // Date Filtering State
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date()
    const start = new Date()
    start.setDate(1) // Default to this month
    return { start, end }
  })
  const [activeFilter, setActiveFilter] = useState('this_month')

  const { transactions, summary, loading } = useFinanceLedger(
    dateRange.start,
    dateRange.end,
    { franchiseId, companyId, affiliateId },
  )

  const handleQuickFilter = (filter: string) => {
    setActiveFilter(filter)
    const now = new Date()
    let start = new Date()
    let end = new Date()

    switch (filter) {
      case 'this_month': {
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
      }
      case 'this_quarter': {
        const q = Math.floor(now.getMonth() / 3)
        start = new Date(now.getFullYear(), q * 3, 1)
        end = new Date(now.getFullYear(), q * 3 + 3, 0)
        break
      }
      case 'last_quarter': {
        const lq = Math.floor(now.getMonth() / 3) - 1
        start = new Date(now.getFullYear(), lq * 3, 1)
        end = new Date(now.getFullYear(), lq * 3 + 3, 0)
        break
      }
      case 'this_semester': {
        const s = Math.floor(now.getMonth() / 6)
        start = new Date(now.getFullYear(), s * 6, 1)
        end = new Date(now.getFullYear(), s * 6 + 6, 0)
        break
      }
      case 'this_year': {
        start = new Date(now.getFullYear(), 0, 1)
        end = new Date(now.getFullYear(), 11, 31)
        break
      }
    }
    setDateRange({ start, end })
  }

  const handleExport = () => {
    const headers = [
      'Date',
      'Description',
      'Reference ID',
      'Type',
      'Amount',
      'Running Balance',
    ]
    const rows = transactions.map((t) => [
      new Date(t.transaction_date).toISOString().split('T')[0],
      t.description,
      t.reference_id || 'N/A',
      t.type.toUpperCase(),
      t.amount.toString(),
      t.running_balance.toString(),
    ])
    exportToCSV(
      headers,
      rows,
      `Checking_Account_Statement_${new Date().toISOString().split('T')[0]}.csv`,
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {t('ledger.current_balance', 'Current Balance')}
              </p>
              <h3
                className={cn(
                  'text-3xl font-bold mt-1',
                  summary.closingBalance >= 0
                    ? 'text-slate-800'
                    : 'text-red-600',
                )}
              >
                {formatCurrency(summary.closingBalance)}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {t('ledger.period_credits', 'Period Credits')}
              </p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                {formatCurrency(summary.periodCredits)}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <ArrowUpRight className="h-5 w-5 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {t('ledger.period_debits', 'Period Debits')}
              </p>
              <h3 className="text-2xl font-bold text-rose-600 mt-1">
                {formatCurrency(summary.periodDebits)}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center">
              <ArrowDownRight className="h-5 w-5 text-rose-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 mr-4">
            <CalendarIcon className="h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={dateRange.start.toISOString().split('T')[0]}
              onChange={(e) => {
                setActiveFilter('custom')
                setDateRange((p) => ({ ...p, start: new Date(e.target.value) }))
              }}
              className="text-sm border-slate-200 rounded-md p-1.5 focus:ring-primary focus:border-primary"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={dateRange.end.toISOString().split('T')[0]}
              onChange={(e) => {
                setActiveFilter('custom')
                setDateRange((p) => ({ ...p, end: new Date(e.target.value) }))
              }}
              className="text-sm border-slate-200 rounded-md p-1.5 focus:ring-primary focus:border-primary"
            />
          </div>

          {[
            'this_month',
            'this_quarter',
            'last_quarter',
            'this_semester',
            'this_year',
          ].map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleQuickFilter(filter)}
              className="h-8 text-xs"
            >
              {t(
                `ledger.filter.${filter}`,
                filter
                  .replace('_', ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase()),
              )}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          onClick={handleExport}
          className="shrink-0"
          disabled={transactions.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          {t('ledger.export_csv', 'Export CSV')}
        </Button>
      </div>

      {/* Transactions Table */}
      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">{t('ledger.date', 'Date')}</th>
                <th className="px-6 py-4">
                  {t('ledger.description', 'Description')}
                </th>
                <th className="px-6 py-4">
                  {t('ledger.reference', 'Reference')}
                </th>
                <th className="px-6 py-4 text-right">
                  {t('ledger.amount', 'Amount')}
                </th>
                <th className="px-6 py-4 text-right">
                  {t('ledger.balance', 'Balance')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    {t('common.loading', 'Loading...')}
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Search className="h-8 w-8 text-slate-300 mb-2" />
                      <p>
                        {t(
                          'ledger.no_transactions',
                          'No transactions found for this period.',
                        )}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      {formatDate(tx.transaction_date)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">
                        {tx.description}
                      </p>
                      <span className="text-xs text-slate-500 uppercase">
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs font-mono">
                      {tx.reference_id?.split('-')[0] || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={cn(
                          'font-medium',
                          tx.type === 'credit'
                            ? 'text-emerald-600'
                            : 'text-rose-600',
                        )}
                      >
                        {tx.type === 'credit' ? '+' : '-'}{' '}
                        {formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-800">
                      {formatCurrency(tx.running_balance)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
