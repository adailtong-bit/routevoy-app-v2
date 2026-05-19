import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import * as cheerio from 'npm:cheerio'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

function extractDomain(url: string): string {
  if (!url) return 'Desconhecido'
  try {
    return new URL(
      url.startsWith('http') ? url : `https://${url}`,
    ).hostname.replace(/^www\./, '')
  } catch (e) {
    return url
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const logs: string[] = []
  const addLog = (msg: string) => {
    console.log(`[run-apify] ${msg}`)
    logs.push(msg)
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const payload = await req.json()
    const { query, limit = 10, url, engine = 'scraperapi' } = payload
    addLog(
      `Received request: engine=${engine}, url=${url}, query=${query}, limit=${limit}`,
    )

    const SCRAPER_API_KEY = Deno.env.get('SCRAPER_API_KEY')
    if (!SCRAPER_API_KEY) {
      throw new Error('SCRAPER_API_KEY environment variable is not set')
    }

    let extractedItems: any[] = []

    try {
      addLog(`Calling ScraperAPI...`)
      if (url && url !== 'all') {
        const scraperUrl = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(url)}`
        addLog(`Fetching URL: ${scraperUrl}`)
        const response = await fetch(scraperUrl)
        const html = await response.text()
        addLog(`Received HTML length: ${html.length}`)
        const $ = cheerio.load(html)

        const title = $('title').text() || $('h1').first().text()
        const description = $('meta[name="description"]').attr('content') || ''
        const imageUrl = $('meta[property="og:image"]').attr('content') || ''

        $('article, .card, [class*="product"], [class*="offer"]').each(
          (i, el) => {
            const itemTitle = $(el).find('h2, h3, .title').first().text().trim()
            const itemDesc = $(el)
              .find('p, .description, .summary')
              .first()
              .text()
              .trim()
            let itemLink = $(el).find('a').first().attr('href')
            const itemImg = $(el).find('img').first().attr('src')
            const price = $(el).find('[class*="price"]').first().text().trim()
            if (itemTitle && itemLink) {
              if (!itemLink.startsWith('http')) {
                try {
                  itemLink = new URL(itemLink, url).toString()
                } catch (e) {}
              }
              extractedItems.push({
                title: itemTitle,
                description: itemDesc,
                productLink: itemLink,
                imageUrl: itemImg,
                price: price,
                storeName: new URL(url).hostname,
              })
            }
          },
        )

        if (extractedItems.length === 0 && title && url) {
          extractedItems.push({
            title,
            description,
            imageUrl,
            productLink: url,
            storeName: new URL(url).hostname,
          })
        }
      } else {
        const searchQ = query
          ? `${query} inurl:deal OR inurl:sale OR inurl:product -job -jobs -career -hiring`
          : '"deals" OR "discounts" OR "coupon" OR "hotel" (inurl:deal OR inurl:sale OR inurl:product) -job -jobs -career -hiring'
        const scraperUrl = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&engine=google&gl=us&hl=en&q=${encodeURIComponent(searchQ)}&num=${limit}&autoparse=true`
        addLog(`Fetching Search URL: ${scraperUrl}`)

        const response = await fetch(scraperUrl)
        if (!response.ok) {
          throw new Error(`ScraperAPI HTTP ${response.status}`)
        }
        const data = await response.json()
        addLog(
          `Received JSON response from ScraperAPI. Keys: ${Object.keys(data).join(',')}`,
        )

        if (data && data.organic_results) {
          addLog(`Found ${data.organic_results.length} organic results.`)

          const isValidDeal = (
            title: string,
            link: string,
            snippet: string,
          ) => {
            const t = (title + ' ' + snippet).toLowerCase()
            const blacklist = [
              'vaga',
              'emprego',
              'job ',
              'jobs',
              'career',
              'hiring',
              'trabalhe',
              'carreira',
              'recruitment',
              'recrutamento',
              'salary',
              'salário',
              'resume',
              'glassdoor',
              'indeed',
              'linkedin',
              'home',
              'log in',
              'login',
              'sign up',
              'register',
              'coupon site',
            ]
            if (blacklist.some((word) => t.includes(word))) return false

            try {
              const u = new URL(link)
              if (u.pathname === '/' || u.pathname.length < 3) return false
              if (
                t.includes('promo codes') &&
                t.includes('coupons') &&
                t.includes('discounts')
              )
                return false
              if (title.length < 10) return false

              const path = u.pathname.toLowerCase()
              const hasDealPath =
                path.includes('/deal') ||
                path.includes('/sale') ||
                path.includes('/coupon') ||
                path.includes('/promotion') ||
                path.includes('/offer') ||
                path.includes('/item') ||
                path.includes('/product') ||
                path.includes('/p/')
              if (
                !hasDealPath &&
                !u.search.includes('id') &&
                !u.search.includes('product')
              )
                return false
            } catch (e) {
              return false
            }

            return true
          }

          data.organic_results.forEach((r: any) => {
            if (isValidDeal(r.title, r.link, r.snippet || '')) {
              extractedItems.push({
                title: r.title,
                description: r.snippet,
                productLink: r.link,
                storeName: r.displayed_link || extractDomain(r.link),
                category: 'Geral',
                status: 'pending',
              })
            }
          })
        } else {
          addLog(`No organic_results found in JSON.`)
        }
      }
    } catch (fetchError: any) {
      addLog(`External API failed: ${fetchError.message}`)

      // Fallback robusto para busca orgânica DuckDuckGo
      try {
        addLog(`Trying DuckDuckGo fallback...`)
        const searchFormData = new URLSearchParams()
        searchFormData.append(
          'q',
          `${query || 'deals discount travel hotel coupon us usd'} (deal OR discount OR coupon OR sale) -job -jobs -career -hiring`,
        )
        searchFormData.append('kl', 'us-en')
        const ddgRes = await fetch('https://html.duckduckgo.com/html/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
          },
          body: searchFormData.toString(),
        })

        if (ddgRes.ok) {
          const html = await ddgRes.text()
          const $ = cheerio.load(html)
          let count = 0

          $('.result').each((i, el) => {
            if (count >= limit) return

            const title = $(el).find('.result__title a').text().trim()
            const snippet = $(el).find('.result__snippet').text().trim()
            let link = $(el).find('.result__title a').attr('href') || ''

            if (link.includes('uddg=')) {
              const m = link.match(/uddg=([^&]+)/)
              if (m) link = decodeURIComponent(m[1])
            } else if (link.startsWith('//')) {
              link = 'https:' + link
            }

            const isValidDeal = (
              tTitle: string,
              tLink: string,
              tSnippet: string,
            ) => {
              const t = (tTitle + ' ' + tSnippet).toLowerCase()
              const blacklist = [
                'vaga',
                'emprego',
                'job ',
                'jobs',
                'career',
                'hiring',
                'trabalhe',
                'carreira',
                'recruitment',
                'recrutamento',
                'salary',
                'salário',
                'resume',
                'glassdoor',
                'indeed',
                'linkedin',
                'home',
                'log in',
                'login',
                'sign up',
                'register',
                'coupon site',
              ]
              if (blacklist.some((word) => t.includes(word))) return false

              try {
                const u = new URL(tLink)
                if (u.pathname === '/' || u.pathname.length < 3) return false
                if (
                  t.includes('promo codes') &&
                  t.includes('coupons') &&
                  t.includes('discounts')
                )
                  return false

                const path = u.pathname.toLowerCase()
                const hasDealPath =
                  path.includes('/deal') ||
                  path.includes('/sale') ||
                  path.includes('/coupon') ||
                  path.includes('/promotion') ||
                  path.includes('/offer') ||
                  path.includes('/item') ||
                  path.includes('/product') ||
                  path.includes('/p/')
                if (
                  !hasDealPath &&
                  !u.search.includes('id') &&
                  !u.search.includes('product')
                )
                  return false
              } catch (e) {
                return false
              }
              return true
            }

            if (
              title &&
              link.startsWith('http') &&
              !link.includes('duckduckgo.com') &&
              isValidDeal(title, link, snippet)
            ) {
              const priceMatch = snippet.match(
                /(?:\$|€|£|R\$)\s*\d+(?:[.,]\d{2})?/,
              )
              let priceStr = priceMatch ? priceMatch[0] : null

              if (priceStr) {
                const pVal = parseFloat(
                  priceStr.replace(/[^\d.,]/g, '').replace(',', '.'),
                )
                if (!isNaN(pVal) && pVal === 0) priceStr = null // discard 0 price
              }

              extractedItems.push({
                title: title.substring(0, 200),
                description: snippet,
                productLink: link,
                storeName: extractDomain(link),
                price: priceStr,
                imageUrl: null,
              })
              count++
            }
          })
          addLog(`DuckDuckGo fallback found ${count} results.`)
        } else {
          addLog(`DuckDuckGo fallback failed with HTTP ${ddgRes.status}`)
        }
      } catch (ddgErr: any) {
        addLog(`Organic Search fallback also failed: ${ddgErr.message}`)
      }
    }

    addLog(`Total extracted items before filtering: ${extractedItems.length}`)

    let validExtractedItems = extractedItems.filter((item) => {
      // Regra de Qualidade Anti-Lixo e Exigência de Preço
      if (!item.price) return false

      const cleanStr = String(item.price).replace(/[^\d.,]/g, '')
      const pVal = parseFloat(cleanStr.replace(',', '.'))
      if (isNaN(pVal) || pVal === 0) return false

      if (!item.title || item.title.length < 10) return false

      return true
    })

    const finalItems = validExtractedItems.slice(0, limit).map((item) => {
      const titleClean = item.title
        ? item.title.substring(0, 100).toLowerCase().trim()
        : ''
      const cleanLink = (item.productLink || item.url || '')
        .split('?')[0]
        .trim()

      let hashNum = 0
      const hashBase = `${cleanLink}|${titleClean}`
      for (let i = 0; i < hashBase.length; i++) {
        hashNum = (hashNum << 5) - hashNum + hashBase.charCodeAt(i)
        hashNum = hashNum & hashNum
      }
      const uniqueHash = `${engine}_${Math.abs(hashNum).toString(16)}`

      let priceVal = null
      if (item.price) {
        const cleanStr = String(item.price).replace(/[^\d.,]/g, '')
        if (cleanStr) {
          priceVal = parseFloat(cleanStr.replace(',', '.'))
          if (isNaN(priceVal)) priceVal = null
        }
      }

      return {
        title: item.title?.substring(0, 255) || 'Oferta sem título',
        description: item.description,
        product_link: item.productLink || item.url,
        source_url: item.productLink || item.url,
        image_url: item.imageUrl || null,
        price: priceVal,
        currency: 'USD',
        country: 'USA',
        store_name:
          item.storeName || extractDomain(item.productLink || item.url),
        category: item.category || 'Geral',
        status: 'published',
        captured_at: new Date().toISOString(),
        unique_hash: uniqueHash,
        environment:
          Deno.env.get('APP_ENV') === 'development'
            ? 'development'
            : 'production',
      }
    })

    let savedCount = 0
    let newItems = finalItems

    if (finalItems.length > 0) {
      const uniqueItemsMap = new Map()
      finalItems.forEach((item) => {
        if (!uniqueItemsMap.has(item.unique_hash)) {
          uniqueItemsMap.set(item.unique_hash, item)
        }
      })
      const uniqueFinalItems = Array.from(uniqueItemsMap.values())

      const hashes = uniqueFinalItems.map((item) => item.unique_hash)
      addLog(`Checking ${hashes.length} hashes against DB...`)

      const { data: existing, error: selectError } = await supabaseClient
        .from('discovered_promotions')
        .select('unique_hash')
        .in('unique_hash', hashes)

      if (selectError) {
        addLog(`Error checking existing hashes: ${selectError.message}`)
      }

      const existingSet = new Set((existing || []).map((e) => e.unique_hash))
      newItems = uniqueFinalItems.filter(
        (item) => !existingSet.has(item.unique_hash),
      )

      addLog(`Found ${newItems.length} new items to insert.`)

      if (newItems.length > 0) {
        const { data: saved, error } = await supabaseClient
          .from('discovered_promotions')
          .insert(newItems)
          .select()

        if (error) {
          addLog(
            `Critical Insert Error: ${error.message} (Code: ${error.code})`,
          )
          if (error.code !== '23505') {
            // If not duplicate key
            throw new Error('Erro de Ingestão: ' + error.message)
          }
        } else {
          savedCount = saved?.length || 0
          addLog(`Successfully inserted ${savedCount} items.`)
        }
      }
    }

    // Retornamos todos os finalItems para que o Frontend tenha a lista completa e possa iterar/exibir
    return new Response(
      JSON.stringify({
        success: true,
        found: extractedItems.length,
        imported: savedCount,
        items: finalItems,
        logs,
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } },
    )
  } catch (error: any) {
    console.error('[run-apify] Falha Fatal na Execução:', error)
    return new Response(
      JSON.stringify({ error: error.message, details: error.stack }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      },
    )
  }
})
