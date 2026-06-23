import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Mail, Search, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { CreateAffiliateModal } from '@/components/admin/CreateAffiliateModal'

export function AdminAffiliatesTab({ franchiseId }: { franchiseId?: string }) {
  const { t } = useLanguage()
  const { franchises } = useCouponStore()
  const [affiliates, setAffiliates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const franchise = franchiseId
    ? franchises.find((f) => f.id === franchiseId)
    : null

  const fetchAffiliates = async () => {
    setLoading(true)
    let query = supabase.from('profiles').select('*').eq('is_affiliate', true)

    if (franchiseId && franchise) {
      if (franchise.addressCountry) {
        query = query.eq('country', franchise.addressCountry)
      }
      if (franchise.addressState) {
        query = query.eq('state', franchise.addressState)
      }
    }

    const { data, error } = await query
    if (error) {
      toast.error(error.message)
    } else {
      setAffiliates(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAffiliates()
  }, [franchiseId, franchise])

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', id)
    if (!error) {
      toast.success(t('common.success', 'Status updated'))
      fetchAffiliates()
    } else {
      toast.error(error.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirm_delete', 'Are you sure?'))) return
    const { error } = await supabase
      .from('profiles')
      .update({ is_affiliate: false })
      .eq('id', id)
    if (!error) {
      toast.success(t('common.success', 'Removed from affiliates'))
      fetchAffiliates()
    } else {
      toast.error(error.message)
    }
  }

  const filtered = affiliates.filter(
    (a) =>
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            className="pl-9"
            placeholder={t('common.search', 'Search...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          {t('admin.add_affiliate', 'Add Affiliate')}
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('auth.name', 'Name')}</TableHead>
              <TableHead>{t('auth.email', 'Email')}</TableHead>
              <TableHead>{t('profile.location', 'Location')}</TableHead>
              <TableHead>{t('admin.status', 'Status')}</TableHead>
              <TableHead className="text-right">
                {t('common.actions', 'Actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-slate-500"
                >
                  {t('common.no_results', 'No results found')}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((affiliate) => (
                <TableRow key={affiliate.id}>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      <User className="h-4 w-4 text-slate-400" />
                      {affiliate.name || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="h-4 w-4" />
                      {affiliate.email}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {[affiliate.city, affiliate.state, affiliate.country]
                      .filter(Boolean)
                      .join(', ') || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        affiliate.status === 'active' ? 'default' : 'secondary'
                      }
                    >
                      {affiliate.status || 'pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        toggleStatus(affiliate.id, affiliate.status)
                      }
                    >
                      {affiliate.status === 'active' ? (
                        <XCircle className="h-4 w-4 text-orange-500" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(affiliate.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateAffiliateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchAffiliates}
      />
    </div>
  )
}
