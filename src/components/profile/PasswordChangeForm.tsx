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

export function PasswordChangeForm() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full sm:w-auto flex items-center gap-2"
        >
          <Key className="w-4 h-4" />
          Alterar Senha / Change Password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            Alterar Senha / Change Password
          </DialogTitle>
          <DialogDescription>
            Atualize sua senha para manter sua conta segura. / Update your
            password to keep your account secure.
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
