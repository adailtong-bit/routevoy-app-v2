import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'
import { Shield, KeyRound, AlertCircle } from 'lucide-react'

export default function ActivateAccount() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const id = searchParams.get('id')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [invitation, setInvitation] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (!id) {
      setErrorMsg('Link inválido. O ID de ativação está faltando.')
      setLoading(false)
      return
    }

    const fetchInvitation = async () => {
      try {
        const { data, error } = await supabase
          .from('user_invitations')
          .select('*')
          .eq('id', id)
          .maybeSingle()

        if (error || !data) {
          setErrorMsg('Link de ativação inválido ou não encontrado.')
        } else if (data.status !== 'pending') {
          setErrorMsg('Este link de ativação já foi utilizado ou expirou.')
        } else {
          setInvitation(data)
        }
      } catch (err) {
        setErrorMsg('Erro ao verificar o link de ativação.')
      } finally {
        setLoading(false)
      }
    }

    fetchInvitation()
  }, [id])

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      return
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    setSubmitting(true)
    try {
      // 1. Sign up the user
      const { error: authErr } = await supabase.auth.signUp({
        email: invitation.email,
        password: password,
      })

      if (authErr) {
        if (
          authErr.message.includes('already registered') ||
          authErr.message.includes('already exists')
        ) {
          // If already registered, try to sign in
          const { error: signInErr } = await supabase.auth.signInWithPassword({
            email: invitation.email,
            password: password,
          })
          if (signInErr) throw signInErr
        } else {
          throw authErr
        }
      }

      // 2. Consume the invitation
      const { error: rpcErr } = await supabase.rpc('accept_invitation', {
        invitation_id: id,
      })

      if (rpcErr) throw rpcErr

      toast.success('Conta ativada com sucesso!')
      navigate('/')
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Erro ao ativar a conta')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200/60">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            Ativação de Conta
          </CardTitle>
          <CardDescription>
            Defina sua senha para acessar sua conta RouteVoy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMsg ? (
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-6">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <p className="text-slate-600 font-medium">{errorMsg}</p>
              <Button asChild variant="outline" className="mt-4">
                <Link to="/">Voltar ao Início</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleActivate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email de Acesso</Label>
                <Input
                  id="email"
                  value={invitation?.email}
                  disabled
                  className="bg-slate-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repita a senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full font-bold mt-6"
                disabled={submitting}
              >
                {submitting ? 'Ativando...' : 'Ativar Minha Conta'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
