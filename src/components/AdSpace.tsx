import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { useEnvironment } from '@/hooks/use-environment'

interface AdSpaceProps {
  position?: 'top' | 'bottom' | 'sidebar' | 'inline'
  className?: string
}

export function AdSpace({ position = 'inline', className }: AdSpaceProps) {
  const [ad, setAd] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const { isProduction } = useEnvironment()

  useEffect(() => {
    let isMounted = true

    const fetchAd = async () => {
      try {
        setLoading(true)
        let query: any = supabase
          .from('ad_campaigns')
          .select('*')
          .eq('status', 'active')
          .eq('placement', position)

        if (isProduction) {
          query = query.eq('environment', 'production')
        }

        const { data, error } = await query.limit(1).maybeSingle()

        if (error && error.code !== 'PGRST116') {
          console.warn('Error fetching ad:', error)
        }

        if (isMounted) {
          setAd(data || null)
        }
      } catch (err) {
        console.warn('Failed to fetch ad:', err)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchAd()

    return () => {
      isMounted = false
    }
  }, [position])

  if (loading) {
    return (
      <div
        className={cn(
          'w-full h-24 sm:h-32 bg-slate-100 animate-pulse rounded-lg',
          className,
        )}
      />
    )
  }

  if (!ad) {
    return (
      <div
        className={cn(
          'w-full flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-300 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer',
          className,
        )}
      >
        <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1 uppercase tracking-wider">
          Espaço Publicitário Disponível
        </p>
        <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3">
          Destaque sua marca para milhares de clientes!
        </h3>
        <a
          href="/merchant/campaigns"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 hover:scale-105 h-9 px-6 py-2"
        >
          Anuncie Aqui
        </a>
      </div>
    )
  }

  return (
    <a
      href={ad.link || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'block w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow group relative',
        className,
      )}
    >
      <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded backdrop-blur-sm z-10">
        Patrocinado
      </div>
      {ad.image ? (
        <div className="h-24 sm:h-32 w-full relative overflow-hidden bg-slate-50">
          <img
            src={ad.image}
            alt={ad.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      ) : (
        <div className="h-24 sm:h-32 w-full bg-gradient-to-r from-slate-800 to-slate-900 flex items-center justify-center p-4 text-center">
          <h3 className="text-white font-bold text-lg">{ad.title}</h3>
        </div>
      )}
    </a>
  )
}
