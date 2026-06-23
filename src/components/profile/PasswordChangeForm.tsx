import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/stores/LanguageContext'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Key } from 'lucide-react'

export function PasswordChangeForm() {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error(t('profile.password.mismatch', 'As senhas não coincidem.'))
      return
    }

    if (passwords.newPassword.length < 6) {
      toast.error(
        t(
          'profile.password.too_short',
          'A nova senha deve ter pelo menos 6 caracteres.',
        ),
      )
      return
    }

    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user?.email) throw new Error('Usuário não autenticado.')

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwords.currentPassword,
      })

      if (signInError) {
        throw new Error(
          t('profile.password.incorrect', 'A senha atual está incorreta.'),
        )
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: passwords.newPassword,
      })

      if (updateError) throw updateError

      toast.success(
        t('profile.password.success', 'Senha atualizada com sucesso!'),
      )
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error: any) {
      console.error('Error updating password:', error)
      toast.error(
        error.message ||
          t('profile.password.error', 'Erro ao atualizar a senha.'),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          {t('profile.password.title', 'Alterar Senha')}
        </CardTitle>
        <CardDescription>
          {t(
            'profile.password.description',
            'Atualize sua senha para manter sua conta segura.',
          )}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">
              {t('profile.password.current', 'Senha Atual')}
            </Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={passwords.currentPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">
              {t('profile.password.new', 'Nova Senha')}
            </Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              value={passwords.newPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              {t('profile.password.confirm', 'Confirmar Nova Senha')}
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={passwords.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading
              ? t('common.saving', 'Salvando...')
              : t('common.save', 'Salvar Alterações')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
