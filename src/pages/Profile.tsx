import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/stores/LanguageContext'
import { PasswordChangeForm } from '@/components/profile/PasswordChangeForm'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { User, Mail } from 'lucide-react'
import { toast } from 'sonner'

export default function Profile() {
  const auth = useAuth() as any
  const user = auth.user
  const profile = auth.profile
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
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id)

      if (error) throw error
      toast.success(
        t('profile.update_success', 'Perfil atualizado com sucesso!'),
      )

      if (auth.syncProfile) {
        auth.syncProfile()
      }
    } catch (error: any) {
      toast.error(t('profile.update_error', 'Erro ao atualizar perfil.'))
    } finally {
      setIsSaving(false)
    }
  }

  if (auth.loading) {
    return <div className="p-8 text-center text-slate-500">Loading...</div>
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t('profile.title', 'Meu Perfil')}
        </h1>
        <p className="text-slate-500 mt-2">
          {t(
            'profile.subtitle',
            'Gerencie suas informações pessoais e segurança da conta.',
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {t('profile.personal_info', 'Informações Pessoais')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('profile.email', 'E-mail')}</Label>
                <div className="flex items-center gap-2 text-slate-500 bg-slate-50 p-2 rounded-md border border-slate-100">
                  <Mail className="w-4 h-4" />
                  <span>{user?.email}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('profile.name', 'Nome')}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('profile.phone', 'Telefone')}</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, phone: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('profile.city', 'Cidade')}</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, city: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('profile.state', 'Estado')}</Label>
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
                  ? t('common.saving', 'Salvando...')
                  : t('common.save', 'Salvar Alterações')}
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
