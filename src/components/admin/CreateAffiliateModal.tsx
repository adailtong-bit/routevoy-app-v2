import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AddressForm } from '@/components/AddressForm'
import { PhoneInput } from '@/components/PhoneInput'
import { useLanguage } from '@/stores/LanguageContext'
import { Loader2, UploadCloud, X } from 'lucide-react'

const formatTaxId = (v: string) => {
  v = v.replace(/\D/g, '')
  if (v.length <= 11) {
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  } else {
    v = v.replace(/^(\d{2})(\d)/, '$1.$2')
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    v = v.replace(/\.(\d{3})(\d)/, '.$1/$2')
    v = v.replace(/(\d{4})(\d)/, '$1-$2')
  }
  return v.substring(0, 18)
}

export function CreateAffiliateModal({
  isOpen,
  onClose,
  onSuccess,
  franchiseId,
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  franchiseId?: string
}) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    tax_id: '',
    phone: '',
    image_url: '',
    commission_model: 'percentage',
    commission_rate: '30',
    monthly_fee: '0',
    address_country: 'Brasil',
    address_state: '',
    address_city: '',
    address_zip: '',
    address_street: '',
    address_number: '',
    address_neighborhood: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    region_id: 'global',
    coverage_scope: 'national',
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error(
        t(
          'common.invalid_file_type',
          'Invalid file type. Only JPG, PNG and WEBP are allowed.',
        ),
      )
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        t('common.file_too_large', 'File size must be less than 5MB.'),
      )
      return
    }

    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `affiliate_${Date.now()}.${fileExt}`

      const { error } = await supabase.storage
        .from('affiliates')
        .upload(fileName, file)

      if (error) throw error

      const { data: publicUrlData } = supabase.storage
        .from('affiliates')
        .getPublicUrl(fileName)

      setFormData((prev) => ({ ...prev, image_url: publicUrlData.publicUrl }))
      toast.success(t('common.upload_success', 'Image uploaded successfully'))
    } catch (error: any) {
      console.error('Error uploading image:', error)
      toast.error(
        error.message || t('common.upload_error', 'Failed to upload image'),
      )
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      toast.error(
        t(
          'common.error_title_category',
          'Fill in the required fields (Name and Email)',
        ),
      )
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.from('affiliate_partners').insert({
        name: formData.name,
        email: formData.email,
        tax_id: formData.tax_id.replace(/\D/g, ''),
        image_url: formData.image_url || null,
        commission_model: formData.commission_model,
        commission_rate: parseFloat(formData.commission_rate) || 0,
        monthly_fee: parseFloat(formData.monthly_fee) || 0,
        franchise_id: franchiseId || null,
        region_id: formData.region_id,
        phone: formData.phone.replace(/\D/g, ''),
        address_country: formData.address_country,
        address_state: formData.address_state,
        address_city: formData.address_city,
        address_zip: formData.address_zip,
        address_street: formData.address_street,
        address_number: formData.address_number,
        address_neighborhood: formData.address_neighborhood,
        latitude: formData.latitude,
        longitude: formData.longitude,
        coverage_scope: formData.coverage_scope,
        status: 'active',
      } as any)

      if (error) {
        if (error.code === '23505')
          throw new Error(
            t('admin.affiliates.error_email', 'Email already registered.'),
          )
        throw error
      }

      toast.success(
        t(
          'admin.affiliates.success_register',
          'Affiliate registered successfully!',
        ),
      )
      onSuccess()
      onClose()

      setFormData({
        name: '',
        email: '',
        tax_id: '',
        phone: '',
        image_url: '',
        commission_model: 'percentage',
        commission_rate: '30',
        monthly_fee: '0',
        address_country: 'Brasil',
        address_state: '',
        address_city: '',
        address_zip: '',
        address_street: '',
        address_number: '',
        address_neighborhood: '',
        latitude: undefined as number | undefined,
        longitude: undefined as number | undefined,
        region_id: 'global',
        coverage_scope: 'national',
      })
    } catch (err: any) {
      toast.error(err.message || t('common.error', 'Error saving data'))
    } finally {
      setLoading(false)
    }
  }

  const isFormValid =
    formData.name.trim().length > 0 && formData.email.trim().length > 0

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t('admin.affiliates.register_title', 'Register Affiliate')}
          </DialogTitle>
          <DialogDescription>
            {t(
              'admin.affiliates.register_desc',
              'Fill in the details below to register a new affiliate partner in the system.',
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full mt-4">
          <TabsList className="w-full flex justify-start overflow-x-auto">
            <TabsTrigger value="general">
              {t('admin.affiliates.tab_general', 'General')}
            </TabsTrigger>
            <TabsTrigger value="contacts">
              {t('admin.affiliates.tab_contacts', 'Contacts')}
            </TabsTrigger>
            <TabsTrigger value="billing">
              {t('admin.affiliates.tab_billing', 'Billing')}
            </TabsTrigger>
            <TabsTrigger value="addressing">
              {t('admin.affiliates.tab_address', 'Address')}
            </TabsTrigger>
            <TabsTrigger value="coverage">
              {t('admin.affiliates.tab_coverage', 'Coverage')}
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 space-y-4 min-h-[300px]">
            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    {t('admin.affiliates.name_req', 'Affiliate Name *')}
                  </Label>
                  <Input
                    placeholder={t(
                      'admin.affiliates.name_ph',
                      'e.g. Affiliate Silva',
                    )}
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    {t('admin.affiliates.email_req', 'Email (Login) *')}
                  </Label>
                  <Input
                    type="email"
                    placeholder={t(
                      'admin.affiliates.email_ph',
                      'email@example.com',
                    )}
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    {t('admin.affiliates.tax_id', 'Document (Tax ID)')}
                  </Label>
                  <Input
                    placeholder={t('admin.affiliates.tax_id_ph', '000-00-0000')}
                    value={formData.tax_id}
                    onChange={(e) =>
                      handleChange('tax_id', formatTaxId(e.target.value))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t mt-4">
                <Label>
                  {t('admin.affiliates.logo', 'Affiliate Logo / Image')}
                </Label>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                />
                {formData.image_url ? (
                  <div className="relative group mt-2 h-32 w-32 rounded-md border overflow-hidden">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleChange('image_url', '')}
                      >
                        <X className="w-4 h-4 mr-2" />
                        {t('common.remove', 'Remove')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 h-32 w-full max-w-sm rounded-md border-2 border-dashed hover:border-primary/50 cursor-pointer flex flex-col items-center justify-center text-slate-400 bg-slate-50 hover:bg-slate-50/80 transition-colors"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-8 w-8 mb-2 animate-spin text-primary" />
                        <span className="text-sm">
                          {t('common.uploading', 'Uploading...')}
                        </span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-8 w-8 mb-2 opacity-50" />
                        <span className="text-sm font-medium">
                          {t('common.click_to_upload', 'Click to upload image')}
                        </span>
                        <span className="text-xs mt-1">
                          JPG, PNG, WEBP (Max 5MB)
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="contacts" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    {t('admin.affiliates.business_phone', 'Business Phone')}
                  </Label>
                  <PhoneInput
                    value={formData.phone}
                    onChange={(val: string) => handleChange('phone', val)}
                    countryCode={
                      formData.address_country === 'USA' ? 'US' : 'BR'
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="billing" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    {t('admin.affiliates.commission_model', 'Commission Model')}
                  </Label>
                  <Select
                    value={formData.commission_model}
                    onValueChange={(val) =>
                      handleChange('commission_model', val)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t('common.select', 'Select...')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">
                        {t('admin.affiliates.split', 'Commission Split (%)')}
                      </SelectItem>
                      <SelectItem value="monthly">
                        {t('admin.affiliates.saas', 'SaaS Monthly Fee ($)')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.commission_model === 'percentage' ? (
                  <div className="space-y-2">
                    <Label>
                      {t(
                        'admin.affiliates.commission_rate',
                        'Commission Rate (%)',
                      )}
                    </Label>
                    <Input
                      type="number"
                      placeholder="Ex: 30"
                      value={formData.commission_rate}
                      onChange={(e) =>
                        handleChange('commission_rate', e.target.value)
                      }
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>
                      {t(
                        'admin.affiliates.monthly_fee',
                        'Monthly Fee Amount ($)',
                      )}
                    </Label>
                    <Input
                      type="number"
                      placeholder="Ex: 199.90"
                      value={formData.monthly_fee}
                      onChange={(e) =>
                        handleChange('monthly_fee', e.target.value)
                      }
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="addressing" className="space-y-4">
              <AddressForm
                country={formData.address_country}
                state={formData.address_state}
                city={formData.address_city}
                zip={formData.address_zip}
                street={formData.address_street}
                number={formData.address_number}
                neighborhood={formData.address_neighborhood}
                lat={formData.latitude}
                lng={formData.longitude}
                onChange={(data: any) => {
                  setFormData((prev) => ({
                    ...prev,
                    address_country: data.country || prev.address_country,
                    address_state: data.state || '',
                    address_city: data.city || '',
                    address_zip: data.zip || '',
                    address_street: data.street || '',
                    address_number: data.number || '',
                    address_neighborhood: data.neighborhood || '',
                    latitude: data.lat,
                    longitude: data.lng,
                  }))
                }}
              />
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>
                    {t('admin.affiliates.assigned_region', 'Assigned Region')}
                  </Label>
                  <Input
                    placeholder="Ex: Sudeste"
                    value={formData.region_id}
                    onChange={(e) => handleChange('region_id', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="coverage" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    {t('admin.affiliates.coverage_scope', 'Coverage Scope')}
                  </Label>
                  <Select
                    value={formData.coverage_scope}
                    onValueChange={(val) => handleChange('coverage_scope', val)}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t('common.select', 'Select...')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="national">
                        {t('admin.affiliates.national', 'National')}
                      </SelectItem>
                      <SelectItem value="state">
                        {t('admin.affiliates.state', 'State')}
                      </SelectItem>
                      <SelectItem value="city">
                        {t('admin.affiliates.city', 'City')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="mt-6 border-t pt-4">
          <Button variant="ghost" onClick={onClose}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !isFormValid || isUploading}
          >
            {loading
              ? t('common.loading', 'Loading...')
              : t('common.save', 'Save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
