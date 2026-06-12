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
      <div className="grid gap-4 md:grid-cols-3">
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
      <Card>
        <CardHeader>
          <CardTitle>Latest Transactions</CardTitle>
          <CardDescription>History of transfers and receipts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none text-slate-800">
                      Merchant Transfer #{1000 + i}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Today at 14:32
                    </p>
                  </div>
                </div>
                <div className="font-bold text-emerald-600">
                  + ${(Math.random() * 1000).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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
