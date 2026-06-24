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
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useLanguage } from '@/stores/LanguageContext'

export function TargetGroupDialog({
  open,
  onOpenChange,
  group,
  onSuccess,
  affiliateId,
  companyId,
  franchiseId,
}: any) {
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      if (group) {
        setName(group.name || '')
        setDescription(group.description || '')
      } else {
        setName('')
        setDescription('')
      }
    }
  }, [open, group])

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error(
        t('common.required_fields', 'Preencha os campos obrigatórios'),
      )
      return
    }
    setLoading(true)
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        affiliate_id: affiliateId || null,
        company_id: companyId || null,
        franchise_id: franchiseId || null,
      }

      if (group?.id) {
        const { error } = await supabase
          .from('crm_target_groups')
          .update(payload)
          .eq('id', group.id)
        if (error) throw error
        toast.success(t('common.updated_success', 'Atualizado com sucesso'))
      } else {
        const { error } = await supabase
          .from('crm_target_groups')
          .insert([payload])
        if (error) throw error
        toast.success(t('common.created_success', 'Criado com sucesso'))
      }
      if (onSuccess) onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {group
              ? t('crm.edit_group', 'Editar Grupo')
              : t('crm.new_group', 'Novo Grupo')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t('common.name', 'Nome')}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Clientes Recorrentes"
            />
          </div>
          <div className="space-y-2">
            <Label>{t('common.description', 'Descrição')}</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opcional"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {t('common.cancel', 'Cancelar')}
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading
              ? t('common.saving', 'Salvando...')
              : t('common.save', 'Salvar')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
