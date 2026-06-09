import { useState, useMemo } from 'react'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import { supabase } from '@/lib/supabase/client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Send,
  Mail,
  MessageSquare,
  Users,
  Eye,
  CheckCircle2,
  LayoutTemplate,
  Target,
  BarChart2,
  Star,
} from 'lucide-react'
import { toast } from 'sonner'
import { MOCK_USERS, CATEGORIES } from '@/lib/data'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { CRMPerformanceDashboard } from './crm/CRMPerformanceDashboard'
import { CampaignFormDialog } from '@/components/merchant/CampaignFormDialog'
import { Plus } from 'lucide-react'

function TopDedicatedUsers() {
  const [users, setUsers] = useState<any[]>([])
  const { t } = useLanguage()

  useEffect(() => {
    async function fetchEngagements() {
      const { data: engagements } = await supabase
        .from('user_engagements')
        .select('user_id')
      if (engagements) {
        const counts: Record<string, number> = {}
        engagements.forEach((e: any) => {
          if (e.user_id) counts[e.user_id] = (counts[e.user_id] || 0) + 1
        })
        const userIds = Object.keys(counts)
          .sort((a, b) => counts[b] - counts[a])
          .slice(0, 5)

        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .in('id', userIds)
          if (profiles) {
            const enriched = profiles
              .map((p) => ({
                ...p,
                engagements: counts[p.id],
              }))
              .sort((a, b) => b.engagements - a.engagements)
            setUsers(enriched)
          }
        }
      }
    }
    fetchEngagements()
  }, [])

  if (users.length === 0) return null

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />{' '}
          {t('crm.top_dedicated_users', 'Top Dedicated Users')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between p-3 bg-white rounded-lg border shadow-sm"
            >
              <div className="overflow-hidden">
                <p className="font-semibold text-sm truncate">
                  {u.name || u.email.split('@')[0]}
                </p>
                <p className="text-xs text-slate-500 truncate">{u.email}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="secondary" className="font-mono bg-slate-100">
                  {u.engagements} shares
                </Badge>
                {u.is_vip && (
                  <Badge className="bg-purple-600 hover:bg-purple-700 text-white border-none shadow-sm">
                    VIP
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function AdminCRM({ franchiseId }: { franchiseId?: string }) {
  const { t } = useLanguage()
  const { coupons } = useCouponStore()

  const [channel, setChannel] = useState<'whatsapp' | 'email'>('email')
  const [offerId, setOfferId] = useState('none')
  const [behavior, setBehavior] = useState('all')
  const [interests, setInterests] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [isDispatching, setIsDispatching] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false)

  const activeOffers = useMemo(
    () =>
      coupons.filter((c) => {
        if (c.status !== 'active') return false
        if (
          franchiseId &&
          c.companyId !== franchiseId &&
          c.franchiseId !== franchiseId &&
          franchiseId !== 'mock-company-admin' &&
          franchiseId !== 'mock-franchise-admin'
        )
          return false
        return true
      }),
    [coupons, franchiseId],
  )

  const selectedOffer = useMemo(
    () => activeOffers.find((c) => c.id === offerId),
    [activeOffers, offerId],
  )

  const filteredUsers = useMemo(
    () =>
      MOCK_USERS.filter((u) => {
        if (u.role !== 'user' && u.role !== 'franchisee') return false
        if (behavior === 'frequent' && !u.preferences?.newsletter) return false
        if (behavior === 'recent' && u.subscriptionTier !== 'premium')
          return false
        if (behavior === 'inactive' && u.preferences?.newsletter) return false
        if (
          interests.length > 0 &&
          (!u.preferences?.categories ||
            !u.preferences.categories.some((c) => interests.includes(c)))
        )
          return false
        return true
      }),
    [behavior, interests],
  )

  const handleDispatch = () => {
    setIsDispatching(true)
    setTimeout(() => {
      setIsDispatching(false)
      setShowConfirm(false)
      toast.success(t('crm.dispatch_success', 'Campaign dispatched!'))
      setMessage('')
      setOfferId('none')
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="performance" className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">
              CRM & Analytics
            </h2>
            <p className="text-slate-500 text-sm">
              Analise o desempenho e dispare campanhas direcionadas para a sua
              audiência.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsCampaignDialogOpen(true)}
              className="font-bold shadow-md hover:-translate-y-0.5 transition-transform"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('crm.new_campaign', 'Criar Nova Campanha')}
            </Button>
            <TabsList className="bg-slate-100 p-1">
              <TabsTrigger
                value="performance"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <BarChart2 className="w-4 h-4 mr-2" /> Desempenho
              </TabsTrigger>
              <TabsTrigger
                value="dispatch"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Send className="w-4 h-4 mr-2" /> Disparos
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <CampaignFormDialog
          open={isCampaignDialogOpen}
          onOpenChange={setIsCampaignDialogOpen}
          companyId={franchiseId || 'admin-global'}
        />

        <TabsContent value="performance" className="mt-0 outline-none">
          <CRMPerformanceDashboard franchiseId={franchiseId} />
        </TabsContent>

        <TabsContent value="dispatch" className="mt-0 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-6">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />{' '}
                    {t('crm.dispatch.target_filters', 'Target Filters')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>
                      {t('crm.dispatch.user_behavior', 'User Behavior')}
                    </Label>
                    <Select value={behavior} onValueChange={setBehavior}>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t(
                            'crm.dispatch.select_behavior',
                            'Select behavior',
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          {t('crm.dispatch.all_active', 'All Active Users')}
                        </SelectItem>
                        <SelectItem value="frequent">
                          {t('crm.dispatch.frequent_buyers', 'Frequent Buyers')}
                        </SelectItem>
                        <SelectItem value="recent">
                          {t('crm.dispatch.recent_signups', 'Recent Signups')}
                        </SelectItem>
                        <SelectItem value="inactive">
                          {t(
                            'crm.dispatch.inactive_users',
                            'Inactive Users (> 30 days)',
                          )}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {t(
                        'crm.dispatch.category_interests',
                        'Category Interests',
                      )}
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
                        const isSelected = interests.includes(cat.id)
                        return (
                          <Badge
                            key={cat.id}
                            variant={isSelected ? 'default' : 'outline'}
                            className={cn(
                              'cursor-pointer',
                              !isSelected && 'hover:text-primary',
                            )}
                            onClick={() =>
                              setInterests((p) =>
                                isSelected
                                  ? p.filter((x) => x !== cat.id)
                                  : [...p, cat.id],
                              )
                            }
                          >
                            {t(cat.translationKey, cat.label)}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 flex justify-between items-center border">
                    <span className="text-sm font-medium text-slate-600">
                      {t(
                        'crm.dispatch.estimated_audience',
                        'Estimated Audience',
                      )}
                    </span>
                    <span className="text-xl font-bold text-primary">
                      {filteredUsers.length}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <LayoutTemplate className="w-5 h-5 text-primary" />{' '}
                    {t('crm.dispatch.campaign_content', 'Campaign Content')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('crm.dispatch.channel', 'Channel')}</Label>
                    <ToggleGroup
                      type="single"
                      value={channel}
                      onValueChange={(v) => v && setChannel(v as any)}
                      className="justify-start"
                    >
                      <ToggleGroupItem
                        value="email"
                        className="w-32 data-[state=on]:bg-blue-50 data-[state=on]:text-blue-700 border"
                      >
                        <Mail className="w-4 h-4 mr-2" /> Email
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="whatsapp"
                        className="w-32 data-[state=on]:bg-green-50 data-[state=on]:text-green-700 border"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" /> WhatsApp
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('crm.dispatch.link_offer', 'Link Offer')}</Label>
                    <Select value={offerId} onValueChange={setOfferId}>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t(
                            'crm.dispatch.select_offer',
                            'Select offer',
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          {t('crm.dispatch.no_offer', 'No specific offer')}
                        </SelectItem>
                        {activeOffers.map((o) => (
                          <SelectItem key={o.id} value={o.id}>
                            {o.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {t('crm.dispatch.custom_message', 'Custom Message')}
                    </Label>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      placeholder={t(
                        'crm.dispatch.type_message',
                        'Type your message...',
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <TopDedicatedUsers />
              <Card className="sticky top-6">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />{' '}
                    {t('crm.dispatch.preview', 'Preview')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 sm:px-6 sm:pb-6">
                  {channel === 'email' ? (
                    <div className="border rounded-lg bg-white overflow-hidden shadow-sm mx-4 sm:mx-0 mb-4 sm:mb-0">
                      <div className="bg-slate-100 p-3 border-b text-sm flex flex-col gap-1">
                        <div>
                          <span className="text-slate-500 mr-2">
                            {t('crm.dispatch.to', 'To:')}
                          </span>
                          {filteredUsers.length}{' '}
                          {t('crm.dispatch.users', 'Users')}
                        </div>
                        <div>
                          <span className="text-slate-500 mr-2">
                            {t('crm.dispatch.subj', 'Subj:')}
                          </span>
                          {selectedOffer
                            ? selectedOffer.title
                            : t('crm.dispatch.updates', 'Updates')}
                        </div>
                      </div>
                      <div className="p-5 text-center flex flex-col items-center gap-3">
                        {selectedOffer && (
                          <img
                            src={selectedOffer.image}
                            className="w-full h-32 object-cover rounded-md"
                            alt="Offer preview"
                          />
                        )}
                        <h3 className="font-bold">
                          {selectedOffer?.title ||
                            t('crm.dispatch.updates', 'Updates')}
                        </h3>
                        <p className="text-sm text-slate-600 whitespace-pre-wrap">
                          {message || selectedOffer?.description}
                        </p>
                        {selectedOffer && (
                          <Button size="sm" className="mt-2 w-full">
                            {t('crm.dispatch.view_offer', 'View Offer')}
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="border rounded-lg bg-[#efeae2] h-[380px] flex flex-col overflow-hidden shadow-sm mx-4 sm:mx-0 mb-4 sm:mb-0">
                      <div className="bg-[#00a884] text-white p-3 flex items-center gap-2 shrink-0">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-semibold text-sm">Deal Voy</span>
                      </div>
                      <ScrollArea className="flex-1 p-4 bg-opacity-10">
                        <div className="bg-white rounded-lg p-2 max-w-[90%] shadow-sm text-sm relative pb-5 rounded-tl-none">
                          {selectedOffer && (
                            <img
                              src={selectedOffer.image}
                              className="w-full h-24 object-cover rounded-md mb-2"
                              alt="Offer preview"
                            />
                          )}
                          {selectedOffer && (
                            <p className="font-bold mb-1">
                              *{selectedOffer.title}*
                            </p>
                          )}
                          <p className="whitespace-pre-wrap text-slate-700">
                            {message || selectedOffer?.description}
                          </p>
                          {selectedOffer && (
                            <a
                              href="#"
                              className="text-blue-500 text-xs mt-1 block"
                            >
                              https://dealvoy.app/o/{selectedOffer.id}
                            </a>
                          )}
                          <span className="text-[10px] text-slate-400 absolute bottom-1 right-2 flex items-center">
                            12:00{' '}
                            <CheckCircle2 className="w-3 h-3 ml-1 text-blue-500" />
                          </span>
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full"
                        disabled={filteredUsers.length === 0}
                      >
                        <Send className="w-4 h-4 mr-2" />{' '}
                        {t('crm.dispatch.review_dispatch', 'Review & Dispatch')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {t('crm.dispatch.confirm_title', 'Confirm Dispatch')}
                        </DialogTitle>
                        <DialogDescription>
                          {t(
                            'crm.dispatch.confirm_desc',
                            'Send campaign to audience.',
                          )}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3 py-4">
                        <div className="flex justify-between p-3 bg-slate-50 rounded-lg border">
                          <span className="text-sm text-slate-500">
                            {t('crm.dispatch.channel', 'Channel')}
                          </span>
                          <span className="font-semibold capitalize">
                            {channel}
                          </span>
                        </div>
                        <div className="flex justify-between p-3 bg-slate-50 rounded-lg border">
                          <span className="text-sm text-slate-500">
                            {t('crm.dispatch.audience', 'Audience')}
                          </span>
                          <span className="font-semibold">
                            {filteredUsers.length}{' '}
                            {t('crm.dispatch.users', 'Users')}
                          </span>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setShowConfirm(false)}
                        >
                          {t('common.cancel', 'Cancel')}
                        </Button>
                        <Button
                          onClick={handleDispatch}
                          disabled={isDispatching}
                        >
                          {isDispatching
                            ? t('crm.dispatch.sending', 'Sending...')
                            : t('common.confirm', 'Confirm')}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
