import {
  fetchWebSearchPromotions,
  saveDiscoveredPromotion,
  saveCrawlerLog,
} from '@/services/crawler'
import { toast } from 'sonner'

export interface CrawlerProgress {
  total: number
  current: number
  found: number
  imported: number
  errors: number
  logs: string[]
  isScanning: boolean
  sessionImportedItems?: any[]
}

let progress: CrawlerProgress = {
  total: 0,
  current: 0,
  found: 0,
  imported: 0,
  errors: 0,
  logs: [],
  isScanning: sessionStorage.getItem('crawler_isScanning') === 'true',
  sessionImportedItems: [],
}

let abortController: AbortController | null = null
let listeners: (() => void)[] = []

const notify = () => listeners.forEach((l) => l())

export const subscribeCrawler = (listener: () => void) => {
  listeners.push(listener)
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

export const getCrawlerProgress = () => progress

const addLog = (msg: string) => {
  progress.logs = [
    `[${new Date().toLocaleTimeString()}] ${msg}`,
    ...progress.logs,
  ].slice(0, 50)
  notify()
}

const pingUrl = async (url: string) => {
  try {
    // Validates DNS and connection independently of CORS issues by using 'no-cors'
    await fetch(url, { method: 'HEAD', mode: 'no-cors' })
    return true
  } catch (e) {
    return false
  }
}

export const startExtractionTask = async (
  query: string,
  limit: number,
  source: string,
  sourceOptions?: {
    country?: string
    state?: string
    city?: string
    category?: string
  },
) => {
  if (progress.isScanning) {
    stopExtractionTask()
  }

  abortController = new AbortController()
  progress = {
    total: limit,
    current: 0,
    found: 0,
    imported: 0,
    errors: 0,
    logs: [],
    isScanning: true,
    sessionImportedItems: [],
  }
  sessionStorage.setItem('crawler_isScanning', 'true')
  notify()

  const errorDetails: string[] = []

  try {
    addLog(`Initiating Organic Search Motor for query: "${query}"...`)

    const fetchOptions: any = {
      platform: source === 'all' ? 'all' : source,
      url: source === 'all' ? 'all' : source,
      useConfiguredSources: source === 'all',
      region:
        sourceOptions?.state || sourceOptions?.city || sourceOptions?.country,
    }
    if (sourceOptions?.category) {
      fetchOptions.category = sourceOptions.category
    }

    const items = await fetchWebSearchPromotions(query, limit, fetchOptions)

    const itemsFound = items.length
    progress.total = itemsFound > 0 ? itemsFound : limit
    progress.found = itemsFound
    addLog(`Found ${itemsFound} organic results. Starting validation...`)
    notify()

    if (itemsFound === 0) {
      addLog('No items found. Process completed.')
    }

    // Batch processing to save items efficiently
    const BATCH_SIZE = 5
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      if (abortController?.signal.aborted) {
        errorDetails.push('Extraction aborted by user.')
        break
      }

      const batch = items.slice(i, i + BATCH_SIZE)

      await Promise.all(
        batch.map(async (item, batchIndex) => {
          const globalIndex = i + batchIndex
          // Strict Validation (Production Grade) - Não geramos dados falsos
          if (!item.title?.trim() || item.title.length < 5) {
            throw new Error(`Item ignorado: Título inválido ou ausente.`)
          }

          if (item.title.length > 250) {
            item.title = item.title.substring(0, 247) + '...'
          }

          const siteName = item.storeName || item.siteName || ''
          if (!siteName.trim()) {
            item.storeName = source !== 'all' ? source : 'Web Search'
          }

          // Preço real ou nulo (nunca gerar preços aleatórios)
          if (typeof item.price === 'string') {
            const cleanStr = item.price.replace(/[^\d.,]/g, '')
            if (cleanStr) {
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

              const numericPrice = parseFloat(decimalStr)
              item.price = isNaN(numericPrice) ? null : numericPrice
            } else {
              item.price = null
            }
          } else if (item.price && isNaN(Number(item.price))) {
            item.price = null
          }

          item.currency = item.currency || 'USD'
          item.imageUrl = item.imageUrl || item.image || null
          item.discount = item.discount ? String(item.discount) : null

          item.country =
            item.country ||
            item.countryOfOrigin ||
            sourceOptions?.country ||
            'USA'
          item.category = item.category || sourceOptions?.category || 'Geral'
          item.capturedAt = item.capturedAt || new Date().toISOString()
          item.status = item.status || 'pending'

          const linkToTest =
            item.productLink || item.sourceUrl || item.originalUrl || ''
          if (!linkToTest.trim() || !linkToTest.startsWith('http')) {
            throw new Error(`Item ignorado: URL de origem inválida.`)
          }
          item.sourceUrl = linkToTest
          item.productLink = linkToTest

          // Real-Time Link Validation (Log only, do not discard to ensure all items are saved)
          addLog(`Pinging URL for "${item.title.substring(0, 30)}..."`)
          const isLinkValid = await pingUrl(item.sourceUrl)

          if (!isLinkValid) {
            addLog(
              `Warning: Unreachable Link (${item.sourceUrl}) - Proceeding anyway`,
            )
          }

          try {
            // Remove system fields and unsupported fields to prevent database validation errors (400)
            // Payload mapping com tratamento defensivo
            const payload: any = {
              title: item.title,
              description: item.description || item.snippet,
              price: item.price,
              original_price: item.originalPrice || item.oldPrice,
              currency: item.currency || 'USD',
              discount: item.discount,
              image_url: item.imageUrl || item.image || item.image_url,
              product_link:
                item.productLink ||
                item.link ||
                item.product_link ||
                item.sourceUrl,
              source_url: item.sourceUrl || item.link || item.product_link,
              store_name: item.storeName || item.store_name || item.siteName,
              category: item.category || sourceOptions?.category || 'Geral',
              country: item.country || sourceOptions?.country || 'USA',
              status: 'pending',
              captured_at: new Date().toISOString(),
              environment: 'production',
            }
            // Atomic Persistence Sync
            const savedItem = await saveDiscoveredPromotion(payload)

            if (savedItem.skipped) {
              if (savedItem.reason === 'duplicate') {
                addLog(`Skipped (Duplicate): ${item.title}`)
              } else {
                addLog(`Skipped (Error): ${item.title} - ${savedItem.error}`)
                progress.errors++
                errorDetails.push(
                  `Failed to save "${item.title}": ${savedItem.error}`,
                )
              }
            } else {
              progress.imported++
              if (!progress.sessionImportedItems)
                progress.sessionImportedItems = []
              progress.sessionImportedItems.push(savedItem)
              addLog(`Imported: ${item.title}`)
            }
          } catch (err: any) {
            progress.errors++
            const errMsg = `Failed to save "${item.title}": ${err.message}`
            errorDetails.push(errMsg)
            addLog(errMsg)
          }

          progress.current = Math.min(progress.total, progress.current + 1)
          notify()
        }),
      )
    }

    addLog('Finalizing execution and generating audit logs...')
    await saveCrawlerLog({
      date: new Date().toISOString(),
      storeName: source === 'all' ? 'Organic Web Search' : source,
      status:
        errorDetails.length > 0
          ? progress.imported > 0
            ? 'warning'
            : 'error'
          : 'success',
      itemsFound,
      itemsImported: progress.imported,
      sourceId: `organic_${source.toLowerCase()}`,
      errorMessage:
        errorDetails.length > 0
          ? `Completed with ${errorDetails.length} errors/discards.`
          : undefined,
      errorDetails: errorDetails,
      category: sourceOptions?.category || 'all',
    })

    addLog(
      `Done. ${progress.found} Found, ${progress.imported} Imported, ${progress.errors} Discarded.`,
    )

    // Alerta visual conforme especificado na User Story
    if (progress.imported > 0) {
      toast.success(
        `Extração concluída! ${progress.imported} novas ofertas salvas.`,
        {
          description: "Verifique a aba 'Importados' (Ofertas Pendentes).",
        },
      )
    } else {
      toast.info('Extração finalizada.', {
        description:
          'Nenhuma oferta nova foi importada (todas duplicadas ou inválidas).',
      })
    }
  } catch (err: any) {
    addLog(`Fatal Error: ${err.message}`)
    try {
      await saveCrawlerLog({
        date: new Date().toISOString(),
        storeName: source === 'all' ? 'Organic Web Search' : source,
        status: 'error',
        itemsFound: 0,
        itemsImported: 0,
        sourceId: `organic_${source.toLowerCase()}`,
        errorMessage: err.message,
        errorDetails: [err.message],
        category: sourceOptions?.category || 'all',
      })
    } catch (logErr) {
      console.error('Failed to save fatal error log (unhandled):', logErr)
    }
  } finally {
    progress.isScanning = false
    abortController = null
    sessionStorage.setItem('crawler_isScanning', 'false')
    notify()
  }
}

export const stopExtractionTask = () => {
  if (abortController) {
    abortController.abort()
  }
  progress.isScanning = false
  sessionStorage.setItem('crawler_isScanning', 'false')
  addLog('Extraction manually aborted.')
  notify()
}
