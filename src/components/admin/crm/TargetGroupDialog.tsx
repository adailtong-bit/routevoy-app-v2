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

export function TargetGroupDialog({
  open,
  onOpenChange,
  companyId,
  franchiseId,
  affiliateId,
  editData,
  onSuccess,
}: any) {
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      if (editData) {
        setFormData({
          name: editData.name || '',
          description: editData.description || '',
        })
      } else {
        setFormData({ name: '', description: '' })
      }
    }
  }, [open, editData])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        company_id: companyId || null,
        franchise_id: franchiseId || null,
        affiliate_id: affiliateId || null,
        filters: {},
      }

      if (editData) {
        await supabase
          .from('crm_target_groups')
          .update(payload)
          .eq('id', editData.id)
        toast.success('Grupo atualizado!')
      } else {
        await supabase.from('crm_target_groups').insert(payload)
        toast.success('Grupo criado!')
      }
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      toast.error('Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editData ? 'Editar Grupo' : 'Novo Grupo'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
