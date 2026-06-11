import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'

export function AdPricingTab({
  environment = 'production',
}: {
  environment?: string
}) {
  const [pricing, setPricing] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { t } = useLanguage()

  const [formData, setFormData] = useState({
    placement: '',
    billing_type: 'fixed',
    price: '',
    duration_days: '30',
  })

  useEffect(() => {
    fetchPricing()
  }, [environment])

  const fetchPricing = async () => {
    const { data } = await supabase
      .from('ad_pricing')
      .select('*')
      .eq('environment', environment)
      .order('created_at', { ascending: false })
    if (data) setPricing(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('ad_pricing').insert([
      {
        placement: formData.placement,
        billing_type: formData.billing_type,
        price: parseFloat(formData.price),
        duration_days: parseInt(formData.duration_days),
        environment,
      },
    ])

    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success(t('common.success', 'Pricing configured successfully'))
      setFormData({
        placement: '',
        billing_type: 'fixed',
        price: '',
        duration_days: '30',
      })
      fetchPricing()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirm_delete', 'Are you sure?'))) return
    const { error } = await supabase.from('ad_pricing').delete().eq('id', id)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success(t('common.success', 'Removed successfully'))
      fetchPricing()
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold mb-4 text-slate-800">
          {t('ads.add_pricing', 'Add Pricing Configuration')}
        </h3>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
        >
          <div className="space-y-2">
            <Label>{t('admin.ads.placement', 'Placement')}</Label>
            <Input
              required
              value={formData.placement}
              onChange={(e) =>
                setFormData({ ...formData, placement: e.target.value })
              }
              placeholder="E.g.: home_hero, sidebar"
            />
          </div>
          <div className="space-y-2">
            <Label>{t('admin.ads.billing_type', 'Billing Type')}</Label>
            <select
              required
              className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={formData.billing_type}
              onChange={(e) =>
                setFormData({ ...formData, billing_type: e.target.value })
              }
            >
              <option value="fixed">Fixed (Premium)</option>
              <option value="cpc">CPC (Cost Per Click)</option>
              <option value="cpa">CPA (Cost Per Acquisition)</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>{t('admin.ads.price', 'Price')}</Label>
            <Input
              required
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label>{t('ads.duration_days', 'Duration (Days)')}</Label>
            <Input
              type="number"
              value={formData.duration_days}
              onChange={(e) =>
                setFormData({ ...formData, duration_days: e.target.value })
              }
              placeholder="30"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            {t('common.save', 'Add')}
          </Button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>{t('admin.ads.placement', 'Placement')}</TableHead>
              <TableHead>
                {t('admin.ads.billing_type', 'Billing Type')}
              </TableHead>
              <TableHead>{t('admin.ads.price', 'Price')}</TableHead>
              <TableHead>{t('ads.duration_days', 'Duration')}</TableHead>
              <TableHead className="w-16 text-right">
                {t('common.actions', 'Actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pricing.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.placement}</TableCell>
                <TableCell className="uppercase">{p.billing_type}</TableCell>
                <TableCell className="font-semibold text-emerald-600">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(p.price)}
                </TableCell>
                <TableCell>
                  {p.duration_days ? `${p.duration_days} days` : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:bg-red-50"
                    onClick={() => handleDelete(p.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {pricing.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-8"
                >
                  {t('ads.no_rules', 'No configurations defined.')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
