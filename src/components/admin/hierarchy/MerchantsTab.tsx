import { useState } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Store,
  Download,
  FileText,
  Copy,
  Check,
} from 'lucide-react'
import { Company } from '@/lib/types'
import { AdvancedCompanyForm } from './AdvancedCompanyForm'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { logAudit } from '@/services/audit'
import { useAuth } from '@/hooks/use-auth'

export function MerchantsTab({ franchiseId }: { franchiseId?: string }) {
  const { user: authUser } = useAuth()
  const { companies, franchises, addCompany, updateCompany, deleteCompany } =
    useCouponStore()
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const urlSearch = (searchParams.get('q') || '').toLowerCase()
  const location = useLocation()
  const isFranchisee = location.pathname.includes('/franchisee')

  const [searchQuery, setSearchQuery] = useState(urlSearch)
  const [statusFilter, setStatusFilter] = useState('all')
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMerchant, setEditingMerchant] = useState<Company | null>(null)

  const [generatedLink, setGeneratedLink] = useState('')
  const [linkModalOpen, setLinkModalOpen] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink)
    setLinkCopied(true)
    toast.success(t('admin.link_copied', 'Link copiado!'))
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const displayCompanies = (
    franchiseId
      ? companies.filter((c) => c.franchiseId === franchiseId)
      : companies
  ).filter((c) => {
    if (deletedIds.has(c.id)) return false

    const matchesSearch =
      !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.region && c.region.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleOpenDialog = (merchant?: Company) => {
    if (merchant) {
      setEditingMerchant(merchant)
    } else {
      setEditingMerchant(null)
    }
    setIsDialogOpen(true)
  }

  const handleSave = (finalData: any) => {
    const formattedData = {
      ...finalData,
      franchiseId:
        finalData.franchiseId === 'independent'
          ? undefined
          : finalData.franchiseId,
      region: finalData.addressState || finalData.addressCity || 'Global',
    }

    if (editingMerchant) {
      updateCompany(editingMerchant.id, formattedData)
    } else {
      const newCompany: Company = {
        ...formattedData,
        id: Math.random().toString(),
        registrationDate: new Date().toISOString(),
        enableLoyalty: false,
        credentialsSent: false,
      }
      addCompany(newCompany)
    }
    setIsDialogOpen(false)
  }

  const getFranchiseName = (id?: string) => {
    if (!id) return t('franchisee.merchants.independent', 'Independente')
    return (
      franchises.find((f) => f.id === id)?.name ||
      t('franchisee.merchants.unknown', 'Desconhecida')
    )
  }

  const exportCsv = () => {
    const headers = ['ID', 'Name', 'Email', 'Franchise', 'Region', 'Status']
    const rows = displayCompanies.map(
      (c) =>
        `"${c.id}","${c.name}","${c.email}","${getFranchiseName(c.franchiseId)}","${c.region}","${c.status}"`,
    )
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      headers.join(',') +
      '\n' +
      rows.join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'lojistas_export.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportPdf = () => {
    const w = window.open('', '_blank')
    if (w) {
      w.document.write(`
        <html><head><title>Relatório de Lojistas</title>
        <style>body{font-family:sans-serif; padding:20px;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #ddd; padding:8px; text-align:left;}</style></head>
        <body>
        <h1>Relatório de Lojistas</h1>
        <table>
          <tr><th>Nome</th><th>Email</th><th>Franquia</th><th>Região</th><th>Status</th></tr>
          ${displayCompanies.map((c) => `<tr><td>${c.name}</td><td>${c.email}</td><td>${getFranchiseName(c.franchiseId)}</td><td>${c.region}</td><td>${c.status}</td></tr>`).join('')}
        </table>
        <script>window.print(); window.close();</script>
        </body></html>
      `)
      w.document.close()
    }
  }

  const handleDeleteCompany = async (company: Company) => {
    if (
      !confirm(
        `${t('common.confirm_delete', 'Are you sure you want to delete?')} ${company.name}?`,
      )
    )
      return

    try {
      // Optimistic UI update to prevent screen from looking stuck
      setDeletedIds((prev) => new Set(prev).add(company.id))

      const { error } = await supabase
        .from('merchants')
        .delete()
        .eq('id', company.id)
      if (error) throw error

      deleteCompany(company.id)
      await logAudit(
        'DELETE',
        'merchant',
        company.id,
        `Lojista ${company.name} excluído do sistema`,
        authUser?.email,
      )
      toast.success(t('common.success', 'Merchant deleted successfully!'))
    } catch (error) {
      console.error('Delete error', error)
      toast.error(t('common.error', 'Error deleting merchant'))
      // Revert optimistic update
      setDeletedIds((prev) => {
        const next = new Set(prev)
        next.delete(company.id)
        return next
      })
    }
  }

  const handleSendCredentials = async (c: Company) => {
    try {
      const { data: inv, error: fetchErr } = await supabase
        .from('user_invitations')
        .select('id')
        .eq('email', c.email)
        .eq('status', 'pending')
        .maybeSingle()

      let inviteId = inv?.id

      if (!inviteId) {
        const { data: newInv, error: insertErr } = await supabase
          .from('user_invitations')
          .insert({
            email: c.email,
            role: 'merchant',
            company_id: c.id,
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

      updateCompany(c.id, { credentialsSent: true })
    } catch (err: any) {
      console.error('Error generating link:', err)
      toast.error(t('common.error', 'Error generating activation link'))
    }
  }

  return (
    <div className="space-y-4 animate-fade-in-up min-w-0 w-full max-w-full">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm gap-4 min-w-0 w-full">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 bg-primary/10 rounded-lg text-primary hidden sm:block shrink-0">
            <Store className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-800 truncate">
              {t('franchisee.merchants.title', 'Diretório de Lojistas')}
            </h3>
            <p className="text-sm text-slate-500 truncate">
              {franchiseId
                ? t(
                    'franchisee.merchants.desc_franchise',
                    'Gerencie os lojistas vinculados à sua franquia.',
                  )
                : t(
                    'franchisee.merchants.desc_global',
                    'Gerencie todos os lojistas (independentes e de franquias).',
                  )}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto shrink-0">
          <Input
            placeholder={t('admin.merchants.search', 'Buscar lojistas...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-48 bg-slate-50"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-36 bg-slate-50">
              <SelectValue
                placeholder={t('admin.merchants.filter_status', 'Status')}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t('admin.merchants.all_statuses', 'Todos')}
              </SelectItem>
              <SelectItem value="active">
                {t('admin.active', 'Ativo')}
              </SelectItem>
              <SelectItem value="pending">
                {t('admin.pending', 'Pendente')}
              </SelectItem>
              <SelectItem value="inactive">
                {t('admin.inactive', 'Inativo')}
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={exportCsv}
            className="font-semibold flex-1 sm:flex-none"
          >
            <FileText className="w-4 h-4 mr-2" />{' '}
            {t('franchisee.merchants.export_csv', 'CSV')}
          </Button>
          <Button
            variant="outline"
            onClick={exportPdf}
            className="font-semibold flex-1 sm:flex-none"
          >
            <Download className="w-4 h-4 mr-2" />{' '}
            {t('franchisee.merchants.export_pdf', 'PDF')}
          </Button>
          <Button
            onClick={() => handleOpenDialog()}
            className="font-bold w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />{' '}
            {t('franchisee.merchants.add', 'Adicionar Lojista')}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          'rounded-xl border border-slate-200 bg-white shadow-sm min-w-0 w-full',
          !isFranchisee && 'overflow-hidden',
        )}
      >
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-700 whitespace-nowrap">
                {t('franchisee.merchants.name', 'Nome da Loja')}
              </TableHead>
              <TableHead className="font-semibold text-slate-700 whitespace-nowrap">
                {t('franchisee.merchants.email', 'E-mail')}
              </TableHead>
              <TableHead className="font-semibold text-slate-700 whitespace-nowrap">
                {t('franchisee.merchants.location', 'Localização')}
              </TableHead>
              {!franchiseId && (
                <TableHead className="font-semibold text-slate-700 whitespace-nowrap">
                  {t('franchisee.merchants.affiliation', 'Afiliação')}
                </TableHead>
              )}
              <TableHead className="font-semibold text-slate-700 whitespace-nowrap">
                {t('franchisee.merchants.status', 'Status')}
              </TableHead>
              <TableHead className="font-semibold text-slate-700 whitespace-nowrap">
                {t('franchisee.merchants.credentials', 'Credenciais')}
              </TableHead>
              <TableHead className="font-semibold text-slate-700 text-right whitespace-nowrap">
                {t('franchisee.merchants.actions', 'Ações')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayCompanies.map((c) => {
              const isSent = c.credentialsSent || c.status === 'active'
              return (
                <TableRow key={c.id} className="hover:bg-slate-50/80">
                  <TableCell className="font-bold text-slate-800 whitespace-nowrap">
                    {c.name}
                  </TableCell>
                  <TableCell className="text-slate-600 font-medium whitespace-nowrap">
                    {c.email}
                  </TableCell>
                  <TableCell className="text-slate-600 whitespace-nowrap">
                    {c.region || c.addressCountry}
                  </TableCell>
                  {!franchiseId && (
                    <TableCell className="whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className="bg-slate-100 text-slate-700"
                      >
                        {getFranchiseName(c.franchiseId)}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell className="whitespace-nowrap">
                    <Badge
                      variant={
                        c.status === 'active'
                          ? 'default'
                          : c.status === 'pending'
                            ? 'secondary'
                            : 'destructive'
                      }
                      className={cn(
                        c.status === 'active' && 'bg-emerald-500',
                        'capitalize',
                      )}
                    >
                      {c.status === 'active'
                        ? t('franchisee.merchants.active', 'Ativo')
                        : c.status === 'pending'
                          ? t('franchisee.merchants.pending', 'Pendente')
                          : t('franchisee.merchants.inactive', 'Inativo')}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={isSent ? 'default' : 'secondary'}
                        className={
                          isSent
                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }
                      >
                        {isSent
                          ? t('franchisee.merchants.sent', 'Enviado')
                          : t('franchisee.merchants.pending', 'Pendente')}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-primary hover:text-primary/80 font-bold hover:bg-primary/10"
                        onClick={() => handleSendCredentials(c)}
                      >
                        {isSent
                          ? t('franchisee.merchants.resend', 'Reenviar')
                          : t('franchisee.merchants.send', 'Enviar')}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(c)}
                      className="text-slate-500 hover:text-primary hover:bg-primary/5"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCompany(c)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
            {displayCompanies.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={franchiseId ? 6 : 7}
                  className="text-center py-12 text-slate-500 font-medium"
                >
                  {t(
                    'franchisee.merchants.no_merchants',
                    'Nenhum lojista encontrado.',
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMerchant
                ? t('franchisee.merchants.edit', 'Editar Lojista')
                : t('franchisee.merchants.add', 'Cadastrar Lojista')}
            </DialogTitle>
          </DialogHeader>
          <AdvancedCompanyForm
            type="merchant"
            initialData={editingMerchant}
            franchiseId={franchiseId}
            onSave={handleSave}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={linkModalOpen} onOpenChange={setLinkModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t('admin.activation_link', 'Link de Ativação')}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <p className="text-sm text-slate-500">
              {t(
                'admin.activation_link_desc',
                'Envie este link para o usuário definir sua senha e ativar a conta.',
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
