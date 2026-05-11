import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  Coupon,
  UserLocation,
  Review,
  UploadedDocument,
  Booking,
  Challenge,
  Badge,
  ABTest,
  Itinerary,
  Company,
  Advertisement,
  User,
  RewardActivity,
  RewardItem,
  PaymentTransaction,
  ConnectedApp,
  Mission,
  Franchise,
  TravelOffer,
  Region,
  ValidationLog,
  CarRental,
  SystemLog,
  UserPreferences,
  BehavioralTrigger,
  CrawlerSource,
  DiscoveredPromotion,
  AdPricing,
  Advertiser,
  AdInvoice,
  PlatformSettings,
  SubscriptionTier,
  PartnerPolicy,
  PartnerInvoice,
  SeasonalEvent,
  TargetGroup,
  CommunicationCampaign,
  StandardRule,
  RewardCatalogItem,
} from '@/lib/types'
import {
  fetchCoupons,
  fetchCrawlerPromotions,
  fetchWebSearchPromotions,
} from '@/lib/api'
import {
  MOCK_COUPONS,
  MOCK_USER_LOCATION,
  MOCK_CHALLENGES,
  MOCK_BADGES,
  MOCK_AB_TESTS,
  MOCK_ITINERARIES,
  MOCK_COMPANIES,
  MOCK_ADS,
  MOCK_USERS as ORIGINAL_MOCK_USERS,
  MOCK_REWARDS,
  MOCK_FRANCHISES,
  MOCK_TRAVEL_OFFERS,
  MOCK_VALIDATION_LOGS,
  MOCK_CAR_RENTALS,
  REGIONS,
  MOCK_SYSTEM_LOGS,
  MOCK_CRAWLER_SOURCES,
  MOCK_DISCOVERED_PROMOTIONS,
  MOCK_AD_PRICING,
  MOCK_ADVERTISERS,
  MOCK_AD_INVOICES,
  DEFAULT_PLATFORM_SETTINGS,
  MOCK_PARTNER_POLICIES,
  MOCK_PARTNER_INVOICES,
  SEASONAL_EVENTS,
} from '@/lib/data'
import { toast } from 'sonner'
import { useNotification } from './NotificationContext'
import { useLanguage } from './LanguageContext'

const MOCK_USERS: User[] = ORIGINAL_MOCK_USERS.map((u) => ({
  ...u,
  state:
    u.country === 'Brasil'
      ? 'São Paulo'
      : u.country === 'USA'
        ? 'Florida'
        : undefined,
}))

interface CouponContextType {
  allCoupons: Coupon[]
  coupons: Coupon[]
  companies: Company[]
  ads: Advertisement[]
  users: User[]
  user: User | null
  savedIds: string[]
  reservedIds: string[]
  tripIds: string[]
  userLocation: UserLocation | null
  uploads: UploadedDocument[]
  bookings: Booking[]
  points: number
  rewardHistory: RewardActivity[]
  fetchCredits: number
  challenges: Challenge[]
  missions: Mission[]
  badges: Badge[]
  abTests: ABTest[]
  downloadedIds: string[]
  itineraries: Itinerary[]
  activeItineraryId: string | null
  setActiveItineraryId: (id: string | null) => void
  rewards: RewardItem[]
  isFetchConnected: boolean
  birthdayGiftAvailable: boolean
  transactions: PaymentTransaction[]
  connectedApps: ConnectedApp[]
  isDownloading: boolean
  downloadProgress: number
  franchises: Franchise[]
  travelOffers: TravelOffer[]
  selectedRegion: string
  regions: Region[]
  validationLogs: ValidationLog[]
  carRentals: CarRental[]
  systemLogs: SystemLog[]
  crawlerSources: CrawlerSource[]
  discoveredPromotions: DiscoveredPromotion[]
  dbPromotions: DiscoveredPromotion[]
  adPricing: AdPricing[]
  advertisers: Advertiser[]
  adInvoices: AdInvoice[]
  platformSettings: PlatformSettings
  partnerPolicies: PartnerPolicy[]
  partnerInvoices: PartnerInvoice[]
  seasonalEvents: SeasonalEvent[]
  usedVouchers: string[]
  targetGroups: TargetGroup[]
  communicationCampaigns: CommunicationCampaign[]
  standardRules: StandardRule[]
  rewardCatalog: RewardCatalogItem[]
  setRegion: (regionCode: string) => void
  toggleSave: (id: string) => void
  toggleTrip: (id: string) => void
  reserveCoupon: (id: string) => boolean
  cancelReservation: (id: string) => void
  addCoupon: (coupon: Coupon) => void
  deleteCoupon: (id: string) => void
  isSaved: (id: string) => boolean
  isReserved: (id: string) => boolean
  isInTrip: (id: string) => boolean
  isLoadingLocation: boolean
  isLoadingCoupons: boolean
  addReview: (couponId: string, review: Omit<Review, 'id' | 'date'>) => void
  replyToReview: (couponId: string, reviewId: string, text: string) => void
  addUpload: (doc: UploadedDocument) => void
  refreshCoupons: () => void
  hasErrorLoading: boolean
  voteCoupon: (id: string, type: 'up' | 'down') => void
  reportCoupon: (id: string, issue: string) => void
  makeBooking: (booking: Omit<Booking, 'id' | 'status'>) => void
  updateBooking: (id: string, data: Partial<Booking>) => void
  cancelBooking: (id: string) => void
  approveBooking: (id: string, price: number) => void
  payBooking: (id: string) => Promise<void>
  redeemPoints: (amount: number, type: 'points' | 'fetch') => boolean
  earnPoints: (amount: number, title: string) => void
  addABTest: (test: ABTest) => void
  downloadOffline: (ids: string[]) => void
  processPayment: (details: {
    couponId?: string
    amount: number
    method?: 'card' | 'fetch' | 'wallet'
    installments?: number
  }) => Promise<boolean>
  isDownloaded: (id: string) => boolean
  joinChallenge: (id: string) => void
  completeMission: (id: string) => void
  login: (email: string, password?: string) => Promise<void>
  register: (name: string, email: string, password?: string) => Promise<void>
  logout: () => void
  approveCompany: (id: string) => void
  rejectCompany: (id: string) => void
  createAd: (ad: Advertisement) => void
  updateAd: (id: string, data: Partial<Advertisement>) => void
  deleteAd: (id: string) => void
  updateCampaign: (id: string, data: Partial<Coupon>) => void
  connectFetch: () => void
  importFetchPoints: (amount: number) => void
  claimBirthdayGift: () => void
  updateUserProfile: (data: Partial<User>) => void
  updateUserPreferences: (prefs: Partial<UserPreferences>) => void
  upgradeSubscription: (tier: SubscriptionTier) => void
  connectApp: (id: string) => void
  saveItinerary: (itinerary: Itinerary) => void
  updateItinerary: (itinerary: Itinerary) => void
  deleteItinerary: (id: string) => void
  publishItinerary: (id: string) => void
  moderateItinerary: (id: string, status: 'approved' | 'rejected') => void
  toggleLoyaltySystem: (companyId: string, enabled: boolean) => void
  validateCoupon: (
    code: string,
    customerEmail?: string,
  ) => Promise<{ success: boolean; message: string }>
  addCarRental: (car: CarRental) => void
  trackVisit: (couponId: string) => void
  trackShare: (type: 'route' | 'coupon', id: string) => void
  updateBehavioralTriggers: (
    couponId: string,
    triggers: BehavioralTrigger[],
  ) => void
  togglePreferredCustomer: (companyId: string, userId: string) => void
  addCrawlerSource: (source: CrawlerSource) => void
  updateCrawlerSource: (id: string, data: Partial<CrawlerSource>) => void
  deleteCrawlerSource: (id: string) => void
  importPromotion: (id: string, customCategory?: string) => void
  ignorePromotion: (id: string) => void
  triggerScan: (sourceId: string, limit?: number) => void
  addAdPricing: (pricing: AdPricing) => void
  addAdvertiser: (advertiser: Advertiser) => void
  createAdCampaign: (ad: Advertisement, invoice: AdInvoice) => void
  updateInvoiceStatus: (id: string, status: AdInvoice['status']) => void
  updatePlatformSettings: (settings: Partial<PlatformSettings>) => void
  updatePartnerPolicy: (policy: PartnerPolicy) => void
  deletePartnerPolicy: (id: string) => void
  generatePartnerInvoice: (data: Partial<PartnerInvoice>) => void
  updatePartnerInvoiceStatus: (
    id: string,
    status: PartnerInvoice['status'],
  ) => void
  updatePartnerInvoice: (id: string, data: Partial<PartnerInvoice>) => void
  reconcilePartnerInvoice: (refNumber: string) => boolean
  addSeasonalEvent: (event: SeasonalEvent) => void
  updateSeasonalEvent: (id: string, event: Partial<SeasonalEvent>) => void
  deleteSeasonalEvent: (id: string) => void
  trackSeasonalClick: (id: string) => void
  approveSeasonalCampaign: (id: string) => void
  rejectSeasonalCampaign: (id: string) => void
  renewSeasonalCampaign: (id: string) => void

  // Target Groups & Comms
  addTargetGroup: (group: TargetGroup) => void
  updateTargetGroup: (id: string, data: Partial<TargetGroup>) => void
  deleteTargetGroup: (id: string) => void
  createCommunicationCampaign: (campaign: CommunicationCampaign) => void
  updateCommunicationCampaign: (
    id: string,
    data: Partial<CommunicationCampaign>,
  ) => void
  deleteCommunicationCampaign: (id: string) => void

  // Hierarchy Management
  addUser: (user: User) => void
  updateUser: (id: string, data: Partial<User>) => void
  deleteUser: (id: string) => void
  addCompany: (company: Company) => void
  updateCompany: (id: string, data: Partial<Company>) => void
  deleteCompany: (id: string) => void
  addFranchise: (franchise: Franchise) => void
  updateFranchise: (id: string, data: Partial<Franchise>) => void
  deleteFranchise: (id: string) => void

  // Standard Rules & Rewards
  addStandardRule: (rule: StandardRule) => void
  updateStandardRule: (id: string, data: Partial<StandardRule>) => void
  deleteStandardRule: (id: string) => void
  addRewardCatalogItem: (item: RewardCatalogItem) => void
  updateRewardCatalogItem: (
    id: string,
    data: Partial<RewardCatalogItem>,
  ) => void
  deleteRewardCatalogItem: (id: string) => void
  searchWeb: (query: string) => Promise<Coupon[]>
}

const CouponContext = createContext<CouponContextType | undefined>(undefined)

export function CouponProvider({ children }: { children: React.ReactNode }) {
  const { addNotification } = useNotification()
  const { t } = useLanguage()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(true)
  const [hasErrorLoading, setHasErrorLoading] = useState(false)

  const loadCoupons = async (isRetry = false) => {
    if (isRetry) {
      setIsLoadingCoupons(true)
      setHasErrorLoading(false)
    }
    try {
      const res = await fetchCoupons({ limit: 100 })

      if (res && res.data && Array.isArray(res.data)) {
        setCoupons(res.data)
        setHasErrorLoading(false)
      } else {
        setCoupons([])
      }
    } catch (e: any) {
      console.error('Failed to load coupons', e)
      setHasErrorLoading(true)
      setCoupons([])
    } finally {
      setIsLoadingCoupons(false)
    }
  }

  useEffect(() => {
    let mounted = true
    loadCoupons().catch((err) => {
      console.error('Unhandled error in loadCoupons', err)
      if (mounted) {
        setHasErrorLoading(true)
        setCoupons([])
        setIsLoadingCoupons(false)
      }
    })

    return () => {
      mounted = false
    }
  }, [])

  const [ads, setAds] = useState<Advertisement[]>([])
  const [users, setUsers] = useState<User[]>([])

  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      try {
        return JSON.parse(storedUser)
      } catch {
        // ignore parsing error
      }
    }
    return null
  })

  const [savedIds, setSavedIds] = useState<string[]>([])
  const [reservedIds, setReservedIds] = useState<string[]>([])
  const [tripIds, setTripIds] = useState<string[]>([])
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(true)
  const [uploads, setUploads] = useState<UploadedDocument[]>([])
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 'b1',
      couponId: 'h1',
      storeName: 'Family Resorts',
      date: '2025-05-10',
      endDate: '2025-05-15',
      time: '14:00',
      guests: 4,
      adults: 2,
      childrenCount: 2,
      childAges: [5, 8],
      status: 'confirmed',
      userId: 'u_user',
      userName: 'End User',
      source: 'partner',
      requiresPrivacy: true,
      type: 'hotel',
    },
  ])
  const [points, setPoints] = useState(1250)
  const [fetchCredits, setFetchCredits] = useState(50.0)
  const [challenges, setChallenges] = useState<Challenge[]>(MOCK_CHALLENGES)
  const [missions, setMissions] = useState<Mission[]>([
    {
      id: 'm1',
      title: 'Avalie sua visita ao Burger King',
      description: 'Conta pra gente como foi sua experiência e ganhe pontos.',
      rewardPoints: 100,
      type: 'survey',
      completed: false,
    },
  ])
  const [badges] = useState<Badge[]>(MOCK_BADGES)
  const [abTests, setAbTests] = useState<ABTest[]>(MOCK_AB_TESTS)
  const [downloadedIds, setDownloadedIds] = useState<string[]>([])
  const [itineraries, setItineraries] = useState<Itinerary[]>(MOCK_ITINERARIES)
  const [activeItineraryId, setActiveItineraryId] = useState<string | null>(
    null,
  )
  const [rewards] = useState<RewardItem[]>(MOCK_REWARDS)
  const [isFetchConnected, setIsFetchConnected] = useState(false)
  const [birthdayGiftAvailable, setBirthdayGiftAvailable] = useState(false)
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([])
  const [connectedApps, setConnectedApps] = useState<ConnectedApp[]>([])
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  const [franchises, setFranchises] = useState<Franchise[]>(MOCK_FRANCHISES)
  const [travelOffers, setTravelOffers] =
    useState<TravelOffer[]>(MOCK_TRAVEL_OFFERS)
  const [selectedRegion, setSelectedRegion] = useState<string>('Global')
  const [validationLogs, setValidationLogs] =
    useState<ValidationLog[]>(MOCK_VALIDATION_LOGS)
  const [carRentals, setCarRentals] = useState<CarRental[]>(MOCK_CAR_RENTALS)
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>(MOCK_SYSTEM_LOGS)

  const [rewardHistory, setRewardHistory] = useState<RewardActivity[]>([])

  const [crawlerSources, setCrawlerSources] =
    useState<CrawlerSource[]>(MOCK_CRAWLER_SOURCES)
  const [discoveredPromotions, setDiscoveredPromotions] = useState<
    DiscoveredPromotion[]
  >([])
  const [dbPromotions, setDbPromotions] = useState<DiscoveredPromotion[]>([])

  const loadPromotions = async (isRetry = false) => {
    try {
      const res = await fetchCrawlerPromotions({ limit: 100 })

      if (res && res.data && Array.isArray(res.data)) {
        setDiscoveredPromotions(res.data)
        setDbPromotions(res.data)
      } else {
        setDiscoveredPromotions([])
        setDbPromotions([])
      }
    } catch (e: any) {
      console.error('Failed to load promotions', e)
      setDiscoveredPromotions([])
      setDbPromotions([])
    }
  }

  useEffect(() => {
    let mounted = true
    loadPromotions().catch((err) => {
      console.error('Unhandled error in loadPromotions', err)
      if (mounted) {
        setDiscoveredPromotions([])
        setDbPromotions([])
      }
    })

    return () => {
      mounted = false
    }
  }, [])

  const [adPricing, setAdPricing] = useState<AdPricing[]>(MOCK_AD_PRICING)
  const [advertisers, setAdvertisers] = useState<Advertiser[]>(MOCK_ADVERTISERS)
  const [adInvoices, setAdInvoices] = useState<AdInvoice[]>(MOCK_AD_INVOICES)

  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(
    DEFAULT_PLATFORM_SETTINGS,
  )
  const [partnerPolicies, setPartnerPolicies] = useState<PartnerPolicy[]>(
    MOCK_PARTNER_POLICIES,
  )
  const [partnerInvoices, setPartnerInvoices] = useState<PartnerInvoice[]>(
    MOCK_PARTNER_INVOICES,
  )

  const [seasonalEvents, setSeasonalEvents] =
    useState<SeasonalEvent[]>(SEASONAL_EVENTS)

  const [usedVouchers, setUsedVouchers] = useState<string[]>([])

  const [targetGroups, setTargetGroups] = useState<TargetGroup[]>([
    {
      id: 'tg-1',
      name: 'Foodies - Alta Frequência SP',
      description: 'Clientes em SP que resgatam muitas ofertas de alimentação.',
      filters: {
        categories: ['Alimentação'],
        frequency: 'high',
        location: 'São Paulo',
        state: 'São Paulo',
        city: 'São Paulo',
        gender: 'all',
      },
      createdAt: new Date().toISOString(),
      leadCount: 15,
    },
    {
      id: 'tg-2',
      name: 'Turistas Potenciais NY',
      description: 'Leads na região de NY com histórico de viagens/lazer.',
      franchiseId: 'f_ny',
      filters: {
        categories: ['Lazer', 'Outros'],
        frequency: 'all',
        location: 'New York',
        state: 'New York',
        city: 'all',
        gender: 'all',
      },
      createdAt: new Date().toISOString(),
      leadCount: 12,
    },
    {
      id: 'tg-3',
      name: 'Meus Clientes Fiéis',
      description: 'Clientes locais que visitaram a loja mais de 5 vezes.',
      companyId: 'c1',
      filters: {
        categories: [],
        frequency: 'high',
        location: '',
        state: 'all',
        city: 'all',
        gender: 'all',
      },
      createdAt: new Date().toISOString(),
      leadCount: 28,
    },
  ])

  const [communicationCampaigns, setCommunicationCampaigns] = useState<
    CommunicationCampaign[]
  >([
    {
      id: 'cc-1',
      name: 'Promoção de Fim de Semana - Pizza',
      targetGroupId: 'tg-1',
      channel: 'push',
      geographicScope: 'state',
      volumeImpact: 100,
      randomizationType: 'percentage',
      randomizationValue: 100,
      isExclusive: true,
      groupingIdentifier: 'GRP-WKND24',
      status: 'active',
      content:
        'Não perca! 50% OFF em pizzas tamanho família neste fim de semana.',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ])

  const [rewardCatalog, setRewardCatalog] = useState<RewardCatalogItem[]>([
    {
      id: 'rc-1',
      companyId: 'c1',
      title: 'Desconto Padrão 10%',
      description: 'Válido para compras gerais',
      type: 'percentage',
      estimatedCost: 10,
    },
    {
      id: 'rc-2',
      companyId: 'c1',
      title: 'Bebida Grátis',
      description: 'Uma bebida a escolha',
      type: 'item',
      estimatedCost: 15,
    },
    {
      id: 'rc-3',
      companyId: 'c1',
      title: '10% OFF no próximo serviço',
      description: 'Retorno fidelidade',
      type: 'percentage',
      estimatedCost: 20,
    },
    {
      id: 'rc-4',
      companyId: 'c1',
      title: 'R$ 50 OFF Exclusivo',
      description: 'Desconto de alto valor',
      type: 'fixed_discount',
      estimatedCost: 50,
    },
  ])

  const [standardRules, setStandardRules] = useState<StandardRule[]>([
    {
      id: 'sr-1',
      companyId: 'c1',
      name: 'Geral (Varejo)',
      instructions:
        'Válido enquanto durarem os estoques. Não cumulativo com outras promoções. Indispensável a apresentação do voucher digital.',
      isLogicEnabled: true,
      triggerType: 'coupon_usage',
      threshold: 1,
      rewardId: 'rc-1',
      reward: 'Desconto Padrão 10%',
    },
    {
      id: 'sr-2',
      companyId: 'c1',
      name: 'Restaurante / Bar',
      instructions:
        'Válido para consumo no local. Não inclui taxa de serviço. Um voucher por mesa. Não cumulativo com outras promoções.',
      isLogicEnabled: true,
      triggerType: 'amount_spent',
      threshold: 100,
      rewardId: 'rc-2',
      reward: 'Bebida Grátis',
    },
    {
      id: 'sr-3',
      companyId: 'c1',
      name: 'Serviços / Agendamento',
      instructions:
        'Necessário agendamento prévio. Sujeito a disponibilidade de horário. Tolerância de 15 minutos de atraso.',
      isLogicEnabled: true,
      triggerType: 'visit',
      threshold: 3,
      rewardId: 'rc-3',
      reward: '10% OFF no próximo serviço',
    },
    {
      id: 'sr-4',
      companyId: 'c1',
      name: 'Instruções Apenas (Sem Lógica)',
      instructions:
        'Válido apenas para pedidos com retirada no balcão. Taxa de entrega não inclusa (se aplicável).',
      isLogicEnabled: false,
    },
  ])

  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user))
    } else {
      localStorage.removeItem('currentUser')
    }
  }, [user])

  useEffect(() => {
    const storedSaved = localStorage.getItem('savedCoupons')
    if (storedSaved) {
      try {
        setSavedIds(JSON.parse(storedSaved))
      } catch {
        // ignore
      }
    }
    const storedActiveItinerary = localStorage.getItem('activeItineraryId')
    if (storedActiveItinerary) setActiveItineraryId(storedActiveItinerary)

    setTimeout(() => {
      setUserLocation(MOCK_USER_LOCATION)
      setIsLoadingLocation(false)
    }, 1500)
  }, [])

  const logSystemAction = (
    action: string,
    details: string,
    status: 'success' | 'warning' | 'error' = 'success',
  ) => {
    const log: SystemLog = {
      id: Math.random().toString(),
      date: new Date().toISOString(),
      action,
      details,
      user: user?.id || 'unknown',
      status,
    }
    setSystemLogs((prev) => [log, ...prev])
  }

  const safeCoupons = Array.isArray(coupons) ? coupons : []
  const safeCompanies = Array.isArray(companies) ? companies : []

  const allAudienceCoupons = safeCoupons.filter((c) => {
    let audienceMatch = true
    if (c.targetAudience === 'preferred') {
      const company = safeCompanies.find((comp) => comp.id === c.companyId)
      const isMerchant =
        user?.role === 'super_admin' ||
        user?.role === 'shopkeeper' ||
        user?.companyId === c.companyId
      const isPreferred = Array.isArray(company?.preferredCustomers)
        ? company.preferredCustomers.includes(user?.id || '')
        : false
      audienceMatch = isMerchant || !!isPreferred
    }
    return audienceMatch
  })

  const filteredCoupons = allAudienceCoupons.filter((c) => {
    const regionMatch =
      selectedRegion === 'Global' ||
      !c.region ||
      c.region === selectedRegion ||
      c.region === ''
    return regionMatch
  })

  const setRegion = (regionCode: string) => {
    setSelectedRegion(regionCode)
    toast.info(`Região alterada para: ${regionCode}`)
  }

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const safePrev = Array.isArray(prev) ? prev : []
      const newSaved = safePrev.includes(id)
        ? safePrev.filter((sid) => sid !== id)
        : [...safePrev, id]
      localStorage.setItem('savedCoupons', JSON.stringify(newSaved))
      return newSaved
    })
  }

  const toggleTrip = (id: string) => {
    setTripIds((prev) => {
      const safePrev = Array.isArray(prev) ? prev : []
      return safePrev.includes(id)
        ? safePrev.filter((tid) => tid !== id)
        : [...safePrev, id]
    })
  }

  const reserveCoupon = (id: string) => {
    // In a real app this could be async with atomic lock, but keeping sync for UI compatibility
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    if (isUUID) {
      supabase
        .rpc('validate_promotion', { p_promo_id: id })
        .then(({ data }) => {
          if (data && !data.success) {
            toast.error(data.message || 'Aviso: Cupom pode estar esgotado.')
          }
        })
    }

    const safeCouponsData = Array.isArray(coupons) ? coupons : []
    const safeEventsData = Array.isArray(seasonalEvents) ? seasonalEvents : []

    const coupon = safeCouponsData.find((c) => c.id === id)
    const event = safeEventsData.find((e) => e.id === id)

    let available = 0
    if (coupon)
      available =
        coupon.totalAvailable !== undefined ? coupon.totalAvailable : 100
    if (event)
      available =
        event.totalAvailable !== undefined ? event.totalAvailable : 100

    if (available <= 0) {
      toast.error('Este voucher está esgotado.')
      return false
    }

    setReservedIds((prev) => [...(Array.isArray(prev) ? prev : []), id])

    if (coupon) {
      setCoupons((prev) =>
        (Array.isArray(prev) ? prev : []).map((c) =>
          c.id === id
            ? {
                ...c,
                totalAvailable: Math.max(0, (c.totalAvailable ?? 100) - 1),
                reservedCount: (c.reservedCount || 0) + 1,
              }
            : c,
        ),
      )
    } else if (event) {
      setSeasonalEvents((prev) =>
        (Array.isArray(prev) ? prev : []).map((e) =>
          e.id === id
            ? {
                ...e,
                totalAvailable: Math.max(0, (e.totalAvailable ?? 100) - 1),
              }
            : e,
        ),
      )
    }

    logSystemAction('Reserve Coupon', `Reserved coupon ${id}`)
    trackVisit(id)
    return true
  }

  const cancelReservation = (id: string) => {
    setReservedIds((prev) =>
      (Array.isArray(prev) ? prev : []).filter((rid) => rid !== id),
    )

    const safeCouponsData = Array.isArray(coupons) ? coupons : []
    const safeEventsData = Array.isArray(seasonalEvents) ? seasonalEvents : []

    const coupon = safeCouponsData.find((c) => c.id === id)
    const event = safeEventsData.find((e) => e.id === id)

    if (coupon) {
      setCoupons((prev) =>
        (Array.isArray(prev) ? prev : []).map((c) =>
          c.id === id
            ? {
                ...c,
                totalAvailable: (c.totalAvailable ?? 100) + 1,
                reservedCount: Math.max(0, (c.reservedCount || 1) - 1),
              }
            : c,
        ),
      )
    } else if (event) {
      setSeasonalEvents((prev) =>
        (Array.isArray(prev) ? prev : []).map((e) =>
          e.id === id
            ? { ...e, totalAvailable: (e.totalAvailable ?? 100) + 1 }
            : e,
        ),
      )
    }

    logSystemAction('Cancel Reservation', `Cancelled reservation for ${id}`)
    toast.success(
      'Reserva cancelada. O voucher voltou para a disponibilidade geral.',
    )
  }

  const addCoupon = (coupon: Coupon) =>
    setCoupons((prev) => [coupon, ...(Array.isArray(prev) ? prev : [])])
  const deleteCoupon = (id: string) => {
    setCoupons((prev) =>
      (Array.isArray(prev) ? prev : []).filter((c) => c.id !== id),
    )
    toast.success('Promoção excluída com sucesso')
  }

  const addReview = (
    id: string,
    review: Omit<Review, 'id' | 'date'> & { images?: string[] },
  ) => {
    /* ... */
  }
  const replyToReview = (couponId: string, reviewId: string, text: string) => {
    /* ... */
  }
  const trackVisit = (couponId: string) => {
    /* ... */
  }
  const trackShare = (type: 'route' | 'coupon', id: string) => {
    /* ... */
  }
  const updateBehavioralTriggers = (
    couponId: string,
    triggers: BehavioralTrigger[],
  ) => {
    /* ... */
  }
  const togglePreferredCustomer = (companyId: string, userId: string) => {
    /* ... */
  }
  const addUpload = (doc: any) => {
    /* ... */
  }
  const refreshCoupons = () => {
    loadCoupons(true)
    loadPromotions(true)
  }
  const voteCoupon = (id: string, type: any) => {
    /* ... */
  }
  const reportCoupon = (id: string, issue: string) => {
    /* ... */
  }
  const makeBooking = (booking: Omit<Booking, 'id' | 'status'>) => {
    /* ... */
  }
  const updateBooking = (id: string, data: Partial<Booking>) => {
    /* ... */
  }
  const cancelBooking = (id: string) => {
    /* ... */
  }
  const approveBooking = (id: string, price: number) => {
    /* ... */
  }
  const payBooking = async (id: string) => {
    const booking = bookings.find((b) => b.id === id)
    if (!booking) return

    try {
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          booking.couponId,
        )

      if (isUUID) {
        const { data, error } = await supabase.rpc('consume_promotion', {
          p_promo_id: booking.couponId,
          p_user_id: user?.id || null,
        })
        if (error) throw error
        if (data && !data.success) {
          throw new Error(
            data.message || 'Falha ao consumir cupom atomicamente.',
          )
        }
      }

      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: 'paid' } : b)),
      )
    } catch (e: any) {
      console.error('Payment/Consumption failed', e)
      throw e
    }
  }
  const earnPoints = (amount: number, title: string) => {
    /* ... */
  }
  const redeemPoints = (amount: number, type: any) => {
    return true
  }

  const addABTest = (test: ABTest) => setAbTests((prev) => [test, ...prev])
  const downloadOffline = (ids: string[]) => {
    /* ... */
  }
  const processPayment = async (d: any) => {
    return Promise.resolve(true)
  }
  const isDownloaded = (id: string) => downloadedIds.includes(id)
  const joinChallenge = (id: string) => {
    /* ... */
  }
  const completeMission = (id: string) => {
    /* ... */
  }

  const login = async (email: string, password?: string) => {
    const API_URL =
      import.meta.env.VITE_API_URL || 'https://routevoy.goskip.app/api'
    try {
      const res = await fetch(
        `${API_URL}/collections/users/auth-with-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identity: email, password }),
        },
      )

      if (!res.ok) {
        throw new Error('Usuário ou senha inválidos.')
      }

      const data = await res.json()
      let loggedUser = data.record as User
      if (email === 'adailtong@gmail.com') loggedUser.role = 'super_admin'
      setUser(loggedUser)
      if (loggedUser.region) setSelectedRegion(loggedUser.region)
      toast.success(`Bem-vindo, ${loggedUser.name}!`)
    } catch (e: any) {
      console.error('Login failed:', e)
      throw new Error(e.message || 'Erro ao realizar login.')
    }
  }

  const register = async (name: string, email: string, password?: string) => {
    const API_URL =
      import.meta.env.VITE_API_URL || 'https://routevoy.goskip.app/api'
    try {
      const res = await fetch(`${API_URL}/collections/users/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          passwordConfirm: password,
          role: email === 'adailtong@gmail.com' ? 'super_admin' : 'user',
        }),
      })

      if (!res.ok) {
        throw new Error(
          'Erro ao criar conta. Verifique os dados e tente novamente.',
        )
      }

      try {
        await fetch(`${API_URL}/collections/users/request-verification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
      } catch (err) {
        console.warn('Failed to send verification email', err)
      }

      await login(email, password)
      toast.success(
        'Conta criada com sucesso! Verifique seu e-mail para validar sua conta.',
      )
    } catch (e: any) {
      console.error('Register failed:', e)
      throw new Error(e.message || 'Erro ao realizar cadastro.')
    }
  }

  const logout = () => {
    setUser(null)
  }

  const approveCompany = (id: string) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'active' } : c)),
    )
  }
  const rejectCompany = (id: string) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'rejected' } : c)),
    )
  }

  const createAd = (ad: Advertisement) => setAds((prev) => [ad, ...prev])
  const updateAd = (id: string, data: Partial<Advertisement>) => {
    setAds((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)))
  }
  const deleteAd = (id: string) => {
    setAds((prev) => prev.filter((a) => a.id !== id))
  }
  const updateCampaign = (id: string, data: Partial<Coupon>) => {
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)))
  }
  const connectFetch = () => {}
  const importFetchPoints = (a: number) => {}
  const claimBirthdayGift = () => {}

  const updateUserProfile = (data: Partial<User>) => {
    if (!user) return
    const updatedUser = { ...user, ...data }
    setUser(updatedUser)
  }
  const updateUserPreferences = (prefs: Partial<UserPreferences>) => {
    if (!user) return
    const updatedUser = {
      ...user,
      preferences: { ...user.preferences, ...prefs },
    }
    setUser(updatedUser)
  }
  const upgradeSubscription = (tier: SubscriptionTier) => {
    if (!user) return
    setUser({ ...user, subscriptionTier: tier })
  }

  const connectApp = (id: string) => {}
  const saveItinerary = (it: Itinerary) => {}
  const updateItinerary = (itinerary: Itinerary) => {}
  const deleteItinerary = (id: string) => {}
  const publishItinerary = (id: string) => {}
  const moderateItinerary = (id: string, status: 'approved' | 'rejected') => {}
  const toggleLoyaltySystem = (companyId: string, enabled: boolean) => {}
  const [validationAttempts, setValidationAttempts] = useState<{
    count: number
    timestamp: number
  }>({ count: 0, timestamp: Date.now() })

  const validateCoupon = async (code: string, customerEmail?: string) => {
    if (!code) return { success: false, message: 'Código inválido' }

    const now = Date.now()
    if (now - validationAttempts.timestamp > 60000) {
      setValidationAttempts({ count: 1, timestamp: now })
    } else {
      if (validationAttempts.count >= 10) {
        logSystemAction(
          'Security Block',
          `Bloqueio de brute force ativado para validação de cupons. IP/Sessão suspensa temporariamente.`,
          'error',
        )
        return {
          success: false,
          message:
            'Muitas tentativas detectadas. Bloqueio temporário ativado por segurança (Rate Limiting).',
        }
      }
      setValidationAttempts((prev) => ({ ...prev, count: prev.count + 1 }))
    }

    try {
      const { data, error } = await supabase.rpc('validate_promotion_by_code', {
        p_code: code,
      })
      if (error) {
        return {
          success: false,
          message: error.message || 'Erro de validação.',
        }
      }
      return { success: data.success, message: data.message }
    } catch (e) {
      return {
        success: false,
        message: 'Erro ao conectar ao motor de validação.',
      }
    }
  }
  const addCarRental = (car: CarRental) => {}

  const isSaved = (id: string) => savedIds.includes(id)
  const isReserved = (id: string) => reservedIds.includes(id)
  const isInTrip = (id: string) => tripIds.includes(id)

  const addCrawlerSource = (source: CrawlerSource) => {}
  const updateCrawlerSource = (id: string, data: Partial<CrawlerSource>) => {}
  const deleteCrawlerSource = (id: string) => {}

  const importPromotion = (id: string, customCategory?: string) => {
    setDiscoveredPromotions((prev) =>
      (Array.isArray(prev) ? prev : []).map((p) =>
        p.id === id
          ? { ...p, status: 'imported', category: customCategory || p.category }
          : p,
      ),
    )

    const safeDiscovered = Array.isArray(discoveredPromotions)
      ? discoveredPromotions
      : []
    const promo = safeDiscovered.find((p) => p.id === id)
    if (promo) {
      const newCoupon: Coupon = {
        id: Math.random().toString(),
        storeName: promo.storeName,
        title: promo.title,
        description: promo.description,
        discount: promo.discount,
        category: customCategory || promo.category,
        distance: 0,
        expiryDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        image: promo.image,
        code: `ORG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        coordinates: { lat: 0, lng: 0 },
        status: 'active',
        source: 'organic',
        capturedAt: promo.capturedAt || new Date().toISOString(),
        region: promo.region,
        price: promo.price,
        currency: promo.currency,
        franchiseId: promo.franchiseId,
        targetAudience: 'all',
        externalUrl: promo.originalUrl,
        instructions: 'Válido por 30 dias ou enquanto durar o estoque',
      }
      addCoupon(newCoupon)
    }
  }

  const ignorePromotion = (id: string) => {
    setDiscoveredPromotions((prev) =>
      (Array.isArray(prev) ? prev : []).map((p) =>
        p.id === id ? { ...p, status: 'ignored' } : p,
      ),
    )
  }

  const triggerScan = async (sourceId: string, limit: number = 50) => {
    const API_URL =
      import.meta.env.VITE_API_URL || 'https://routevoy.goskip.app/api'
    try {
      const res = await fetch(`${API_URL}/crawler/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId, limit }),
      })
      if (res.ok) {
        const data = await res.json()
        const items = Array.isArray(data?.items) ? data.items : []
        setDiscoveredPromotions((prev) => [
          ...items,
          ...(Array.isArray(prev) ? prev : []),
        ])
        logSystemAction('Crawler Scan', `Scan completed for source ${sourceId}`)
        toast.success('Varredura concluída com sucesso')
      }
    } catch (e) {
      console.error('Error triggering scan', e)
      toast.error('Erro ao acionar crawler')
    }
  }

  const addAdPricing = (pricing: AdPricing) => {}
  const addAdvertiser = (advertiser: Advertiser) => {}
  const createAdCampaign = (ad: Advertisement, invoice: AdInvoice) => {}
  const updateInvoiceStatus = (id: string, status: AdInvoice['status']) => {}
  const updatePlatformSettings = (settings: Partial<PlatformSettings>) => {
    setPlatformSettings((prev) => ({ ...prev, ...settings }))
  }
  const updatePartnerPolicy = (policy: PartnerPolicy) => {}
  const deletePartnerPolicy = (id: string) => {}

  const generatePartnerInvoice = (data: Partial<PartnerInvoice>) => {
    const newInvoice: PartnerInvoice = {
      id: Math.random().toString(),
      referenceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      companyId: data.companyId || '',
      franchiseId: data.franchiseId || '',
      targetType: data.targetType || 'merchant',
      periodStart: data.periodStart || new Date().toISOString(),
      periodEnd: data.periodEnd || new Date().toISOString(),
      totalSales: data.totalSales || 0,
      totalCommission: data.totalCommission || 0,
      totalCashback: data.totalCashback || 0,
      status: data.status || 'draft',
      dueDate:
        data.dueDate || new Date(Date.now() + 15 * 86400000).toISOString(),
      issueDate: data.issueDate || new Date().toISOString(),
      transactionCount: data.transactionCount || 1,
      items: data.items || [],
      collectorId: data.collectorId,
      description: data.description,
      paymentInstructions: data.paymentInstructions,
    }
    setPartnerInvoices((prev) => [newInvoice, ...prev])
    toast.success('Fatura gerada com sucesso e adicionada à área de staging.')
  }

  const updatePartnerInvoiceStatus = (
    id: string,
    status: PartnerInvoice['status'],
  ) => {
    setPartnerInvoices((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status } : i)),
    )
  }

  const updatePartnerInvoice = (id: string, data: Partial<PartnerInvoice>) => {
    setPartnerInvoices((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...data } : i)),
    )
  }

  const reconcilePartnerInvoice = (refNumber: string) => {
    return true
  }
  const addSeasonalEvent = (event: SeasonalEvent) => {}
  const updateSeasonalEvent = (id: string, event: Partial<SeasonalEvent>) => {}
  const deleteSeasonalEvent = (id: string) => {}
  const trackSeasonalClick = (id: string) => {}
  const approveSeasonalCampaign = (id: string) => {}
  const rejectSeasonalCampaign = (id: string) => {}
  const renewSeasonalCampaign = (id: string) => {}

  const addUser = (newUser: User) => {
    setUsers((prev) => [newUser, ...prev])
  }
  const updateUser = (id: string, data: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)))
  }
  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }
  const addCompany = (company: Company) => {
    setCompanies((prev) => [company, ...prev])
  }
  const updateCompany = (id: string, data: Partial<Company>) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c)),
    )
  }
  const deleteCompany = (id: string) => {
    setCompanies((prev) => prev.filter((c) => c.id !== id))
  }
  const addFranchise = (franchise: Franchise) => {
    setFranchises((prev) => [franchise, ...prev])
  }
  const updateFranchise = (id: string, data: Partial<Franchise>) => {
    setFranchises((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...data } : f)),
    )
  }
  const deleteFranchise = (id: string) => {
    setFranchises((prev) => prev.filter((f) => f.id !== id))
  }

  // Target Groups & Comms
  const addTargetGroup = (group: TargetGroup) => {
    setTargetGroups((prev) => [group, ...prev])
  }

  const updateTargetGroup = (id: string, data: Partial<TargetGroup>) => {
    setTargetGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...data } : g)),
    )
    toast.success('Grupo de Segmentação atualizado')
  }

  const deleteTargetGroup = (id: string) => {
    setTargetGroups((prev) => prev.filter((g) => g.id !== id))
    toast.success('Grupo de Segmentação removido')
  }

  const createCommunicationCampaign = (campaign: CommunicationCampaign) => {
    setCommunicationCampaigns((prev) => [campaign, ...prev])
  }

  const updateCommunicationCampaign = (
    id: string,
    data: Partial<CommunicationCampaign>,
  ) => {
    setCommunicationCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c)),
    )
  }

  const deleteCommunicationCampaign = (id: string) => {
    setCommunicationCampaigns((prev) => prev.filter((c) => c.id !== id))
  }

  const addStandardRule = (rule: StandardRule) => {
    setStandardRules((prev) => [rule, ...prev])
    toast.success('Regra de Campanha criada com sucesso!')
  }

  const updateStandardRule = (id: string, data: Partial<StandardRule>) => {
    setStandardRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...data } : r)),
    )
    toast.success('Regra de Campanha atualizada com sucesso!')
  }

  const deleteStandardRule = (id: string) => {
    setStandardRules((prev) => prev.filter((r) => r.id !== id))
    toast.success('Regra de Campanha excluída com sucesso!')
  }

  const addRewardCatalogItem = (item: RewardCatalogItem) => {
    setRewardCatalog((prev) => [item, ...prev])
    toast.success('Recompensa adicionada ao catálogo!')
  }

  const updateRewardCatalogItem = (
    id: string,
    data: Partial<RewardCatalogItem>,
  ) => {
    setRewardCatalog((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...data } : r)),
    )
    toast.success('Recompensa atualizada!')
  }

  const deleteRewardCatalogItem = (id: string) => {
    setRewardCatalog((prev) => prev.filter((r) => r.id !== id))
    toast.success('Recompensa removida do catálogo!')
  }

  const searchWeb = async (query: string): Promise<Coupon[]> => {
    if (!query) return []
    try {
      const results = await fetchWebSearchPromotions(query)
      const safeResults = Array.isArray(results) ? results : []
      return safeResults.map((p) => ({
        id: p.id,
        storeName: p.storeName,
        title: p.title,
        description: p.description || '',
        discount: p.discount || '',
        category: p.category || 'Outros',
        distance: 0,
        expiryDate:
          p.expiryDate || new Date(Date.now() + 30 * 86400000).toISOString(),
        image: p.image || '',
        code: `WEB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        coordinates: { lat: 0, lng: 0 },
        status: 'active',
        source: 'organic',
        region: 'Global',
        targetAudience: 'all',
        externalUrl: p.originalUrl,
        instructions: 'Oferta orgânica encontrada na web.',
      }))
    } catch (e) {
      console.error('Search web failed', e)
      return []
    }
  }

  return React.createElement(
    CouponContext.Provider,
    {
      value: {
        allCoupons: allAudienceCoupons,
        coupons: filteredCoupons,
        companies,
        ads,
        users,
        user,
        savedIds,
        reservedIds,
        tripIds,
        userLocation,
        uploads,
        bookings,
        points,
        rewardHistory,
        fetchCredits,
        challenges,
        missions,
        badges,
        abTests,
        downloadedIds,
        itineraries,
        activeItineraryId,
        setActiveItineraryId,
        rewards,
        isFetchConnected,
        birthdayGiftAvailable,
        transactions,
        connectedApps,
        isDownloading,
        downloadProgress,
        franchises,
        travelOffers,
        selectedRegion,
        regions: REGIONS,
        validationLogs,
        carRentals,
        systemLogs,
        crawlerSources,
        discoveredPromotions,
        dbPromotions,
        adPricing,
        advertisers,
        adInvoices,
        platformSettings,
        partnerPolicies,
        partnerInvoices,
        seasonalEvents,
        usedVouchers,
        targetGroups,
        communicationCampaigns,
        standardRules,
        rewardCatalog,
        setRegion,
        toggleSave,
        toggleTrip,
        reserveCoupon,
        cancelReservation,
        addCoupon,
        deleteCoupon,
        isSaved,
        isReserved,
        isInTrip,
        isLoadingLocation,
        isLoadingCoupons,
        hasErrorLoading,
        addReview,
        replyToReview,
        addUpload,
        refreshCoupons,
        voteCoupon,
        reportCoupon,
        makeBooking,
        updateBooking,
        cancelBooking,
        approveBooking,
        payBooking,
        redeemPoints,
        earnPoints,
        addABTest,
        downloadOffline,
        processPayment,
        isDownloaded,
        joinChallenge,
        completeMission,
        login,
        logout,
        approveCompany,
        rejectCompany,
        createAd,
        updateAd,
        deleteAd,
        updateCampaign,
        connectFetch,
        importFetchPoints,
        claimBirthdayGift,
        updateUserProfile,
        updateUserPreferences,
        upgradeSubscription,
        connectApp,
        saveItinerary,
        updateItinerary,
        deleteItinerary,
        publishItinerary,
        moderateItinerary,
        toggleLoyaltySystem,
        addFranchise,
        validateCoupon,
        addCarRental,
        trackVisit,
        trackShare,
        updateBehavioralTriggers,
        togglePreferredCustomer,
        addCrawlerSource,
        updateCrawlerSource,
        deleteCrawlerSource,
        importPromotion,
        ignorePromotion,
        triggerScan,
        addAdPricing,
        addAdvertiser,
        createAdCampaign,
        updateInvoiceStatus,
        updatePlatformSettings,
        updatePartnerPolicy,
        deletePartnerPolicy,
        generatePartnerInvoice,
        updatePartnerInvoiceStatus,
        updatePartnerInvoice,
        reconcilePartnerInvoice,
        addSeasonalEvent,
        updateSeasonalEvent,
        deleteSeasonalEvent,
        trackSeasonalClick,
        approveSeasonalCampaign,
        rejectSeasonalCampaign,
        renewSeasonalCampaign,
        addUser,
        updateUser,
        deleteUser,
        addCompany,
        updateCompany,
        deleteCompany,
        updateFranchise,
        deleteFranchise,
        addTargetGroup,
        updateTargetGroup,
        deleteTargetGroup,
        createCommunicationCampaign,
        updateCommunicationCampaign,
        deleteCommunicationCampaign,
        addStandardRule,
        updateStandardRule,
        deleteStandardRule,
        addRewardCatalogItem,
        updateRewardCatalogItem,
        deleteRewardCatalogItem,
        searchWeb,
      },
    },
    children,
  )
}

export function useCouponStore() {
  const context = useContext(CouponContext)
  if (context === undefined)
    throw new Error('useCouponStore must be used within a CouponProvider')
  return context
}
