import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/stores/LanguageContext'
import { PasswordChangeForm } from '@/components/profile/PasswordChangeForm'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { User, Mail, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function Profile() {
  const { user, profile, loading, syncProfile } = useAuth()
  const { t } = useLanguage()
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    state: '',
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        city: profile.city || '',
        state: profile.state || '',
      })
    } else if (user) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setFormData({
              name: data.name || '',
              phone: data.phone || '',
              city: data.city || '',
              state: data.state || '',
            })
          }
        })
    }
  }, [profile, user])

  const handleSaveProfile = async () => {
    if (!user) return
    setIsSaving(true)
    try {
      const updatePayload = {
        name: formData.name,
        phone: formData.phone,
        city: formData.city,
        state: formData.state,
      }
      const { error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', user.id)

      if (error) throw error
      toast.success(
        t('profile.update_success', 'Profile updated successfully!'),
      )

      if (syncProfile) {
        syncProfile()
      }
    } catch (error: any) {
      toast.error(t('profile.update_error', 'Error updating profile.'))
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        {t('common.loading', 'Loading...')}
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-slate-300" />
            <p className="text-slate-500">
              {t(
                'profile.not_available',
                'Profile not available. Please sign in again.',
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t('profile.title', 'My Profile')}
        </h1>
        <p className="text-slate-500 mt-2">
          {t(
            'profile.subtitle',
            'Manage your personal information and account security.',
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {t('profile.personal_info', 'Personal Information')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('profile.email', 'Email')}</Label>
                <div className="flex items-center gap-2 text-slate-500 bg-slate-50 p-2 rounded-md border border-slate-100">
                  <Mail className="w-4 h-4" />
                  <span>{user?.email}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('profile.name', 'Name')}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('profile.phone', 'Phone')}</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, phone: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('profile.city', 'City')}</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, city: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('profile.state', 'State')}</Label>
                  <Input
                    value={formData.state}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, state: e.target.value }))
                    }
                  />
                </div>
              </div>
              <Button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="w-full mt-4"
              >
                {isSaving
                  ? t('common.saving', 'Saving...')
                  : t('common.save', 'Save Changes')}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <PasswordChangeForm />
        </div>
      </div>
    </div>
  )
}
