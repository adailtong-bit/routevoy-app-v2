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
import { HierarchicalLocationSelector } from '@/components/HierarchicalLocationSelector'

export default function CompleteProfile() {
  const authContext = useAuth()
  const { role, companyId, franchiseId, signOut, user, profile, syncProfile } =
    authContext
  const affiliateStatus = (authContext as any).affiliateStatus
  const navigate = useNavigate()
  const { t } = useLanguage()

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: profile?.name || user?.user_metadata?.name || '',
    phone: profile?.phone || '',
    tax_id: profile?.tax_id || '',
    country: profile?.country || '',
    state: profile?.state || '',
    city: profile?.city || '',
  })

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('status_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (
            payload.new &&
            (payload.new.status === 'approved' ||
              payload.new.status === 'active')
          ) {
            syncProfile()
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'affiliate_partners',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (
            payload.new &&
            (payload.new.status === 'approved' ||
              payload.new.status === 'active')
          ) {
            syncProfile()
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, syncProfile])

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
      // If affiliate is already complete AND approved
      const isApproved =
        profile?.status === 'approved' ||
        profile?.status === 'active' ||
        affiliateStatus === 'approved' ||
        affiliateStatus === 'active'

      if (
        profile?.city &&
        profile?.state &&
        profile?.country &&
        profile?.phone &&
        profile?.name &&
        profile?.tax_id &&
        isApproved
      ) {
        navigate('/affiliate', { replace: true })
      }
    }
  }, [role, franchiseId, companyId, profile, affiliateStatus, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!formData.country || !formData.state || !formData.city) {
      toast.error(
        t(
          'profile.location_required',
          'Por favor, selecione País, Estado e Cidade.',
        ),
      )
      return
    }

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
          tax_id: formData.tax_id,
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
            tax_id: formData.tax_id,
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
          tax_id: formData.tax_id,
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
          <CardTitle className="text-2xl flex flex-col items-center gap-3">
            {t(
              'affiliate.complete_profile_title',
              'Complete seu Perfil de Afiliado',
            )}
            <span className="text-sm font-medium px-3 py-1 bg-amber-100 text-amber-700 rounded-full border border-amber-200">
              {profile?.status === 'pending'
                ? t('auth.pending_approval', 'Aguardando Aprovação')
                : t('auth.incomplete_profile', 'Perfil Incompleto')}
            </span>
          </CardTitle>
          {profile?.status === 'pending' ? (
            <CardDescription className="text-base mt-2">
              {t(
                'auth.pending_approval_desc',
                'Seu perfil está aguardando aprovação de um administrador ou franqueado. Você será notificado quando for aprovado.',
              )}
            </CardDescription>
          ) : (
            <CardDescription className="text-base mt-2">
              {t(
                'auth.update_profile_desc',
                'Por favor, atualize as informações do seu perfil para continuar e enviar para análise.',
              )}
            </CardDescription>
          )}
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
                <Label>{t('profile.tax_id', 'CPF / CNPJ')}</Label>
                <Input
                  required
                  value={formData.tax_id}
                  onChange={(e) =>
                    setFormData({ ...formData, tax_id: e.target.value })
                  }
                  placeholder="000.000.000-00"
                />
              </div>
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

            <div className="space-y-2">
              <Label className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4" />{' '}
                {t('profile.location', 'Localização')}
              </Label>
              <HierarchicalLocationSelector
                country={formData.country}
                state={formData.state}
                city={formData.city}
                onChange={(country, state, city) =>
                  setFormData({ ...formData, country, state, city })
                }
              />
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
