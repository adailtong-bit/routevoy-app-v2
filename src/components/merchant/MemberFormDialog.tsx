import { useState, useEffect } from 'react'
import { useLanguage } from '@/stores/LanguageContext'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

interface MemberFormData {
  name: string
  email: string
  role: string
}

interface MemberFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'add' | 'edit'
  member?: {
    id: string
    name: string | null
    email: string
    role: string | null
  } | null
  onSubmit: (data: MemberFormData) => Promise<void>
  submitting: boolean
}

export function MemberFormDialog({
  open,
  onOpenChange,
  mode,
  member,
  onSubmit,
  submitting,
}: MemberFormDialogProps) {
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('manager')

  useEffect(() => {
    if (mode === 'edit' && member) {
      setName(member.name || '')
      setEmail(member.email || '')
      setRole(member.role || 'manager')
    } else {
      setName('')
      setEmail('')
      setRole('manager')
    }
  }, [open, mode, member])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({ name, email, role })
  }

  const isAdd = mode === 'add'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isAdd
              ? t('team.add_member_title', 'Add New Member')
              : t('team.edit_member_title', 'Edit Member')}
          </DialogTitle>
          <DialogDescription>
            {isAdd
              ? t(
                  'team.add_member_description',
                  'This user will receive an email invitation and will be part of the current company.',
                )
              : t(
                  'team.edit_member_description',
                  'Update the member information below.',
                )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="member-name">{t('common.name', 'Name')}</Label>
            <Input
              id="member-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('common.name_placeholder', 'Collaborator name')}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="member-email">{t('common.email', 'Email')}</Label>
            <Input
              id="member-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              disabled={!isAdd}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('common.role', 'Role')}</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue
                  placeholder={t('common.select_role', 'Select role')}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manager">
                  {t('team.role.manager', 'Manager')}
                </SelectItem>
                <SelectItem value="supervisor">
                  {t('team.role.supervisor', 'Supervisor')}
                </SelectItem>
                <SelectItem value="attendant">
                  {t('team.role.attendant', 'Attendant')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {submitting
                ? t('common.sending', 'Sending...')
                : isAdd
                  ? t('team.invite_button', 'Invite Member')
                  : t('common.save', 'Save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
