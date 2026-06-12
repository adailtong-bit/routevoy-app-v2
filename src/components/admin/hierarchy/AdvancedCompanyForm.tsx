import React, { useState, useEffect } from 'react'
import { Company, Franchise } from '@/lib/types'
import { useCouponStore } from '@/stores/CouponContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DialogFooter } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  COUNTRIES,
  REGIONS,
  LOCATION_DATA,
  getMergedLocationData,
} from '@/lib/locationData'
import { useLanguage } from '@/stores/LanguageContext'
import { useEnvironment } from '@/hooks/use-environment'
import { useAuth } from '@/hooks/use-auth'
import { ShieldAlert } from 'lucide-react'

interface Props {
  type: 'merchant' | 'franchise' | 'advertiser' | string
  initialData?: Company | null
  franchiseId?: string
  onSave: (data: Partial<Company>) => void
  onCancel: () => void
}

export function AdvancedCompanyForm({
  type,
  initialData,
  franchiseId,
  onSave,
  onCancel,
}: Props) {
  const { t } = useLanguage()
  const { franchises } = useCouponStore()
  const { isDevelopment } = useEnvironment()
  const { profile, franchiseId: userFranchiseId } = useAuth()

  const resolvedFranchiseId =
    franchiseId ||
    (profile?.role === 'franchisee' ? userFranchiseId : 'independent')

  const [formData, setFormData] = useState<
    Partial<Company & Franchise & { country?: string }>
  >({
    name: '',
    email: '',
    status: 'active',
    franchiseId: resolvedFranchiseId,
    businessPhone: '',
    addressCountry: 'USA',
    country: 'USA',
    region: 'Global',

    // Primary contact
    contactPerson: '',
    contactDepartment: '',
    contactEmail: '',
    contactPhone: '',

    // Secondary contact
    secondaryContactName: '',
    secondaryContactDepartment: '',
    secondaryContactEmail: '',
    secondaryContactPhone: '',

    // Billing
    stateRegistration: '',
    billingEmail: '',

    // Address
    addressStreet: '',
    addressNumber: '',
    addressNeighborhood: '',
    addressCity: '',
    addressState: '',
    addressZip: '',
    addressLat: undefined,
    addressLng: undefined,
    coverageScope: 'national',
    coverageStates: [],
    coverageCities: [],
  })

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }))
    }
  }, [initialData])

  useEffect(() => {
    if (
      !initialData &&
      resolvedFranchiseId &&
      resolvedFranchiseId !== 'independent'
    ) {
      setFormData((prev) => ({ ...prev, franchiseId: resolvedFranchiseId }))
    }
  }, [resolvedFranchiseId, initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Sanitize payload to prevent backend 400 errors with read-only fields
    const payload = { ...formData }
    delete (payload as any).id
    delete (payload as any).created
    delete (payload as any).updated
    delete (payload as any).collectionId
    delete (payload as any).collectionName
    delete (payload as any).expand

    onSave(payload)
  }

  const handleNumberChange = (field: keyof Company, value: string) => {
    const num = parseFloat(value)
    setFormData((prev) => ({ ...prev, [field]: isNaN(num) ? undefined : num }))
  }

  const dynamicLocationData = React.useMemo(() => getMergedLocationData(), [])
  const ALL_COUNTRIES = React.useMemo(
    () => Object.keys(dynamicLocationData).sort(),
    [dynamicLocationData],
  )
  const ALL_REGIONS = React.useMemo(
    () =>
      Array.from(
        new Set([
          'Global',
          ...ALL_COUNTRIES,
          'Europe',
          'North America',
          'South America',
        ]),
      ).sort(),
    [ALL_COUNTRIES],
  )

  const parentFranchise =
    formData.franchiseId && formData.franchiseId !== 'independent'
      ? franchises.find((f) => f.id === formData.franchiseId)
      : null

  const allowedStates =
    parentFranchise &&
    (parentFranchise.coverageScope === 'state' ||
      parentFranchise.coverageScope === 'city')
      ? parentFranchise.coverageStates
      : undefined

  const allowedCities =
    parentFranchise && parentFranchise.coverageScope === 'city'
      ? parentFranchise.coverageCities
      : undefined

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      {isDevelopment && (
        <div className="mb-4 p-3 bg-amber-50 text-amber-800 rounded-md border border-amber-200 text-sm flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          <strong>Trava de Segurança:</strong> As alterações feitas aqui serão
          apenas simuladas e não afetarão a produção.
        </div>
      )}
      <Tabs defaultValue="general" className="w-full">
        <TabsList
          className={
            type === 'franchise'
              ? 'grid w-full grid-cols-5'
              : 'grid w-full grid-cols-4'
          }
        >
          <TabsTrigger value="general">
            {t('admin.company.tabs.general', 'General')}
          </TabsTrigger>
          <TabsTrigger value="contacts">
            {t('admin.company.tabs.contacts', 'Contacts')}
          </TabsTrigger>
          <TabsTrigger value="billing">
            {t('admin.company.tabs.billing', 'Billing')}
          </TabsTrigger>
          <TabsTrigger value="address">
            {t('admin.company.tabs.address', 'Addressing')}
          </TabsTrigger>
          {type === 'franchise' && (
            <TabsTrigger value="coverage">
              {t('admin.company.tabs.coverage', 'Coverage')}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {type === 'franchise'
                  ? t('admin.company.name', 'Franchise / Region Name')
                  : t('admin.company.name', 'Company Name')}
              </Label>
              <Input
                required
                placeholder={
                  type === 'franchise' ? 'Ex: Franquia São Paulo' : ''
                }
                value={formData.name || ''}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>
                {type === 'franchise'
                  ? t(
                      'admin.company.master_email',
                      'Franchisee Access Email (Login)',
                    )
                  : t('admin.company.master_email', 'Main Email')}
              </Label>
              <Input
                required
                type="email"
                placeholder="email@example.com"
                value={formData.email || ''}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>
                {t('admin.company.business_phone', 'Business Phone')}
              </Label>
              <Input
                required
                value={formData.businessPhone || ''}
                onChange={(e) =>
                  setFormData({ ...formData, businessPhone: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('profile.country', 'Country')}</Label>
              <Select
                required
                value={formData.addressCountry || formData.country || ''}
                onValueChange={(v) =>
                  setFormData((prev) => ({
                    ...prev,
                    addressCountry: v,
                    country: v,
                    region: prev.region || v,
                    addressState: '',
                    addressCity: '',
                    coverageStates: [],
                    coverageCities: [],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('common.select', 'Select...')} />
                </SelectTrigger>
                <SelectContent>
                  {ALL_COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>
                {t('vendor.settings_tab.assigned_region', 'Assigned Region')}
              </Label>
              <Select
                value={
                  formData.region ||
                  formData.addressCountry ||
                  formData.country ||
                  ''
                }
                onValueChange={(v) => {
                  const isCountry = ALL_COUNTRIES.includes(v)
                  setFormData((prev) => ({
                    ...prev,
                    region: v,
                    ...(isCountry
                      ? {
                          country: v,
                          addressCountry: v,
                          addressState: '',
                          addressCity: '',
                          coverageStates: [],
                          coverageCities: [],
                        }
                      : {}),
                  }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('common.select', 'Select...')} />
                </SelectTrigger>
                <SelectContent>
                  {ALL_REGIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {t(
                  'admin.company.region_help',
                  'Controls default formats (currency, numbers, etc.) for this entity and its children.',
                )}
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6 mt-4">
          <div className="space-y-4">
            <h4 className="text-sm font-medium leading-none">
              {t('admin.company.primary_contact', 'Primary Contact')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('admin.company.contact_name', 'Full Name')}</Label>
                <Input
                  required
                  value={formData.contactPerson || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, contactPerson: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.company.department', 'Department')}</Label>
                <Input
                  required
                  value={formData.contactDepartment || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactDepartment: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.company.contact_email', 'Email')}</Label>
                <Input
                  required
                  type="email"
                  value={formData.contactEmail || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, contactEmail: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.company.contact_phone', 'Phone')}</Label>
                <Input
                  required
                  value={formData.contactPhone || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, contactPhone: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium leading-none">
              {t('admin.company.secondary_contact', 'Secondary Contact')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('admin.company.contact_name', 'Full Name')}</Label>
                <Input
                  value={formData.secondaryContactName || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      secondaryContactName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.company.department', 'Department')}</Label>
                <Input
                  value={formData.secondaryContactDepartment || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      secondaryContactDepartment: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.company.contact_email', 'Email')}</Label>
                <Input
                  type="email"
                  value={formData.secondaryContactEmail || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      secondaryContactEmail: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.company.contact_phone', 'Phone')}</Label>
                <Input
                  value={formData.secondaryContactPhone || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      secondaryContactPhone: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {t('admin.company.state_reg', 'State Registration / Tax ID')}
              </Label>
              <Input
                value={formData.stateRegistration || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stateRegistration: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.company.billing_email', 'Billing Email')}</Label>
              <Input
                type="email"
                value={formData.billingEmail || ''}
                onChange={(e) =>
                  setFormData({ ...formData, billingEmail: e.target.value })
                }
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="address" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {t('admin.company.address.street', 'Street Address')}
              </Label>
              <Input
                required
                value={formData.addressStreet || ''}
                onChange={(e) =>
                  setFormData({ ...formData, addressStreet: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.company.address.number', 'Number')}</Label>
              <Input
                required
                value={formData.addressNumber || ''}
                onChange={(e) =>
                  setFormData({ ...formData, addressNumber: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>
                {t('admin.company.address.neighborhood', 'Neighborhood')}
              </Label>
              <Input
                required
                value={formData.addressNeighborhood || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    addressNeighborhood: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>
                {t('admin.company.address.state', 'State / Province')}
              </Label>
              <Select
                required
                value={formData.addressState || ''}
                onValueChange={(val) =>
                  setFormData({
                    ...formData,
                    addressState: val,
                    addressCity: '',
                  })
                }
                disabled={!formData.addressCountry}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('common.select', 'Select...')} />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(
                    dynamicLocationData[formData.addressCountry || '']
                      ?.states || {},
                  )
                    .filter(
                      (s) =>
                        !allowedStates ||
                        allowedStates.length === 0 ||
                        allowedStates.includes(s),
                    )
                    .map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('admin.company.address.city', 'City')}</Label>
              <Select
                required
                value={formData.addressCity || ''}
                onValueChange={(val) =>
                  setFormData({ ...formData, addressCity: val })
                }
                disabled={!formData.addressState}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('common.select', 'Select...')} />
                </SelectTrigger>
                <SelectContent>
                  {(
                    dynamicLocationData[formData.addressCountry || '']?.states[
                      formData.addressState || ''
                    ] || []
                  )
                    .filter(
                      (c) =>
                        !allowedCities ||
                        allowedCities.length === 0 ||
                        allowedCities.includes(c),
                    )
                    .map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('admin.company.address.zip', 'ZIP Code')}</Label>
              <Input
                required
                value={formData.addressZip || ''}
                onChange={(e) =>
                  setFormData({ ...formData, addressZip: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.company.address.lat', 'Latitude')}</Label>
              <Input
                required
                type="number"
                step="any"
                value={formData.addressLat ?? ''}
                onChange={(e) =>
                  handleNumberChange('addressLat', e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.company.address.lng', 'Longitude')}</Label>
              <Input
                required
                type="number"
                step="any"
                value={formData.addressLng ?? ''}
                onChange={(e) =>
                  handleNumberChange('addressLng', e.target.value)
                }
              />
            </div>
          </div>
        </TabsContent>
        {type === 'franchise' && (
          <TabsContent value="coverage" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>
                  {t('admin.franchise.coverage_scope', 'Coverage Scope')}
                </Label>
                <Select
                  value={formData.coverageScope || 'national'}
                  onValueChange={(val: any) =>
                    setFormData({
                      ...formData,
                      coverageScope: val,
                      coverageStates: [],
                      coverageCities: [],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('common.select', 'Select...')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national">
                      {t('admin.franchise.scope.national', 'National')}
                    </SelectItem>
                    <SelectItem value="state">
                      {t('admin.franchise.scope.state', 'Specific States')}
                    </SelectItem>
                    <SelectItem value="city">
                      {t('admin.franchise.scope.city', 'Specific Cities')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(formData.coverageScope === 'state' ||
                formData.coverageScope === 'city') && (
                <div className="space-y-2">
                  <Label>
                    {t('admin.franchise.coverage_states', 'Allowed States')}
                  </Label>
                  <div className="border rounded-md p-4 max-h-48 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.keys(
                      dynamicLocationData[formData.addressCountry || '']
                        ?.states || {},
                    ).map((s) => (
                      <label
                        key={s}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={(formData.coverageStates || []).includes(s)}
                          onChange={(e) => {
                            const newStates = e.target.checked
                              ? [...(formData.coverageStates || []), s]
                              : (formData.coverageStates || []).filter(
                                  (st) => st !== s,
                                )
                            setFormData({
                              ...formData,
                              coverageStates: newStates,
                            })
                          }}
                          className="rounded border-gray-300"
                        />
                        <span>{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {formData.coverageScope === 'city' && (
                <div className="space-y-2">
                  <Label>
                    {t('admin.franchise.coverage_cities', 'Allowed Cities')}
                  </Label>
                  <div className="border rounded-md p-4 max-h-48 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(formData.coverageStates || [])
                      .flatMap(
                        (s) =>
                          dynamicLocationData[formData.addressCountry || '']
                            ?.states[s] || [],
                      )
                      .map((c) => (
                        <label
                          key={c}
                          className="flex items-center space-x-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={(formData.coverageCities || []).includes(
                              c,
                            )}
                            onChange={(e) => {
                              const newCities = e.target.checked
                                ? [...(formData.coverageCities || []), c]
                                : (formData.coverageCities || []).filter(
                                    (ci) => ci !== c,
                                  )
                              setFormData({
                                ...formData,
                                coverageCities: newCities,
                              })
                            }}
                            className="rounded border-gray-300"
                          />
                          <span>{c}</span>
                        </label>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>

      <DialogFooter className="mt-6 pt-4 border-t">
        <Button variant="outline" type="button" onClick={onCancel}>
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button
          type="submit"
          className={
            isDevelopment ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''
          }
        >
          {isDevelopment ? (
            <>
              <ShieldAlert className="w-4 h-4 mr-2" />
              Simular (Trava Ativa)
            </>
          ) : (
            t('common.save', 'Save')
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}
