import { useState, useMemo } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
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

  const [openCountry, setOpenCountry] = useState(false)
  const [openState, setOpenState] = useState(false)
  const [openCity, setOpenCity] = useState(false)

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
      <Popover open={openCountry} onOpenChange={setOpenCountry}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={openCountry}
            className="w-full justify-between bg-white shadow-sm border-slate-200 text-slate-700"
          >
            <span className="truncate">
              {country && country !== 'all'
                ? country
                : t('location.select_country', 'Select Country')}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder={t('location.search_country', 'Search country...')}
            />
            <CommandList>
              <CommandEmpty>
                {t('location.no_country_found', 'No country found.')}
              </CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="all"
                  onSelect={() => {
                    onChange('', '', '')
                    setOpenCountry(false)
                  }}
                  className="font-semibold text-primary"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      !country || country === 'all'
                        ? 'opacity-100'
                        : 'opacity-0',
                    )}
                  />
                  {t('common.all_countries', 'All Countries')}
                </CommandItem>
                {COUNTRIES.map((c) => (
                  <CommandItem
                    key={c}
                    value={c}
                    onSelect={() => {
                      onChange(c, '', '')
                      setOpenCountry(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        country === c ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {c}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Popover open={openState} onOpenChange={setOpenState}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={openState}
            disabled={!country || country === 'all'}
            className="w-full justify-between bg-white shadow-sm border-slate-200 text-slate-700"
          >
            <span className="truncate">
              {state && state !== 'all'
                ? state
                : t('location.select_state', 'Select State')}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder={t('location.search_state', 'Search state...')}
            />
            <CommandList>
              <CommandEmpty>
                {t('location.no_state_found', 'No state found.')}
              </CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="all"
                  onSelect={() => {
                    onChange(country, '', '')
                    setOpenState(false)
                  }}
                  className="font-semibold text-primary"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      !state || state === 'all' ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {t('common.all_states', 'All States')}
                </CommandItem>
                {states.map((s) => (
                  <CommandItem
                    key={s}
                    value={s}
                    onSelect={() => {
                      onChange(country, s, '')
                      setOpenState(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        state === s ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {s}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Popover open={openCity} onOpenChange={setOpenCity}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={openCity}
            disabled={!state || state === 'all'}
            className="w-full justify-between bg-white shadow-sm border-slate-200 text-slate-700"
          >
            <span className="truncate">
              {city && city !== 'all'
                ? city
                : t('location.select_city', 'Select City')}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder={t('location.search_city', 'Search city...')}
            />
            <CommandList>
              <CommandEmpty>
                {t('location.no_city_found', 'No city found.')}
              </CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="all"
                  onSelect={() => {
                    onChange(country, state, '')
                    setOpenCity(false)
                  }}
                  className="font-semibold text-primary"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      !city || city === 'all' ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {t('common.all_cities', 'All Cities')}
                </CommandItem>
                {cities.map((c) => (
                  <CommandItem
                    key={c}
                    value={c}
                    onSelect={() => {
                      onChange(country, state, c)
                      setOpenCity(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        city === c ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {c}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
