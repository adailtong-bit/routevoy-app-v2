import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { AlertCircle, User, MapPin, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/stores/LanguageContext'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function CompleteProfile() {
  const { role, companyId, franchiseId, signOut, user, profile, syncProfile } =
    useAuth()
  const navigate = useNavigate()
  const { t } = useLanguage()

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: profile?.name || user?.user_metadata?.name || '',
    phone: profile?.phone || '',
    country: profile?.country || '',
    state: profile?.state || '',
    city: profile?.city || '',
  })

  useEffect(() => {
    // If regular user needs organization link
    if (!profile?.is_affiliate && role !== 'affiliate') {
      if (role === 'franchisee' && franchiseId) {
        navigate('/franchisee', { replace: true })
      }
      if ((role === 'merchant' || role === 'shopkeeper') && companyId) {
        navigate('/merchant', { replace: true })
      }
      if (role === 'super_admin' || role === 'admin') {
        navigate('/admin', { replace: true })
      }
    } else if (profile?.is_affiliate || role === 'affiliate') {
      // If affiliate is already complete
      if (profile?.city && profile?.state && profile?.country) {
        navigate('/affiliate', { replace: true })
      }
    }
  }, [role, franchiseId, companyId, profile, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)

    try {
      // Find matching franchise based on coverage
      const { data: franchises } = await supabase
        .from('franchises')
        .select('id, coverage_states, coverage_cities')
        .eq('status', 'active')

      let matchedFranchiseId = null

      if (franchises && franchises.length > 0) {
        for (const franchise of franchises) {
          const coveredStates = Array.isArray(franchise.coverage_states)
            ? franchise.coverage_states
            : []
          const coveredCities = Array.isArray(franchise.coverage_cities)
            ? franchise.coverage_cities
            : []

          if (
            coveredCities.includes(formData.city) ||
            coveredStates.includes(formData.state)
          ) {
            matchedFranchiseId = franchise.id
            break
          }
        }
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone: formData.phone,
          country: formData.country,
          state: formData.state,
          city: formData.city,
          franchise_id: matchedFranchiseId,
          status: 'pending',
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Update or Create Affiliate Partner record
      const { data: existingPartner } = await supabase
        .from('affiliate_partners')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (existingPartner) {
        await supabase
          .from('affiliate_partners')
          .update({
            name: formData.name,
            phone: formData.phone,
            address_country: formData.country,
            address_state: formData.state,
            address_city: formData.city,
            franchise_id: matchedFranchiseId,
            region: formData.state,
            status: 'pending',
          })
          .eq('id', existingPartner.id)
      } else {
        await supabase.from('affiliate_partners').insert({
          user_id: user.id,
          email: user.email || '',
          name: formData.name,
          phone: formData.phone,
          address_country: formData.country,
          address_state: formData.state,
          address_city: formData.city,
          franchise_id: matchedFranchiseId,
          region: formData.state,
          status: 'pending',
        })
      }

      toast.success(t('profile.save_success', 'Perfil atualizado com sucesso!'))
      await syncProfile()
      navigate('/affiliate', { replace: true })
    } catch (err: any) {
      toast.error(t('common.error', 'Erro ao salvar perfil: ') + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Render for non-affiliates who are missing organization links
  if (!profile?.is_affiliate && role !== 'affiliate') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full border-amber-200 shadow-lg shadow-amber-500/10">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto bg-amber-100 p-3 rounded-full mb-4 w-16 h-16 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>
            <CardTitle className="text-xl">
              {t('auth.profile_incomplete', 'Organização não Vinculada')}
            </CardTitle>
            <CardDescription className="text-sm mt-2">
              {t(
                'auth.profile_incomplete_desc',
                'Sua conta foi criada, mas ainda não possui os vínculos organizacionais necessários (Franquia ou Empresa) para acessar o painel.',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center text-sm text-slate-600">
            <div className="bg-slate-50 rounded-lg p-4 text-left border border-slate-100">
              <p className="mb-1">
                Email: <strong className="text-slate-900">{user?.email}</strong>
              </p>
              <p>
                Perfil Detectado:{' '}
                <strong className="text-slate-900 capitalize">{role}</strong>
              </p>
            </div>
            <p className="text-slate-500">
              Por favor, contate o administrador do sistema para vincular a sua
              conta à organização correta e tente novamente.
            </p>
            <Button
              onClick={signOut}
              variant="outline"
              className="w-full mt-4 h-12 font-bold text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              {t('auth.logout', 'Sair e Voltar ao Início')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render for affiliates to complete profile
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-slate-50">
      <Card className="max-w-xl w-full shadow-lg border-primary/20">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4 w-16 h-16 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {t(
              'affiliate.complete_profile_title',
              'Complete seu Perfil de Afiliado',
            )}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {t(
              'affiliate.complete_profile_desc',
              'Precisamos de algumas informações geográficas para direcioná-lo ao franqueado responsável pela sua região.',
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('profile.name', 'Nome Completo')}</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Seu nome"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('profile.phone', 'Telefone/WhatsApp')}</Label>
                <Input
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+55 (11) 99999-9999"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {t('profile.country', 'País')}
              </Label>
              <Input
                required
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                placeholder="Ex: Brasil"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('profile.state', 'Estado / Província')}</Label>
                <Input
                  required
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  placeholder="Ex: São Paulo"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('profile.city', 'Cidade')}</Label>
                <Input
                  required
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="Ex: Campinas"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 font-bold text-lg mt-6"
              disabled={loading}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-primary/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  {t('profile.submit_review', 'Enviar para Análise')}
                </>
              )}
            </Button>

            <Button
              type="button"
              onClick={signOut}
              variant="ghost"
              className="w-full mt-2 text-slate-500 hover:text-slate-800"
            >
              {t('auth.logout', 'Sair da Conta')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
