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
        } else {
          // Preview env sees only dev ads to test isolation
          query = query.eq('environment', 'development')
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

  const isFooter = position === 'bottom'
  const heightClasses = isFooter ? 'h-12 sm:h-16' : 'h-24 sm:h-32'

  if (loading) {
    return (
      <div
        className={cn(
          'w-full bg-slate-100 animate-pulse rounded-lg',
          heightClasses,
          className,
        )}
      />
    )
  }

  if (!ad) {
    return (
      <div
        className={cn(
          'w-full flex flex-col items-center justify-center text-center border border-dashed border-slate-300 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer',
          isFooter ? 'py-3 px-4' : 'p-6',
          className,
        )}
      >
        <p
          className={cn(
            'font-medium text-slate-500 uppercase tracking-wider',
            isFooter
              ? 'text-[10px] sm:text-xs mb-0.5'
              : 'text-xs sm:text-sm mb-1',
          )}
        >
          Espaço Publicitário Disponível
        </p>
        <h3
          className={cn(
            'font-bold text-slate-800',
            isFooter
              ? 'text-sm sm:text-base mb-2'
              : 'text-base sm:text-lg mb-3',
          )}
        >
          Destaque sua marca para milhares de clientes!
        </h3>
        <a
          href="/merchant/campaigns"
          className={cn(
            'inline-flex items-center justify-center whitespace-nowrap rounded-full font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 hover:scale-105',
            isFooter ? 'text-xs h-7 px-4 py-1' : 'text-sm h-9 px-6 py-2',
          )}
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
      <div
        className={cn(
          'absolute bg-black/60 text-white uppercase font-bold rounded backdrop-blur-sm z-10',
          isFooter
            ? 'top-1 right-1 text-[8px] px-1.5 py-0.5'
            : 'top-2 right-2 text-[10px] px-2 py-0.5',
        )}
      >
        Patrocinado
      </div>
      {ad.image ? (
        <div
          className={cn(
            'w-full relative overflow-hidden bg-slate-50',
            heightClasses,
          )}
        >
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
        <div
          className={cn(
            'w-full bg-gradient-to-r from-slate-800 to-slate-900 flex items-center justify-center p-4 text-center',
            heightClasses,
          )}
        >
          <h3
            className={cn(
              'text-white font-bold',
              isFooter ? 'text-sm sm:text-base line-clamp-2' : 'text-lg',
            )}
          >
            {ad.title}
          </h3>
        </div>
      )}
    </a>
  )
}
