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

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const payload = await req.json()
    const { query, limit = 10, url, engine = 'apify' } = payload

    const APIFY_API_KEY =
      Deno.env.get('APIFY_API_KEY') ||
      'apify_api_YJoWmr8wuxrtBHG0iHjqYTMflDdCBo3hRqDK'
    const SCRAPER_API_KEY =
      Deno.env.get('SCRAPER_API_KEY') || '124578ab1a147cdc8baf7376968c4f1f'

    let extractedItems: any[] = []

    if (engine === 'scraperapi') {
      if (url && url !== 'all') {
        const scraperUrl = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(url)}`
        const response = await fetch(scraperUrl)
        const html = await response.text()
        const $ = cheerio.load(html)

        const title = $('title').text() || $('h1').first().text()
        const description = $('meta[name="description"]').attr('content') || ''
        const imageUrl = $('meta[property="og:image"]').attr('content') || ''

        $(
          'article, .card, [class*="product"], [class*="job"], [class*="offer"]',
        ).each((i, el) => {
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
        })

        if (extractedItems.length === 0) {
          extractedItems.push({
            title,
            description,
            imageUrl,
            productLink: url,
            storeName: new URL(url).hostname,
          })
        }
      } else {
        const searchQ = query || 'vagas oportunidades descontos'
        const scraperUrl = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&engine=google&q=${encodeURIComponent(searchQ)}&num=${limit}&autoparse=true`

        const response = await fetch(scraperUrl)
        const contentType = response.headers.get('content-type') || ''

        if (contentType.includes('application/json')) {
          const data = await response.json()
          if (data && data.organic_results) {
            data.organic_results.forEach((r: any) => {
              extractedItems.push({
                title: r.title,
                description: r.snippet,
                productLink: r.link,
                storeName: r.displayed_link || extractDomain(r.link),
                category: 'Geral',
                status: 'pending',
              })
            })
          }
        } else {
          const html = await response.text()
          const $ = cheerio.load(html)

          $('.g').each((i, el) => {
            const title = $(el).find('h3').first().text().trim()
            const link = $(el).find('a').first().attr('href')
            const description = $(el)
              .find('.VwiC3b, .s3v9rd, .IsZvec')
              .first()
              .text()
              .trim()
            const displayedUrl = $(el).find('cite').first().text().trim()

            if (title && link && link.startsWith('http')) {
              extractedItems.push({
                title,
                description,
                productLink: link,
                storeName: displayedUrl || extractDomain(link),
                category: 'Geral',
                status: 'pending',
              })
            }
          })
        }
      }
    } else {
      if (url && url !== 'all') {
        const apifyUrl = `https://api.apify.com/v2/acts/apify~cheerio-scraper/run-sync-get-dataset-items?token=${APIFY_API_KEY}`

        const response = await fetch(apifyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startUrls: [{ url }],
            pageFunction: `async function pageFunction(context) {
              const $ = context.$;
              const title = $('title').text() || $('h1').first().text();
              const description = $('meta[name="description"]').attr('content') || '';
              const imageUrl = $('meta[property="og:image"]').attr('content') || '';
              
              const items = [];
              $('article, .card, [class*="product"], [class*="job"], [class*="offer"]').each((i, el) => {
                 const itemTitle = $(el).find('h2, h3, .title').first().text().trim();
                 const itemDesc = $(el).find('p, .description, .summary').first().text().trim();
                 const itemLink = $(el).find('a').first().attr('href');
                 const itemImg = $(el).find('img').first().attr('src');
                 const price = $(el).find('[class*="price"]').first().text().trim();
                 if(itemTitle && itemLink) {
                   items.push({
                     title: itemTitle,
                     description: itemDesc,
                     productLink: itemLink,
                     imageUrl: itemImg,
                     price: price,
                     storeName: new URL(context.request.url).hostname
                   });
                 }
              });
              
              if(items.length > 0) return items;
              return [{ title, description, imageUrl, productLink: context.request.url }];
            }`,
            proxyConfiguration: { useApifyProxy: true },
          }),
        })

        const data = await response.json()
        if (data && Array.isArray(data)) {
          data.forEach((d: any) => {
            if (Array.isArray(d)) extractedItems.push(...d)
            else extractedItems.push(d)
          })
        }
      } else {
        const apifyUrl = `https://api.apify.com/v2/acts/apify~google-search-scraper/run-sync-get-dataset-items?token=${APIFY_API_KEY}`

        const response = await fetch(apifyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            queries: [query || 'vagas oportunidades descontos'],
            resultsPerPage: limit,
            countryCode: 'br',
            languageCode: 'pt',
          }),
        })

        const data = await response.json()

        if (data && Array.isArray(data)) {
          data.forEach((d: any) => {
            if (d.organicResults) {
              d.organicResults.forEach((r: any) => {
                extractedItems.push({
                  title: r.title,
                  description: r.description,
                  productLink: r.url,
                  storeName: r.displayedUrl,
                  category: 'Geral',
                  status: 'pending',
                })
              })
            }
          })
        }
      }
    }

    const finalItems = extractedItems.slice(0, limit).map((item) => {
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

      // Preço de forma segura
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
        image_url: item.imageUrl || null,
        price: priceVal,
        currency: item.currency || 'BRL',
        store_name:
          item.storeName || extractDomain(item.productLink || item.url),
        category: item.category || 'Geral',
        status: 'pending',
        captured_at: new Date().toISOString(),
        unique_hash: uniqueHash,
        environment: 'production',
      }
    })

    let savedCount = 0
    let newItems = finalItems

    if (finalItems.length > 0) {
      // Remover duplicatas locais dentro do próprio array finalItems
      const uniqueItemsMap = new Map()
      finalItems.forEach((item) => {
        if (!uniqueItemsMap.has(item.unique_hash)) {
          uniqueItemsMap.set(item.unique_hash, item)
        }
      })
      const uniqueFinalItems = Array.from(uniqueItemsMap.values())

      // Postgres upsert with partial unique index fails. Doing manual check:
      const hashes = uniqueFinalItems.map((item) => item.unique_hash)
      const { data: existing } = await supabaseClient
        .from('discovered_promotions')
        .select('unique_hash')
        .in('unique_hash', hashes)

      const existingSet = new Set((existing || []).map((e) => e.unique_hash))
      newItems = uniqueFinalItems.filter(
        (item) => !existingSet.has(item.unique_hash),
      )

      if (newItems.length > 0) {
        const { data: saved, error } = await supabaseClient
          .from('discovered_promotions')
          .insert(newItems)
          .select()

        if (error) {
          console.error(
            '[run-apify] Erro Crítico ao inserir items no banco:',
            error,
          )
          throw new Error('Erro de Ingestão: ' + error.message)
        } else {
          savedCount = saved?.length || 0
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        found: extractedItems.length,
        imported: savedCount,
        items: newItems,
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
