import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TargetGroupDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
  companyId,
  franchiseId,
  affiliateId,
}: any) {
  const [loading, setLoading] = useState(false)
  const [categoriesList, setCategoriesList] = useState<any[]>([])
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    filters: {
      country: '',
      city: '',
      state: '',
      gender: '',
      vipStatus: 'all',
      minAge: '',
      maxAge: '',
      frequency: 'all',
      categories: [] as string[],
    },
  })

  useEffect(() => {
    supabase
      .from('categories')
      .select('id, name, label')
      .eq('status', 'active')
      .then(({ data }) => {
        if (data) setCategoriesList(data)
      })
  }, [])

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        filters: {
          country: '',
          city: '',
          state: '',
          gender: '',
          vipStatus: 'all',
          minAge:
            initialData.filters?.age_range?.min ||
            initialData.filters?.minAge ||
            '',
          maxAge:
            initialData.filters?.age_range?.max ||
            initialData.filters?.maxAge ||
            '',
          frequency:
            initialData.filters?.consumption_profile ||
            initialData.filters?.frequency ||
            'all',
          categories: initialData.filters?.categories || [],
          ...initialData.filters,
        },
      })
    } else {
      setFormData({
        name: '',
        description: '',
        filters: {
          country: '',
          city: '',
          state: '',
          gender: '',
          vipStatus: 'all',
          minAge: '',
          maxAge: '',
          frequency: 'all',
          categories: [],
        },
      })
    }
  }, [initialData, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      let leadCount = 0

      let profileQuery = supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })

      if (formData.filters.city)
        profileQuery = profileQuery.ilike('city', `%${formData.filters.city}%`)
      if (formData.filters.state)
        profileQuery = profileQuery.ilike(
          'state',
          `%${formData.filters.state}%`,
        )
      if (formData.filters.country)
        profileQuery = profileQuery.ilike(
          'country',
          `%${formData.filters.country}%`,
        )
      if (formData.filters.gender && formData.filters.gender !== 'all')
        profileQuery = profileQuery.eq('gender', formData.filters.gender)
      if (formData.filters.vipStatus === 'vip')
        profileQuery = profileQuery.eq('is_vip', true)
      if (formData.filters.vipStatus === 'regular')
        profileQuery = profileQuery.eq('is_vip', false)

      if (formData.filters.minAge) {
        const maxDate = new Date()
        maxDate.setFullYear(
          maxDate.getFullYear() - Number(formData.filters.minAge),
        )
        profileQuery = profileQuery.lte(
          'birthday',
          maxDate.toISOString().split('T')[0],
        )
      }
      if (formData.filters.maxAge) {
        const minDate = new Date()
        minDate.setFullYear(
          minDate.getFullYear() - Number(formData.filters.maxAge) - 1,
        )
        profileQuery = profileQuery.gt(
          'birthday',
          minDate.toISOString().split('T')[0],
        )
      }

      const { count } = await profileQuery
      leadCount = count || 0

      const payloadFilters = {
        ...formData.filters,
        age_range: {
          min: formData.filters.minAge ? Number(formData.filters.minAge) : null,
          max: formData.filters.maxAge ? Number(formData.filters.maxAge) : null,
        },
        consumption_profile: formData.filters.frequency,
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        filters: payloadFilters,
        lead_count: leadCount,
        company_id: companyId || null,
        franchise_id: franchiseId || null,
        affiliate_id: affiliateId || null,
      }

      let error
      if (initialData?.id) {
        const res = await supabase
          .from('crm_target_groups')
          .update(payload)
          .eq('id', initialData.id)
        error = res.error
      } else {
        const res = await supabase.from('crm_target_groups').insert(payload)
        error = res.error
      }

      if (error) throw error
      toast.success('Target group saved successfully')
      onSuccess?.()
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (categoryId: string) => {
    setFormData((prev) => {
      const current = prev.filters.categories || []
      const updated = current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId]
      return {
        ...prev,
        filters: { ...prev.filters, categories: updated },
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Target Group' : 'Create Target Group'}
          </DialogTitle>
          <DialogDescription>
            Define your audience segmentation rules based on Profile data.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label>Group Name</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. VIP Customers, Summer Promo"
              />
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Details about this segment..."
                rows={2}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold mb-4">Segmentation Filters</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Country</Label>
                <Input
                  value={formData.filters.country}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      filters: { ...formData.filters, country: e.target.value },
                    })
                  }
                  placeholder="e.g. Brasil"
                />
              </div>

              <div className="space-y-2">
                <Label>State / Region</Label>
                <Input
                  value={formData.filters.state}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      filters: { ...formData.filters, state: e.target.value },
                    })
                  }
                  placeholder="e.g. SP"
                />
              </div>

              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={formData.filters.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      filters: { ...formData.filters, city: e.target.value },
                    })
                  }
                  placeholder="e.g. São Paulo"
                />
              </div>

              <div className="space-y-2">
                <Label>Gender</Label>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.filters.gender}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      filters: { ...formData.filters, gender: e.target.value },
                    })
                  }
                >
                  <option value="">All</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Age Range</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={formData.filters.minAge}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        filters: {
                          ...formData.filters,
                          minAge: e.target.value,
                        },
                      })
                    }
                  />
                  <span className="text-slate-500">-</span>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={formData.filters.maxAge}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        filters: {
                          ...formData.filters,
                          maxAge: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Consumption Profile</Label>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.filters.frequency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      filters: {
                        ...formData.filters,
                        frequency: e.target.value,
                      },
                    })
                  }
                >
                  <option value="all">All</option>
                  <option value="high">High Frequency / Whale</option>
                  <option value="medium">Medium Frequency</option>
                  <option value="low">Low Frequency / Casual</option>
                  <option value="new">New Customer</option>
                  <option value="churn-risk">At Risk of Churn</option>
                </select>
              </div>

              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label>System Categories</Label>
                <Popover open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isCategoryOpen}
                      className="w-full justify-between h-auto min-h-[2.5rem] whitespace-normal"
                    >
                      {formData.filters.categories.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {formData.filters.categories.map((catId) => {
                            const cat = categoriesList.find(
                              (c) => c.id === catId || c.name === catId,
                            )
                            return (
                              <span
                                key={catId}
                                className="bg-primary/10 text-primary px-2 py-0.5 rounded-md text-xs"
                              >
                                {cat?.label || cat?.name || catId}
                              </span>
                            )
                          })}
                        </div>
                      ) : (
                        <span className="text-muted-foreground font-normal">
                          Select categories...
                        </span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[300px] md:w-[400px] p-0"
                    align="start"
                  >
                    <Command>
                      <CommandInput placeholder="Search categories..." />
                      <CommandList>
                        <CommandEmpty>No category found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {categoriesList.map((category) => {
                            const isSelected =
                              formData.filters.categories.includes(
                                category.name,
                              )
                            return (
                              <CommandItem
                                key={category.id}
                                value={category.name}
                                onSelect={() => toggleCategory(category.name)}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    isSelected ? 'opacity-100' : 'opacity-0',
                                  )}
                                />
                                {category.label}
                              </CommandItem>
                            )
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Target Group'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
