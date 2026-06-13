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

  // Avoid infinite loops by updating local state only when props change significantly
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
      if (isDiff) {
        return {
          country,
          state,
          city,
          zip,
          street,
          number,
          neighborhood,
          lat,
          lng,
        }
      }
      return prev
    })
  }, [country, state, city, zip, street, number, neighborhood, lat, lng])

  const handleChange = (field: keyof AddressData, value: any) => {
    if (localData[field] === value) return
    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    onChange(newData)
  }

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    const c = localData.country
    if (c === 'Brasil' || c === 'Brazil' || c === 'BR') {
      if (val.length > 8) val = val.slice(0, 8)
      val = val.replace(/^(\d{5})(\d{0,3})/, '$1-$2').replace(/-$/, '')
    } else if (c === 'USA' || c === 'US' || c === 'United States') {
      if (val.length > 9) val = val.slice(0, 9)
      if (val.length > 5) {
        val = val.replace(/^(\d{5})(\d{0,4})/, '$1-$2').replace(/-$/, '')
      }
    }
    handleChange('zip', val)
  }

  const fetchCoordinates = async (query: string) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
      )
      const data = await res.json()
      if (data && data.length > 0) {
        handleChange('lat', parseFloat(data[0].lat))
        handleChange('lng', parseFloat(data[0].lon))
      }
    } catch (err) {
      console.error('Geocoding error:', err)
    }
  }

  const handleBlur = () => {
    if (localData.city && localData.state) {
      const parts = [
        localData.street,
        localData.city,
        localData.state,
        localData.zip,
        localData.country,
      ].filter(Boolean)
      fetchCoordinates(parts.join(', '))
    }
  }

  const statesList = Object.keys(
    LOCATION_DATA[localData.country || '']?.states || {},
  )
  const citiesList = localData.state
    ? LOCATION_DATA[localData.country || '']?.states[localData.state] || []
    : []

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>{t('profile.country', 'Country')}</Label>
        <Select
          value={localData.country}
          onValueChange={(val) => {
            const newData = { ...localData, country: val, state: '', city: '' }
            setLocalData(newData)
            onChange(newData)
          }}
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
        <Label>{t('admin.company.address.zip', 'ZIP Code')}</Label>
        <Input
          value={localData.zip || ''}
          onChange={handleZipChange}
          onBlur={handleBlur}
          placeholder={
            localData.country === 'Brasil' || localData.country === 'Brazil'
              ? '00000-000'
              : '00000'
          }
        />
      </div>

      <div className="space-y-2">
        <Label>{t('admin.company.address.state', 'State')}</Label>
        <Select
          value={localData.state}
          onValueChange={(val) => {
            const newData = { ...localData, state: val, city: '' }
            setLocalData(newData)
            onChange(newData)
          }}
          disabled={!localData.country || statesList.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select state" />
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
        <Label>{t('admin.company.address.city', 'City')}</Label>
        <div className="relative">
          <Input
            list="address-form-cities"
            value={localData.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            onBlur={handleBlur}
            placeholder="Type or select city"
            disabled={!localData.state}
          />
          <datalist id="address-form-cities">
            {citiesList.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t('admin.company.address.street', 'Street / Address')}</Label>
        <Input
          value={localData.street || ''}
          onChange={(e) => handleChange('street', e.target.value)}
          onBlur={handleBlur}
        />
      </div>

      <div className="space-y-2">
        <Label>{t('admin.company.address.number', 'Number')}</Label>
        <Input
          value={localData.number || ''}
          onChange={(e) => handleChange('number', e.target.value)}
          onBlur={handleBlur}
        />
      </div>

      <div className="space-y-2">
        <Label>{t('admin.company.address.neighborhood', 'Neighborhood')}</Label>
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
