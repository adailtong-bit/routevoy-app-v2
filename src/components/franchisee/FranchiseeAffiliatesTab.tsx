import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Plus, Edit2, Trash2, Mail, Percent } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { toast } from 'sonner'

export function FranchiseeAffiliatesTab({
  franchiseId,
}: {
  franchiseId: string
}) {
  const [affiliates, setAffiliates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    status: 'active',
    commission_rate: 30,
  })

  const fetchAffiliates = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('affiliate_partners')
      .select('*')
      .eq('franchise_id', franchiseId)
      .order('created_at', { ascending: false })

    if (data) setAffiliates(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchAffiliates()
  }, [franchiseId])

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      toast.error('Name and email are required')
      return
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        status: formData.status,
        commission_rate: formData.commission_rate,
        franchise_id: franchiseId,
      }

      if (formData.id) {
        const { error } = await supabase
          .from('affiliate_partners')
          .update(payload)
          .eq('id', formData.id)
        if (error) throw error
        toast.success('Affiliate updated')
      } else {
        const { error } = await supabase
          .from('affiliate_partners')
          .insert([payload])
        if (error) throw error
        toast.success('Affiliate created')
      }

      setIsDialogOpen(false)
      fetchAffiliates()
    } catch (e: any) {
      toast.error(e.message || 'Error saving affiliate')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this affiliate?')) {
      const { error } = await supabase
        .from('affiliate_partners')
        .delete()
        .eq('id', id)
      if (error) toast.error(error.message)
      else {
        toast.success('Affiliate deleted')
        fetchAffiliates()
      }
    }
  }

  const openDialog = (affiliate?: any) => {
    if (affiliate) {
      setFormData({
        id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
        status: affiliate.status || 'active',
        commission_rate: affiliate.commission_rate || 30,
      })
    } else {
      setFormData({
        id: '',
        name: '',
        email: '',
        status: 'active',
        commission_rate: 30,
      })
    }
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            Affiliate Partners
          </h2>
          <p className="text-slate-500">
            Manage affiliates promoting your region.
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Add Affiliate
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Affiliate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Commission Rate</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-slate-500 font-medium"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : affiliates.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-slate-500"
                  >
                    No affiliates found for your region.
                  </TableCell>
                </TableRow>
              ) : (
                affiliates.map((aff) => (
                  <TableRow key={aff.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-800">
                          {aff.name}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center mt-1">
                          <Mail className="w-3 h-3 mr-1" /> {aff.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          aff.status === 'active' ? 'default' : 'secondary'
                        }
                        className="capitalize"
                      >
                        {aff.status || 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-slate-700 font-medium">
                        <Percent className="w-4 h-4 mr-1 text-slate-400" />
                        {aff.commission_rate || 0}%
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {new Date(aff.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDialog(aff)}
                      >
                        <Edit2 className="h-4 w-4 text-slate-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(aff.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formData.id ? 'Edit Affiliate' : 'New Affiliate'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="john@example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Commission Rate (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.commission_rate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      commission_rate: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
