import { useState, useEffect } from 'react'
import { Plus, Search, ImageOff, Loader2, Edit, Trash2 } from 'lucide-react'
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
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { AdminCouponSheet } from './AdminCouponSheet'

export function AdminOffersTab() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [isFetching, setIsFetching] = useState(true)
  const [search, setSearch] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<any>(null)

  const fetchCoupons = async () => {
    setIsFetching(true)
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Failed to load coupons')
    } else {
      setCoupons(data || [])
    }
    setIsFetching(false)
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return
    const { error } = await supabase.from('coupons').delete().eq('id', id)
    if (error) toast.error('Error deleting coupon')
    else {
      toast.success('Coupon deleted')
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
            Coupons & Vouchers
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
              setEditingCoupon(null)
              setSheetOpen(true)
            }}
            className="gap-2 shrink-0 bg-blue-600 hover:bg-blue-700 text-white"
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
                <TableCell colSpan={5} className="text-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : filteredCoupons.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-10 text-slate-500"
                >
                  No coupons found.
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
                    <span className="font-medium text-slate-700">
                      {coupon.store_name || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs">
                      {coupon.discount || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${coupon.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}
                    >
                      {coupon.status || 'inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingCoupon(coupon)
                          setSheetOpen(true)
                        }}
                      >
                        <Edit className="w-4 h-4 text-slate-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(coupon.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AdminCouponSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        coupon={editingCoupon}
        onSuccess={() => {
          setSheetOpen(false)
          fetchCoupons()
        }}
      />
    </div>
  )
}
