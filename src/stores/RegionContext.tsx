import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'

export interface RegionContextType {
  country: string
  locale: string
  currency: string
  distanceUnit: string
  loading: boolean
}

export const getRegionFormatting = (targetScope: string) => {
  let locale = 'pt-BR'
  let currency = 'BRL'
  let distanceUnit = 'km'

  const scope = (targetScope || '').toUpperCase()

  if (scope.includes('BRASIL') || scope.includes('BRAZIL') || scope === 'BR') {
    locale = 'pt-BR'
    currency = 'BRL'
    distanceUnit = 'km'
  } else if (scope.includes('MEXICO') || scope === 'MX') {
    locale = 'es-MX'
    currency = 'MXN'
    distanceUnit = 'km'
  } else if (
    scope.includes('ESPANHA') ||
    scope.includes('SPAIN') ||
    scope === 'ES'
  ) {
    locale = 'es-ES'
    currency = 'EUR'
    distanceUnit = 'km'
  } else if (scope.includes('PORTUGAL') || scope === 'PT') {
    locale = 'pt-PT'
    currency = 'EUR'
    distanceUnit = 'km'
  } else if (
    scope.includes('EU') ||
    scope.includes('FRANCE') ||
    scope.includes('FR')
  ) {
    locale = 'fr-FR'
    currency = 'EUR'
    distanceUnit = 'km'
  } else if (
    scope.includes('USA') ||
    scope.includes('UNITED STATES') ||
    scope === 'US'
  ) {
    locale = 'en-US'
    currency = 'USD'
    distanceUnit = 'mi'
  }

  return { locale, currency, distanceUnit }
}

const RegionContext = createContext<RegionContextType>({
  country: 'BR',
  ...getRegionFormatting('BR'),
  loading: true,
})

export const useRegionContext = () => useContext(RegionContext)

export const RegionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth()
  const [country, setCountry] = useState('BR')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchRegion = async () => {
      let resolvedCountry = 'BR'

      if (user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, franchise_id, company_id')
            .eq('id', user.id)
            .maybeSingle()

          if (profile) {
            const role = profile.role

            if (
              role === 'admin' ||
              role === 'super_admin' ||
              user.email?.toLowerCase() === 'adailtong@gmail.com'
            ) {
              resolvedCountry = 'BR'
            } else if (profile.franchise_id) {
              const { data: franchise } = await supabase
                .from('franchises')
                .select('country')
                .eq('id', profile.franchise_id)
                .maybeSingle()

              if (franchise?.country) {
                resolvedCountry = franchise.country
              }
            } else if (profile.company_id) {
              const { data: company } = await supabase
                .from('merchants')
                .select('franchise_id')
                .eq('id', profile.company_id)
                .maybeSingle()

              if (company?.franchise_id) {
                const { data: franchise } = await supabase
                  .from('franchises')
                  .select('country')
                  .eq('id', company.franchise_id)
                  .maybeSingle()
                if (franchise?.country) {
                  resolvedCountry = franchise.country
                }
              }
            }
          }
        } catch (error) {
          console.error('Error fetching region context:', error)
        }
      }

      if (isMounted) {
        setCountry(resolvedCountry)

        // Sync with localStorage so global utils can use it synchronously
        const formatting = getRegionFormatting(resolvedCountry)
        localStorage.setItem('app_locale', formatting.locale)
        localStorage.setItem('app_currency', formatting.currency)
        localStorage.setItem('app_distance_unit', formatting.distanceUnit)

        setLoading(false)
      }
    }

    fetchRegion()

    return () => {
      isMounted = false
    }
  }, [user])

  const formatting = getRegionFormatting(country)

  return (
    <RegionContext.Provider value={{ country, ...formatting, loading }}>
      {children}
    </RegionContext.Provider>
  )
}
