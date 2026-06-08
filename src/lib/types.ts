export interface AffiliateConfig {
  paramName: string
  partnerId?: string
  discountParamName?: string
}

export interface MenuItem {
  name: string
  description: string
  price: number
  translations?: {
    [key: string]: {
      name: string
      description: string
    }
  }
}

export interface ReviewReply {
  id: string
  userId: string
  userName: string
  text: string
  date: string
  role: 'vendor' | 'admin'
}

export interface Review {
  id: string
  userId: string
  userName: string
  rating: number
  comment: string
  date: string
  status?: 'pending' | 'approved' | 'rejected'
  images?: string[]
  replies?: ReviewReply[]
}

export type Mood =
  | 'Romantic'
  | 'Economic'
  | 'Quick Bite'
  | 'Adventure'
  | 'Relaxing'
  | 'Family'

export interface LoyaltyProgram {
  totalStamps: number
  currentStamps: number
  reward: string
}

export interface RewardCatalogItem {
  id: string
  companyId: string
  title: string
  description?: string
  type: 'fixed_discount' | 'percentage' | 'item'
  estimatedCost: number
}

export interface BehavioralTrigger {
  id: string
  type:
    | 'share'
    | 'coupon_usage'
    | 'visualization'
    | 'link_click'
    | 'visit'
    | 'amount_spent'
    | 'specific_action'
  threshold: number
  reward: string
  rewardId?: string
  isActive: boolean
}

export interface StandardRule {
  id: string
  companyId: string
  name: string
  instructions?: string
  isLogicEnabled?: boolean
  triggerType?:
    | 'share'
    | 'coupon_usage'
    | 'visualization'
    | 'link_click'
    | 'visit'
    | 'amount_spent'
    | 'specific_action'
  threshold?: number
  reward?: string
  rewardId?: string
}

export interface Coupon {
  id: string
  storeName: string
  companyId?: string
  franchiseId?: string
  title: string
  description: string
  discount: string
  category: string
  distance: number
  expiryDate: string
  startDate?: string
  endDate?: string
  image: string
  logo?: string
  code: string
  isFeatured?: boolean
  isTrending?: boolean
  isSpecial?: boolean
  isSeasonal?: boolean
  terms?: string
  address?: string
  instructions?: string
  translations?: Record<
    string,
    { title?: string; description?: string; instructions?: string }
  >
  coordinates: {
    lat: number
    lng: number
  }
  totalAvailable?: number
  totalLimit?: number
  isUnlimited?: boolean
  maxPerUser?: number
  reservedCount?: number
  menu?: MenuItem[]
  reviews?: Review[]
  averageRating?: number
  moods?: Mood[]
  loyaltyProgram?: LoyaltyProgram
  lastVerified?: string
  upvotes?: number
  downvotes?: number
  status?: 'active' | 'expired' | 'issue' | 'used' | 'paused'
  acceptsBooking?: boolean
  price?: number
  currency?: string
  isPaid?: boolean
  source?: 'partner' | 'aggregated' | 'organic'
  capturedAt?: string
  region?: string
  country?: string
  state?: string
  city?: string
  behavioralTriggers?: BehavioralTrigger[]
  visitCount?: number
  targetAudience?: 'all' | 'preferred'
  offerType?: 'in-store' | 'online'
  externalUrl?: string
  affiliateConfig?: AffiliateConfig
  enableProximityAlerts?: boolean
  alertRadius?: number
  proximityAlertsSent?: number
  redeemedViaAlert?: number
  businessType?: string
}

export type CategoryType = Coupon['category']

export interface UserLocation {
  lat: number
  lng: number
  address?: string
}

export interface SeasonalEvent {
  id: string
  title: string
  startDate: string
  endDate: string
  description: string
  instructions?: string
  translations?: Record<
    string,
    { title?: string; description?: string; instructions?: string }
  >
  type: 'sale' | 'holiday' | 'event'
  coordinates?: {
    lat: number
    lng: number
  }
  image?: string
  images?: string[]
  region?: string
  companyId?: string
  franchiseId?: string
  billingAmount?: number
  price?: number
  status:
    | 'draft'
    | 'pending'
    | 'active'
    | 'rejected'
    | 'scheduled'
    | 'archived'
    | 'expired'
  clickCount?: number
  vouchers?: string[]
  offerType?: 'in-store' | 'online'
  externalUrl?: string
  affiliateConfig?: AffiliateConfig
  totalAvailable?: number
  targetAudience?: 'all' | 'preferred'
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'deal' | 'alert' | 'system' | 'event' | 'gift' | 'mission' | 'chat'
  read: boolean
  date: string
  link?: string
  priority?: 'high' | 'medium' | 'low'
  category?: 'smart' | 'system' | 'gamification' | 'communication'
}

export interface UploadedDocument {
  id: string
  date: string
  status: 'Pending' | 'Verified' | 'Rejected'
  type: 'Receipt' | 'Coupon'
  storeName: string
  image: string
}

export interface Booking {
  id: string
  couponId: string
  companyId?: string
  franchiseId?: string
  storeName: string
  date: string
  endDate?: string
  time: string
  guests: number
  adults?: number
  childrenCount?: number
  childAges?: number[]
  status:
    | 'confirmed'
    | 'cancelled'
    | 'paid'
    | 'pending'
    | 'awaiting_payment'
    | 'refund_processing'
  price?: number
  userId?: string
  userName?: string
  source?: 'partner' | 'organic'
  requiresPrivacy?: boolean
  type?: 'general' | 'hotel' | 'car' | 'ticket' | 'activity'
  driverName?: string
  driverContact?: string
  includesToll?: boolean
  carCategory?: string
}

export interface Challenge {
  id: string
  title: string
  description: string
  total: number
  current: number
  reward: string
  icon: string
  completed: boolean
  status: 'active' | 'completed' | 'available'
  type?: 'travel' | 'social' | 'collection'
}

export interface Mission {
  id: string
  title: string
  description: string
  rewardPoints: number
  type: 'survey' | 'action'
  completed: boolean
  expiresAt?: string
}

export interface Badge {
  id: string
  name: string
  description: string
  image: string
  earnedDate?: string
}

export interface RewardActivity {
  id: string
  title: string
  points: number
  date: string
  type: 'earned' | 'redeemed' | 'imported'
}

export interface ABVariant {
  id: string
  name: string
  title: string
  discount: string
  image: string
  views: number
  clicks: number
  redemptions: number
}

export interface ABTest {
  id: string
  couponId: string
  startDate: string
  endDate: string
  status: 'active' | 'completed' | 'draft'
  variantA: ABVariant
}

export interface DayPlan {
  id: string
  dayNumber: number
  stops: Coupon[]
  date?: string
}

export interface Itinerary {
  id: string
  title: string
  description: string
  stops: Coupon[]
  days?: DayPlan[]
  totalSavings: number
  duration: string
  image: string
  tags: string[]
  matchScore: number
  isTemplate?: boolean
  region?: string
  agencyId?: string
  isPublic?: boolean
  status?: 'draft' | 'pending' | 'approved' | 'rejected'
  authorId?: string
  authorName?: string
  type?: 'shopping' | 'travel'
}

export type UserRole =
  | 'super_admin'
  | 'franchisee'
  | 'shopkeeper'
  | 'agency'
  | 'user'
  | 'staff'

export type SubscriptionTier = 'free' | 'premium' | 'vip'

export interface UserPreferences {
  notifications?: boolean
  newsletter?: boolean
  locationTracking?: boolean
  categories?: string[]
  quietHoursStart?: string
  quietHoursEnd?: string
  emailAlerts?: boolean
  pushAlerts?: boolean
  dashboardWidgets?: string[]
  travelMode?: boolean
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  subscriptionTier?: SubscriptionTier
  avatar?: string
  birthday?: string
  documentNumber?: string
  region?: string
  companyId?: string
  agencyId?: string
  franchiseId?: string
  country?: string
  state?: string
  city?: string
  zipCode?: string
  phone?: string
  companyName?: string
  businessEmail?: string
  businessPhone?: string
  preferences?: UserPreferences
  partnerId?: string
  gender?: 'male' | 'female' | 'non-binary' | 'other' | 'prefer-not-to-say'
  staffRole?: string
  status?: 'active' | 'inactive' | 'invited'
}

export interface CompanyDocument {
  id: string
  name: string
  label: string
  url: string
  type: string
  uploadDate: string
}

export interface Company {
  id: string
  name: string
  legalName?: string
  category?: string
  businessType?: string
  status: 'active' | 'pending' | 'rejected' | 'inactive'
  internalRef?: string
  email: string
  registrationDate: string
  region: string
  enableLoyalty: boolean
  ownerId?: string
  preferredCustomers?: string[]
  franchiseId?: string
  taxId?: string
  contactPerson?: string
  contactEmail?: string
  contactPhone?: string
  contactDepartment?: string
  businessPhone?: string
  whatsapp?: string
  website?: string
  secondaryContactName?: string
  secondaryContactEmail?: string
  secondaryContactPhone?: string
  secondaryContactDepartment?: string
  billingEmail?: string
  addressStreet?: string
  addressNumber?: string
  addressComplement?: string
  addressNeighborhood?: string
  addressCity?: string
  addressState?: string
  addressZip?: string
  addressCountry?: string
  addressLat?: number
  addressLng?: number
  paymentMethod?: string
  billingFrequency?: string
  bankName?: string
  bankAgency?: string
  bankAccount?: string
  contractTerms?: string
  stateRegistration?: string
  credentialsSent?: boolean
  documents?: CompanyDocument[]
  webhookUrl?: string
  defaultTriggerType?: 'visit' | 'share' | 'amount_spent' | 'specific_action'
  defaultTriggerGoal?: number
  defaultTriggerReward?: string
}

export type AdBillingType = 'fixed' | 'cpc' | 'cpa'

export type AdPlacement =
  | 'home_hero'
  | 'sidebar'
  | 'feed'
  | 'footer'
  | 'content'
  | 'top'
  | 'bottom'
  | 'search'
  | 'offer_of_the_day'
  | 'top_ranking'
  | 'sponsored_push'

export interface Advertisement {
  id: string
  title: string
  companyId: string
  region: string
  country?: string
  state?: string
  city?: string
  category: string
  billingType: AdBillingType
  placement: AdPlacement
  status: 'active' | 'paused' | 'ended' | 'pending'
  budget?: number
  costPerClick?: number
  views: number
  clicks: number
  startDate: string
  endDate: string
  image: string
  link: string
  price?: number
  currency?: string
  advertiserId?: string
  durationDays?: number
  franchiseId?: string
  description?: string
  priorityScore?: number
}

export interface AdPricing {
  id: string
  placement: string
  billingType: AdBillingType
  durationDays?: number
  price: number
}

export interface Advertiser {
  id: string
  companyName: string
  taxId: string
  email: string
  phone: string
  address: {
    street: string
    number: string
    city: string
    state: string
    zip: string
  }
}

export interface AdInvoice {
  id: string
  referenceNumber: string
  adId: string
  advertiserId: string
  amount: number
  issueDate: string
  dueDate: string
  sentAt?: string
  status:
    | 'draft'
    | 'pending'
    | 'invoiced'
    | 'sent'
    | 'paid'
    | 'overdue'
    | 'canceled'
}

export interface RewardItem {
  id: string
  title: string
  description: string
  cost: number
  image: string
  category: 'coupon' | 'product' | 'experience'
  available: boolean
}

export interface PaymentTransaction {
  id: string
  date: string
  amount: number
  storeName: string
  couponTitle: string
  method: 'card' | 'fetch' | 'points' | 'wallet'
  status: 'completed' | 'pending' | 'failed'
  customerName?: string
  pointsAwarded?: number
  installments?: number
  couponId?: string
  companyId?: string
  franchiseId?: string
}

export interface ConnectedApp {
  id: string
  name: string
  connected: boolean
  points?: number
  lastSync?: string
  icon: string
  color: string
}

export interface Franchise {
  id: string
  name: string
  legalName?: string
  category?: string
  status: 'active' | 'inactive' | 'pending' | 'rejected'
  internalRef?: string
  region: string
  ownerId: string
  licenseExpiry: string
  taxId?: string
  contactPerson?: string
  contactEmail?: string
  contactPhone?: string
  contactDepartment?: string
  businessPhone?: string
  whatsapp?: string
  website?: string
  secondaryContactName?: string
  secondaryContactEmail?: string
  secondaryContactPhone?: string
  secondaryContactDepartment?: string
  billingEmail?: string
  addressStreet?: string
  addressNumber?: string
  addressComplement?: string
  addressNeighborhood?: string
  addressCity?: string
  addressState?: string
  addressZip?: string
  addressCountry?: string
  addressLat?: number
  addressLng?: number
  paymentMethod?: string
  billingFrequency?: string
  address?: string
  bankName?: string
  bankAgency?: string
  bankAccount?: string
  contractTerms?: string
  stateRegistration?: string
  credentialsSent?: boolean
  documents?: CompanyDocument[]
  coverageScope?: 'national' | 'state' | 'city'
  coverageStates?: string[]
  coverageCities?: string[]
}

export type TravelOfferType =
  | 'flight'
  | 'hotel'
  | 'package'
  | 'car_rental'
  | 'insurance'
  | 'activity'

export interface TravelOffer {
  id: string
  type: TravelOfferType
  provider: string
  title: string
  description: string
  price: number
  currency: string
  image: string
  destination: string
  rating?: number
  link: string
  region?: string
  country?: string
  state?: string
  city?: string
  agencyId?: string
  availability?: number
  hasSeparatedRooms?: boolean
  source?: 'partner' | 'organic'
  translations?: Record<
    string,
    { title?: string; description?: string; destination?: string }
  >
  roomTypeKey?: string
  isSponsored?: boolean
}

export interface Region {
  id: string
  name: string
  country: string
  code: string
}

export interface PaymentMethod {
  id: string
  type: 'card' | 'wallet'
  last4?: string
  brand?: string
  expiry?: string
  email?: string
  isDefault: boolean
}

export interface ValidationLog {
  id: string
  couponId: string
  couponTitle: string
  customerName: string
  validatedAt: string
  method: 'qr' | 'manual'
  shopkeeperId: string
  companyId?: string
  franchiseId?: string
  userId?: string
  commissionAmount?: number
  cashbackAmount?: number
}

export interface CarRental {
  id: string
  model: string
  brand: string
  year: number
  plate: string
  category: 'Economy' | 'SUV' | 'Luxury' | 'Convertible'
  pricePerDay: number
  status: 'available' | 'rented' | 'maintenance'
  location: string
  image: string
  agencyId: string
}

export interface SystemLog {
  id: string
  date: string
  action: string
  details: string
  user: string
  status: 'success' | 'warning' | 'error'
}

export interface ClientHistory {
  id: string
  clientName: string
  action: string
  date: string
  amount: number
  status: 'completed' | 'pending'
}

export interface Message {
  id: string
  senderId: string
  text: string
  timestamp: string
  isRead: boolean
}

export interface ChatThread {
  id: string
  participants: { id: string; name: string; avatar: string; role: UserRole }[]
  messages: Message[]
  lastMessage: string
  lastUpdated: string
  unreadCount: number
}

export interface CrawlerHistory {
  id: string
  date: string
  storeName: string
  status: 'success' | 'warning' | 'error' | 'scanning'
  itemsFound: number
  itemsImported: number
  sourceId: string
  errorMessage?: string
  errorDetails?: string[]
  category?: string
}

export interface CrawlerSource {
  id: string
  name: string
  url: string
  type: 'api' | 'web' | 'app'
  region: string
  country?: string
  state?: string
  city?: string
  scanRadius: number
  category?: string
  lastScan?: string
  status: 'active' | 'paused'
  lastStatus?: 'success' | 'warning' | 'error' | 'scanning'
  lastErrorMessage?: string
}

export interface DiscoveredPromotion {
  id: string
  sourceId: string
  originalUrl?: string
  productLink?: string
  title: string
  discount: string
  discountPercentage?: number
  description: string
  price?: number
  currentPrice?: number
  originalPrice?: number
  currency?: string
  expiryDate: string
  image: string
  imageUrl?: string
  storeName: string
  status: 'pending' | 'imported' | 'ignored'
  region: string
  country?: string
  state?: string
  city?: string
  category: string
  capturedAt?: string
  rawData?: Record<string, any>
  franchiseId?: string
  matchConfidence?: number
  matchReason?: string
  isFeatured?: boolean
}

export interface InterestCategory {
  id: string
  label: string
  icon?: string
}

export interface PlatformSettings {
  commissionRate: number
  cashbackSplitUser: number
  cashbackSplitPlatform: number
  franchiseRoyaltyRate: number
  mainCategories?: string[]
  availableInterests?: InterestCategory[]
  categories?: {
    id: string
    label: string
    translationKey: string
    icon: string
    description?: string
    status?: 'active' | 'inactive' | string
    createdAt?: string
  }[]
  travelMargins: {
    hotels: number
    flights: number
    cars: number
    insurance: number
  }
  subscriptionPricing: {
    premium: number
    vip: number
  }
  withdrawal: {
    minAmount: number
    instantFee: number
  }
  referral: {
    fixedReward: number
    friendCashbackPercentage: number
    durationDays: number
  }
  globalProximityAlertsEnabled?: boolean
}

export interface PartnerPolicy {
  id: string
  companyId: string
  billingModel: 'CPA' | 'CPC' | 'monthly' | 'global'
  commissionRate: number
  cashbackRate: number
  cpcValue: number
  fixedFee: number
  billingCycle: string
  taxId: string
  contractTerms: string
}

export interface PartnerInvoice {
  id: string
  referenceNumber: string
  companyId: string
  franchiseId?: string
  targetType?: 'franchise' | 'merchant' | 'company'
  periodStart: string
  periodEnd: string
  totalSales: number
  totalCommission: number
  totalCashback: number
  status:
    | 'draft'
    | 'pending'
    | 'invoiced'
    | 'sent'
    | 'paid'
    | 'overdue'
    | 'canceled'
  dueDate: string
  issueDate: string
  transactionCount: number
  items?: any[]
  collectorId?: string
  description?: string
  paymentInstructions?: string
  billerName?: string
  billerTaxId?: string
  billerStateReg?: string
  billerEmail?: string
  billerAddress?: string
  billerContact?: string
  billerPhone?: string
  customerName?: string
  customerTaxId?: string
  customerStateReg?: string
  customerEmail?: string
  customerAddress?: string
  customerContact?: string
  customerPhone?: string
}

export interface WebhookLog {
  id: string
  companyId: string
  endpoint: string
  event: string
  payload: any
  status: number
  timestamp: string
}

export interface FinancialTransaction {
  id: string
  franchiseId?: string
  type: 'receipt' | 'payment' | 'royalty_payment'
  amount: number
  date: string
  description: string
  status: 'completed' | 'pending'
  sourceId?: string
}

export interface TargetGroup {
  id: string
  name: string
  description: string
  franchiseId?: string
  companyId?: string
  filters: {
    categories?: string[]
    frequency?: 'high' | 'medium' | 'low' | 'all'
    location?: string
    minSpend?: number
    gender?: 'male' | 'female' | 'other' | 'all'
    minAge?: number
    maxAge?: number
    state?: string
    city?: string
  }
  createdAt: string
  leadCount?: number
}

export interface CommunicationCampaign {
  id: string
  name: string
  targetGroupId: string
  franchiseId?: string
  companyId?: string
  channel: 'email' | 'sms' | 'push' | 'whatsapp'
  geographicScope: 'local' | 'state' | 'national'
  volumeImpact: number
  randomizationType?: 'percentage' | 'absolute'
  randomizationValue?: number
  linkedOfferId?: string
  isExclusive?: boolean
  groupingIdentifier?: string
  status: 'draft' | 'scheduled' | 'sent' | 'active' | 'inactive'
  clicks?: number
  redemptions?: number
  content: string
  createdAt: string
  scheduledAt?: string
}
