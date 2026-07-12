import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Key } from 'lucide-react'
import { PasswordUpdateForm } from '@/components/shared/PasswordUpdateForm'
import { useLanguage } from '@/stores/LanguageContext'

export function PasswordChangeForm() {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full sm:w-auto flex items-center gap-2"
        >
          <Key className="w-4 h-4" />
          {t('profile.change_password', 'Change Password')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            {t('profile.change_password', 'Change Password')}
          </DialogTitle>
          <DialogDescription>
            {t(
              'profile.change_password_desc',
              'Update your password to keep your account secure.',
            )}
          </DialogDescription>
        </DialogHeader>
        <PasswordUpdateForm
          onSuccess={() => setIsOpen(false)}
          onCancel={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
