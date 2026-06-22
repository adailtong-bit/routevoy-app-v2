import { useState, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { useFinanceLedger } from '@/hooks/use-finance-ledger'
import { exportToCSV, exportToPDF } from '@/lib/exportUtils'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Download, FileText } from 'lucide-react'
import {
  startOfQuarter,
  endOfQuarter,
  subQuarters,
  startOfYear,
  endOfYear,
  startOfMonth,
} from 'date-fns'

export function TransactionsList({ franchiseId }: { franchiseId?: string }) {
  const [period, setPeriod] = useState('this_quarter')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const { startDate, endDate } = useMemo(() => {
    const now = new Date()
    switch (period) {
      case 'this_quarter':
        return { startDate: startOfQuarter(now), endDate: endOfQuarter(now) }
      case 'last_quarter': {
        const lastQ = subQuarters(now, 1)
        return {
          startDate: startOfQuarter(lastQ),
          endDate: endOfQuarter(lastQ),
        }
      }
      case 'this_semester': {
        const currentMonth = now.getMonth()
        const isFirstSemester = currentMonth < 6
        const startMonth = isFirstSemester ? 0 : 6
        const endMonth = isFirstSemester ? 5 : 11
        const start = new Date(now.getFullYear(), startMonth, 1)
        const end = new Date(
          now.getFullYear(),
          endMonth + 1,
          0,
          23,
          59,
          59,
          999,
        )
        return { startDate: start, endDate: end }
      }
      case 'this_year':
        return { startDate: startOfYear(now), endDate: endOfYear(now) }
      case 'custom': {
        const start = customStart
          ? new Date(customStart + 'T00:00:00')
          : startOfMonth(now)
        const end = customEnd ? new Date(customEnd + 'T23:59:59') : now
        return { startDate: start, endDate: end }
      }
      case 'this_month':
      default:
        return {
          startDate: startOfMonth(now),
          endDate: new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
            23,
            59,
            59,
            999,
          ),
        }
    }
  }, [period, customStart, customEnd])

  const { transactions, summary, loading } = useFinanceLedger(
    startDate,
    endDate,
    { franchiseId },
  )

  const handleExport = () => {
    const headers = [
      'Date',
      'Description',
      'Reference',
      'Type',
      'Amount',
      'Balance',
    ]
    const rows = transactions.map((tx) => [
      formatDate(tx.transaction_date, 'en-US'),
      tx.description,
      tx.reference_id || '-',
      tx.type === 'credit' ? 'Credit' : 'Debit',
      tx.amount.toString(),
      tx.running_balance.toString(),
    ])
    exportToCSV(
      headers,
      rows,
      `Ledger_Export_${formatDate(new Date(), 'en-US').replace(/\//g, '-')}.csv`,
    )
  }

  const handleExportPDF = () => {
    const headers = [
      'Date',
      'Description',
      'Reference',
      'Type',
      'Amount',
      'Balance',
    ]
    const rows = transactions.map((tx) => [
      formatDate(tx.transaction_date, 'en-US'),
      tx.description,
      tx.reference_id || '-',
      tx.type === 'credit' ? 'Credit' : 'Debit',
      formatCurrency(tx.amount, 'USD', 'en-US'),
      formatCurrency(tx.running_balance, 'USD', 'en-US'),
    ])
    exportToPDF(
      headers,
      rows,
      `Ledger_Export_${formatDate(new Date(), 'en-US').replace(/\//g, '-')}.pdf`,
      'Financial Ledger Report',
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-full sm:w-[200px] bg-white">
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="this_quarter">This Quarter</SelectItem>
              <SelectItem value="last_quarter">Last Quarter</SelectItem>
              <SelectItem value="this_semester">This Semester</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
              <SelectItem value="custom">Custom Date</SelectItem>
            </SelectContent>
          </Select>

          {period === 'custom' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="date"
                className="flex h-10 w-full sm:w-[140px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
              />
              <span className="text-slate-500 text-sm">to</span>
              <input
                type="date"
                className="flex h-10 w-full sm:w-[140px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={loading || transactions.length === 0}
            className="flex-1 md:flex-none"
          >
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={loading || transactions.length === 0}
            className="flex-1 md:flex-none"
          >
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium uppercase">
              Initial Balance
            </p>
            <p className="text-xl font-bold mt-1 text-slate-800">
              {formatCurrency(summary.initialBalance, 'USD', 'en-US')}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium uppercase">
              Credits
            </p>
            <p className="text-xl font-bold mt-1 text-emerald-600">
              {formatCurrency(summary.periodCredits, 'USD', 'en-US')}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium uppercase">
              Debits
            </p>
            <p className="text-xl font-bold mt-1 text-red-600">
              {formatCurrency(summary.periodDebits, 'USD', 'en-US')}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white border-primary/20 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium uppercase">
              Closing Balance
            </p>
            <p className="text-xl font-bold mt-1 text-primary">
              {formatCurrency(summary.closingBalance, 'USD', 'en-US')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="text-lg">Financial Ledger</CardTitle>
          <CardDescription>
            Detailed view of all transactions for the selected period.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[150px]">Reference</TableHead>
                  <TableHead className="text-right w-[120px]">Amount</TableHead>
                  <TableHead className="text-right w-[120px]">
                    Balance
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center h-32 text-slate-500"
                    >
                      Loading ledger data...
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center h-32 text-slate-500"
                    >
                      No transactions found for this period.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => (
                    <TableRow
                      key={tx.id}
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <TableCell className="whitespace-nowrap text-sm text-slate-600">
                        {formatDate(tx.transaction_date, 'en-US')}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-800">
                          {tx.description}
                        </div>
                        {tx.category && (
                          <div className="text-xs text-slate-500 mt-0.5">
                            {tx.category}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {tx.reference_id ? (
                          <div className="flex items-center text-xs text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded w-fit">
                            <FileText className="w-3 h-3 mr-1" />
                            {tx.reference_id.split('-')[0]}...
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <span
                          className={
                            tx.type === 'credit'
                              ? 'text-emerald-600 font-semibold'
                              : 'text-red-600 font-semibold'
                          }
                        >
                          {tx.type === 'credit' ? '+' : '-'}
                          {formatCurrency(tx.amount, 'USD', 'en-US')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-bold whitespace-nowrap text-slate-800">
                        {formatCurrency(tx.running_balance, 'USD', 'en-US')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
