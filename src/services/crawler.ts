import { supabase } from '@/lib/supabase/client'

export const fetchWebSearchPromotions = async (
  query: string,
  limit: number,
  options?: any,
) => {
  // Chamada espelhada com a arquitetura que funciona (run-apify)
  const { data, error } = await supabase.functions.invoke('run-apify', {
    body: { query, limit, url: options?.url, engine: 'scraperapi' },
  })

  if (error) {
    console.error('Error fetching promotions:', error)
    throw error
  }

  if (data?.error) {
    console.warn('Crawler returned an error:', data.error, data.details)
    throw new Error(data.error)
  }

  return data?.items || []
}

export const saveDiscoveredPromotion = async (promo: any) => {
  try {
    const rawLink = promo.product_link || promo.source_url || ''
    const cleanLink = rawLink.split('?')[0].trim()
    const titleClean = promo.title
      ? promo.title.substring(0, 100).toLowerCase().trim()
      : ''
    const priceStr = promo.price ? promo.price.toString() : '0'

    // De-duplicação: Hashing baseado em link + título + preço
    const hashBase = `${cleanLink}|${titleClean}|${priceStr}`
    let hashNum = 0
    for (let i = 0; i < hashBase.length; i++) {
      const char = hashBase.charCodeAt(i)
      hashNum = (hashNum << 5) - hashNum + char
      hashNum = hashNum & hashNum
    }
    const uniqueHash = `h_${Math.abs(hashNum).toString(16)}_${titleClean.substring(0, 8).replace(/[^a-z0-9]/g, '')}`

    // Verificação preventiva para evitar erro de constraint no log
    const { data: existing, error: existingError } = await supabase
      .from('discovered_promotions')
      .select('id')
      .eq('unique_hash', uniqueHash)
      .limit(1)
      .maybeSingle()

    if (existingError && existingError.code !== 'PGRST116') {
      console.warn('Error checking existing hash:', existingError)
    }

    if (existing) {
      console.log(`Skipping duplicate (hash match): ${promo.title}`)
      return { skipped: true, reason: 'duplicate', id: existing.id }
    }

    // Alternativa: verificação por link exato
    if (cleanLink && cleanLink.startsWith('http')) {
      const { data: existingLink } = await supabase
        .from('discovered_promotions')
        .select('id')
        .like('product_link', `${cleanLink}%`)
        .limit(1)
        .maybeSingle()

      if (existingLink) {
        console.log(`Skipping duplicate (link match): ${cleanLink}`)
        return { skipped: true, reason: 'duplicate', id: existingLink.id }
      }
    }

    // Garantir que os dados mapeiem corretamente para a tabela e prevenir erros de colunas inexistentes.
    // Evitar nulos em campos cruciais (Data cleaning)
    const finalTitle = promo.title
      ? promo.title.substring(0, 255)
      : 'Oferta sem título'
    const finalEnv = promo.environment || 'production'

    const payload = {
      unique_hash: uniqueHash,
      title: finalTitle,
      description: promo.description || null,
      price: promo.price || null,
      original_price: promo.original_price || null,
      currency: promo.currency || 'USD',
      discount: promo.discount || null,
      discount_percentage: promo.discount_percentage || null,
      image_url: promo.image_url || null,
      product_link:
        promo.product_link || promo.productLink || promo.url || null,
      source_url: promo.source_url || promo.sourceUrl || promo.url || null,
      store_name: promo.store_name || promo.storeName || 'Web Search',
      category: promo.category || 'Geral',
      country: promo.country || 'USA',
      status: promo.status || 'pending',
      captured_at:
        promo.captured_at || promo.capturedAt || new Date().toISOString(),
      campaign_name: promo.campaign_name || null,
      coverage: promo.coverage || 'toda a rede',
      discount_rules: promo.discount_rules || 'percentual',
      start_date: promo.start_date || null,
      end_date: promo.end_date || null,
      limit_type: promo.limit_type || null,
      total_limit: promo.total_limit || null,
      enable_proximity_alerts: promo.enable_proximity_alerts || false,
      alert_radius: promo.alert_radius || null,
      is_seasonal: promo.is_seasonal || false,
      enable_trigger: promo.enable_trigger || false,
      trigger_type: promo.trigger_type || null,
      trigger_threshold: promo.trigger_threshold || null,
      reward_id: promo.reward_id || null,
      company_id: promo.company_id || null,
      environment: finalEnv,
    }

    const { data, error } = await supabase
      .from('discovered_promotions')
      .insert([payload])
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        // Unique violation fallback
        return { skipped: true, reason: 'duplicate' }
      }
      console.error(
        'Error saving promotion (DB insert):',
        error.message,
        error.details,
        payload,
      )
      // Return a mock response so the task doesn't fail completely
      return { skipped: true, reason: 'error', error: error.message }
    }
    return data
  } catch (err: any) {
    if (err.code === '23505') {
      return { skipped: true, reason: 'duplicate' }
    }
    console.error('Fatal error in saveDiscoveredPromotion:', err)
    throw err
  }
}

export const saveCrawlerLog = async (log: any) => {
  const { data, error } = await supabase.from('crawler_logs').insert([log])

  if (error) {
    console.error('Error saving log', error)
  }
  return data
}

export const fetchCrawlerLogs = async (filters?: any) => {
  let query = supabase
    .from('crawler_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (filters?.franchise_id) {
    query = query.eq('franchise_id', filters.franchise_id)
  }
  if (filters?.company_id) {
    query = query.eq('company_id', filters.company_id)
  }
  if (filters?.affiliate_id) {
    query = query.eq('affiliate_id', filters.affiliate_id)
  }
  if (filters?.source_id) {
    query = query.eq('source_id', filters.source_id)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching crawler logs', error)
    throw error
  }
  return data || []
}

export const fetchCrawlerPromotions = async (filters?: any) => {
  let query = supabase
    .from('discovered_promotions')
    .select('*')
    .order('captured_at', { ascending: false })

  if (filters?.status) {
    if (Array.isArray(filters.status)) {
      query = query.in('status', filters.status)
    } else {
      query = query.eq('status', filters.status)
    }
  }
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }
  if (filters?.franchise_id) {
    query = query.eq('franchise_id', filters.franchise_id)
  }
  if (filters?.company_id) {
    query = query.eq('company_id', filters.company_id)
  }
  if (filters?.affiliate_id) {
    query = query.or(
      `affiliate_id.eq.${filters.affiliate_id},reward_id.eq.${filters.affiliate_id}`,
    )
  }
  if (filters?.reward_id) {
    query = query.eq('reward_id', filters.reward_id)
  }

  const { data, error } = await query
  if (error) {
    console.error('Error fetching crawler promotions', error)
    return { data: [] }
  }
  return { data }
}

export const updatePromotion = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('discovered_promotions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const updatePromotionStatus = async (id: string, status: string) => {
  const { data, error } = await supabase
    .from('discovered_promotions')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deletePromotion = async (id: string) => {
  const { error } = await supabase
    .from('discovered_promotions')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

export const fetchCrawlerSources = async (filters?: any) => {
  let query = supabase
    .from('crawler_sources')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters?.franchise_id) {
    query = query.eq('franchise_id', filters.franchise_id)
  }
  if (filters?.company_id) {
    query = query.eq('company_id', filters.company_id)
  }
  if (filters?.affiliate_id) {
    query = query.eq('affiliate_id', filters.affiliate_id)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching crawler sources', error)
    return []
  }
  return data
}

export const saveCrawlerSource = async (source: any) => {
  const { data, error } = await supabase
    .from('crawler_sources')
    .insert([source])
    .select()
    .single()

  if (error) {
    console.error('Error saving crawler source', error)
    throw error
  }
  return data
}

export const updateCrawlerSource = async (id: string, source: any) => {
  const { data, error } = await supabase
    .from('crawler_sources')
    .update(source)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating crawler source', error)
    throw error
  }
  return data
}

export const deleteCrawlerSource = async (id: string) => {
  const { error } = await supabase.from('crawler_sources').delete().eq('id', id)

  if (error) {
    console.error('Error deleting crawler source', error)
    throw error
  }
  return true
}
