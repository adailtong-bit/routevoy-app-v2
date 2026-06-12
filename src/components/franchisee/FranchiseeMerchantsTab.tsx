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
import { Store, Plus, Edit2, Trash2, Mail, MapPin } from 'lucide-react'
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

export function FranchiseeMerchantsTab({
  franchiseId,
}: {
  franchiseId: string
}) {
  const [merchants, setMerchants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    status: 'active',
    address_city: '',
  })

  const fetchMerchants = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('merchants')
      .select('*')
      .eq('franchise_id', franchiseId)
      .order('created_at', { ascending: false })

    if (data) setMerchants(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchMerchants()
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
        address_city: formData.address_city,
        franchise_id: franchiseId,
      }

      if (formData.id) {
        const { error } = await supabase
          .from('merchants')
          .update(payload)
          .eq('id', formData.id)
        if (error) throw error
        toast.success('Merchant updated')
      } else {
        const payloadWithId = { ...payload, id: crypto.randomUUID() }
        const { error } = await supabase
          .from('merchants')
          .insert([payloadWithId])
        if (error) throw error
        toast.success('Merchant created')
      }

      setIsDialogOpen(false)
      fetchMerchants()
    } catch (e: any) {
      toast.error(e.message || 'Error saving merchant')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this merchant?')) {
      const { error } = await supabase.from('merchants').delete().eq('id', id)
      if (error) toast.error(error.message)
      else {
        toast.success('Merchant deleted')
        fetchMerchants()
      }
    }
  }

  const openDialog = (merchant?: any) => {
    if (merchant) {
      setFormData({
        id: merchant.id,
        name: merchant.name || '',
        email: merchant.email || '',
        status: merchant.status || 'active',
        address_city: merchant.address_city || '',
      })
    } else {
      setFormData({
        id: '',
        name: '',
        email: '',
        status: 'active',
        address_city: '',
      })
    }
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            Merchant Management
          </h2>
          <p className="text-slate-500">
            Manage stores and vendors in your region.
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Add Merchant
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Merchant</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
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
              ) : merchants.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-slate-500"
                  >
                    No merchants found for your region.
                  </TableCell>
                </TableRow>
              ) : (
                merchants.map((merchant) => (
                  <TableRow key={merchant.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                          <Store className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">
                            {merchant.name || 'Unnamed Store'}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center mt-1">
                            <Mail className="w-3 h-3 mr-1" />{' '}
                            {merchant.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-slate-600 text-sm">
                        <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                        {merchant.address_city || 'Not specified'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          merchant.status === 'active' ? 'default' : 'secondary'
                        }
                        className="capitalize"
                      >
                        {merchant.status || 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {new Date(merchant.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDialog(merchant)}
                      >
                        <Edit2 className="h-4 w-4 text-slate-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(merchant.id)}
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
              {formData.id ? 'Edit Merchant' : 'New Merchant'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Store Name</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Awesome Store"
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
                placeholder="store@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={formData.address_city}
                onChange={(e) =>
                  setFormData({ ...formData, address_city: e.target.value })
                }
                placeholder="New York"
              />
            </div>
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
