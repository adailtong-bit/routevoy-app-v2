import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'

interface PasswordUpdateFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  showCancel?: boolean
}

export function PasswordUpdateForm({
  onSuccess,
  onCancel,
  showCancel = true,
}: PasswordUpdateFormProps) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error(t('profile.passwords_dont_match', 'Passwords do not match.'))
      return
    }

    if (passwords.newPassword.length < 8) {
      toast.error(
        t(
          'profile.password_too_short',
          'New password must be at least 8 characters long.',
        ),
      )
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwords.newPassword,
      })

      if (updateError) throw updateError

      toast.success(
        t(
          'profile.password_changed_success',
          'Your password has been changed successfully.',
        ),
      )
      setPasswords({ newPassword: '', confirmPassword: '' })
      if (onSuccess) onSuccess()
    } catch (error: any) {
      toast.error(
        error.message ||
          t('profile.password_change_error', 'Error updating password.'),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="space-y-2">
        <Label htmlFor="newPassword">
          {t('profile.new_password', 'New Password')}
        </Label>
        <div className="relative">
          <Input
            id="newPassword"
            name="newPassword"
            type={showNew ? 'text' : 'password'}
            placeholder={t('profile.enter_new_password', 'Enter new password')}
            value={passwords.newPassword}
            onChange={handleChange}
            required
            disabled={loading}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none"
          >
            {showNew ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">
          {t('profile.confirm_password', 'Confirm New Password')}
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            placeholder={t(
              'profile.confirm_new_password',
              'Confirm new password',
            )}
            value={passwords.confirmPassword}
            onChange={handleChange}
            required
            disabled={loading}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none"
          >
            {showConfirm ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      <div className="pt-4 flex justify-end gap-2">
        {showCancel && onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {t('common.cancel', 'Cancel')}
          </Button>
        )}
        <Button
          type="submit"
          disabled={
            loading ||
            !passwords.newPassword ||
            !passwords.confirmPassword ||
            passwords.newPassword !== passwords.confirmPassword
          }
          className="w-full sm:w-auto"
        >
          {loading
            ? t('common.processing', 'Processing...')
            : t('profile.change_password', 'Change Password')}
        </Button>
      </div>
    </form>
  )
}
