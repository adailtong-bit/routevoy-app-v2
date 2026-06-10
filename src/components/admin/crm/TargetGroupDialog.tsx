import { useState, useMemo } from 'react'
import { useLanguage } from '@/stores/LanguageContext'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Users } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function TargetGroupDialog({
  open,
  onOpenChange,
  editingGroup,
  profiles,
  engagements,
  categories,
  companyId,
  franchiseId,
  affiliateId,
  onSaved,
}: any) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState<any>(
    editingGroup || {
      name: '',
      description: '',
      filters: {
        categories: [],
        frequency: 'all',
        gender: 'all',
        state: 'all',
        city: 'all',
        minAge: '',
        maxAge: '',
      },
    },
  )

  const availableStates = useMemo(
    () =>
      Array.from(
        new Set(profiles.map((u: any) => u.state).filter(Boolean)),
      ).sort(),
    [profiles],
  )
  const availableCities = useMemo(
    () =>
      Array.from(
        new Set(
          profiles
            .filter(
              (u: any) =>
                !formData.filters.state ||
                formData.filters.state === 'all' ||
                u.state === formData.filters.state,
            )
            .map((u: any) => u.city)
            .filter(Boolean),
        ),
      ).sort(),
    [profiles, formData.filters.state],
  )

  const estimatedLeads = useMemo(() => {
    return profiles.filter((u: any) => {
      const { gender, minAge, maxAge, state, city, frequency } =
        formData.filters
      if (gender && gender !== 'all' && u.gender !== gender) return false
      if (state && state !== 'all' && u.state !== state) return false
      if (city && city !== 'all' && u.city !== city) return false
      if (minAge || maxAge) {
        const age = u.birthday
          ? new Date().getFullYear() - new Date(u.birthday).getFullYear()
          : null
        if (age === null) return false
        if (minAge && age < minAge) return false
        if (maxAge && age > maxAge) return false
      }
      if (frequency && frequency !== 'all') {
        const count = engagements.filter((e: any) => e.user_id === u.id).length
        if (frequency === 'high' && count < 10) return false
        if (frequency === 'medium' && (count < 3 || count > 9)) return false
        if (frequency === 'low' && (count < 1 || count > 2)) return false
      }
      return true
    }).length
  }, [profiles, engagements, formData.filters])

  const handleSave = async () => {
    const payload = {
      name: formData.name,
      description: formData.description,
      filters: formData.filters,
      lead_count: estimatedLeads,
      company_id: companyId || null,
      franchise_id: franchiseId || null,
      affiliate_id: affiliateId || null,
    }
    if (editingGroup)
      await supabase
        .from('crm_target_groups')
        .update(payload)
        .eq('id', editingGroup.id)
    else await supabase.from('crm_target_groups').insert([payload])

    toast.success('Grupo salvo com sucesso!')
    onSaved()
    onOpenChange(false)
  }

  const updateFilter = (k: string, v: any) =>
    setFormData({ ...formData, filters: { ...formData.filters, [k]: v } })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingGroup
              ? t('admin.crm_tabs.edit_group', 'Edit Group')
              : t('admin.crm_tabs.create_group', 'Create Target Group')}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>{t('admin.crm_tabs.group_name', 'Group Name')}</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g. Mulheres 25+ SP"
            />
          </div>
          <div className="space-y-2">
            <Label>{t('admin.crm_tabs.group_desc', 'Description')}</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('admin.crm_tabs.gender', 'Gender')}</Label>
              <Select
                value={formData.filters.gender || 'all'}
                onValueChange={(v) => updateFilter('gender', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('admin.crm_tabs.frequency', 'Frequency')}</Label>
              <Select
                value={formData.filters.frequency || 'all'}
                onValueChange={(v) => updateFilter('frequency', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="high">Alta (10+)</SelectItem>
                  <SelectItem value="medium">Média (3-9)</SelectItem>
                  <SelectItem value="low">Baixa (1-2)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('admin.crm_tabs.state', 'State')}</Label>
              <Select
                value={formData.filters.state || 'all'}
                onValueChange={(v) => {
                  updateFilter('state', v)
                  updateFilter('city', 'all')
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {availableStates.map((s: any) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('admin.crm_tabs.city', 'City')}</Label>
              <Select
                value={formData.filters.city || 'all'}
                onValueChange={(v) => updateFilter('city', v)}
                disabled={
                  !formData.filters.state || formData.filters.state === 'all'
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {availableCities.map((c: any) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('admin.crm_tabs.min_age', 'Min Age')}</Label>
              <Input
                type="number"
                value={formData.filters.minAge || ''}
                onChange={(e) => updateFilter('minAge', e.target.value)}
                placeholder="Ex: 18"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.crm_tabs.max_age', 'Max Age')}</Label>
              <Input
                type="number"
                value={formData.filters.maxAge || ''}
                onChange={(e) => updateFilter('maxAge', e.target.value)}
                placeholder="Ex: 65"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>
                {t('admin.crm_tabs.consumption_profile', 'Consumption Profile')}
              </Label>
              <Select
                value={formData.filters.categories?.[0] || 'all'}
                onValueChange={(v) =>
                  updateFilter('categories', v === 'all' ? [] : [v])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categories?.map((c: any) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl border flex items-center justify-between mt-2">
            <span className="text-sm font-medium text-blue-800 flex items-center gap-2">
              <Users className="w-4 h-4" /> Leads Estimados
            </span>
            <span className="font-black text-2xl text-blue-600">
              {estimatedLeads}
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button onClick={handleSave} disabled={!formData.name}>
            {t('common.save', 'Save Group')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
