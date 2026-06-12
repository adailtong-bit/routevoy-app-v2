import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCouponStore } from '@/stores/CouponContext'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DollarSign, Plus, Edit2, Trash2 } from 'lucide-react'
import { Advertisement } from '@/lib/types'

export function FranchiseeAdsTab({ franchiseId }: { franchiseId: string }) {
  const {
    ads,
    createAd,
    updateAd,
    deleteAd,
    platformSettings,
    companies,
    franchises,
  } = useCouponStore()
  const [searchParams] = useSearchParams()
  const searchQuery = (searchParams.get('q') || '').toLowerCase()

  const franchise = franchises.find((f) => f.id === franchiseId)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null)

  const [adFormData, setAdFormData] = useState<Partial<Advertisement>>({
    title: '',
    description: '',
    image: '',
    link: '',
    price: 0,
  })

  const royaltyRate = platformSettings.franchiseRoyaltyRate || 15

  const myAds = useMemo(() => {
    return ads
      .filter((a) => a.franchiseId === franchiseId)
      .filter((a) => {
        if (!searchQuery) return true
        return (
          a.title.toLowerCase().includes(searchQuery) ||
          (a.description && a.description.toLowerCase().includes(searchQuery))
        )
      })
  }, [ads, franchiseId, searchQuery])

  const totalRevenue = myAds.reduce(
    (sum, ad) => sum + (ad.price || ad.budget || 0),
    0,
  )
  const totalRoyalties = totalRevenue * (royaltyRate / 100)

  const handleOpenDialog = (ad?: Advertisement) => {
    if (ad) {
      setEditingAd(ad)
      setAdFormData({
        title: ad.title,
        description: ad.description || '',
        image: ad.image,
        link: ad.link,
        price: ad.price || ad.budget || 0,
      })
    } else {
      setEditingAd(null)
      setAdFormData({
        title: '',
        description: '',
        image: 'https://img.usecurling.com/p/800/400?q=ad',
        link: '',
        price: 0,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    const hqCompany = companies.find(
      (c) => c.franchiseId === franchiseId && c.name.includes('HQ'),
    )

    if (editingAd) {
      updateAd(editingAd.id, adFormData)
    } else {
      createAd({
        id: Math.random().toString(),
        title: adFormData.title || 'New Ad',
        description: adFormData.description,
        image: adFormData.image || '',
        link: adFormData.link || '',
        price: adFormData.price,
        franchiseId,
        companyId: hqCompany?.id || 'admin_created',
        region: franchise?.region || 'Regional',
        category: 'Others',
        billingType: 'fixed',
        placement: 'sidebar',
        status: 'pending',
        views: 0,
        clicks: 0,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      })
    }
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500">
              Total Regional Ad Revenue
            </p>
            <h3 className="text-2xl font-bold">${totalRevenue.toFixed(2)}</h3>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-full text-orange-600">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500">
              Royalties Due ({royaltyRate}%)
            </p>
            <h3 className="text-2xl font-bold">${totalRoyalties.toFixed(2)}</h3>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>Regional Advertising</CardTitle>
            <CardDescription>
              Create and manage ads displayed exclusively in your region.
            </CardDescription>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="shrink-0 w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Ad
          </Button>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Royalties</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myAds.map((ad) => {
                const revenue = ad.price || ad.budget || 0
                const royalties = revenue * (royaltyRate / 100)
                return (
                  <TableRow key={ad.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={ad.image}
                          alt={ad.title}
                          className="w-12 h-8 rounded object-cover"
                        />
                        <span className="font-medium truncate max-w-[150px]">
                          {ad.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          ad.status === 'active' ? 'default' : 'secondary'
                        }
                        className="capitalize"
                      >
                        {ad.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${revenue.toFixed(2)}
                    </TableCell>
                    <TableCell className="font-bold text-orange-600">
                      ${royalties.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(ad)}
                      >
                        <Edit2 className="h-4 w-4 text-slate-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteAd(ad.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              {myAds.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-slate-500"
                  >
                    No regional ads created yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAd ? 'Edit Regional Ad' : 'Create Regional Ad'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Ad Title</Label>
              <Input
                value={adFormData.title}
                onChange={(e) =>
                  setAdFormData({ ...adFormData, title: e.target.value })
                }
                placeholder="Ex: Winter Super Sale"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={adFormData.description}
                onChange={(e) =>
                  setAdFormData({ ...adFormData, description: e.target.value })
                }
                placeholder="Additional details about the ad"
              />
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={adFormData.image}
                onChange={(e) =>
                  setAdFormData({ ...adFormData, image: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>Destination URL (Link)</Label>
              <Input
                value={adFormData.link}
                onChange={(e) =>
                  setAdFormData({ ...adFormData, link: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>Expected Revenue (For Royalties calculation)</Label>
              <Input
                type="number"
                value={adFormData.price}
                onChange={(e) =>
                  setAdFormData({
                    ...adFormData,
                    price: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-100 mt-2">
              <p className="text-sm font-medium text-orange-800">
                Royalties Due: $
                {((adFormData.price || 0) * (royaltyRate / 100)).toFixed(2)}
              </p>
              <p className="text-xs text-orange-600 mt-1">
                The standard applied rate is {royaltyRate}%.
              </p>
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
