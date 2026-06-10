import { useState, useMemo } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
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
import { Download, Search, Users, Phone, Mail } from 'lucide-react'

export default function MerchantLeads() {
  const { validationLogs, users, user, companies } = useCouponStore()
  const { formatDate } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCampaign, setFilterCampaign] = useState('all')

  const myCompany =
    companies.find((c) => c.id === user?.companyId) || companies[0]

  const leads = useMemo(() => {
    if (!myCompany) return []

    const companyLogs = validationLogs.filter(
      (l) => l.companyId === myCompany.id,
    )

    return companyLogs
      .map((log) => {
        const customerUser = users.find((u) => u.id === log.userId)
        return {
          id: log.id,
          customerName:
            customerUser?.name || log.customerName || 'Walk-in Customer',
          email: customerUser?.email || 'N/A',
          phone: customerUser?.phone || 'N/A',
          campaignName: log.couponTitle,
          acquiredAt: log.validatedAt,
        }
      })
      .sort(
        (a, b) =>
          new Date(b.acquiredAt).getTime() - new Date(a.acquiredAt).getTime(),
      )
  }, [validationLogs, myCompany?.id, users])

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
      'Customer Name',
      'Email',
      'Phone',
      'Campaign',
      'Acquisition Date',
    ]
    const rows = filteredLeads.map((l) => [
      l.customerName,
      l.email,
      l.phone,
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
      `leads_${myCompany?.name?.replace(/\s+/g, '_') || 'empresa'}_${new Date().toISOString().split('T')[0]}.csv`,
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
            <Users className="h-6 w-6 text-primary" />
            Leads Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track customers who used your offers and export the base for
            marketing actions.
          </p>
        </div>
        <Button
          onClick={exportCSV}
          variant="outline"
          className="w-full sm:w-auto font-bold border-primary/20 text-primary hover:bg-primary/5"
          disabled={filteredLeads.length === 0}
        >
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name or email..."
            className="pl-10 bg-white h-11 rounded-lg border-slate-200 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-64">
          <Select value={filterCampaign} onValueChange={setFilterCampaign}>
            <SelectTrigger className="h-11 bg-white border-slate-200 rounded-lg shadow-sm">
              <SelectValue placeholder="Filter by Campaign" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campaigns</SelectItem>
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
              <TableHead className="font-semibold text-slate-700">
                Customer Name
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Contact
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Campaign Used
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Acquisition Date
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.map((lead) => (
              <TableRow
                key={lead.id}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <TableCell className="font-medium text-slate-900">
                  {lead.customerName}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 text-sm text-slate-600">
                    {lead.email !== 'N/A' && (
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-slate-400" /> {lead.email}
                      </span>
                    )}
                    {lead.phone !== 'N/A' && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-slate-400" />{' '}
                        {lead.phone}
                      </span>
                    )}
                    {lead.email === 'N/A' && lead.phone === 'N/A' && (
                      <span className="text-slate-400 italic">
                        Not informed
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                    {lead.campaignName}
                  </span>
                </TableCell>
                <TableCell className="text-slate-500 whitespace-nowrap">
                  {formatDate(lead.acquiredAt)}
                </TableCell>
              </TableRow>
            ))}
            {filteredLeads.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-slate-500"
                >
                  No leads found with the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-slate-500 text-right px-2">
        Showing {filteredLeads.length} leads out of {leads.length}
      </div>
    </div>
  )
}
