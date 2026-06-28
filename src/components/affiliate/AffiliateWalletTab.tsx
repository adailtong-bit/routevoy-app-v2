import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { exportToCSV, exportToPDF } from '@/lib/exportUtils'
import { useLanguage } from '@/stores/LanguageContext'
import { Download } from 'lucide-react'

export function AffiliateWalletTab({
  affiliateId,
}: {
  affiliateId: string | null
}) {
  const { t, formatCurrency } = useLanguage()
  const [transactions, setTransactions] = useState<any[]>([])
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!affiliateId) return
      setLoading(true)

      const [txRes, wdRes] = await Promise.all([
        supabase
          .from('affiliate_transactions')
          .select('*')
          .eq('affiliate_id', affiliateId)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('affiliate_withdrawals')
          .select('*')
          .eq('affiliate_id', affiliateId)
          .order('request_date', { ascending: false })
          .limit(20),
      ])

      if (txRes.data) setTransactions(txRes.data)
      if (wdRes.data) setWithdrawals(wdRes.data)

      setLoading(false)
    }
    fetchData()
  }, [affiliateId])

  const handleExportCSV = () => {
    const headers = ['ID', 'Produto', 'Venda', 'Comissão', 'Data', 'Status']
    const rows = transactions.map((tx) => [
      tx.id,
      tx.product_name || '',
      tx.sale_amount?.toString() || '0',
      tx.affiliate_earnings?.toString() || '0',
      tx.created_at ? new Date(tx.created_at).toLocaleDateString() : '',
      tx.status || '',
    ])
    exportToCSV(headers, rows, 'affiliate_transactions.csv')
  }

  const handleExportPDF = () => {
    const headers = ['Produto', 'Venda', 'Comissão', 'Data', 'Status']
    const rows = transactions.map((tx) => [
      tx.product_name || '',
      formatCurrency(tx.sale_amount || 0),
      formatCurrency(tx.affiliate_earnings || 0),
      tx.created_at ? new Date(tx.created_at).toLocaleDateString() : '',
      tx.status || '',
    ])
    exportToPDF(
      headers,
      rows,
      'affiliate_transactions.pdf',
      'Relatório de Transações de Afiliado',
    )
  }

  const totalEarnings = transactions.reduce(
    (sum, tx) => sum + Number(tx.affiliate_earnings || 0),
    0,
  )
  const totalWithdrawn = withdrawals
    .filter((w) => w.status === 'paid')
    .reduce((sum, w) => sum + Number(w.amount || 0), 0)
  const available = totalEarnings - totalWithdrawn

  if (loading)
    return <div className="p-4">{t('common.loading', 'Loading...')}</div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500 uppercase">
              {t('affiliate.wallet.total_earnings', 'Total Earnings')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalEarnings)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500 uppercase">
              {t('affiliate.wallet.total_withdrawn', 'Total Withdrawn')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {formatCurrency(totalWithdrawn)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500 uppercase">
              {t('affiliate.wallet.available', 'Available Balance')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {formatCurrency(available)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {t('affiliate.wallet.transaction_history', 'Transaction History')}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="w-4 h-4 mr-2" /> PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('affiliate.wallet.date', 'Date')}</TableHead>
                <TableHead>
                  {t('affiliate.wallet.product', 'Product')}
                </TableHead>
                <TableHead>
                  {t('affiliate.wallet.sale', 'Sale Amount')}
                </TableHead>
                <TableHead>
                  {t('affiliate.wallet.earnings', 'Earnings')}
                </TableHead>
                <TableHead>{t('affiliate.wallet.status', 'Status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    {t('common.none', 'None')}
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      {tx.created_at
                        ? new Date(tx.created_at).toLocaleDateString()
                        : ''}
                    </TableCell>
                    <TableCell>{tx.product_name}</TableCell>
                    <TableCell>{formatCurrency(tx.sale_amount || 0)}</TableCell>
                    <TableCell className="text-green-600 font-medium">
                      {formatCurrency(tx.affiliate_earnings || 0)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${tx.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}
                      >
                        {tx.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
