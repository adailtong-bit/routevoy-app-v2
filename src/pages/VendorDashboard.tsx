import { useSearchParams, Link } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Briefcase,
  ShoppingBag,
  Zap,
  Scan,
  History,
  Settings,
  Users,
  CalendarDays,
  ScanLine,
  MapPin,
  Target,
  Send,
  ListOrdered,
  Gift,
  Plus,
} from 'lucide-react'
import { useState } from 'react'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import { useAuth } from '@/hooks/use-auth'
import { VendorAnalytics } from '@/components/VendorAnalytics'
import { CouponValidation } from '@/components/CouponValidation'
import { VendorStats } from '@/components/vendor/VendorStats'
import { CampaignFormDialog } from '@/components/merchant/CampaignFormDialog'
import { OrdersTable, HistoryTable } from '@/components/vendor/VendorTables'
import { VendorCampaignsTab } from '@/components/vendor/VendorCampaignsTab'
import { BehavioralTriggersTab } from '@/components/vendor/BehavioralTriggersTab'
import { VendorSettingsTab } from '@/components/vendor/VendorSettingsTab'
import { VendorCustomersTab } from '@/components/vendor/VendorCustomersTab'
import { VendorSeasonalTab } from '@/components/vendor/VendorSeasonalTab'
import { VendorRulesTab } from '@/components/vendor/VendorRulesTab'
import { VendorRewardsTab } from '@/components/vendor/VendorRewardsTab'
import { StaffTab } from '@/components/admin/hierarchy/StaffTab'
import { TargetGroupsTab } from '@/components/admin/crm/TargetGroupsTab'
import { CommunicationCampaignsTab } from '@/components/admin/crm/CommunicationCampaignsTab'
import { AdminCRM } from '@/components/admin/AdminCRM'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function VendorDashboard() {
  const { t } = useLanguage()
  const { companies, coupons: allCoupons, bookings } = useCouponStore()
  const { user: authUser, role: authRole } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false)

  const activeTab = searchParams.get('tab') || 'overview'

  const setActiveTab = (tab: string) => {
    setSearchParams({ tab })
  }

  const isAdminOrFranchisee =
    authRole === 'super_admin' ||
    authRole === 'admin' ||
    authRole === 'franchisee' ||
    authUser?.email === 'adailtong@gmail.com'

  const mockCompany = {
    id: 'mock-company-admin',
    name: 'Empresa Teste (Visão Admin)',
    region: 'Global',
    addressCountry: 'Brasil',
    addressState: 'SP',
    addressCity: 'São Paulo',
    addressStreet: 'Avenida Paulista',
    addressNumber: '1000',
  } as any

  const matchedCompany = companies.find(
    (c) => c.ownerId === authUser?.id || c.email === authUser?.email,
  )

  const myCompany =
    matchedCompany || (isAdminOrFranchisee ? companies[0] || mockCompany : null)

  const coupons = allCoupons.filter(
    (c) =>
      c.source !== 'aggregated' &&
      (c.companyId === myCompany?.id || isAdminOrFranchisee),
  )

  const myBookings = bookings.filter((b) => b.storeName === myCompany?.name)

  const isAddressComplete =
    myCompany?.addressCountry &&
    myCompany?.addressState &&
    myCompany?.addressCity &&
    myCompany?.addressStreet &&
    myCompany?.addressNumber

  if (!myCompany) {
    return (
      <div className="container py-16 text-center animate-fade-in flex flex-col items-center justify-center min-h-[60vh]">
        <Briefcase className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Nenhum lojista associado encontrado
        </h2>
        <p className="text-slate-500 mb-6 max-w-md">
          Seu perfil não possui um estabelecimento vinculado. Entre em contato
          com o administrador ou cadastre sua loja para publicar promoções.
        </p>
        <div className="flex gap-4">
          <Button disabled className="opacity-50 cursor-not-allowed">
            <Plus className="w-4 h-4 mr-2" /> Nova Promoção
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Voltar para a Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 mb-16 md:mb-0 animate-fade-in-up">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-primary" />{' '}
            {t('vendor.dashboard', 'Painel do Lojista')}
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            {myCompany.name} - {myCompany.region}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            asChild
            variant="outline"
            className="gap-2 bg-slate-50 hover:bg-slate-100 border-slate-200 font-bold"
          >
            <Link to="/merchant/scanner">
              <ScanLine className="h-4 w-4 text-primary" />{' '}
              {t('vendor.scanner', 'Scanner PDV')}
            </Link>
          </Button>
          <Button
            onClick={() => setIsCampaignDialogOpen(true)}
            className="font-bold shadow-md hover:-translate-y-0.5 transition-transform gap-2"
          >
            <Plus className="w-4 h-4" /> Nova Promoção
          </Button>
          <CampaignFormDialog
            open={isCampaignDialogOpen}
            onOpenChange={setIsCampaignDialogOpen}
            companyId={myCompany.id}
          />
        </div>
      </div>

      {!isAddressComplete && (
        <Alert className="mb-6 border-orange-200 bg-orange-50/80 animate-fade-in-up shadow-sm">
          <MapPin className="h-5 w-5 !text-orange-600" />
          <AlertTitle className="text-orange-800 font-bold">
            {t('vendor.incomplete_address', 'Endereço da Loja Incompleto')}
          </AlertTitle>
          <AlertDescription className="text-orange-700 mt-1">
            {t(
              'vendor.incomplete_address_desc',
              'Seu estabelecimento não será exibido corretamente no mapa para os clientes. Complete os dados de endereço para ativar a navegação GPS.',
            )}{' '}
            <button
              onClick={() => setActiveTab('settings')}
              className="font-bold underline hover:text-orange-900 transition-colors"
            >
              {t('vendor.setup_address', 'Configurar endereço agora')}
            </button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 flex flex-wrap h-auto p-1 bg-slate-100/80 rounded-lg justify-start shadow-inner overflow-x-auto whitespace-nowrap scrollbar-hide">
          <TabsTrigger
            value="overview"
            className="py-2.5 px-4 font-semibold data-[state=active]:shadow-sm"
          >
            {t('vendor.overview', 'Visão Geral')}
          </TabsTrigger>
          <TabsTrigger
            value="offers"
            className="py-2.5 px-4 font-semibold data-[state=active]:shadow-sm"
          >
            <ShoppingBag className="h-4 w-4 mr-2 text-emerald-500" />{' '}
            {t('vendor.campaigns', 'Campanhas')}
          </TabsTrigger>
          <TabsTrigger
            value="staff"
            className="py-2.5 px-4 font-semibold data-[state=active]:shadow-sm"
          >
            <Users className="h-4 w-4 mr-2" /> {t('vendor.staff', 'Equipe')}
          </TabsTrigger>
          <TabsTrigger
            value="customers"
            className="py-2.5 px-4 font-semibold data-[state=active]:shadow-sm"
          >
            <Users className="h-4 w-4 mr-2 text-blue-500" />{' '}
            {t('vendor.customers', 'CRM / Leads')}
          </TabsTrigger>
          <TabsTrigger
            value="target_groups"
            className="py-2.5 px-4 font-semibold data-[state=active]:shadow-sm"
          >
            <Target className="h-4 w-4 mr-2 text-indigo-500" />{' '}
            {t('vendor.target_groups', 'Grupos Alvo')}
          </TabsTrigger>
          <TabsTrigger
            value="comms"
            className="py-2.5 px-4 font-semibold data-[state=active]:shadow-sm"
          >
            <Send className="h-4 w-4 mr-2 text-rose-500" />{' '}
            {t('vendor.comms', 'Campanhas CRM')}
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className="py-2.5 px-4 font-semibold data-[state=active]:shadow-sm"
          >
            {t('vendor.orders', 'Pedidos')}
          </TabsTrigger>
          <TabsTrigger
            value="validation"
            className="py-2.5 px-4 font-semibold data-[state=active]:shadow-sm"
          >
            <Scan className="h-4 w-4 mr-2" />{' '}
            {t('vendor.validation_tab', 'Validar')}
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="py-2.5 px-4 font-semibold data-[state=active]:shadow-sm"
          >
            <History className="h-4 w-4 mr-2" />{' '}
            {t('vendor.history', 'Resgates')}
          </TabsTrigger>
          <TabsTrigger
            value="rules"
            className="py-2.5 px-4 font-semibold data-[state=active]:shadow-sm"
          >
            <ListOrdered className="h-4 w-4 mr-2 text-amber-500" />{' '}
            {t('vendor.rules', 'Regras de Campanha')}
          </TabsTrigger>
          <TabsTrigger
            value="rewards"
            className="py-2.5 px-4 font-semibold data-[state=active]:shadow-sm"
          >
            <Gift className="h-4 w-4 mr-2 text-pink-500" /> Recompensas
          </TabsTrigger>
          <TabsTrigger
            value="behavioral"
            className="py-2.5 px-4 font-semibold data-[state=active]:shadow-sm"
          >
            <Zap className="h-4 w-4 mr-2 text-orange-500" />{' '}
            {t('vendor.behavioral_tab', 'Gatilhos')}
          </TabsTrigger>
          <TabsTrigger
            value="seasonal"
            className="py-2.5 px-4 font-semibold data-[state=active]:shadow-sm"
          >
            <CalendarDays className="h-4 w-4 mr-2 text-purple-500" />{' '}
            {t('vendor.seasonal', 'Sazonal')}
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="py-2.5 px-4 font-semibold data-[state=active]:shadow-sm"
          >
            <Settings className="h-4 w-4 mr-2" />{' '}
            {t('vendor.settings', 'Configurações')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-8">
          <VendorStats company={myCompany} activeCampaigns={coupons.length} />
          <VendorAnalytics />
        </TabsContent>
        <TabsContent value="offers" className="mt-4">
          <VendorCampaignsTab coupons={coupons} company={myCompany} />
        </TabsContent>
        <TabsContent value="staff" className="mt-4">
          <StaffTab parentType="company" parentId={myCompany.id} />
        </TabsContent>
        <TabsContent value="customers" className="mt-4">
          <VendorCustomersTab company={myCompany} />
        </TabsContent>
        <TabsContent value="target_groups" className="mt-4">
          <TargetGroupsTab companyId={myCompany.id} />
        </TabsContent>
        <TabsContent value="comms" className="mt-4">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <AdminCRM franchiseId={myCompany.id} />
          </div>
        </TabsContent>
        <TabsContent value="rules" className="mt-4">
          <VendorRulesTab company={myCompany} />
        </TabsContent>
        <TabsContent value="rewards" className="mt-4">
          <VendorRewardsTab company={myCompany} />
        </TabsContent>
        <TabsContent value="seasonal" className="mt-4">
          <VendorSeasonalTab company={myCompany} />
        </TabsContent>
        <TabsContent value="orders" className="mt-4">
          <OrdersTable orders={myBookings} />
        </TabsContent>
        <TabsContent value="behavioral" className="mt-4">
          <BehavioralTriggersTab coupons={coupons} />
        </TabsContent>
        <TabsContent value="validation" className="mt-4">
          <CouponValidation />
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <HistoryTable />
        </TabsContent>
        <TabsContent value="settings" className="mt-4">
          <VendorSettingsTab company={myCompany} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
