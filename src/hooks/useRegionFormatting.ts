import { useMemo } from 'react'
import { useRegionContext, getRegionFormatting } from '@/stores/RegionContext'
import { useAuth } from '@/hooks/use-auth'

export function useRegionFormatting(
  regionCode?: string,
  country?: string,
  explicitCurrency?: string,
) {
  const context = useRegionContext()
  const auth = useAuth()

  return useMemo(() => {
    let { locale, currency, distanceUnit } =
      context || getRegionFormatting('BR')

    const targetScope = country || regionCode || ''
    if (targetScope) {
      const format = getRegionFormatting(targetScope)
      locale = format.locale
      currency = format.currency
      distanceUnit = format.distanceUnit
    }

    if (explicitCurrency) {
      currency = explicitCurrency
      if (currency === 'USD') locale = 'en-US'
      else if (currency === 'BRL') locale = 'pt-BR'
    } else {
      if (
        auth?.user?.email?.toLowerCase() === 'adailtong@gmail.com' ||
        auth?.role === 'admin' ||
        auth?.role === 'super_admin' ||
        auth?.hierarchy?.isMaster
      ) {
        currency = 'USD'
        // Keeping the UI locale preference, only forcing the USD currency for the Master Admin
      } else if (auth?.profile?.preferred_currency) {
        currency = auth.profile.preferred_currency
        if (currency === 'BRL') locale = 'pt-BR'
        if (currency === 'EUR') locale = 'es-ES'
        if (currency === 'USD') locale = 'en-US'
      } else if (auth?.profile?.resolved_currency) {
        currency = auth.profile.resolved_currency
        if (currency === 'BRL') locale = 'pt-BR'
        if (currency === 'EUR') locale = 'es-ES'
        if (currency === 'USD') locale = 'en-US'
      }
    }

    const formatCurrency = (amount: number | null | undefined) => {
      if (amount === undefined || amount === null || isNaN(amount)) return ''
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)
    }

    const formatDate = (date: string | Date | null | undefined) => {
      if (!date) return ''
      return new Intl.DateTimeFormat(locale).format(new Date(date))
    }

    const formatShortDate = (date: string | Date | null | undefined) => {
      if (!date) return ''
      return new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
      }).format(new Date(date))
    }

    const formatTime = (date: string | Date | null | undefined) => {
      if (!date) return ''
      return new Intl.DateTimeFormat(locale, {
        hour: 'numeric',
        minute: 'numeric',
        hour12: locale === 'en-US',
      }).format(new Date(date))
    }

    const formatNumber = (
      num: number | null | undefined,
      options?: Intl.NumberFormatOptions,
    ) => {
      if (num === undefined || num === null || isNaN(num)) return ''
      return new Intl.NumberFormat(locale, options).format(num)
    }

    const formatDistance = (valueInKm: number) => {
      if (distanceUnit === 'mi') {
        const miles = valueInKm * 0.621371
        return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(miles)} mi`
      }
      return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(valueInKm)} km`
    }

    return {
      locale,
      currency,
      distanceUnit,
      formatCurrency,
      formatDate,
      formatShortDate,
      formatTime,
      formatNumber,
      formatDistance,
    }
  }, [regionCode, country, explicitCurrency, context])
}
