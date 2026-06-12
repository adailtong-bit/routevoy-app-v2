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

export function FinanceTab({ franchiseId }: { franchiseId?: string }) {
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
            <div className="text-2xl font-black text-slate-800">$45,231.89</div>
            <p className="text-xs text-emerald-600 flex items-center mt-1 font-medium">
              <ArrowUpRight className="h-3 w-3 mr-1" /> +20.1% this month
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
            <div className="text-2xl font-black text-slate-800">$12,034.50</div>
            <p className="text-xs text-red-600 flex items-center mt-1 font-medium">
              <ArrowUpRight className="h-3 w-3 mr-1" /> +4.5% this month
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
            <div className="text-2xl font-black text-slate-800">$33,197.39</div>
            <p className="text-xs text-emerald-600 flex items-center mt-1 font-medium">
              <ArrowUpRight className="h-3 w-3 mr-1" /> +12.3% this month
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
