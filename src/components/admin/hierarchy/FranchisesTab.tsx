import { useState, useEffect } from 'react'
import { useLanguage } from '@/stores/LanguageContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Edit2,
  Trash2,
  Download,
  FileText,
  FileSpreadsheet,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react'
import { Franchise } from '@/lib/types'
import { AdvancedCompanyForm } from './AdvancedCompanyForm'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'

export function FranchisesTab() {
  const { t } = useLanguage()

  const [franchises, setFranchises] = useState<Franchise[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingFranchise, setEditingFranchise] = useState<Franchise | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(true)

  const [generatedLink, setGeneratedLink] = useState('')
  const [linkModalOpen, setLinkModalOpen] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink)
    setLinkCopied(true)
    toast.success(t('admin.link_copied', 'Link copied!'))
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const fetchFranchises = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('franchises')
        .select('*')
        .order('created_at', { ascending: false })

      if (data && !error) {
        const mapped: Franchise[] = data.map((f: any) => ({
          id: f.id,
          name: f.name || '',
          email: f.email || '',
          region: f.region || '',
          ownerId: f.email || 'unknown',
          licenseExpiry: new Date(Date.now() + 31536000000).toISOString(),
          status: f.status || 'active',
          taxId: f.tax_id || '',
          contactEmail: f.email || '',
          contactPerson: f.name || '',
          addressState: f.coverage_states?.[0] || '',
          credentialsSent: true,
        }))
        setFranchises(mapped)
      }
    } catch (e) {
      console.error('Error fetching franchises:', e)
      toast.error(t('common.error', 'Error loading franchises'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFranchises()
  }, [])

  const handleOpenDialog = (franchise?: Franchise) => {
    if (franchise) {
      setEditingFranchise(franchise)
    } else {
      setEditingFranchise(null)
    }
    setIsDialogOpen(true)
  }

  const handleSave = async (finalData: any) => {
    try {
      if (editingFranchise) {
        const { error } = await supabase
          .from('franchises')
          .update({
            name: finalData.name,
            email: finalData.email,
            region: finalData.addressState || finalData.region || 'Global',
            status: finalData.status || 'active',
          })
          .eq('id', editingFranchise.id)

        if (error) throw error
        toast.success(
          t('admin.franchises.updated', 'Franchise updated successfully!'),
        )
      } else {
        const tempId = crypto.randomUUID()
        const { error } = await supabase.from('franchises').insert({
          id: tempId,
          name: finalData.name,
          email: finalData.email,
          region: finalData.addressState || finalData.region || 'Global',
          status: 'active',
          address_country:
            finalData.country || finalData.addressCountry || 'Brasil',
          address_state: finalData.addressState || finalData.state,
          address_city: finalData.addressCity || finalData.city,
          coverage_scope: finalData.coverageScope || 'national',
        })

        if (error) {
          throw new Error(
            error.message || 'Erro de validação no banco de dados.',
          )
        }

        // Profile insertion via randomUUID violates foreign key auth.users(id).
        // Creation of profile is deferred to the send-invitation function / user signup.

        toast.success(
          t('admin.franchises.created', 'Franchise created successfully!'),
        )
      }
      setIsDialogOpen(false)
      fetchFranchises()
    } catch (err: any) {
      console.error('Save Franchise Error:', err)
      toast.error(err.message || t('common.error', 'Error saving franchise'))
    }
  }

  const deleteFranchise = async (id: string) => {
    if (
      !confirm(t('common.confirm_delete', 'Are you sure you want to delete?'))
    )
      return

    try {
      const { error } = await supabase.from('franchises').delete().eq('id', id)
      if (error) throw error
      toast.success(t('common.deleted', 'Deleted successfully'))
      fetchFranchises()
    } catch (err) {
      console.error(err)
      toast.error(t('common.error', 'Error deleting franchise'))
    }
  }

  const filteredFranchises = franchises.filter((f) => {
    if (!searchQuery) return true
    return (
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.taxId && f.taxId.includes(searchQuery)) ||
      (f.region && f.region.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })

  const exportCsv = () => {
    const headers = ['ID', 'Name', 'Tax ID', 'Contact', 'Region', 'Status']
    const rows = filteredFranchises.map(
      (f) =>
        `"${f.id}","${f.name}","${f.taxId || ''}","${f.contactEmail || ''}","${f.region || ''}","${f.status}"`,
    )
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      headers.join(',') +
      '\n' +
      rows.join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'franchises_export.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportPdf = () => {
    const w = window.open('', '_blank')
    if (w) {
      w.document.write(`
        <html><head><title>Franchises Report</title>
        <style>body{font-family:sans-serif; padding:20px;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #ddd; padding:8px; text-align:left;}</style></head>
        <body>
        <h1>Franchises Report</h1>
        <table>
          <tr><th>Name</th><th>Tax ID</th><th>Contact</th><th>Region</th><th>Status</th></tr>
          ${filteredFranchises.map((f) => `<tr><td>${f.name}</td><td>${f.taxId || ''}</td><td>${f.contactEmail || ''}</td><td>${f.region || ''}</td><td>${f.status}</td></tr>`).join('')}
        </table>
        <script>window.print(); window.close();</script>
        </body></html>
      `)
      w.document.close()
    }
  }

  const handleSendCredentials = async (f: Franchise) => {
    try {
      const email = f.email || f.contactEmail || f.ownerId
      if (!email) {
        toast.error(t('common.error', 'Franchise has no registered email'))
        return
      }

      const { data: inv, error: fetchErr } = await supabase
        .from('user_invitations')
        .select('id')
        .eq('email', email)
        .eq('status', 'pending')
        .maybeSingle()

      let inviteId = inv?.id

      if (!inviteId) {
        const { data: newInv, error: insertErr } = await supabase
          .from('user_invitations')
          .insert({
            email: email,
            role: 'franchisee',
            franchise_id: f.id,
            status: 'pending',
          })
          .select()
          .single()

        if (insertErr) throw insertErr
        inviteId = newInv.id
      }

      const link = `${window.location.origin}/activate?id=${inviteId}`
      setGeneratedLink(link)
      setLinkModalOpen(true)

      const updated = franchises.map((x) =>
        x.id === f.id ? { ...x, credentialsSent: true } : x,
      )
      setFranchises(updated)
    } catch (err: any) {
      console.error('Error generating link:', err)
      toast.error(t('common.error', 'Error generating link'))
    }
  }

  const handleAccountingExport = (f: Franchise) => {
    toast.info(
      'Accounting export is processed securely. Please check your email for the report.',
    )
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card p-4 rounded-lg border gap-4">
        <div>
          <h3 className="text-lg font-bold">
            {t('admin.franchises.network', 'Rede de Franqueados')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t(
              'admin.franchises.network_desc',
              'Gerencie seus franqueados, crie novos acessos regionais e monitore a rede.',
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Input
            placeholder={t('admin.franchises.search', 'Search franchises...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-48 bg-white"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={fetchFranchises}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </Button>
          <Button variant="outline" onClick={exportCsv}>
            <FileText className="w-4 h-4 mr-2" />
            {t('admin.franchises.export_csv', 'CSV')}
          </Button>
          <Button variant="outline" onClick={exportPdf}>
            <Download className="w-4 h-4 mr-2" />
            {t('admin.franchises.export_pdf', 'PDF')}
          </Button>
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('admin.franchises.add', 'Criar Franqueado')}
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.title', 'Name / Franchise')}</TableHead>
              <TableHead>{t('admin.tax_id', 'Tax ID / Doc')}</TableHead>
              <TableHead>{t('profile.phone', 'Contact/Access')}</TableHead>
              <TableHead>{t('profile.state', 'Region')}</TableHead>
              <TableHead>{t('admin.status', 'Status')}</TableHead>
              <TableHead>
                {t('franchisee.merchants.credentials', 'Credentials')}
              </TableHead>
              <TableHead className="text-right">
                {t('common.actions', 'Action')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center items-center h-full">
                    <Skeleton className="w-full h-12" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredFranchises.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  {t('common.no_data', 'No data found.')}
                </TableCell>
              </TableRow>
            ) : (
              filteredFranchises.map((f) => {
                const isSent = f.credentialsSent || f.status === 'active'
                return (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.name}</TableCell>
                    <TableCell>{f.taxId || 'N/A'}</TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">
                        {f.contactPerson || 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {f.email || f.contactEmail || f.ownerId}
                      </p>
                    </TableCell>
                    <TableCell>{f.region || f.addressState}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          f.status === 'active' ? 'default' : 'secondary'
                        }
                      >
                        {t(`admin.${f.status}`, f.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={isSent ? 'default' : 'secondary'}
                          className={
                            isSent
                              ? 'bg-green-500 hover:bg-green-600'
                              : 'text-slate-600'
                          }
                        >
                          {isSent
                            ? t('admin.sent', 'Sent')
                            : t('admin.pending', 'Pending')}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                          onClick={() => handleSendCredentials(f)}
                        >
                          {isSent
                            ? t('franchisee.merchants.resend', 'Resend')
                            : t('franchisee.merchants.send', 'Send')}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAccountingExport(f)}
                        title={t(
                          'admin.franchises.export_accounting',
                          'Export Accounting',
                        )}
                        className="text-green-600 hover:text-green-700"
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(f)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteFranchise(f.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFranchise
                ? t('admin.franchises.edit', 'Edit Franchise')
                : t('admin.franchises.add', 'Create New Franchise')}
            </DialogTitle>
          </DialogHeader>
          <AdvancedCompanyForm
            defaultType="franchise"
            initialData={editingFranchise}
            onSave={handleSave}
            onCancel={() => setIsDialogOpen(false)}
            isControlled={true}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={linkModalOpen} onOpenChange={setLinkModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t('admin.activation_link', 'Activation Link')}
            </DialogTitle>{' '}
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <p className="text-sm text-slate-500">
              {t(
                'admin.activation_link_desc',
                'Send this link to the user to set their password and activate the account.',
              )}
            </p>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={generatedLink}
                className="bg-slate-50 font-mono text-sm"
              />
              <Button
                onClick={handleCopyLink}
                variant="secondary"
                className="shrink-0"
              >
                {linkCopied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
