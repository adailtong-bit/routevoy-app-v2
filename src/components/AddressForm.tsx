import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LOCATION_DATA } from '@/lib/locationData'
import { useLanguage } from '@/stores/LanguageContext'

interface AddressFormProps {
  country?: string
  state: string
  city: string
  allowedStates?: string[]
  allowedCities?: string[]
  onChange: (data: {
    country?: string
    state: string
    city: string
    zip?: string
    address?: string
  }) => void
}

export function AddressForm({
  country,
  state,
  city,
  allowedStates,
  allowedCities,
  onChange,
}: AddressFormProps) {
  const { t } = useLanguage()
  const [zip, setZip] = useState('')
  const [address, setAddress] = useState('')
  const [activeCountry, setActiveCountry] = useState(country || 'Brasil')

  useEffect(() => {
    if (country) setActiveCountry(country)
  }, [country])

  const availableStates = Object.keys(
    LOCATION_DATA[activeCountry]?.states || {},
  )
    .filter(
      (s) =>
        !allowedStates ||
        allowedStates.length === 0 ||
        allowedStates.includes(s),
    )
    .sort()

  const availableCities =
    activeCountry && state
      ? (LOCATION_DATA[activeCountry]?.states[state] || [])
          .filter(
            (c) =>
              !allowedCities ||
              allowedCities.length === 0 ||
              allowedCities.includes(c),
          )
          .sort()
      : []

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    // Dynamic Masking based on country
    if (
      activeCountry === 'Brasil' ||
      activeCountry === 'Brazil' ||
      activeCountry === 'BR'
    ) {
      if (val.length > 8) val = val.slice(0, 8)
      val = val.replace(/^(\d{5})(\d{0,3})/, '$1-$2').replace(/-$/, '')
    } else if (activeCountry === 'USA' || activeCountry === 'US') {
      if (val.length > 9) val = val.slice(0, 9)
      if (val.length > 5) {
        val = val.replace(/^(\d{5})(\d{0,4})/, '$1-$2').replace(/-$/, '')
      }
    } else {
      if (val.length > 10) val = val.slice(0, 10)
    }
    setZip(val)
    onChange({ country: activeCountry, state, city, zip: val, address })
  }

  const handleCountryChange = (val: string) => {
    setActiveCountry(val)
    onChange({ country: val, state: '', city: '', zip, address })
  }

  const handleStateChange = (val: string) => {
    const capital = LOCATION_DATA[activeCountry]?.states[val]?.[0] || ''
    onChange({
      country: activeCountry,
      state: val,
      city: capital,
      zip,
      address,
    })
  }

  return (
    <div className="space-y-4 animate-in slide-in-from-top-2">
      <div className="space-y-2">
        <Label>{t('address.country', 'Country')}</Label>
        <Select value={activeCountry} onValueChange={handleCountryChange}>
          <SelectTrigger>
            <SelectValue placeholder={t('address.country', 'Select Country')} />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(LOCATION_DATA).map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('address.zip', 'ZIP / Postal Code')}</Label>
          <Input
            value={zip}
            onChange={handleZipChange}
            placeholder={
              activeCountry === 'Brasil' || activeCountry === 'Brazil'
                ? '00000-000'
                : activeCountry === 'USA'
                  ? '33101'
                  : '00000'
            }
          />
        </div>
        <div className="space-y-2">
          <Label>{t('address.state', 'State / Province')}</Label>
          <Select
            value={state}
            onValueChange={handleStateChange}
            disabled={!activeCountry || availableStates.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('address.state', 'State')} />
            </SelectTrigger>
            <SelectContent>
              {availableStates.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t('address.city', 'City')}</Label>
        <div className="relative">
          <Input
            list="city-suggestions"
            value={city}
            onChange={(e) =>
              onChange({
                country: activeCountry,
                state,
                city: e.target.value,
                zip,
                address,
              })
            }
            placeholder={t('address.city', 'Type or select city')}
            disabled={!state}
          />
          <datalist id="city-suggestions">
            {availableCities.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t('address.street', 'Street Address')}</Label>
        <Input
          value={address}
          onChange={(e) => {
            setAddress(e.target.value)
            onChange({
              country: activeCountry,
              state,
              city,
              zip,
              address: e.target.value,
            })
          }}
          placeholder={
            activeCountry === 'Brasil' || activeCountry === 'Brazil'
              ? 'Rua Paulista, 1000'
              : '123 Ocean Drive'
          }
        />
      </div>
    </div>
  )
}
