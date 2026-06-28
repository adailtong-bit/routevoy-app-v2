import { useState } from 'react'
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useLanguage } from '@/stores/LanguageContext'

export function AdvancedCompanyForm({
  initialData,
  onSave,
  onCancel,
  defaultType = 'merchant',
  type,
  franchiseId,
  isControlled = false,
}: {
  initialData?: any
  onSave: (data?: any) => void
  onCancel: () => void
  defaultType?: string
  type?: string
  franchiseId?: string
  isControlled?: boolean
}) {
  const { t } = useLanguage()
  const resolvedType = type || defaultType

  const [formData, setFormData] = useState({
    name:
      initialData?.name ||
      initialData?.companyName ||
      initialData?.contactPerson ||
      '',
    email: initialData?.email || initialData?.contactEmail || '',
    businessType:
      initialData?.businessType || initialData?.business_type || resolvedType,
    status: initialData?.status || 'active',
    franchiseId:
      initialData?.franchiseId ||
      initialData?.franchise_id ||
      franchiseId ||
      '',
    document:
      initialData?.document || initialData?.taxId || initialData?.tax_id || '',
    phone:
      initialData?.phone ||
      initialData?.businessPhone ||
      initialData?.contactPhone ||
      initialData?.business_phone ||
      initialData?.contact_phone ||
      '',
    country:
      initialData?.country ||
      initialData?.addressCountry ||
      initialData?.address_country ||
      'Brasil',
    addressZip:
      initialData?.addressZip ||
      initialData?.address_zip ||
      initialData?.zipCode ||
      '',
    addressStreet:
      initialData?.addressStreet || initialData?.address_street || '',
    addressNumber:
      initialData?.addressNumber || initialData?.address_number || '',
    addressComplement:
      initialData?.addressComplement || initialData?.address_complement || '',
    addressNeighborhood:
      initialData?.addressNeighborhood ||
      initialData?.address_neighborhood ||
      '',
    addressCity:
      initialData?.addressCity ||
      initialData?.address_city ||
      initialData?.city ||
      '',
    addressState:
      initialData?.addressState ||
      initialData?.address_state ||
      initialData?.state ||
      '',
    contactPerson:
      initialData?.contactPerson || initialData?.contact_person || '',
    contactDepartment:
      initialData?.contactDepartment || initialData?.contact_department || '',
    contactEmail: initialData?.contactEmail || initialData?.contact_email || '',
    contactPhone: initialData?.contactPhone || initialData?.contact_phone || '',
    billingEmail: initialData?.billingEmail || initialData?.billing_email || '',
    paymentMethod:
      initialData?.paymentMethod || initialData?.payment_method || '',
    billingFrequency:
      initialData?.billingFrequency || initialData?.billing_frequency || '',
    bankName: initialData?.bankName || initialData?.bank_name || '',
    bankAgency: initialData?.bankAgency || initialData?.bank_agency || '',
    bankAccount: initialData?.bankAccount || initialData?.bank_account || '',
  })

  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (isControlled) {
      onSave(formData)
      return
    }

    setLoading(true)
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        business_type: formData.businessType,
        status: formData.status,
        franchise_id: formData.franchiseId || null,
        tax_id: formData.document,
        business_phone: formData.phone,
        address_country: formData.country,
        address_zip: formData.addressZip,
        address_street: formData.addressStreet,
        address_number: formData.addressNumber,
        address_complement: formData.addressComplement,
        address_neighborhood: formData.addressNeighborhood,
        address_city: formData.addressCity,
        address_state: formData.addressState,
        contact_person: formData.contactPerson,
        contact_department: formData.contactDepartment,
        contact_email: formData.contactEmail,
        contact_phone: formData.contactPhone,
        billing_email: formData.billingEmail,
        payment_method: formData.paymentMethod,
        billing_frequency: formData.billingFrequency,
        bank_name: formData.bankName,
        bank_agency: formData.bankAgency,
        bank_account: formData.bankAccount,
      }

      if (initialData?.id) {
        const { error } = await supabase
          .from('companies')
          .update(payload)
          .eq('id', initialData.id)
        if (error) throw error
        toast.success(t('company_form.messages.update_success'))
      } else {
        const { error } = await supabase.from('companies').insert([payload])
        if (error) throw error
        toast.success(t('company_form.messages.create_success'))
      }
      onSave()
    } catch (err: any) {
      toast.error(t('company_form.messages.save_error') + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 py-4">
      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
          <TabsTrigger value="geral" className="py-2">
            {t('company_form.tabs.general')}
          </TabsTrigger>
          <TabsTrigger value="contatos" className="py-2">
            {t('company_form.tabs.contacts')}
          </TabsTrigger>
          <TabsTrigger value="faturamento" className="py-2">
            {t('company_form.tabs.billing')}
          </TabsTrigger>
          <TabsTrigger value="enderecamento" className="py-2">
            {t('company_form.tabs.address')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('company_form.fields.company_name')}</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('company_form.fields.email')}</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('company_form.fields.document')}</Label>
              <Input
                value={formData.document}
                onChange={(e) =>
                  setFormData({ ...formData, document: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('company_form.fields.phone_company')}</Label>
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('company_form.fields.country')}</Label>
              <Input
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('company_form.fields.status')}</Label>
              <Select
                value={formData.status}
                onValueChange={(val) =>
                  setFormData({ ...formData, status: val })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('company_form.placeholders.select_status')}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    {t('company_form.status.active')}
                  </SelectItem>
                  <SelectItem value="pending">
                    {t('company_form.status.pending')}
                  </SelectItem>
                  <SelectItem value="inactive">
                    {t('company_form.status.inactive')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contatos" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-slate-50">
            <h4 className="col-span-full font-medium mb-2">
              {t('company_form.fields.main_contact')}
            </h4>
            <div className="space-y-2">
              <Label>{t('company_form.fields.contact_name')}</Label>
              <Input
                value={formData.contactPerson}
                onChange={(e) =>
                  setFormData({ ...formData, contactPerson: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('company_form.fields.contact_department')}</Label>
              <Input
                value={formData.contactDepartment}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contactDepartment: e.target.value,
                  })
                }
                placeholder={t('company_form.placeholders.department')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('company_form.fields.contact_email')}</Label>
              <Input
                type="email"
                value={formData.contactEmail}
                onChange={(e) =>
                  setFormData({ ...formData, contactEmail: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('company_form.fields.contact_phone')}</Label>
              <Input
                value={formData.contactPhone}
                onChange={(e) =>
                  setFormData({ ...formData, contactPhone: e.target.value })
                }
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="faturamento" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('company_form.fields.billing_email')}</Label>
              <Input
                type="email"
                value={formData.billingEmail}
                onChange={(e) =>
                  setFormData({ ...formData, billingEmail: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('company_form.fields.payment_method')}</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(val) =>
                  setFormData({ ...formData, paymentMethod: val })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('company_form.placeholders.select_option')}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">
                    {t('company_form.payment_methods.pix')}
                  </SelectItem>
                  <SelectItem value="boleto">
                    {t('company_form.payment_methods.boleto')}
                  </SelectItem>
                  <SelectItem value="credit_card">
                    {t('company_form.payment_methods.credit_card')}
                  </SelectItem>
                  <SelectItem value="transfer">
                    {t('company_form.payment_methods.transfer')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('company_form.fields.billing_frequency')}</Label>
              <Select
                value={formData.billingFrequency}
                onValueChange={(val) =>
                  setFormData({ ...formData, billingFrequency: val })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('company_form.placeholders.select_option')}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">
                    {t('company_form.billing_frequencies.monthly')}
                  </SelectItem>
                  <SelectItem value="quarterly">
                    {t('company_form.billing_frequencies.quarterly')}
                  </SelectItem>
                  <SelectItem value="annual">
                    {t('company_form.billing_frequencies.annual')}
                  </SelectItem>
                  <SelectItem value="per_campaign">
                    {t('company_form.billing_frequencies.per_campaign')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg mt-2">
              <h4 className="col-span-full font-medium text-sm text-slate-500">
                {t('company_form.fields.bank_details')}
              </h4>
              <div className="space-y-2">
                <Label>{t('company_form.fields.bank_name')}</Label>
                <Input
                  value={formData.bankName}
                  onChange={(e) =>
                    setFormData({ ...formData, bankName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('company_form.fields.bank_agency')}</Label>
                <Input
                  value={formData.bankAgency}
                  onChange={(e) =>
                    setFormData({ ...formData, bankAgency: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('company_form.fields.bank_account')}</Label>
                <Input
                  value={formData.bankAccount}
                  onChange={(e) =>
                    setFormData({ ...formData, bankAccount: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="enderecamento" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('company_form.fields.zip')}</Label>
              <Input
                value={formData.addressZip}
                onChange={(e) =>
                  setFormData({ ...formData, addressZip: e.target.value })
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{t('company_form.fields.street')}</Label>
              <Input
                value={formData.addressStreet}
                onChange={(e) =>
                  setFormData({ ...formData, addressStreet: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('company_form.fields.number')}</Label>
              <Input
                value={formData.addressNumber}
                onChange={(e) =>
                  setFormData({ ...formData, addressNumber: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('company_form.fields.complement')}</Label>
              <Input
                value={formData.addressComplement}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    addressComplement: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('company_form.fields.neighborhood')}</Label>
              <Input
                value={formData.addressNeighborhood}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    addressNeighborhood: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('company_form.fields.city')}</Label>
              <Input
                value={formData.addressCity}
                onChange={(e) =>
                  setFormData({ ...formData, addressCity: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('company_form.fields.state')}</Label>
              <Input
                value={formData.addressState}
                onChange={(e) =>
                  setFormData({ ...formData, addressState: e.target.value })
                }
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-6 border-t mt-6">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          {t('company_form.buttons.cancel')}
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {t('company_form.buttons.save')}
        </Button>
      </div>
    </div>
  )
}
