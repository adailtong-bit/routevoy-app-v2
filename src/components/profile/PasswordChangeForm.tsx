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
      toast.error(t('profile.password.mismatch', 'Passwords do not match.'))
      return
    }

    if (passwords.newPassword.length < 8) {
      toast.error(
        t(
          'profile.password.too_short',
          'New password must be at least 8 characters long.',
        ),
      )
      return
    }

    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user?.email) throw new Error('User not authenticated.')

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwords.currentPassword,
      })

      if (signInError) {
        throw new Error(
          t('profile.password.incorrect', 'Current password is incorrect.'),
        )
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: passwords.newPassword,
      })

      if (updateError) throw updateError

      toast.success(
        t('profile.password.success', 'Password updated successfully!'),
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
          t('profile.password.error', 'Error updating password.'),
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
          {t('profile.password.title', 'Change Password')}
        </CardTitle>
        <CardDescription>
          {t(
            'profile.password.description',
            'Update your password to keep your account secure.',
          )}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">
              {t('profile.password.current', 'Current Password')}
            </Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              placeholder={t(
                'profile.password.current_placeholder',
                'Enter current password',
              )}
              value={passwords.currentPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">
              {t('profile.password.new', 'New Password')}
            </Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder={t(
                'profile.password.new_placeholder',
                'Enter new password',
              )}
              value={passwords.newPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              {t('profile.password.confirm', 'Confirm New Password')}
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder={t(
                'profile.password.confirm_placeholder',
                'Confirm new password',
              )}
              value={passwords.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading
              ? t('common.saving', 'Saving...')
              : t('common.update_password', 'Update Password')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
