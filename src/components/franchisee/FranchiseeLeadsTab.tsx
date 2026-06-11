import { useMemo } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import { useCouponStore } from '@/stores/CouponContext'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FranchiseeLeadsTab({ franchiseId }: { franchiseId: string }) {
  const { t } = useLanguage()
  const { validationLogs, users, companies, franchises } = useCouponStore()
  const [searchParams] = useSearchParams()
  const searchQuery = (searchParams.get('q') || '').toLowerCase()
  const location = useLocation()
  const isFranchisee = location.pathname.includes('/franchisee')

  const myFranchise = franchises.find((f) => f.id === franchiseId)
  const { formatDate } = useRegionFormatting(
    myFranchise?.region,
    myFranchise?.addressCountry,
  )

  const franchiseCompanies = useMemo(
    () =>
      myFranchise
        ? companies.filter(
            (c) =>
              c.franchiseId === myFranchise.id ||
              (c.regionId && c.regionId === myFranchise.regionId) ||
              (c.region && c.region === myFranchise.region),
          )
        : [],
    [companies, myFranchise?.id, myFranchise?.regionId, myFranchise?.region],
  )
  const franchiseCompanyIds = useMemo(
    () => franchiseCompanies.map((c) => c.id),
    [franchiseCompanies],
  )

  const franchiseLogs = useMemo(
    () =>
      validationLogs.filter((log) =>
        franchiseCompanyIds.includes(log.companyId || ''),
      ),
    [validationLogs, franchiseCompanyIds],
  )

  const leadsList = useMemo(() => {
    return franchiseLogs
      .map((log) => {
        const u = users.find((user) => user.id === log.userId)
        return {
          id: log.id,
          customerName:
            u?.name ||
            log.customerName ||
            t('franchisee.leads.counter', 'Cliente Balcão'),
          email: u?.email || 'N/A',
          phone: u?.phone || 'N/A',
          campaignName: log.couponTitle,
          storeName:
            companies.find((c) => c.id === log.companyId)?.name || 'Loja',
          acquiredAt: log.validatedAt,
        }
      })
      .filter((lead) => {
        if (!searchQuery) return true
        return (
          lead.customerName.toLowerCase().includes(searchQuery) ||
          lead.email.toLowerCase().includes(searchQuery) ||
          lead.phone.toLowerCase().includes(searchQuery) ||
          lead.campaignName.toLowerCase().includes(searchQuery) ||
          lead.storeName.toLowerCase().includes(searchQuery)
        )
      })
      .sort(
        (a, b) =>
          new Date(b.acquiredAt).getTime() - new Date(a.acquiredAt).getTime(),
      )
  }, [franchiseLogs, users, companies, t, searchQuery])

  return (
    <div className="space-y-6 animate-fade-in-up min-w-0 w-full max-w-full">
      <div className="min-w-0">
        <h2 className="text-2xl font-bold text-slate-800 truncate">
          {t('franchisee.leads.title', 'Leads Regionais')}
        </h2>
        <p className="text-muted-foreground line-clamp-2 sm:line-clamp-none">
          {t(
            'franchisee.leads.desc',
            'Clientes que interagiram com ofertas dos seus lojistas.',
          )}
        </p>
      </div>
      <Card
        className={cn(
          'shadow-sm min-w-0 w-full',
          !isFranchisee && 'overflow-hidden',
        )}
      >
        <CardContent
          className={cn('p-0 sm:p-0', !isFranchisee && 'overflow-x-auto')}
        >
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="whitespace-nowrap">
                  {t('franchisee.leads.customer', 'Cliente')}
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  {t('franchisee.leads.contact', 'Contato')}
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  {t('franchisee.leads.campaign', 'Campanha Utilizada')}
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  {t('franchisee.leads.merchant', 'Lojista')}
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  {t('franchisee.leads.date', 'Data')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leadsList.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium text-slate-900 whitespace-nowrap">
                    {lead.customerName}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex flex-col gap-1 text-sm text-slate-600">
                      {lead.email !== 'N/A' && (
                        <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                          <Mail className="h-3 w-3 text-slate-400 shrink-0" />{' '}
                          <span className="truncate">{lead.email}</span>
                        </span>
                      )}
                      {lead.phone !== 'N/A' && (
                        <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                          <Phone className="h-3 w-3 text-slate-400 shrink-0" />{' '}
                          <span className="truncate">{lead.phone}</span>
                        </span>
                      )}
                      {lead.email === 'N/A' && lead.phone === 'N/A' && (
                        <span className="text-slate-400 italic">
                          {t('franchisee.leads.not_informed', 'Não informado')}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge
                      variant="outline"
                      className="bg-slate-50 max-w-[150px] truncate block"
                    >
                      {lead.campaignName}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-700 font-medium whitespace-nowrap max-w-[150px] truncate">
                    {lead.storeName}
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm whitespace-nowrap">
                    {formatDate(lead.acquiredAt)}
                  </TableCell>
                </TableRow>
              ))}
              {leadsList.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-slate-500"
                  >
                    {t(
                      'franchisee.leads.no_leads',
                      'Nenhum lead capturado ainda.',
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
