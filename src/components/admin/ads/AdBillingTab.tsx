import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { format } from 'date-fns'

export function AdBillingTab() {
  const [invoices, setInvoices] = useState<any[]>([])
  const { role, user } = useAuth()

  const isAdmin = role === 'admin' || role === 'super_admin'

  useEffect(() => {
    fetchInvoices()
  }, [role, user])

  const fetchInvoices = async () => {
    let query = supabase
      .from('ad_invoices')
      .select(
        `
      *,
      ad_advertisers (
        company_name,
        email
      ),
      ad_campaigns (
        title
      )
    `,
      )
      .order('created_at', { ascending: false })

    if (!isAdmin && user?.email) {
      const { data: advertiser } = await supabase
        .from('ad_advertisers')
        .select('id')
        .eq('email', user.email)
        .maybeSingle()

      if (advertiser) {
        query = query.eq('advertiser_id', advertiser.id)
      } else {
        setInvoices([])
        return
      }
    }

    const { data } = await query
    if (data) setInvoices(data)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-500">Pago</Badge>
      case 'pending':
        return (
          <Badge className="bg-amber-500 text-amber-900 border-none">
            Pendente
          </Badge>
        )
      case 'overdue':
        return <Badge className="bg-red-500">Vencido</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Ref.</TableHead>
              {isAdmin && <TableHead>Anunciante</TableHead>}
              <TableHead>Campanha Associada</TableHead>
              <TableHead>Data de Emissão</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Valor Final</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-medium text-xs text-slate-500">
                  {inv.reference_number}
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <span className="block font-medium text-slate-900">
                      {inv.ad_advertisers?.company_name || 'Desconhecido'}
                    </span>
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      {inv.ad_advertisers?.email}
                    </span>
                  </TableCell>
                )}
                <TableCell className="font-medium text-slate-700">
                  {inv.ad_campaigns?.title || 'N/A'}
                </TableCell>
                <TableCell>
                  {format(new Date(inv.issue_date), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell>
                  {format(new Date(inv.due_date), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell className="font-semibold text-emerald-600">
                  R$ {inv.amount.toFixed(2)}
                </TableCell>
                <TableCell>{getStatusBadge(inv.status)}</TableCell>
              </TableRow>
            ))}
            {invoices.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 7 : 6}
                  className="text-center text-muted-foreground py-10"
                >
                  Nenhuma fatura encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
