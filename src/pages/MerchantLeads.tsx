import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/stores/LanguageContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Download, Search, Users, Phone, Mail, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export default function MerchantLeads() {
  const { t, formatDate } = useLanguage()
  const { user: authUser, profile } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCampaign, setFilterCampaign] = useState('all')
  const [leads, setLeads] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchLeads() {
      setIsLoading(true)

      let companyId = null

      if (authUser?.email) {
        const { data: merchant } = await supabase
          .from('merchants')
          .select('id')
          .eq('email', authUser.email)
          .maybeSingle()

        if (merchant) {
          companyId = merchant.id
        } else if (
          profile?.role === 'admin' ||
          profile?.role === 'super_admin'
        ) {
          companyId = 'admin'
        }
      }

      if (!companyId) {
        setIsLoading(false)
        return
      }

      // Fetch user engagements
      const { data: engagements } = await supabase.from('user_engagements')
        .select(`
          id,
          created_at,
          action_type,
          user_id,
          campaign_id,
          discovered_promotions ( title, company_id )
        `)

      if (!engagements) {
        setIsLoading(false)
        return
      }

      // Filter engagements by company if not admin
      const companyEngagements =
        companyId === 'admin'
          ? engagements
          : engagements.filter(
              (e) => e.discovered_promotions?.company_id === companyId,
            )

      // Fetch profiles
      const userIds = [
        ...new Set(companyEngagements.map((e) => e.user_id).filter(Boolean)),
      ]

      let profilesMap: Record<string, any> = {}
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, email')
          .in('id', userIds)

        if (profiles) {
          profiles.forEach((p) => {
            profilesMap[p.id] = p
          })
        }
      }

      const formattedLeads = companyEngagements
        .map((e) => {
          const p = e.user_id ? profilesMap[e.user_id] : null
          return {
            id: e.id,
            customerName: p?.name || 'Walk-in Customer',
            email: p?.email || 'N/A',
            phone: 'N/A', // profiles table doesn't have phone by default in this schema
            campaignName: e.discovered_promotions?.title || 'Unknown Campaign',
            acquiredAt: e.created_at,
          }
        })
        .sort(
          (a, b) =>
            new Date(b.acquiredAt).getTime() - new Date(a.acquiredAt).getTime(),
        )

      setLeads(formattedLeads)
      setIsLoading(false)
    }

    fetchLeads()
  }, [authUser, profile])

  const campaigns = useMemo(() => {
    const names = new Set(leads.map((l) => l.campaignName))
    return Array.from(names)
  }, [leads])

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCampaign =
      filterCampaign === 'all' || l.campaignName === filterCampaign
    return matchesSearch && matchesCampaign
  })

  const exportCSV = () => {
    const headers = [
      t('merchant.leads.customer_name', 'Customer Name'),
      t('merchant.leads.contact', 'Contact'),
      t('merchant.leads.campaign_used', 'Campaign Used'),
      t('merchant.leads.acquisition_date', 'Acquisition Date'),
    ]
    const rows = filteredLeads.map((l) => [
      l.customerName,
      l.email !== 'N/A' ? l.email : l.phone !== 'N/A' ? l.phone : '',
      l.campaignName,
      formatDate(l.acquiredAt),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `leads_${new Date().toISOString().split('T')[0]}.csv`,
    )
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="container py-8 px-4 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
            <Users className="h-6 w-6 text-primary shrink-0" />
            <span className="whitespace-nowrap truncate">
              {t('merchant.leads.title', 'Leads Management')}
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {t(
              'merchant.leads.desc',
              'Track customers who used your offers and export the base for marketing actions.',
            )}
          </p>
        </div>
        <Button
          onClick={exportCSV}
          variant="outline"
          className="w-full sm:w-auto font-bold border-primary/20 text-primary hover:bg-primary/5 whitespace-nowrap"
          disabled={filteredLeads.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />{' '}
          {t('merchant.leads.export_csv', 'Export CSV')}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={t(
              'merchant.leads.search_placeholder',
              'Search by name or email...',
            )}
            className="pl-10 bg-white h-11 rounded-lg border-slate-200 shadow-sm w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-64 shrink-0">
          <Select value={filterCampaign} onValueChange={setFilterCampaign}>
            <SelectTrigger className="h-11 bg-white border-slate-200 rounded-lg shadow-sm w-full">
              <SelectValue
                placeholder={t('merchant.leads.all_campaigns', 'All Campaigns')}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t('merchant.leads.all_campaigns', 'All Campaigns')}
              </SelectItem>
              {campaigns.map((camp) => (
                <SelectItem key={camp} value={camp}>
                  {camp}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-700 whitespace-nowrap">
                {t('merchant.leads.customer_name', 'Customer Name')}
              </TableHead>
              <TableHead className="font-semibold text-slate-700 whitespace-nowrap">
                {t('merchant.leads.contact', 'Contact')}
              </TableHead>
              <TableHead className="font-semibold text-slate-700 whitespace-nowrap">
                {t('merchant.leads.campaign_used', 'Campaign Used')}
              </TableHead>
              <TableHead className="font-semibold text-slate-700 whitespace-nowrap">
                {t('merchant.leads.acquisition_date', 'Acquisition Date')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-slate-500"
                >
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                  {t('common.loading', 'Loading...')}
                </TableCell>
              </TableRow>
            ) : filteredLeads.length > 0 ? (
              filteredLeads.map((lead) => (
                <TableRow
                  key={lead.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <TableCell className="font-medium text-slate-900 whitespace-nowrap">
                    {lead.customerName}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm text-slate-600">
                      {lead.email !== 'N/A' && (
                        <span className="flex items-center gap-1.5 whitespace-nowrap">
                          <Mail className="h-3 w-3 text-slate-400 shrink-0" />{' '}
                          <span className="truncate">{lead.email}</span>
                        </span>
                      )}
                      {lead.phone !== 'N/A' && (
                        <span className="flex items-center gap-1.5 whitespace-nowrap">
                          <Phone className="h-3 w-3 text-slate-400 shrink-0" />{' '}
                          {lead.phone}
                        </span>
                      )}
                      {lead.email === 'N/A' && lead.phone === 'N/A' && (
                        <span className="text-slate-400 italic">
                          {t('merchant.leads.not_informed', 'Not informed')}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium whitespace-nowrap">
                      {lead.campaignName}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-500 whitespace-nowrap">
                    {formatDate(lead.acquiredAt)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-slate-500"
                >
                  {t(
                    'merchant.leads.empty',
                    'No leads found with the current filters.',
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-slate-500 text-right px-2">
        {t('merchant.leads.showing', 'Showing {filtered} leads out of {total}')
          .replace('{filtered}', filteredLeads.length.toString())
          .replace('{total}', leads.length.toString())}
      </div>
    </div>
  )
}
