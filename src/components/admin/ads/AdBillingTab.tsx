import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function AdBillingTab() {
  const [invoices, setInvoices] = useState<any[]>([])

  useEffect(() => {
    const fetchInvoices = async () => {
      const { data } = await supabase
        .from('ad_invoices')
        .select('*, ad_campaigns(title)')
        .order('created_at', { ascending: false })
      if (data) setInvoices(data)
    }
    fetchInvoices()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monitoramento de Faturas e Pagamentos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invoices.length === 0 ? (
            <p className="text-slate-500">Nenhuma fatura encontrada.</p>
          ) : (
            invoices.map((inv) => (
              <div
                key={inv.id}
                className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg gap-4 hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-800">
                      Fatura #{inv.reference_number}
                    </h4>
                    <Badge
                      variant={inv.status === 'paid' ? 'default' : 'outline'}
                      className="capitalize"
                    >
                      {inv.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">
                    Campanha Relacionada:{' '}
                    <span className="font-medium text-slate-800">
                      {inv.ad_campaigns?.title || 'N/A'}
                    </span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Vencimento: {new Date(inv.due_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-black text-xl text-primary">
                    R$ {inv.amount?.toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
