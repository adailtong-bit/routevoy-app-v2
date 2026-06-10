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
import { TargetGroupsTab } from './crm/TargetGroupsTab'
import { CommunicationCampaignsTab } from './crm/CommunicationCampaignsTab'
import { LeadsProfileTab } from './crm/LeadsProfileTab'
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
            <TabsList className="bg-slate-100 p-1 flex-wrap h-auto justify-start">
              <TabsTrigger
                value="performance"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <BarChart2 className="w-4 h-4 mr-2" /> Desempenho
              </TabsTrigger>
              <TabsTrigger
                value="target_groups"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Target className="w-4 h-4 mr-2" /> Grupos Alvo
              </TabsTrigger>
              <TabsTrigger
                value="campaigns"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Send className="w-4 h-4 mr-2" /> Campanhas
              </TabsTrigger>
              <TabsTrigger
                value="leads"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Users className="w-4 h-4 mr-2" /> Leads
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

        <TabsContent value="target_groups" className="mt-0 outline-none">
          <TargetGroupsTab franchiseId={franchiseId} companyId={undefined} />
        </TabsContent>

        <TabsContent value="campaigns" className="mt-0 outline-none">
          <CommunicationCampaignsTab
            franchiseId={franchiseId}
            companyId={undefined}
          />
        </TabsContent>

        <TabsContent value="leads" className="mt-0 outline-none">
          <LeadsProfileTab franchiseId={franchiseId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
