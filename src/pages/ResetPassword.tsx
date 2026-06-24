import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { PasswordUpdateForm } from '@/components/shared/PasswordUpdateForm'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Key } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'

export default function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, loading } = useAuth()
  const [isVerifying, setIsVerifying] = useState(true)

  useEffect(() => {
    const hash = window.location.hash

    if (!loading) {
      if (!session && !hash.includes('access_token=')) {
        toast.error(
          'Sessão de recuperação inválida ou expirada. / Invalid or expired recovery session.',
        )
        navigate('/login', { replace: true })
      } else {
        setIsVerifying(false)
      }
    }
  }, [session, loading, navigate])

  const handleSuccess = () => {
    sessionStorage.removeItem('isRecoveryMode')
    navigate('/', { replace: true })
  }

  if (loading || isVerifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-slate-500 font-medium mt-2">
          Verificando sessão de recuperação...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-6">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              Redefinir Senha
            </CardTitle>
            <CardDescription className="text-base">
              Crie uma nova senha segura para sua conta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordUpdateForm onSuccess={handleSuccess} showCancel={false} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
