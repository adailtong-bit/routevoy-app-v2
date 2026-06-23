import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useLanguage } from '@/stores/LanguageContext'

export function CreateAffiliateModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  // Ensure useEffect works without reference errors
  useEffect(() => {
    if (isOpen) {
      setName('')
      setEmail('')
    }
  }, [isOpen])

  const handleSave = async () => {
    if (!name || !email) {
      toast.error(
        t('common.fill_fields', 'Por favor, preencha todos os campos.'),
      )
      return
    }
    setLoading(true)
    const { error } = await supabase.from('profiles').insert({
      name,
      email,
      is_affiliate: true,
      status: 'active',
      role: 'affiliate',
    })
    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success(
        t('admin.affiliate_created', 'Afiliado criado com sucesso!'),
      )
      onSuccess()
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('admin.add_affiliate', 'Adicionar Afiliado')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t('auth.name', 'Nome')}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t('auth.email', 'Email')}</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {t('common.cancel', 'Cancelar')}
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {t('common.save', 'Salvar')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
