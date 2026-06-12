import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Check, X, Store, Tag } from 'lucide-react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function FranchiseeApprovalsTab({
  franchiseId,
}: {
  franchiseId: string
}) {
  const [merchants, setMerchants] = useState<any[]>([])
  const [promotions, setPromotions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    const { data: mData } = await supabase
      .from('merchants')
      .select('*')
      .eq('franchise_id', franchiseId)
      .eq('status', 'pending')

    setMerchants(mData || [])

    const { data: allM } = await supabase
      .from('merchants')
      .select('id')
      .eq('franchise_id', franchiseId)
    const mIds = allM?.map((m) => m.id) || []

    if (mIds.length > 0) {
      const { data: promos } = await supabase
        .from('discovered_promotions')
        .select('*')
        .in('company_id', mIds)
        .eq('status', 'pending')
      setPromotions(promos || [])
    } else {
      setPromotions([])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [franchiseId])

  const handleApproveMerchant = async (id: string) => {
    const { error } = await supabase
      .from('merchants')
      .update({ status: 'active' })
      .eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success('Merchant approved')
      loadData()
    }
  }

  const handleRejectMerchant = async (id: string) => {
    const { error } = await supabase
      .from('merchants')
      .update({ status: 'rejected' })
      .eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success('Merchant rejected')
      loadData()
    }
  }

  const handleApprovePromo = async (id: string) => {
    const { error } = await supabase
      .from('discovered_promotions')
      .update({ status: 'active' })
      .eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success('Promotion approved')
      loadData()
    }
  }

  const handleRejectPromo = async (id: string) => {
    const { error } = await supabase
      .from('discovered_promotions')
      .update({ status: 'rejected' })
      .eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success('Promotion rejected')
      loadData()
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          Pending Approvals
        </h2>
        <p className="text-slate-500">
          Review and approve merchants and promotions in your region.
        </p>
      </div>

      <Tabs defaultValue="merchants" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="merchants">
            Merchants ({merchants.length})
          </TabsTrigger>
          <TabsTrigger value="promotions">
            Promotions ({promotions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="merchants">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : merchants.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-slate-500"
                      >
                        No pending merchants.
                      </TableCell>
                    </TableRow>
                  ) : (
                    merchants.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">
                          <Store className="w-4 h-4 inline mr-2" />
                          {m.name}
                        </TableCell>
                        <TableCell>{m.email}</TableCell>
                        <TableCell>
                          {new Date(m.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleApproveMerchant(m.id)}
                          >
                            <Check className="w-4 h-4 text-emerald-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRejectMerchant(m.id)}
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promotions">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : promotions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-slate-500"
                      >
                        No pending promotions.
                      </TableCell>
                    </TableRow>
                  ) : (
                    promotions.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">
                          <Tag className="w-4 h-4 inline mr-2" />
                          {p.title}
                        </TableCell>
                        <TableCell>{p.store_name}</TableCell>
                        <TableCell>{p.discount}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleApprovePromo(p.id)}
                          >
                            <Check className="w-4 h-4 text-emerald-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRejectPromo(p.id)}
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
