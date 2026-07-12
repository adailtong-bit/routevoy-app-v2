import React, { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LOCATION_DATA, COUNTRIES } from '@/lib/locationData'
import { useLanguage } from '@/stores/LanguageContext'
import {
  formatPostalCode,
  isPostalCodeComplete,
  lookupCep,
  getPostalCodeLabel,
  getPostalCodePlaceholder,
} from '@/lib/postal-code'
import { geocodeAddress, getCountryConfig } from '@/lib/geocoding'
import { CityAutocomplete } from '@/components/CityAutocomplete'

interface AddressData {
  country?: string
  state?: string
  city?: string
  zip?: string
  street?: string
  number?: string
  neighborhood?: string
  lat?: number
  lng?: number
}

interface AddressFormProps {
  country?: string
  state?: string
  city?: string
  zip?: string
  street?: string
  number?: string
  neighborhood?: string
  lat?: number
  lng?: number
  onChange: (data: AddressData) => void
}

export function AddressForm({
  country = 'Brasil',
  state = '',
  city = '',
  zip = '',
  street = '',
  number = '',
  neighborhood = '',
  lat,
  lng,
  onChange,
}: AddressFormProps) {
  const { t } = useLanguage()

  const [localData, setLocalData] = useState<AddressData>({
    country,
    state,
    city,
    zip,
    street,
    number,
    neighborhood,
    lat,
    lng,
  })

  useEffect(() => {
    setLocalData((prev) => {
      const isDiff =
        prev.country !== country ||
        prev.state !== state ||
        prev.city !== city ||
        prev.zip !== zip ||
        prev.street !== street ||
        prev.number !== number ||
        prev.neighborhood !== neighborhood ||
        prev.lat !== lat ||
        prev.lng !== lng
      return isDiff
        ? { country, state, city, zip, street, number, neighborhood, lat, lng }
        : prev
    })
  }, [country, state, city, zip, street, number, neighborhood, lat, lng])

  const updateFields = (updates: Partial<AddressData>) => {
    const newData = { ...localData, ...updates }
    setLocalData(newData)
    onChange(newData)
  }

  const handleChange = (field: keyof AddressData, value: any) => {
    if (localData[field] === value) return
    updateFields({ [field]: value })
  }

  const triggerGeocoding = async (data: AddressData) => {
    if (!data.city && !data.zip) return
    const parts = [
      data.street,
      data.number,
      data.city,
      data.state,
      data.zip,
      data.country,
    ].filter(Boolean)
    const result = await geocodeAddress(parts.join(', '))
    if (result) {
      updateFields({ lat: result.lat, lng: result.lng })
    }
  }

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPostalCode(e.target.value, localData.country || '')
    handleChange('zip', formatted)

    const isBrazil =
      localData.country === 'Brasil' || localData.country === 'Brazil'
    if (isPostalCodeComplete(formatted, localData.country || '') && isBrazil) {
      lookupCep(formatted).then((result) => {
        if (result) {
          const merged = {
            street: result.street || localData.street || '',
            neighborhood: result.neighborhood || localData.neighborhood || '',
            city: result.city || localData.city || '',
            state: result.state || localData.state || '',
          }
          updateFields(merged)
          triggerGeocoding({ ...localData, ...merged })
        }
      })
    }
  }

  const handleCitySelect = (
    cityName: string,
    stateName?: string,
    cityLat?: number,
    cityLng?: number,
  ) => {
    const updates: Partial<AddressData> = { city: cityName }
    if (stateName && !localData.state) updates.state = stateName
    if (cityLat !== undefined) updates.lat = cityLat
    if (cityLng !== undefined) updates.lng = cityLng
    updateFields(updates)
  }

  const handleBlur = () => {
    triggerGeocoding(localData)
  }

  const config = getCountryConfig(localData.country || '')
  const statesList = Object.keys(
    LOCATION_DATA[localData.country || '']?.states || {},
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>{t('profile.country', 'Country')}</Label>
        <Select
          value={localData.country}
          onValueChange={(val) =>
            updateFields({ country: val, state: '', city: '' })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{getPostalCodeLabel(localData.country || '')}</Label>
        <Input
          value={localData.zip || ''}
          onChange={handleZipChange}
          onBlur={handleBlur}
          placeholder={getPostalCodePlaceholder(localData.country || '')}
        />
      </div>

      <div className="space-y-2">
        <Label>{config.stateLabel}</Label>
        <Select
          value={localData.state}
          onValueChange={(val) => updateFields({ state: val })}
          disabled={!localData.country || statesList.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {statesList.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{config.cityLabel}</Label>
        <CityAutocomplete
          value={localData.city || ''}
          onChange={handleCitySelect}
          onBlur={handleBlur}
          placeholder="Type to search city"
          country={localData.country}
        />
      </div>

      <div className="space-y-2">
        <Label>{config.streetLabel}</Label>
        <Input
          value={localData.street || ''}
          onChange={(e) => handleChange('street', e.target.value)}
          onBlur={handleBlur}
        />
      </div>

      <div className="space-y-2">
        <Label>{config.numberLabel}</Label>
        <Input
          value={localData.number || ''}
          onChange={(e) => handleChange('number', e.target.value)}
          onBlur={handleBlur}
        />
      </div>

      <div className="space-y-2">
        <Label>{config.neighborhoodLabel}</Label>
        <Input
          value={localData.neighborhood || ''}
          onChange={(e) => handleChange('neighborhood', e.target.value)}
          onBlur={handleBlur}
        />
      </div>

      <div className="space-y-2">
        <Label>{t('admin.company.address.lat', 'Latitude')}</Label>
        <Input
          type="number"
          step="any"
          value={localData.lat ?? ''}
          onChange={(e) => handleChange('lat', parseFloat(e.target.value))}
        />
      </div>

      <div className="space-y-2">
        <Label>{t('admin.company.address.lng', 'Longitude')}</Label>
        <Input
          type="number"
          step="any"
          value={localData.lng ?? ''}
          onChange={(e) => handleChange('lng', parseFloat(e.target.value))}
        />
      </div>
    </div>
  )
}
