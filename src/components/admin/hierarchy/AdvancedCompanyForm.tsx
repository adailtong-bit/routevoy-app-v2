import React, { useState, useEffect } from 'react'
import { Company, Franchise } from '@/lib/types'
import { useCouponStore } from '@/stores/CouponContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DialogFooter } from '@/components/ui/dialog'
import { PhoneInput } from '@/components/PhoneInput'
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
    addressCountry: 'Brasil',
    country: 'Brasil',
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
    businessSize: '',
    monthlyFixedFee: 0,
    feeValidFrom: '',

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
      setFormData((prev) => {
        const isDifferent =
          JSON.stringify({ ...prev, ...initialData }) !== JSON.stringify(prev)
        return isDifferent ? { ...prev, ...initialData } : prev
      })
    }
  }, [initialData])

  useEffect(() => {
    if (
      !initialData &&
      resolvedFranchiseId &&
      resolvedFranchiseId !== 'independent'
    ) {
      setFormData((prev) => {
        if (prev.franchiseId !== resolvedFranchiseId) {
          return { ...prev, franchiseId: resolvedFranchiseId }
        }
        return prev
      })
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

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    const country = formData.addressCountry || formData.country || ''
    if (country === 'Brasil' || country === 'Brazil' || country === 'BR') {
      if (val.length > 8) val = val.slice(0, 8)
      val = val.replace(/^(\d{5})(\d{0,3})/, '$1-$2').replace(/-$/, '')
    } else if (
      country === 'USA' ||
      country === 'US' ||
      country === 'United States'
    ) {
      if (val.length > 9) val = val.slice(0, 9)
      if (val.length > 5) {
        val = val.replace(/^(\d{5})(\d{0,4})/, '$1-$2').replace(/-$/, '')
      }
    } else {
      if (val.length > 10) val = val.slice(0, 10)
    }
    setFormData((prev) => ({ ...prev, addressZip: val }))
  }

  const fetchCoordinates = async (address: string) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
      )
      const data = await res.json()
      if (data && data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
          addressLat: parseFloat(data[0].lat),
          addressLng: parseFloat(data[0].lon),
        }))
      }
    } catch (err) {
      console.error('Geocoding error:', err)
    }
  }

  const handleAddressBlur = () => {
    const {
      addressStreet,
      addressCity,
      addressState,
      addressCountry,
      addressZip,
    } = formData
    if (addressCity && addressState) {
      const query = [
        addressStreet,
        addressCity,
        addressState,
        addressZip,
        addressCountry,
      ]
        .filter(Boolean)
        .join(', ')
      fetchCoordinates(query)
    }
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

  const phoneCountryCode =
    formData.addressCountry === 'USA' ||
    formData.addressCountry === 'United States'
      ? 'US'
      : 'BR'

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
              <PhoneInput
                value={formData.businessPhone || ''}
                onChange={(val) =>
                  setFormData({ ...formData, businessPhone: val })
                }
                countryCode={phoneCountryCode}
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
                <PhoneInput
                  value={formData.contactPhone || ''}
                  onChange={(val) =>
                    setFormData({ ...formData, contactPhone: val })
                  }
                  countryCode={phoneCountryCode}
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
                <PhoneInput
                  value={formData.secondaryContactPhone || ''}
                  onChange={(val) =>
                    setFormData({
                      ...formData,
                      secondaryContactPhone: val,
                    })
                  }
                  countryCode={phoneCountryCode}
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

            {type !== 'franchise' && (
              <>
                <div className="space-y-2">
                  <Label>
                    {t('admin.company.business_size', 'Business Size')}
                  </Label>
                  <Select
                    value={formData.businessSize || ''}
                    onValueChange={(val) =>
                      setFormData({ ...formData, businessSize: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t('common.select', 'Select...')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pequeno">
                        {t('admin.company.size_small', 'Small')}
                      </SelectItem>
                      <SelectItem value="Médio">
                        {t('admin.company.size_medium', 'Medium')}
                      </SelectItem>
                      <SelectItem value="Grande">
                        {t('admin.company.size_large', 'Large')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>
                    {t('admin.company.monthly_fixed_fee', 'Monthly Fixed Fee')}
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.monthlyFixedFee ?? ''}
                    onChange={(e) =>
                      handleNumberChange(
                        'monthlyFixedFee' as keyof Company,
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    {t('admin.company.fee_valid_from', 'Fee Validity Start')}
                  </Label>
                  <Input
                    type="date"
                    value={
                      formData.feeValidFrom
                        ? formData.feeValidFrom.split('T')[0]
                        : ''
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        feeValidFrom: e.target.value
                          ? new Date(e.target.value).toISOString()
                          : '',
                      })
                    }
                  />
                </div>
              </>
            )}
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
                onBlur={handleAddressBlur}
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
              <div className="relative">
                <Input
                  required
                  list="company-city-suggestions"
                  value={formData.addressCity || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, addressCity: e.target.value })
                  }
                  onBlur={handleAddressBlur}
                  disabled={!formData.addressState}
                  placeholder={t('address.city', 'Type or select city')}
                />
                <datalist id="company-city-suggestions">
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
                      <option key={c} value={c} />
                    ))}
                </datalist>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('admin.company.address.zip', 'ZIP Code')}</Label>
              <Input
                required
                value={formData.addressZip || ''}
                onChange={handleZipChange}
                onBlur={handleAddressBlur}
                placeholder={
                  formData.addressCountry === 'Brasil' ||
                  formData.addressCountry === 'Brazil'
                    ? '00000-000'
                    : '00000'
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.company.address.lat', 'Latitude')}</Label>
              <Input
                required
                type="number"
                step="any"
                value={(formData as any).latitude ?? formData.addressLat ?? ''}
                onChange={(e) => {
                  handleNumberChange(
                    'latitude' as keyof Company,
                    e.target.value,
                  )
                  handleNumberChange('addressLat', e.target.value)
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.company.address.lng', 'Longitude')}</Label>
              <Input
                required
                type="number"
                step="any"
                value={(formData as any).longitude ?? formData.addressLng ?? ''}
                onChange={(e) => {
                  handleNumberChange(
                    'longitude' as keyof Company,
                    e.target.value,
                  )
                  handleNumberChange('addressLng', e.target.value)
                }}
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
