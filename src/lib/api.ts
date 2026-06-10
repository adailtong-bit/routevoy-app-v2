import { supabase } from '@/lib/supabase/client'
import { Coupon, DiscoveredPromotion } from './types'

// Simple memory cache for API requests
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export const fetchCategories = async (): Promise<any[]> => {
  try {
    const { data, error } = await (supabase as any)
      .from('categories')
      .select('*')
      .order('label')
    if (error) {
      console.warn('Error fetching categories from DB:', error)
      return []
    }
    return data || []
  } catch (e) {
    console.error('Failed to fetch categories:', e)
    return []
  }
}

export interface FetchCouponsParams {
  query?: string
  category?: string
  page?: number
  limit?: number
  franchiseId?: string
  region?: string
  language?: string
  environment?: string
}

export interface FetchCouponsResponse {
  data: Coupon[]
  hasMore: boolean
  total: number
}

export const fetchCoupons = async (
  params: FetchCouponsParams = {},
): Promise<FetchCouponsResponse> => {
  const cacheKey = `coupons_${JSON.stringify(params)}`
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as FetchCouponsResponse
  }

  const { query = '', category = 'all', page = 1, limit = 20 } = params

  try {
    let supabaseQuery: any = supabase
      .from('coupons')
      .select('*', { count: 'exact' })
      .in('status', ['active', 'approved', 'published'])

    if (params.environment === 'all') {
      // Bypass environment filter for Admin panels
    } else {
      const isProd =
        window.location.hostname === 'routevoy.com' ||
        window.location.hostname === 'www.routevoy.com'
      supabaseQuery = supabaseQuery.eq(
        'environment',
        isProd ? 'production' : 'development',
      )
    }

    if (query) {
      supabaseQuery = supabaseQuery.ilike('title', `%${query}%`)
    }
    if (category && category !== 'all') {
      supabaseQuery = supabaseQuery.eq('category', category)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, count, error } = await supabaseQuery
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.warn(`Fetch coupons failed:`, error)
      return { data: [], hasMore: false, total: 0 }
    }

    const mappedData = (data || []).map((c: any) => ({
      ...c,
      imageUrl: c.image_url,
      storeName: c.store_name,
      originalPrice: c.original_price,
      startDate: c.start_date,
      endDate: c.end_date,
      locationName: c.location_name,
      usageCount: c.usage_count || 0,
      isVerified: c.is_verified || false,
      isFeatured: c.is_featured || false,
    }))

    const responseData = {
      data: mappedData as any,
      hasMore: count ? from + mappedData.length < count : false,
      total: count || 0,
    }
    cache.set(cacheKey, { data: responseData, timestamp: Date.now() })
    return responseData
  } catch (e) {
    console.error('Fetch coupons error:', e)
    return { data: [], hasMore: false, total: 0 }
  }
}

export interface FetchCrawlerPromotionsParams {
  page?: number
  limit?: number
  franchiseId?: string
  region?: string
  query?: string
  category?: string
  environment?: string
}

export interface FetchCrawlerPromotionsResponse {
  data: DiscoveredPromotion[]
  hasMore: boolean
  total: number
}

export const fetchWebSearchPromotions = async (
  query: string,
  limit: number = 50,
  options: {
    region?: string
    category?: string
    minDiscount?: number
    platform?: string
    page?: number
    url?: string
  } = {},
): Promise<DiscoveredPromotion[]> => {
  const cacheKey = `websearch_${query}_${limit}_${JSON.stringify(options)}`
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as DiscoveredPromotion[]
  }

  try {
    let functionName = 'search-affiliate-deals'
    let bodyPayload: any = { query, limit, ...options }

    if (options.url || options.platform) {
      functionName = 'run-apify'
      bodyPayload = { query, limit, url: options.url, engine: 'scraperapi' }
    }

    const { data, error } = await supabase.functions.invoke(functionName, {
      body: bodyPayload,
    })

    if (error) throw error

    const items = Array.isArray(data?.items) ? data.items : []
    const responseData = items.map((item: any) => ({
      ...item,
      id: item.id || crypto.randomUUID(),
      imageUrl: item.imageUrl || item.image_url || item.image,
      productLink: item.productLink || item.product_link || item.link,
      storeName: item.storeName || item.store_name,
      originalPrice: item.originalPrice || item.original_price || item.oldPrice,
      discountPercentage: item.discountPercentage || item.discount_percentage,
      usageCount:
        item.usage_count ||
        item.usageCount ||
        Math.floor(Math.random() * 50) + 1,
      isVerified: item.is_verified || item.isVerified || true,
    }))

    cache.set(cacheKey, { data: responseData, timestamp: Date.now() })
    return responseData
  } catch (e: any) {
    console.error(`Failed to fetch from organic search engine API:`, e)
    return []
  }
}

export const fetchCrawlerPromotions = async (
  params: FetchCrawlerPromotionsParams = {},
): Promise<FetchCrawlerPromotionsResponse> => {
  const cacheKey = `crawler_${JSON.stringify(params)}`
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as FetchCrawlerPromotionsResponse
  }

  const { page = 1, limit = 20, query, category } = params

  try {
    let supabaseQuery: any = supabase
      .from('discovered_promotions')
      .select('*', { count: 'exact' })
      .in('status', ['active', 'approved', 'published', 'pending'])

    if (params.environment === 'all') {
      // Bypass environment filter for Admin panels
    } else {
      const isProd =
        window.location.hostname === 'routevoy.com' ||
        window.location.hostname === 'www.routevoy.com'
      supabaseQuery = supabaseQuery.eq(
        'environment',
        isProd ? 'production' : 'development',
      )
    }

    if (query) {
      supabaseQuery = supabaseQuery.ilike('title', `%${query}%`)
    }
    if (category && category !== 'all') {
      supabaseQuery = supabaseQuery.eq('category', category)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, count, error } = await supabaseQuery
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.warn(`Fetch crawler promotions failed:`, error)
      return { data: [], hasMore: false, total: 0 }
    }

    const mappedData = (data || []).map((p: any) => ({
      ...p,
      imageUrl: p.image_url,
      productLink: p.product_link,
      sourceUrl: p.source_url,
      storeName: p.store_name,
      originalPrice: p.original_price,
      discountPercentage: p.discount_percentage,
      capturedAt: p.captured_at,
      campaignName: p.campaign_name,
      discountRules: p.discount_rules,
      startDate: p.start_date,
      endDate: p.end_date,
      limitType: p.limit_type,
      totalLimit: p.total_limit,
      enableProximityAlerts: p.enable_proximity_alerts,
      alertRadius: p.alert_radius,
      isSeasonal: p.is_seasonal,
      enableTrigger: p.enable_trigger,
      triggerType: p.trigger_type,
      triggerThreshold: p.trigger_threshold,
      rewardId: p.reward_id,
      companyId: p.company_id,
      uniqueHash: p.unique_hash,
      usageCount: p.usage_count || 0,
      isVerified: p.is_verified || false,
      isFeatured: p.is_featured || false,
      latitude: p.latitude,
      longitude: p.longitude,
      locationName: p.location_name,
    }))

    const responseData = {
      data: mappedData as any,
      hasMore: count ? from + mappedData.length < count : false,
      total: count || 0,
    }
    cache.set(cacheKey, { data: responseData, timestamp: Date.now() })
    return responseData
  } catch (e: any) {
    console.error('Fetch crawler promotions error:', e)
    return { data: [], hasMore: false, total: 0 }
  }
}

export const saveDiscoveredPromotion = async (
  data: Partial<DiscoveredPromotion>,
  retries = 3,
): Promise<any> => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const payload = {
        title: data.title,
        description: data.description,
        price: data.price,
        original_price: data.originalPrice,
        currency: data.currency || 'BRL',
        discount: data.discount,
        discount_percentage: data.discountPercentage,
        image_url: data.imageUrl,
        product_link: data.productLink,
        source_url: data.sourceUrl,
        store_name: data.storeName,
        category: data.category,
        country: data.country,
        status: data.status || 'pending',
        captured_at: data.capturedAt || new Date().toISOString(),
        campaign_name: data.campaignName,
        coverage: data.coverage,
        discount_rules: data.discountRules,
        start_date: data.startDate,
        end_date: data.endDate,
        limit_type: data.limitType,
        total_limit: data.totalLimit,
        enable_proximity_alerts: data.enableProximityAlerts,
        alert_radius: data.alertRadius,
        is_seasonal: data.isSeasonal,
        enable_trigger: data.enableTrigger,
        trigger_type: data.triggerType,
        trigger_threshold: data.triggerThreshold,
        reward_id: data.rewardId,
        company_id: data.companyId,
        unique_hash: data.uniqueHash,
        usage_count: data.usageCount,
        is_verified: data.isVerified,
        is_featured: data.isFeatured,
        engagement_threshold: data.engagementThreshold,
        reward_type: data.rewardType,
        reward_value: data.rewardValue,
        reward_description: data.rewardDescription,
        reward_scope: data.rewardScope,
        promotion_model: data.promotionModel,
        environment:
          window.location.hostname === 'routevoy.com' ||
          window.location.hostname === 'www.routevoy.com'
            ? 'production'
            : 'development',
      }

      // Remove undefined fields so Supabase defaults apply
      Object.keys(payload).forEach(
        (key) =>
          payload[key as keyof typeof payload] === undefined &&
          delete payload[key as keyof typeof payload],
      )

      const { data: result, error } = await supabase
        .from('discovered_promotions')
        .insert(payload)
        .select()
        .single()

      if (error) {
        throw error
      }
      return result
    } catch (e: any) {
      console.error(
        `Error saving discovered promotion (attempt ${attempt + 1}):`,
        e,
      )
      if (attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
        continue
      }
      throw e
    }
  }
}

export const saveCrawlerLog = async (data: any, retries = 3): Promise<any> => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      let errorDetails = data.error_details || data.errorDetails || null
      if (Array.isArray(errorDetails)) {
        errorDetails = errorDetails.slice(0, 100)
      }

      const payload = {
        date: data.date || new Date().toISOString(),
        store_name: data.store_name || data.storeName || null,
        status: data.status || null,
        items_found: Number(data.items_found ?? data.itemsFound ?? 0),
        items_imported: Number(data.items_imported ?? data.itemsImported ?? 0),
        source_id: data.source_id || data.sourceId || null,
        error_message: data.error_message || data.errorMessage || null,
        error_details: errorDetails,
        category: data.category || null,
      }

      const { data: result, error } = await supabase
        .from('crawler_logs')
        .insert(payload)
        .select()
        .single()

      if (error) {
        throw error
      }
      return result
    } catch (e) {
      console.error(`Error saving crawler log (attempt ${attempt + 1}):`, e)
      if (attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
        continue
      }
      return null
    }
  }
}

export const clearCrawlerLogs = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('crawler_logs')
      .delete()
      .not('id', 'is', null)

    if (error) throw error
    return true
  } catch (e) {
    console.error('Failed to clear crawler logs', e)
    return false
  }
}

export const fetchCrawlerLogs = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('crawler_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.warn('Failed to fetch crawler logs from Supabase', error)
      return []
    }

    return (data || []).map((log: any) => ({
      ...log,
      // Map to camelCase properties expected by frontend components and ensuring zeroes aren't lost
      itemsFound: log.items_found ?? 0,
      itemsImported: log.items_imported ?? 0,
      storeName: log.store_name,
      sourceId: log.source_id,
      errorMessage: log.error_message,
      errorDetails: log.error_details,
      created: log.created_at,
    }))
  } catch (e) {
    console.error('Failed to fetch crawler logs', e)
    return []
  }
}

export const updateUser = async (userId: string, data: any): Promise<any> => {
  try {
    const { data: result, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return result
  } catch (e) {
    console.error('Failed to update user', e)
    throw e
  }
}
