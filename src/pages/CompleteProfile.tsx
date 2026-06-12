import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/stores/LanguageContext'

export default function CompleteProfile() {
  const { role, companyId, franchiseId, signOut, user } = useAuth()
  const navigate = useNavigate()
  const { t } = useLanguage()

  useEffect(() => {
    if (role === 'franchisee' && franchiseId) {
      navigate('/franchisee', { replace: true })
    }
    if ((role === 'merchant' || role === 'shopkeeper') && companyId) {
      navigate('/merchant', { replace: true })
    }
    if (role === 'affiliate' || role === 'super_admin' || role === 'admin') {
      navigate('/', { replace: true })
    }
  }, [role, franchiseId, companyId, navigate])

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
