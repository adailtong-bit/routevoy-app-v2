import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { toast } from 'sonner'
import { Trash2, Plus, Percent } from 'lucide-react'
import { CommissionRule } from '@/lib/types'
import { useLanguage } from '@/stores/LanguageContext'

export function CommissionRulesManager() {
  const { t } = useLanguage()
  const [rules, setRules] = useState<CommissionRule[]>([])
  const [franchises, setFranchises] = useState<{ id: string; name: string }[]>(
    [],
  )
  const [loading, setLoading] = useState(true)

  const [serviceType, setServiceType] = useState<
    'publicidade' | 'impulsionamento'
  >('publicidade')
  const [franchiseId, setFranchiseId] = useState<string>('global')
  const [percentage, setPercentage] = useState<string>('10')
  const [validFrom, setValidFrom] = useState<string>('')
  const [validUntil, setValidUntil] = useState<string>('')

  const fetchRules = async () => {
    try {
      const { data, error } = await supabase
        .from('commission_rules')
        .select(
          `
          id,
          franchise_id,
          service_type,
          percentage,
          valid_from,
          valid_until,
          created_at,
          franchises ( name )
        `,
        )
        .order('valid_from', { ascending: false })

      if (error) throw error

      setRules(
        (data || []).map((r: any) => ({
          id: r.id,
          franchiseId: r.franchise_id,
          serviceType: r.service_type,
          percentage: Number(r.percentage),
          validFrom: r.valid_from,
          validUntil: r.valid_until,
          createdAt: r.created_at,
          franchiseName: r.franchises?.name || 'Global',
        })),
      )
    } catch (e: any) {
      toast.error(t('common.error', 'An error occurred') + ': ' + e.message)
    }
  }

  const fetchFranchises = async () => {
    try {
      const { data, error } = await supabase
        .from('franchises')
        .select('id, name')
        .order('name')
      if (error) throw error
      setFranchises(data || [])
    } catch (e: any) {
      toast.error(t('common.error', 'An error occurred'))
    }
  }

  useEffect(() => {
    Promise.all([fetchRules(), fetchFranchises()]).finally(() =>
      setLoading(false),
    )
  }, [])

  const handleAddRule = async () => {
    if (!validFrom) {
      toast.error(
        t('admin.commissions.start_date', 'Start Date') + ' is required',
      )
      return
    }

    const pct = parseFloat(percentage)
    if (isNaN(pct) || pct < 0 || pct > 100) {
      toast.error(
        t('admin.commissions.percentage', 'Percentage (%)') +
          ' must be between 0 and 100',
      )
      return
    }

    if (validUntil && new Date(validFrom) >= new Date(validUntil)) {
      toast.error('The End Date must be after the Start Date')
      return
    }

    const actualFranchiseId = franchiseId === 'global' ? null : franchiseId

    const overlapping = rules.some((r) => {
      if (r.serviceType !== serviceType) return false
      if ((r.franchiseId || null) !== actualFranchiseId) return false

      const start1 = new Date(validFrom).getTime()
      const end1 = validUntil ? new Date(validUntil).getTime() : Infinity
      const start2 = new Date(r.validFrom).getTime()
      const end2 = r.validUntil ? new Date(r.validUntil).getTime() : Infinity

      return start1 < end2 && start2 < end1
    })

    if (overlapping) {
      toast.error(
        t(
          'admin.commissions.overlapping_error',
          'A conflicting rule already exists for this period, service, and franchise.',
        ),
      )
      return
    }

    try {
      const { error } = await supabase.from('commission_rules').insert({
        franchise_id: actualFranchiseId,
        service_type: serviceType,
        percentage: pct,
        valid_from: new Date(validFrom).toISOString(),
        valid_until: validUntil ? new Date(validUntil).toISOString() : null,
      })

      if (error) throw error

      toast.success(
        t('admin.commissions.success_add', 'Rule added successfully'),
      )
      setValidFrom('')
      setValidUntil('')
      setPercentage('10')
      fetchRules()
    } catch (e: any) {
      toast.error(t('common.error', 'An error occurred') + ': ' + e.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.delete', 'Delete') + '?')) return
    try {
      const { error } = await supabase
        .from('commission_rules')
        .delete()
        .eq('id', id)
      if (error) throw error
      toast.success(
        t('admin.commissions.success_delete', 'Rule deleted successfully'),
      )
      fetchRules()
    } catch (e: any) {
      toast.error(t('common.error', 'An error occurred') + ': ' + e.message)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        {t('common.loading', 'Loading...')}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-800">
          {t('admin.commissions.new_rule', 'New Commission Rule')}
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          {t(
            'admin.commissions.new_rule_desc',
            'Set commission rates for Advertising or Offer Boosting.',
          )}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="space-y-2">
            <Label>{t('admin.commissions.service_type', 'Service Type')}</Label>
            <Select
              value={serviceType}
              onValueChange={(val: any) => setServiceType(val)}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder={t('common.select', 'Select...')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="publicidade">
                  {t('admin.commissions.advertising', 'Advertising')}
                </SelectItem>
                <SelectItem value="impulsionamento">
                  {t('admin.commissions.boosting', 'Boosting')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('admin.commissions.franchise', 'Franchise')}</Label>
            <Select value={franchiseId} onValueChange={setFranchiseId}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder={t('common.select', 'Select...')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">
                  {t('admin.commissions.all_global', 'All (Global)')}
                </SelectItem>
                {franchises.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('admin.commissions.percentage', 'Percentage (%)')}</Label>
            <div className="relative">
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={percentage}
                onChange={(e) => {
                  let val = parseFloat(e.target.value)
                  if (val < 0) val = 0
                  if (val > 100) val = 100
                  setPercentage(e.target.value ? String(val) : '')
                }}
                className="bg-white pl-8"
              />
              <Percent className="w-4 h-4 absolute left-2.5 top-3 text-slate-400" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('admin.commissions.start_date', 'Start Date')}</Label>
            <Input
              type="date"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label>
              {t('admin.commissions.end_date_opt', 'End Date (Optional)')}
            </Label>
            <Input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="bg-white"
            />
          </div>

          <div className="md:col-span-5 flex justify-end mt-2">
            <Button onClick={handleAddRule}>
              <Plus className="w-4 h-4 mr-2" />{' '}
              {t('admin.commissions.add_rule', 'Add Rule')}
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          {t(
            'admin.commissions.active_scheduled',
            'Active and Scheduled Rules',
          )}
        </h2>
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>
                  {t('admin.commissions.table.service', 'Service')}
                </TableHead>
                <TableHead>
                  {t('admin.commissions.table.franchise', 'Franchise')}
                </TableHead>
                <TableHead>
                  {t('admin.commissions.table.commission', 'Commission')}
                </TableHead>
                <TableHead>
                  {t('admin.commissions.table.validity', 'Validity')}
                </TableHead>
                <TableHead className="text-right">
                  {t('common.actions', 'Actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-slate-500"
                  >
                    {t(
                      'admin.commissions.no_rules',
                      'No commission rules configured.',
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                rules.map((rule) => {
                  const isActive =
                    new Date(rule.validFrom) <= new Date() &&
                    (!rule.validUntil ||
                      new Date(rule.validUntil) >= new Date())

                  return (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium capitalize">
                        {rule.serviceType === 'publicidade'
                          ? t('admin.commissions.advertising', 'Advertising')
                          : t('admin.commissions.boosting', 'Boosting')}
                        {isActive && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                            {t('admin.active', 'Active')}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {rule.franchiseName ||
                          t('admin.commissions.all_global', 'All (Global)')}
                      </TableCell>
                      <TableCell>{rule.percentage}%</TableCell>
                      <TableCell className="text-sm">
                        De: {new Date(rule.validFrom).toLocaleDateString()}{' '}
                        <br />
                        Até:{' '}
                        {rule.validUntil
                          ? new Date(rule.validUntil).toLocaleDateString()
                          : 'Indeterminado'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(rule.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
