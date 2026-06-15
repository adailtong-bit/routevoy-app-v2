import { useState, useEffect } from 'react'
import { Settings, Save, Building2, MapPin, Receipt, Users } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useLanguage } from '@/stores/LanguageContext'

const isValidUUID = (uuid: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid)

export default function MerchantSettings() {
  const { profile } = useAuth()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const isAdmin =
    profile?.role === 'admin' ||
    profile?.role === 'super_admin' ||
    profile?.email?.toLowerCase() === 'adailtong@gmail.com'
  const hasValidCompany = profile?.company_id && isValidUUID(profile.company_id)

  const [merchantData, setMerchantData] = useState<any>({
    name: '',
    email: '',
    business_phone: '',
    address_street: '',
    address_number: '',
    address_city: '',
    address_state: '',
    address_zip: '',
    billing_name: '',
    billing_email: '',
    contacts: [],
  })

  useEffect(() => {
    const fetchMerchant = async () => {
      if (!hasValidCompany) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', profile.company_id)
        .single()

      if (data && !error) {
        setMerchantData({
          name: data.name || '',
          email: data.email || '',
          business_phone: data.business_phone || '',
          address_street: data.address_street || '',
          address_number: data.address_number || '',
          address_city: data.address_city || '',
          address_state: data.address_state || '',
          address_zip: data.address_zip || '',
          billing_name: data.billing_name || '',
          billing_email: data.billing_email || '',
          contacts: Array.isArray(data.contacts) ? data.contacts : [],
        })
      }
      setLoading(false)
    }

    fetchMerchant()
  }, [profile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMerchantData({ ...merchantData, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    if (!hasValidCompany) {
      if (isAdmin) {
        toast.success(
          t(
            'vendor.settings_tab.save_success',
            'Store settings updated successfully',
          ) + ' (Admin Mock)',
        )
        return
      }
      toast.error(t('vendor.settings_tab.not_linked_title', 'Store not linked'))
      return
    }

    setSaving(true)
    const { error } = await supabase
      .from('merchants')
      .update(merchantData)
      .eq('id', profile.company_id)

    setSaving(false)

    if (error) {
      toast.error(t('common.error', 'An error occurred') + ': ' + error.message)
    } else {
      toast.success(
        t(
          'vendor.settings_tab.save_success',
          'Store settings updated successfully',
        ),
      )
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-10 h-10 border-4 border-primary/40 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!hasValidCompany && !isAdmin) {
    return (
      <div className="container py-8 px-4 max-w-4xl mx-auto flex flex-col items-center justify-center text-center space-y-4 min-h-[50vh]">
        <Building2 className="w-16 h-16 text-slate-300" />
        <h2 className="text-xl font-bold text-slate-700">
          {t('vendor.settings_tab.not_linked_title', 'Store not linked')}
        </h2>
        <p className="text-slate-500 max-w-md">
          {t(
            'vendor.settings_tab.not_linked_desc',
            'Your profile is not linked to a merchant account yet. Please contact support or wait for approval.',
          )}
        </p>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 text-primary rounded-xl">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {t('vendor.settings_tab.title', 'Store Settings')}
          </h1>
          <p className="text-slate-500">
            {t(
              'vendor.settings_tab.desc',
              'Manage your business profile and billing.',
            )}
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-slate-500" />
              {t('vendor.settings_tab.business_profile', 'Business Profile')}
            </CardTitle>
            <CardDescription>
              {t(
                'vendor.settings_tab.business_profile_desc',
                'Public information that appears in your offers.',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('vendor.settings_tab.store_name', 'Store Name')}</Label>
              <Input
                name="name"
                value={merchantData.name}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label>
                {t('vendor.settings_tab.business_email', 'Business Email')}
              </Label>
              <Input
                type="email"
                name="email"
                value={merchantData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>
                {t('vendor.settings_tab.phone_whatsapp', 'Phone / WhatsApp')}
              </Label>
              <Input
                name="business_phone"
                value={merchantData.business_phone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-slate-500" />
              {t('vendor.settings_tab.physical_address', 'Physical Address')}
            </CardTitle>
            <CardDescription>
              {t(
                'vendor.settings_tab.physical_address_desc',
                'Location used for coupon geolocation.',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>
                {t('vendor.settings_tab.street_address', 'Street / Address')}
              </Label>
              <Input
                name="address_street"
                value={merchantData.address_street}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('vendor.settings_tab.number', 'Number')}</Label>
              <Input
                name="address_number"
                value={merchantData.address_number}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('vendor.settings_tab.city', 'City')}</Label>
              <Input
                name="address_city"
                value={merchantData.address_city}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('vendor.settings_tab.state', 'State')}</Label>
              <Input
                name="address_state"
                value={merchantData.address_state}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('vendor.settings_tab.zip', 'ZIP Code')}</Label>
              <Input
                name="address_zip"
                value={merchantData.address_zip}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4 border-b bg-slate-50">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
              <Receipt className="w-5 h-5 text-indigo-500" />
              {t(
                'vendor.settings_tab.billing_recipients',
                'Billing Recipients',
              )}
            </CardTitle>
            <CardDescription>
              {t(
                'vendor.settings_tab.billing_recipients_desc',
                'Where we should send boosting invoices.',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {t(
                  'vendor.settings_tab.financial_manager_name',
                  'Financial Manager Name',
                )}
              </Label>
              <Input
                name="billing_name"
                value={merchantData.billing_name}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label>
                {t('vendor.settings_tab.billing_email', 'Billing Email')}
              </Label>
              <Input
                type="email"
                name="billing_email"
                value={merchantData.billing_email}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-500" />
              {t(
                'vendor.settings_tab.additional_contacts',
                'Additional Contacts',
              )}
            </CardTitle>
            <CardDescription>
              {t(
                'vendor.settings_tab.additional_contacts_desc',
                'Define additional contacts who will receive invoice copies.',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {merchantData.contacts.map((contact: any, idx: number) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-lg bg-slate-50 relative"
              >
                <div className="space-y-2">
                  <Label>{t('vendor.settings_tab.name', 'Name')}</Label>
                  <Input
                    value={contact.name || ''}
                    onChange={(e) => {
                      const newContacts = [...merchantData.contacts]
                      newContacts[idx].name = e.target.value
                      setMerchantData({
                        ...merchantData,
                        contacts: newContacts,
                      })
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('common.email', 'Email')}</Label>
                  <Input
                    type="email"
                    value={contact.email || ''}
                    onChange={(e) => {
                      const newContacts = [...merchantData.contacts]
                      newContacts[idx].email = e.target.value
                      setMerchantData({
                        ...merchantData,
                        contacts: newContacts,
                      })
                    }}
                  />
                </div>
                <div className="space-y-2 relative">
                  <Label>
                    {t('vendor.settings_tab.position', 'Position / Sector')}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={contact.position || ''}
                      onChange={(e) => {
                        const newContacts = [...merchantData.contacts]
                        newContacts[idx].position = e.target.value
                        setMerchantData({
                          ...merchantData,
                          contacts: newContacts,
                        })
                      }}
                    />
                    <Button
                      variant="destructive"
                      onClick={() => {
                        const newContacts = merchantData.contacts.filter(
                          (_: any, i: number) => i !== idx,
                        )
                        setMerchantData({
                          ...merchantData,
                          contacts: newContacts,
                        })
                      }}
                    >
                      X
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => {
                setMerchantData({
                  ...merchantData,
                  contacts: [
                    ...merchantData.contacts,
                    { name: '', email: '', position: '' },
                  ],
                })
              }}
            >
              {t('vendor.settings_tab.add_contact', '+ Add Contact')}
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button
            size="lg"
            className="px-8 font-bold"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="w-5 h-5 mr-2" />
            {saving
              ? t('vendor.settings_tab.saving', 'Saving...')
              : t('vendor.settings_tab.save_changes', 'Save Changes')}
          </Button>
        </div>
      </div>
    </div>
  )
}
