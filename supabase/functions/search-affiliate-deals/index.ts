import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import * as cheerio from 'npm:cheerio'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

function detectCurrency(text: string, domain: string = ''): string {
  if (!text) return domain.includes('.br') ? 'BRL' : 'USD'
  if (text.includes('R$') || text.includes('R $')) return 'BRL'
  if (text.includes('€')) return 'EUR'
  if (text.includes('£')) return 'GBP'
  if (text.includes('$')) return 'USD'
  return domain.includes('.br') ? 'BRL' : 'USD'
}

async function fetchOrganicAffiliateDeals(
  query: string,
  limit: number,
  affiliateIds: Record<string, string>,
) {
  const networks = [
    {
      name: 'Amazon',
      id: affiliateIds?.amazon,
      domain: 'amazon',
      param: 'tag',
    },
    {
      name: 'Booking',
      id: affiliateIds?.awin,
      domain: 'booking.com',
      param: 'aid',
    },
    {
      name: 'RentCars',
      id: affiliateIds?.rakuten,
      domain: 'rentcars.com',
      param: 'affiliate',
    },
    {
      name: 'Shopee',
      id: affiliateIds?.shopee,
      domain: 'shopee',
      param: 'smtt',
    },
  ]

  const searchFormData = new URLSearchParams()
  searchFormData.append(
    'q',
    `${query || 'ofertas viagens'} comprar OR oferta OR desconto`,
  )

  const searchResp = await fetch('https://html.duckduckgo.com/html/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
    },
    body: searchFormData.toString(),
  })

  if (!searchResp.ok) {
    throw new Error(`DuckDuckGo Search Failed: ${searchResp.status}`)
  }

  const searchHtml = await searchResp.text()
  const $search = cheerio.load(searchHtml)
  const results: any[] = []

  $search('.result').each((i, el) => {
    if (results.length >= limit * 2) return

    const titleEl = $search(el).find('.result__title a')
    const title = titleEl.text().trim()
    let rawUrl = titleEl.attr('href') || ''

    if (rawUrl.includes('uddg=')) {
      const match = rawUrl.match(/uddg=([^&]+)/)
      if (match) rawUrl = decodeURIComponent(match[1])
    } else if (rawUrl.startsWith('//')) {
      rawUrl = 'https:' + rawUrl
    } else if (rawUrl.startsWith('/')) {
      rawUrl = 'https://duckduckgo.com' + rawUrl
    }

    const snippet = $search(el).find('.result__snippet').text().trim()

    if (
      title &&
      rawUrl.startsWith('http') &&
      !rawUrl.includes('duckduckgo.com') &&
      !rawUrl.includes('bing.com') &&
      !rawUrl.includes('google.com') &&
      !rawUrl.includes('example.com') &&
      !rawUrl.includes('test.com')
    ) {
      let extractedDomain = ''
      try {
        const parsedUrl = new URL(rawUrl)
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) return
        extractedDomain = parsedUrl.hostname
      } catch (e) {
        return
      }

      if (
        title.length < 5 ||
        title.toLowerCase().includes('compre online') ||
        title.toLowerCase().includes('encontre promoções')
      ) {
        return
      }

      const matchedNetwork = networks.find((n) =>
        extractedDomain.includes(n.domain),
      )

      let finalUrl = rawUrl
      if (matchedNetwork && matchedNetwork.id) {
        try {
          const urlObj = new URL(finalUrl)
          urlObj.searchParams.append(matchedNetwork.param, matchedNetwork.id)
          finalUrl = urlObj.toString()
        } catch (e) {}
      }

      const priceMatch = snippet.match(/(?:R\$|€|\$|£)\s*\d+(?:[.,]\d{2})?/)
      const priceText = priceMatch ? priceMatch[0] : ''
      const currency = detectCurrency(priceText, extractedDomain)

      results.push({
        title: title,
        price: priceText,
        oldPrice: '',
        currency,
        link: finalUrl,
        image: `https://img.usecurling.com/p/400/400?q=${encodeURIComponent(
          extractedDomain.split('.')[0] || 'offer',
        )}`,
        source: matchedNetwork ? 'affiliate_network' : 'organic_search',
        storeName: extractedDomain,
        commission: matchedNetwork ? 5 : 0,
        snippet: snippet,
      })
    }
  })

  return results.slice(0, limit)
}

function parsePrice(priceStr: string) {
  if (!priceStr) return 0
  const num = priceStr.replace(/[^0-9,.]/g, '').replace(',', '.')
  return parseFloat(num) || 0
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, limit = 10, affiliateIds = {} } = await req.json()

    const rawDeals = await fetchOrganicAffiliateDeals(
      query,
      limit,
      affiliateIds,
    )

    const enriched = rawDeals.map((item) => {
      const price = parsePrice(item.price)

      return {
        id: crypto.randomUUID(),
        title: item.title,
        description: item.snippet,
        price: price || null,
        originalPrice: null,
        discount: item.price ? `Preço: ${item.price}` : null,
        discountPercentage: null,
        imageUrl: item.image,
        productLink: item.link,
        storeName: item.storeName,
        status: 'approved',
        category: 'affiliate_deal',
        currency: item.currency || 'BRL',
        matchConfidence: 0.8,
      }
    })

    return new Response(
      JSON.stringify({ items: enriched, total: enriched.length }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
