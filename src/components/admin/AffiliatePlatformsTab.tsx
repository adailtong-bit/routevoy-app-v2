import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/stores/LanguageContext'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Search, Plus, Edit2, Trash2, Link as LinkIcon } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Platform {
  id: string
  name: string
  status: 'active' | 'inactive'
  base_commission_rate: number
  created_at: string
}

export function AffiliatePlatformsTab() {
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    status: 'active',
    base_commission_rate: 0,
  })
  const [isSaving, setIsSaving] = useState(false)

  const { t } = useLanguage()
  const { toast } = useToast()

  const fetchPlatforms = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('affiliate_platforms')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast({
        title: t('common.error', 'An error occurred'),
        description: error.message,
        variant: 'destructive',
      })
    } else {
      setPlatforms(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPlatforms()
  }, [])

  const handleSave = async () => {
    if (!formData.name) return
    setIsSaving(true)
    try {
      if (editingPlatform) {
        const { error } = await supabase
          .from('affiliate_platforms')
          .update(formData)
          .eq('id', editingPlatform.id)
        if (error) throw error
        toast({ title: t('admin.platforms.updated_success') })
      } else {
        const { error } = await supabase
          .from('affiliate_platforms')
          .insert([formData])
        if (error) throw error
        toast({ title: t('admin.platforms.created_success') })
      }
      setIsDialogOpen(false)
      fetchPlatforms()
    } catch (error: any) {
      toast({
        title: t('common.error', 'An error occurred'),
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm(t('admin.platforms.delete_confirm'))) {
      const { error } = await supabase
        .from('affiliate_platforms')
        .delete()
        .eq('id', id)
      if (error) {
        toast({
          title: t('common.error', 'An error occurred'),
          description: error.message,
          variant: 'destructive',
        })
      } else {
        toast({ title: t('admin.platforms.deleted_success') })
        fetchPlatforms()
      }
    }
  }

  const openEdit = (p: Platform) => {
    setEditingPlatform(p)
    setFormData({
      name: p.name,
      status: p.status,
      base_commission_rate: p.base_commission_rate,
    })
    setIsDialogOpen(true)
  }

  const openCreate = () => {
    setEditingPlatform(null)
    setFormData({ name: '', status: 'active', base_commission_rate: 0 })
    setIsDialogOpen(true)
  }

  const filteredPlatforms = platforms.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
            <LinkIcon className="w-6 h-6 text-primary" />
            {t('admin.platforms.title')}
          </h2>
          <p className="text-slate-500">{t('admin.platforms.desc')}</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          {t('admin.platforms.add_new')}
        </Button>
      </div>

      <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-slate-100 max-w-md">
        <Search className="w-5 h-5 text-slate-400 ml-2" />
        <Input
          type="text"
          placeholder={t('admin.platforms.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-0 shadow-none focus-visible:ring-0"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead>{t('admin.platforms.name')}</TableHead>
              <TableHead>{t('admin.platforms.status')}</TableHead>
              <TableHead>{t('admin.platforms.commission_rate')}</TableHead>
              <TableHead className="text-right">
                {t('common.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : filteredPlatforms.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-slate-500"
                >
                  {t('admin.platforms.no_platforms')}
                </TableCell>
              </TableRow>
            ) : (
              filteredPlatforms.map((platform) => (
                <TableRow key={platform.id}>
                  <TableCell className="font-medium text-slate-800">
                    {platform.name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        platform.status === 'active' ? 'default' : 'secondary'
                      }
                      className={
                        platform.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
                      }
                    >
                      {platform.status === 'active'
                        ? t('admin.platforms.active')
                        : t('admin.platforms.inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {platform.base_commission_rate}%
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(platform)}
                      >
                        <Edit2 className="w-4 h-4 text-slate-500" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(platform.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingPlatform
                ? t('admin.platforms.edit', 'Edit Platform')
                : t('admin.platforms.add_new', 'Add Platform')}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="general">
                {t('admin.platforms.tabs.general', 'General Information')}
              </TabsTrigger>
              <TabsTrigger value="settings">
                {t('admin.platforms.tabs.settings', 'Settings')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t('admin.platforms.name', 'Platform Name')}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder={t(
                    'admin.platforms.name_placeholder',
                    'e.g. Awin',
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.platforms.status', 'Status')}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        'admin.platforms.status_select',
                        'Select status',
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      {t('admin.platforms.active', 'Active')}
                    </SelectItem>
                    <SelectItem value="inactive">
                      {t('admin.platforms.inactive', 'Inactive')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>
                  {t(
                    'admin.platforms.commission_rate',
                    'Base Commission Rate (%)',
                  )}
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.base_commission_rate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      base_commission_rate: Number(e.target.value),
                    })
                  }
                  placeholder="0.00"
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.name}>
              {isSaving
                ? t('admin.platforms.saving', 'Saving...')
                : t('common.save', 'Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
