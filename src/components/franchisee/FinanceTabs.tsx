import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
} from 'lucide-react'
import { PartnerBillingTab } from '@/components/admin/PartnerBillingTab'
import { FranchiseeCurrentAccountTab } from '@/components/franchisee/FranchiseeCurrentAccountTab'
import { useFinanceLedger } from '@/hooks/use-finance-ledger'
import { startOfYear } from 'date-fns'

export function FinanceTab({ franchiseId }: { franchiseId?: string }) {
  const { summary } = useFinanceLedger(startOfYear(new Date()), new Date(), {
    franchiseId,
  })

  const revenue = summary.periodCredits
  const expenses = summary.periodDebits
  const profit = revenue - expenses

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          Financial Overview
        </h2>
        <p className="text-slate-500">
          Track general financial metrics of your franchise.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 uppercase">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-800">
              ${revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-emerald-600 flex items-center mt-1 font-medium">
              <ArrowUpRight className="h-3 w-3 mr-1" /> Based on ledger
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 uppercase">
              Expenses
            </CardTitle>
            <ArrowDownRight className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-800">
              ${expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 flex items-center mt-1 font-medium">
              Recorded debits
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 uppercase">
              Net Profit
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-800">
              ${profit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-emerald-600 flex items-center mt-1 font-medium">
              <ArrowUpRight className="h-3 w-3 mr-1" /> Year to Date
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <h3 className="text-xl font-bold tracking-tight text-slate-800 mb-4">
          Financial Ledger
        </h3>
        <FranchiseeCurrentAccountTab franchiseId={franchiseId} />
      </div>
    </div>
  )
}

export function BillingTab({ franchiseId }: { franchiseId?: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          Billing and Invoices
        </h2>
        <p className="text-slate-500">Manage invoices and payment methods.</p>
      </div>
      <PartnerBillingTab franchiseId={franchiseId} />
    </div>
  )
}
