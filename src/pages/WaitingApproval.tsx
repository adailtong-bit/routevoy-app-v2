import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useLanguage } from '@/stores/LanguageContext'

export default function WaitingApproval() {
  const { signOut } = useAuth()
  const { t } = useLanguage()

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-slate-50">
      <Card className="max-w-md w-full shadow-lg border-amber-200">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto bg-amber-100 p-4 rounded-full mb-4 w-20 h-20 flex items-center justify-center">
            <Clock className="w-10 h-10 text-amber-600" />
          </div>
          <CardTitle className="text-2xl text-amber-800">
            {t('affiliate.waiting_approval_title', 'Sua conta está em análise')}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {t(
              'affiliate.waiting_approval_desc',
              'Você será notificado assim que um franqueado ou administrador aprovar seu acesso.',
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-slate-600">
            {t(
              'affiliate.waiting_approval_msg',
              'Agradecemos o seu interesse em se tornar um afiliado. Nossa equipe está revisando suas informações geográficas e os detalhes do seu cadastro.',
            )}
          </p>
          <Button onClick={signOut} variant="outline" className="w-full">
            {t('auth.logout', 'Sair da Conta')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
