import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import * as cheerio from 'npm:cheerio'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
]

function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

function resolveUrl(url: string, base: string): string {
  if (!url) return base
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('//')) return `https:${url}`
  try {
    const baseUrl = new URL(base.startsWith('http') ? base : `https://${base}`)
    return new URL(url, baseUrl.origin).toString()
  } catch (e) {
    return base
  }
}

function extractDomain(url: string): string {
  try {
    return new URL(
      url.startsWith('http') ? url : `https://${url}`,
    ).hostname.replace(/^www\./, '')
  } catch (e) {
    return url
      .replace(/^https?:\/\//, '')
      .split('/')[0]
      .replace(/^www\./, '')
  }
}

function detectCurrency(text: string, baseUrl: string = ''): string {
  if (!text) return baseUrl.includes('.br') ? 'BRL' : 'USD'
  if (text.includes('R$') || text.includes('R $')) return 'BRL'
  if (text.includes('€')) return 'EUR'
  if (text.includes('£')) return 'GBP'
  if (text.includes('$')) return 'USD'
  return baseUrl.includes('.br') ? 'BRL' : 'USD'
}

function cleanPrice(priceStr: string | null | undefined): number | null {
  if (!priceStr) return null
  const cleanStr = priceStr.replace(/[^\d.,]/g, '')
  if (!cleanStr) return null
  const lastComma = cleanStr.lastIndexOf(',')
  const lastDot = cleanStr.lastIndexOf('.')
  let decimalStr = cleanStr
  if (lastComma > lastDot) {
    decimalStr = cleanStr.replace(/\./g, '').replace(',', '.')
  } else if (lastDot > lastComma) {
    decimalStr = cleanStr.replace(/,/g, '')
  } else if (lastComma > -1) {
    decimalStr = cleanStr.replace(',', '.')
  }
  const val = parseFloat(decimalStr)
  return isNaN(val) ? null : val
}

function isValidPromoLink(link: string): boolean {
  if (!link) return false
  try {
    const url = new URL(link)
    // Delivery platforms generic links filter
    if (
      url.hostname.includes('ubereats.com') ||
      url.hostname.includes('ifood.com.br') ||
      url.hostname.includes('rappi.com')
    ) {
      // Must contain an item ID or specific promotion path.
      // Discard generic homepage, store feeds or search pages without specific items.
      if (
        !url.pathname.includes('/item/') &&
        !url.pathname.includes('?item_id=')
      ) {
        return false // Ignorar domínios de delivery se não for o checkout direto do item
      }

      if (url.pathname.includes('/search') || url.pathname.includes('/feed')) {
        return false
      }
    }

    // Discard links that just point to homepages of big chains without specific offer paths
    if (
      url.hostname.includes('tacobell.com') ||
      url.hostname.includes('mcdonalds.com') ||
      url.hostname.includes('burgerking.com')
    ) {
      if (url.pathname === '/' || url.pathname === '') {
        return false
      }
    }

    return true
  } catch (e) {
    return false
  }
}

async function fetchWithRetry(
  url: string,
  options: any,
  retries = 2,
): Promise<Response> {
  let lastError: any
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)
      const res = await fetch(url, { ...options, signal: controller.signal })
      clearTimeout(timeoutId)
      if (res.ok || res.status === 404) return res
      if (res.status === 429 || res.status >= 500) {
        throw new Error(`HTTP ${res.status}`)
      }
      return res
    } catch (e) {
      lastError = e
      await new Promise((resolve) => setTimeout(resolve, 2000 * (i + 1)))
    }
  }
  throw lastError
}

interface ScrapedItem {
  title: string
  price: number | null
  originalPrice?: number | null
  discount?: string | null
  currency?: string
  imageUrl: string | null
  productLink: string
  storeName: string
  description?: string
  category?: string
}

function autoCategorizeItems(items: ScrapedItem[]): ScrapedItem[] {
  const categories = [
    {
      name: 'Eletrônicos',
      keywords: [
        'tv',
        'smartphone',
        'iphone',
        'samsung',
        'notebook',
        'pc',
        'oled',
        'smartwatch',
        'fone',
        'televisão',
      ],
    },
    {
      name: 'Moda',
      keywords: [
        'tênis',
        'camisa',
        'calça',
        'vestido',
        'nike',
        'adidas',
        'bolsa',
        'jaqueta',
        'roupa',
        'sapato',
      ],
    },
    {
      name: 'Alimentação',
      keywords: [
        'pizza',
        'hambúrguer',
        'burger',
        'ifood',
        'delivery',
        'restaurante',
        'combo',
        'lanche',
        'sushi',
      ],
    },
    {
      name: 'Viagens',
      keywords: [
        'passagem',
        'hotel',
        'voo',
        'resort',
        'pacote',
        'hospedagem',
        'milhas',
        'cruzeiro',
        'turismo',
      ],
    },
    {
      name: 'Atrações',
      keywords: [
        'ingresso',
        'passeio',
        'tour',
        'ticket',
        'museu',
        'parque',
        'excursão',
        'show',
      ],
    },
    {
      name: 'Aluguel de Carros',
      keywords: ['aluguel', 'carro', 'locação', 'rent', 'suv', 'veículo'],
    },
    {
      name: 'Beleza',
      keywords: [
        'perfume',
        'maquiagem',
        'shampoo',
        'creme',
        'cabelo',
        'cosmético',
        'skincare',
      ],
    },
    {
      name: 'Casa & Decoração',
      keywords: [
        'sofá',
        'mesa',
        'cadeira',
        'armário',
        'decoração',
        'cama',
        'colchão',
      ],
    },
  ]

  return items.map((item) => {
    if (item.category && item.category !== 'Geral' && item.category !== 'geral')
      return item

    const text = `${item.title} ${item.description || ''}`.toLowerCase()
    let assigned = 'Diversos'

    for (const cat of categories) {
      if (cat.keywords.some((kw) => text.includes(kw))) {
        assigned = cat.name
        break
      }
    }

    return { ...item, category: assigned }
  })
}

class ProfessionalScraper {
  private debugLogs: any[] = []

  addLog(msg: string, data?: any) {
    this.debugLogs.push({ time: new Date().toISOString(), msg, data })
    console.log(`[Scraper] ${msg}`, data ? JSON.stringify(data) : '')
  }

  getLogs() {
    return this.debugLogs
  }

  parseWithRules(
    $: cheerio.CheerioAPI,
    html: string,
    baseUrl: string,
    rules: any,
  ): ScrapedItem[] {
    const items: ScrapedItem[] = []
    const domain = extractDomain(baseUrl)
    const container =
      rules.containerSelector ||
      rules.container ||
      'article, .card, [class*="product"]'

    $(container).each((_, el) => {
      const title = $(el)
        .find(rules.titleSelector || rules.title)
        .first()
        .text()
        .trim()
      const priceText = $(el)
        .find(rules.priceSelector || rules.price)
        .first()
        .text()
        .trim()
      let link = $(el)
        .find(rules.linkSelector || rules.link || 'a')
        .first()
        .attr('href')
      const img =
        $(el)
          .find(rules.imageSelector || rules.image || 'img')
          .first()
          .attr('src') ||
        $(el)
          .find(rules.imageSelector || rules.image || 'img')
          .first()
          .attr('data-src')

      const currency = detectCurrency(priceText, baseUrl)
      const fullLink = resolveUrl(link || '', baseUrl)

      const isValidDeal = (tTitle: string, tLink: string) => {
        const t = tTitle.toLowerCase();
        const blacklist = ['vaga', 'emprego', 'job ', 'jobs', 'career', 'hiring', 'trabalhe', 'carreira', 'recruitment', 'recrutamento', 'salary', 'salário', 'resume'];
        if (blacklist.some(word => t.includes(word))) return false;
        try {
          const u = new URL(tLink);
          if (u.pathname === '/' || u.pathname.length < 3) return false;
        } catch(e) { return false; }
        return true;
      };

      if (title && title.length > 5 && link && isValidPromoLink(fullLink) && isValidDeal(title, fullLink)) {
        items.push({
          title,
          price: cleanPrice(priceText),
          currency,
          imageUrl: resolveUrl(img || '', baseUrl),
          productLink: fullLink,
          storeName: domain,
        })
      }
    })
    return items
  }

  parseAmazon($: cheerio.CheerioAPI, baseUrl: string): ScrapedItem[] {
    const items: ScrapedItem[] = []
    const selectors = [
      'div[data-component-type="s-search-result"]',
      '.sg-col-inner',
      '.a-carousel-card',
      '[class*="DealGridItem"]',
    ]

    let elements = $(selectors.join(', '))

    elements.each((_, el) => {
      const titleTag = $(el)
        .find(
          'span.a-size-base-plus, h2, [class*="dealTitle"], .a-truncate-cut',
        )
        .first()
      const title = titleTag.text().trim()

      const priceWhole = $(el).find('span.a-price-whole').first().text().trim()
      const priceFraction = $(el)
        .find('span.a-price-fraction')
        .first()
        .text()
        .trim()
      let price = priceWhole
        ? `${priceWhole}${priceFraction ? ',' + priceFraction : ''}`
        : null

      if (!price) {
        price = $(el)
          .find('span.a-price, [class*="priceBlock"]')
          .first()
          .text()
          .trim()
      }

      const oldPrice =
        $(el)
          .find('span.a-price.a-text-price span[aria-hidden="true"]')
          .first()
          .text()
          .trim() ||
        $(el).find('span.a-price.a-text-price').first().text().trim()

      let link =
        $(el).find('a.a-link-normal').first().attr('href') ||
        $(el).find('a').first().attr('href')
      let img = $(el)
        .find('img.s-image, img.a-dynamic-image')
        .first()
        .attr('src')

      const currency = detectCurrency(price || oldPrice || '', baseUrl)
      const fullLink = resolveUrl(link || '', 'https://www.amazon.com')

      const isValidDeal = (tTitle: string, tLink: string) => {
        const t = tTitle.toLowerCase();
        const blacklist = ['vaga', 'emprego', 'job ', 'jobs', 'career', 'hiring', 'trabalhe', 'carreira', 'recruitment', 'recrutamento', 'salary', 'salário', 'resume'];
        if (blacklist.some(word => t.includes(word))) return false;
        try {
          const u = new URL(tLink);
          if (u.pathname === '/' || u.pathname.length < 3) return false;
        } catch(e) { return false; }
        return true;
      };

      if (
        title &&
        link &&
        !link.includes('javascript:') &&
        isValidPromoLink(fullLink) &&
        isValidDeal(title, fullLink)
      ) {
        items.push({
          title,
          price: cleanPrice(price),
          originalPrice: cleanPrice(oldPrice),
          currency,
          imageUrl: img || null,
          productLink: fullLink,
          storeName: 'amazon',
        })
      }
    })

    const unique = new Map<string, ScrapedItem>()
    items.forEach((item) => {
      const id = item.productLink.split('?')[0]
      if (!unique.has(id)) unique.set(id, item)
    })

    return Array.from(unique.values())
  }

  parseMercadoLivre($: cheerio.CheerioAPI, baseUrl: string): ScrapedItem[] {
    const items: ScrapedItem[] = []
    const domain = extractDomain(baseUrl)

    const elements = $(
      '.ui-search-result__wrapper, .ui-search-layout__item, .andes-card, .poly-card',
    )

    elements.each((_, el) => {
      const title = $(el)
        .find('h2, .ui-search-item__title, .poly-component__title')
        .first()
        .text()
        .trim()

      let currentPrice: string | null = null
      let oldPrice: string | null = null

      const oldPriceStr = $(el)
        .find(
          's .andes-money-amount__fraction, .poly-price__original .andes-money-amount__fraction',
        )
        .first()
        .text()
        .trim()
      if (oldPriceStr) oldPrice = `R$ ${oldPriceStr}`

      const currentPriceStr = $(el)
        .find('.andes-money-amount__fraction')
        .not('s .andes-money-amount__fraction')
        .first()
        .text()
        .trim()
      if (currentPriceStr) currentPrice = `R$ ${currentPriceStr}`

      if (!currentPrice) {
        const allPrices = $(el)
          .find('.andes-money-amount__fraction')
          .map((_, p) => $(p).text().trim())
          .get()
        if (allPrices.length > 0) {
          currentPrice = `R$ ${allPrices[allPrices.length - 1]}`
        }
      }

      let link = $(el)
        .find(
          'a.ui-search-link, a.ui-search-item__group__element, a.poly-component__title',
        )
        .first()
        .attr('href')
      let img =
        $(el)
          .find(
            'img.ui-search-result-image__image, img.poly-component__picture',
          )
          .first()
          .attr('data-src') || $(el).find('img').first().attr('src')

      const currency = detectCurrency(currentPrice || oldPrice || '', baseUrl)
      const fullLink = resolveUrl((link || '').split('#')[0], baseUrl)

      const isJobRelated = (text: string) => {
        const t = text.toLowerCase();
        const blacklist = ['vaga', 'emprego', 'job ', 'jobs', 'career', 'hiring', 'trabalhe', 'carreira', 'recruitment', 'recrutamento', 'salary', 'salário', 'resume'];
        return blacklist.some(word => t.includes(word));
      };

      if (
        title &&
        link &&
        !link.includes('javascript:') &&
        isValidPromoLink(fullLink) &&
        !isJobRelated(title)
      ) {
        items.push({
          title,
          price: cleanPrice(currentPrice),
          originalPrice: cleanPrice(oldPrice),
          currency,
          imageUrl: resolveUrl(img || '', baseUrl),
          productLink: fullLink,
          storeName: domain,
        })
      }
    })

    const unique = new Map<string, ScrapedItem>()
    items.forEach((item) => {
      const id = item.productLink.split('?')[0]
      if (!unique.has(id)) unique.set(id, item)
    })

    return Array.from(unique.values())
  }

  parseGeneric($: cheerio.CheerioAPI, baseUrl: string): ScrapedItem[] {
    const items: ScrapedItem[] = []
    const domain = extractDomain(baseUrl)

    const containerSelectors = [
      '[class*="product-card"]',
      '[class*="ProductCard"]',
      '[class*="item-card"]',
      '[class*="ItemCard"]',
      'article',
      '.card',
      '.item',
      'li[class*="product"]',
    ]

    let containers = $(containerSelectors.join(', '))
    if (containers.length === 0) {
      containers = $('div:has(a):has(img)')
    }

    containers.each((_, el) => {
      let title = $(el)
        .find('h2, h3, [class*="title"], [class*="name"]')
        .first()
        .text()
        .trim()
      if (!title) title = $(el).find('img').first().attr('alt') || ''
      if (!title) title = $(el).find('a').first().text().trim()

      const prices = $(el).find(
        '[class*="price"], [class*="valor"], [class*="preco"], [class*="amount"]',
      )

      let oldPrice: string | null = null
      let currentPrice: string | null = null

      const strikethrough = $(el)
        .find('s, strike, del, [class*="old"], [class*="original"]')
        .first()
        .text()
        .trim()
      if (strikethrough) {
        const match = strikethrough.match(/(?:\$|€|£|R\$)\s*\d+(?:[.,]\d{2})?/)
        if (match) oldPrice = match[0]
      }

      const allPrices: string[] = []
      prices.each((_, p) => {
        const pt = $(p).text().trim()
        const match = pt.match(/(?:\$|€|£|R\$)\s*\d+(?:[.,]\d{2})?/)
        if (match && !allPrices.includes(match[0])) {
          allPrices.push(match[0])
        }
      })

      if (allPrices.length === 1) {
        currentPrice = allPrices[0]
      } else if (allPrices.length > 1) {
        const parsedPrices = allPrices.map((p) => ({
          str: p,
          val: parseFloat(p.replace(/[^\d,]/g, '').replace(',', '.')),
        }))
        parsedPrices.sort((a, b) => a.val - b.val)

        currentPrice = parsedPrices[0].str
        if (!oldPrice) {
          oldPrice = parsedPrices[parsedPrices.length - 1].str
        }
      } else {
        const priceText = $(el).text().trim()
        const priceMatch = priceText.match(/(?:\$|€|£|R\$)\s*\d+(?:[.,]\d{2})?/)
        if (priceMatch) currentPrice = priceMatch[0]
      }

      let link = $(el).find('a[href]').first().attr('href')
      let img =
        $(el).find('img[src], img[data-src]').first().attr('src') ||
        $(el).find('img').first().attr('data-src')

      const currency = detectCurrency(currentPrice || oldPrice || '', baseUrl)
      const fullLink = resolveUrl(link || '', baseUrl)

      const isValidDeal = (tTitle: string, tLink: string) => {
        const t = tTitle.toLowerCase();
        const blacklist = ['vaga', 'emprego', 'job ', 'jobs', 'career', 'hiring', 'trabalhe', 'carreira', 'recruitment', 'recrutamento', 'salary', 'salário', 'resume'];
        if (blacklist.some(word => t.includes(word))) return false;
        try {
          const u = new URL(tLink);
          if (u.pathname === '/' || u.pathname.length < 3) return false;
        } catch(e) { return false; }
        return true;
      };

      if (
        title &&
        title.length > 10 &&
        link &&
        !link.startsWith('javascript:') &&
        isValidPromoLink(fullLink) &&
        isValidDeal(title, fullLink)
      ) {
        items.push({
          title: title.substring(0, 200),
          price: cleanPrice(currentPrice),
          originalPrice: cleanPrice(oldPrice),
          currency,
          imageUrl: resolveUrl(img || '', baseUrl),
          productLink: fullLink,
          storeName: domain,
        })
      }
    })

    const unique = new Map<string, ScrapedItem>()
    items.forEach((item) => {
      const id = item.title.toLowerCase().substring(0, 30)
      if (!unique.has(id)) unique.set(id, item)
    })

    return Array.from(unique.values())
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const scraper = new ProfessionalScraper()
  scraper.addLog('Iniciando motor de extração Profissional (Node.js/Cheerio)')

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const payload = await req.json()
    const { query, limit = 10, options } = payload
    let targetSources: any[] = []
    let siteMappings: Record<string, any> = {}

    const { data: mappingsData } = await supabaseClient
      .from('site_mappings')
      .select('*')
    if (mappingsData && mappingsData.length > 0) {
      mappingsData.forEach((m) => {
        siteMappings[m.domain.toLowerCase()] = m.mapping_rules
      })
      scraper.addLog(
        `Carregados ${mappingsData.length} mapeamentos estruturados de sites.`,
      )
    }

    if (options?.url && options.url !== 'all') {
      targetSources = [
        {
          url: options.url,
          name: extractDomain(options.url),
          category: options.category,
        },
      ]
    } else if (options?.useConfiguredSources || options?.url === 'all') {
      scraper.addLog('Buscando fontes ativas configuradas no banco de dados...')
      const { data: sourcesData, error: sourcesError } = await supabaseClient
        .from('crawler_sources')
        .select('*')
        .eq('status', 'active')

      if (sourcesError) throw sourcesError
      targetSources = (sourcesData || []).filter(
        (s) => s.url && s.url !== 'all',
      )
      scraper.addLog(`Encontradas ${targetSources.length} fontes ativas.`)
    }

    let organicResults: ScrapedItem[] = []
    if (targetSources.length === 0) {
      scraper.addLog('Aviso: Nenhuma fonte válida configurada. Iniciando busca orgânica (DuckDuckGo) como fallback...')
      try {
        const searchFormData = new URLSearchParams()
        searchFormData.append(
          'q',
          `${query || 'deals discount travel hotel coupon us usd'} (deal OR discount OR coupon OR sale) -job -jobs -career -hiring`
        )
        searchFormData.append('kl', 'us-en')

        const searchResp = await fetch('https://html.duckduckgo.com/html/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': getRandomUserAgent(),
          },
          body: searchFormData.toString(),
        })

        if (searchResp.ok) {
          const searchHtml = await searchResp.text()
          const $search = cheerio.load(searchHtml)

          $search('.result').each((i, el) => {
            if (organicResults.length >= limit) return

            const titleEl = $search(el).find('.result__title a')
            const title = titleEl.text().trim()
            let rawUrl = titleEl.attr('href') || ''

            if (rawUrl.includes('uddg=')) {
              const match = rawUrl.match(/uddg=([^&]+)/)
              if (match) rawUrl = decodeURIComponent(match[1])
            } else if (rawUrl.startsWith('//')) {
              rawUrl = 'https:' + rawUrl
            }

            const snippet = $search(el).find('.result__snippet').text().trim()
            
            const isValidDeal = (tTitle: string, tLink: string, tSnippet: string) => {
              const t = (tTitle + ' ' + tSnippet).toLowerCase();
              const blacklist = ['vaga', 'emprego', 'job ', 'jobs', 'career', 'hiring', 'trabalhe', 'carreira', 'recruitment', 'recrutamento', 'salary', 'salário', 'resume'];
              if (blacklist.some(word => t.includes(word))) return false;
              try {
                const u = new URL(tLink);
                if (u.pathname === '/' || u.pathname.length < 3) return false;
                if (t.includes('promo codes') && t.includes('coupons') && t.includes('discounts')) return false;
              } catch(e) { return false; }
              return true;
            };

            if (
              title &&
              rawUrl.startsWith('http') &&
              !rawUrl.includes('duckduckgo.com') &&
              isValidDeal(title, rawUrl, snippet)
            ) {
              const priceMatch = snippet.match(/(?:\$|€|£|R\$)\s*\d+(?:[.,]\d{2})?/)
              let priceText = priceMatch ? priceMatch[0] : null;
              
              if (priceText) {
                const pVal = parseFloat(priceText.replace(/[^\d.,]/g, '').replace(',', '.'));
                if (!isNaN(pVal) && pVal === 0) priceText = null;
              }

              organicResults.push({
                title: title.substring(0, 200),
                description: snippet,
                productLink: rawUrl,
                storeName: extractDomain(rawUrl),
                price: cleanPrice(priceText),
                currency: detectCurrency(priceText || '', rawUrl),
                imageUrl: null, // Sem imagens fake geradas
                category: options?.category || 'Geral'
              })
            }
          })
          scraper.addLog(`Busca orgânica encontrou ${organicResults.length} resultados reais.`)
        } else {
          scraper.addLog(`Falha na busca orgânica: HTTP ${searchResp.status}`)
        }
      } catch (err: any) {
        scraper.addLog(`Erro na busca orgânica: ${err.message}`)
      }
    }

    const finalItems: ScrapedItem[] = [...organicResults]

    for (let i = 0; i < targetSources.length; i++) {
      if (finalItems.length >= limit) break

      const source = targetSources[i]
      const targetUrl = source.url.startsWith('http')
        ? source.url
        : `https://${source.url}`
      const domain = extractDomain(targetUrl)

      scraper.addLog(`Iniciando extração em: ${domain} (${targetUrl})`)

      if (i > 0) {
        scraper.addLog(
          'Aguardando 2.5s (Delay de Segurança) para evitar bloqueios de IP...',
        )
        await new Promise((r) => setTimeout(r, 2500))
      }

      const headers: Record<string, string> = {
        'User-Agent': getRandomUserAgent(),
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }

      if (domain.includes('amazon')) {
        headers['Referer'] = 'https://www.amazon.com/'
        headers['Accept-Language'] = 'en-US,en;q=0.9'
      } else {
        headers['Referer'] = `https://${domain}/`
      }

      try {
        const response = await fetchWithRetry(targetUrl, { headers }, 2)
        scraper.addLog(`Resposta HTTP [${domain}]: ${response.status}`)

        if (!response.ok) {
          scraper.addLog(`Falha ao acessar ${domain} - ignorando fonte.`)
          continue
        }

        const html = await response.text()
        const $ = cheerio.load(html)
        let extracted: ScrapedItem[] = []

        const mapping =
          siteMappings[domain.toLowerCase()] ||
          Object.values(siteMappings).find((m: any) =>
            domain.includes(m.domain),
          )

        if (domain.includes('amazon')) {
          scraper.addLog(`Aplicando parser ultra-específico para Amazon...`)
          extracted = scraper.parseAmazon($, targetUrl)
        } else if (
          domain.includes('mercadolivre') ||
          domain.includes('mercadolibre')
        ) {
          scraper.addLog(
            `Aplicando parser ultra-específico para Mercado Livre...`,
          )
          extracted = scraper.parseMercadoLivre($, targetUrl)
        } else if (mapping) {
          scraper.addLog(
            `Aplicando mapeamento estrito (De/Para) para ${domain}...`,
          )
          extracted = scraper.parseWithRules($, html, targetUrl, mapping)
        } else {
          scraper.addLog(
            `Nenhum mapeamento encontrado. Aplicando heurística avançada (Genérica) para ${domain}...`,
          )
          extracted = scraper.parseGeneric($, targetUrl)
        }

        scraper.addLog(
          `Encontrados ${extracted.length} itens brutos em ${domain}.`,
        )

        extracted.forEach((item) => {
          item.category = source.category || options?.category || 'Geral'
          if (finalItems.length < limit) finalItems.push(item)
        })
      } catch (err: any) {
        scraper.addLog(`Erro Crítico na extração de ${domain}: ${err.message}`)
      }
    }

    // Apply AI Simulation Categorization
    scraper.addLog(
      'Aplicando categorização inteligente (IA) nos itens extraídos...',
    )
    const categorizedItems = autoCategorizeItems(finalItems)

    if (categorizedItems.length === 0) {
      scraper.addLog('Processo concluído, mas nenhum item válido foi extraído.')
    } else {
      scraper.addLog(
        `Extração bem sucedida. Retornando ${categorizedItems.length} itens normalizados e categorizados.`,
      )
    }

    return new Response(
      JSON.stringify({
        items: categorizedItems,
        debug_info: { logs: scraper.getLogs(), target_url: options?.url },
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      },
    )
  } catch (error: any) {
    scraper.addLog(`Falha Fatal na Execução: ${error.message}`)
    console.error("[crawl-promotions] Erro Crítico:", error)
    return new Response(
      JSON.stringify({
        error: error.message,
        debug_info: { logs: scraper.getLogs() },
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      },
    )
  }
})
