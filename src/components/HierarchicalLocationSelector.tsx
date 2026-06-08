import { useMemo } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LOCATION_DATA, COUNTRIES } from '@/lib/locationData'
import { useLanguage } from '@/stores/LanguageContext'

interface HierarchicalLocationSelectorProps {
  country: string
  state: string
  city: string
  onChange: (country: string, state: string, city: string) => void
}

export function HierarchicalLocationSelector({
  country,
  state,
  city,
  onChange,
}: HierarchicalLocationSelectorProps) {
  const { t } = useLanguage()

  const states = useMemo(() => {
    if (!country || country === 'all' || !LOCATION_DATA[country]) return []
    return Object.keys(LOCATION_DATA[country].states).sort()
  }, [country])

  const cities = useMemo(() => {
    if (
      !country ||
      country === 'all' ||
      !state ||
      state === 'all' ||
      !LOCATION_DATA[country] ||
      !LOCATION_DATA[country].states[state]
    )
      return []
    return LOCATION_DATA[country].states[state]
  }, [country, state])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full mb-3">
      <Select
        value={country || 'all'}
        onValueChange={(v) => onChange(v === 'all' ? '' : v, '', '')}
      >
        <SelectTrigger className="bg-white shadow-sm border-slate-200 text-slate-700">
          <SelectValue
            placeholder={t('location.select_country', 'Select Country')}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="font-semibold text-primary">
            {t('common.all_countries', 'All Countries')}
          </SelectItem>
          {COUNTRIES.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={state || 'all'}
        onValueChange={(v) => onChange(country, v === 'all' ? '' : v, '')}
        disabled={!country || country === 'all'}
      >
        <SelectTrigger className="bg-white shadow-sm border-slate-200 text-slate-700">
          <SelectValue
            placeholder={t('location.select_state', 'Select State')}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="font-semibold text-primary">
            {t('common.all_states', 'All States')}
          </SelectItem>
          {states.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={city || 'all'}
        onValueChange={(v) => onChange(country, state, v === 'all' ? '' : v)}
        disabled={!state || state === 'all'}
      >
        <SelectTrigger className="bg-white shadow-sm border-slate-200 text-slate-700">
          <SelectValue placeholder={t('location.select_city', 'Select City')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="font-semibold text-primary">
            {t('common.all_cities', 'All Cities')}
          </SelectItem>
          {cities.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
