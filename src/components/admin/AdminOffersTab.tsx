import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Edit2,
  Plus,
  Trash2,
  Loader2,
  UploadCloud,
  X,
  ImageOff,
  Search,
} from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/stores/LanguageContext'

export function AdminOffersTab() {
  const { t } = useLanguage()
  const [coupons, setCoupons] = useState<any[]>([])
  const [merchants, setMerchants] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const defaultForm = {
    title: '',
    store_name: '',
    company_id: 'none',
    category: '',
    description: '',
    image_url: '',
    discount: '',
    price: '',
    original_price: '',
    code: '',
    start_date: '',
    end_date: '',
    status: 'active',
    location_name: '',
    latitude: '',
    longitude: '',
    is_demo: false,
    is_featured: false,
    is_verified: false,
  }

  const [formData, setFormData] = useState(defaultForm)

  useEffect(() => {
    fetchCoupons()
    fetchMerchants()
  }, [])

  const fetchMerchants = async () => {
    const { data } = await supabase
      .from('merchants')
      .select('id, name')
      .order('name', { ascending: true })
    if (data) setMerchants(data)
  }

  const fetchCoupons = async () => {
    setIsFetching(true)
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Failed to load coupons')
    } else if (data) {
      setCoupons(data)
    }
    setIsFetching(false)
  }

  const handleEdit = (coupon: any) => {
    setEditingId(coupon.id)
    setFormData({
      title: coupon.title || '',
      store_name: coupon.store_name || '',
      company_id: coupon.company_id || 'none',
      category: coupon.category || '',
      description: coupon.description || '',
      image_url: coupon.image_url || '',
      discount: coupon.discount || '',
      price: coupon.price?.toString() || '',
      original_price: coupon.original_price?.toString() || '',
      code: coupon.code || '',
      start_date: coupon.start_date ? coupon.start_date.split('T')[0] : '',
      end_date: coupon.end_date ? coupon.end_date.split('T')[0] : '',
      status: coupon.status || 'active',
      location_name: coupon.location_name || '',
      latitude: coupon.latitude?.toString() || '',
      longitude: coupon.longitude?.toString() || '',
      is_demo: coupon.is_demo || false,
      is_featured: coupon.is_featured || false,
      is_verified: coupon.is_verified || false,
    })
    setIsDialogOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPG, PNG and WEBP are allowed.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB.')
      return
    }

    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `coupon_${Date.now()}.${fileExt}`

      const { error } = await supabase.storage
        .from('ad-campaigns') // Reusing same bucket for ease
        .upload(fileName, file)

      if (error) throw error

      const { data: publicUrlData } = supabase.storage
        .from('ad-campaigns')
        .getPublicUrl(fileName)

      setFormData({ ...formData, image_url: publicUrlData.publicUrl })
      toast.success('Image uploaded successfully')
    } catch (error: any) {
      console.error('Error uploading image:', error)
      toast.error(error.message || 'Failed to upload image')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the coupon "${title}"?`))
      return

    const { error } = await supabase.from('coupons').delete().eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success('Deleted successfully')
      fetchCoupons()
    }
  }

  const handleSave = async () => {
    if (!formData.title) {
      toast.error('Title is required')
      return
    }

    if (formData.is_demo && formData.status === 'active') {
      toast.error(
        'Demonstration items cannot be active. Please uncheck "Is Demo" to activate.',
      )
      return
    }

    setIsLoading(true)
    const payload = {
      title: formData.title,
      store_name: formData.store_name || null,
      company_id: formData.company_id === 'none' ? null : formData.company_id,
      category: formData.category,
      description: formData.description,
      image_url: formData.image_url,
      discount: formData.discount,
      code: formData.code,
      price: formData.price ? parseFloat(formData.price) : null,
      original_price: formData.original_price
        ? parseFloat(formData.original_price)
        : null,
      start_date: formData.start_date
        ? new Date(formData.start_date).toISOString()
        : null,
      end_date: formData.end_date
        ? new Date(formData.end_date).toISOString()
        : null,
      status: formData.status,
      location_name: formData.location_name || null,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      is_demo: formData.is_demo,
      is_featured: formData.is_featured,
      is_verified: formData.is_verified,
      environment: 'production', // Ensure consistency
    }

    let error
    if (editingId) {
      const res = await supabase
        .from('coupons')
        .update(payload)
        .eq('id', editingId)
      error = res.error
    } else {
      const res = await supabase.from('coupons').insert(payload)
      error = res.error
    }

    setIsLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Saved successfully')
      setIsDialogOpen(false)
      fetchCoupons()
    }
  }

  const filteredCoupons = coupons.filter(
    (c) =>
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.store_name?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">
            {t('admin.nav.coupons', 'Coupons & Vouchers')}
          </h3>
          <p className="text-sm text-slate-500">
            Manage all registered coupons across the network.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search coupons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
          <Button
            onClick={() => {
              setEditingId(null)
              setFormData(defaultForm)
              setIsDialogOpen(true)
            }}
            className="gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" /> Create Coupon
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-md">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Store / Company</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-10 text-slate-500"
                >
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : (
              filteredCoupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {coupon.image_url ? (
                        <img
                          src={coupon.image_url}
                          alt=""
                          className="w-10 h-10 object-cover rounded border border-slate-200"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-slate-100 flex items-center justify-center rounded border border-slate-200 shrink-0">
                          <ImageOff className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span
                          className="font-medium text-slate-900 line-clamp-1 max-w-[200px]"
                          title={coupon.title}
                        >
                          {coupon.title}
                        </span>
                        <span className="text-xs text-slate-500">
                          {coupon.category || 'General'}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-700">
                        {coupon.store_name || '-'}
                      </span>
                      {coupon.company_id && (
                        <span className="text-xs text-slate-400">
                          {merchants.find((m) => m.id === coupon.company_id)
                            ?.name || 'Linked to ID'}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-green-600">
                      {coupon.discount || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <Badge
                        variant={
                          coupon.status === 'active' ? 'default' : 'secondary'
                        }
                      >
                        {coupon.status === 'active' ? 'Active' : coupon.status}
                      </Badge>
                      {coupon.is_demo && (
                        <Badge className="bg-purple-500">Demo</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(coupon)}
                    >
                      <Edit2 className="w-4 h-4 text-slate-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(coupon.id, coupon.title)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
            {!isFetching && filteredCoupons.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-6 text-slate-500"
                >
                  No coupons found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>
              {editingId ? 'Edit Coupon' : 'Create Coupon'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Coupon Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g. 50% Off Everything"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Store Name (Display)</Label>
                  <Input
                    value={formData.store_name}
                    onChange={(e) =>
                      setFormData({ ...formData, store_name: e.target.value })
                    }
                    placeholder="Store Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Link to Merchant Account</Label>
                  <Select
                    value={formData.company_id}
                    onValueChange={(v) =>
                      setFormData({ ...formData, company_id: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a merchant..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Unlinked (Global)</SelectItem>
                      {merchants.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Discount Text</Label>
                  <Input
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({ ...formData, discount: e.target.value })
                    }
                    placeholder="e.g. 50% OFF"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="e.g. Food, Travel"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Promo Code</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    placeholder="e.g. SUMMER50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) =>
                      setFormData({ ...formData, status: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Price (if paid coupon)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Original Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.original_price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        original_price: e.target.value,
                      })
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="coupon_is_demo"
                    checked={formData.is_demo}
                    onCheckedChange={(v) =>
                      setFormData({ ...formData, is_demo: !!v })
                    }
                  />
                  <Label htmlFor="coupon_is_demo" className="cursor-pointer">
                    Is Demo (Seed Data)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="coupon_is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(v) =>
                      setFormData({ ...formData, is_featured: !!v })
                    }
                  />
                  <Label
                    htmlFor="coupon_is_featured"
                    className="cursor-pointer"
                  >
                    Featured
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="coupon_is_verified"
                    checked={formData.is_verified}
                    onCheckedChange={(v) =>
                      setFormData({ ...formData, is_verified: !!v })
                    }
                  />
                  <Label
                    htmlFor="coupon_is_verified"
                    className="cursor-pointer"
                  >
                    Verified Partner
                  </Label>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label>Coupon Image</Label>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                />
                {formData.image_url ? (
                  <div className="relative group mt-2 h-40 w-full md:w-[60%] rounded-md border overflow-hidden">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setFormData({ ...formData, image_url: '' })
                        }
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 h-32 w-full rounded-md border-2 border-dashed hover:border-primary/50 cursor-pointer flex flex-col items-center justify-center text-slate-400 bg-slate-50 hover:bg-slate-50/80 transition-colors"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-8 w-8 mb-2 animate-spin text-primary" />
                        <span className="text-sm">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-8 w-8 mb-2 opacity-50" />
                        <span className="text-sm font-medium">
                          Click to upload image
                        </span>
                        <span className="text-xs mt-1">
                          JPG, PNG, WEBP (Max 5MB)
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </div>

          <div className="p-6 pt-4 border-t flex justify-end gap-3 bg-slate-50/50 rounded-b-lg shrink-0">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading || isUploading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Coupon
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
