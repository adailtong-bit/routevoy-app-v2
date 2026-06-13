import React, { useEffect } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/stores/LanguageContext'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  countryCode?: string
  className?: string
}

const COUNTRIES = [
  { name: 'USA', code: 'US', dial: '+1', mask: '(999) 999-9999' },
  { name: 'Brazil', code: 'BR', dial: '+55', mask: '(99) 99999-9999' },
  { name: 'Mexico', code: 'MX', dial: '+52', mask: '99 9999 9999' },
  { name: 'Portugal', code: 'PT', dial: '+351', mask: '999 999 999' },
  { name: 'Spain', code: 'ES', dial: '+34', mask: '999 99 99 99' },
  { name: 'France', code: 'FR', dial: '+33', mask: '9 99 99 99 99' },
  { name: 'Germany', code: 'DE', dial: '+49', mask: '9999 999999' },
  { name: 'Italy', code: 'IT', dial: '+39', mask: '399 999 9999' },
  { name: 'China', code: 'CN', dial: '+86', mask: '199 9999 9999' },
  { name: 'Japan', code: 'JP', dial: '+81', mask: '090-9999-9999' },
]

export function PhoneInput({
  value,
  onChange,
  countryCode,
  className,
}: PhoneInputProps) {
  const { language } = useLanguage()
  const [country, setCountry] = React.useState(COUNTRIES[0])
  const [phoneNumber, setPhoneNumber] = React.useState('')

  // Automatically adjust default country based on Language Context or Prop
  useEffect(() => {
    let targetCode = countryCode

    // If no explicit country code provided, guess based on language
    if (!targetCode) {
      if (language === 'pt') targetCode = 'BR'
      else if (language === 'en') targetCode = 'US'
      else if (language === 'es') targetCode = 'ES'
      else if (language === 'fr') targetCode = 'FR'
      else if (language === 'de') targetCode = 'DE'
      else if (language === 'it') targetCode = 'IT'
      else if (language === 'zh') targetCode = 'CN'
      else if (language === 'ja') targetCode = 'JP'
    }

    if (targetCode) {
      const found = COUNTRIES.find(
        (c) =>
          c.name === targetCode ||
          c.code === targetCode ||
          (targetCode.includes('Brasil') && c.code === 'BR') ||
          (targetCode.includes('Brazil') && c.code === 'BR') ||
          (targetCode.includes('Mexico') && c.code === 'MX') ||
          (targetCode.includes('US') && c.code === 'US'),
      )
      if (found && found.code !== country.code) {
        setCountry(found)
      }
    }
  }, [countryCode, language, country.code])

  useEffect(() => {
    if (value) {
      let cleanValue = value

      if (cleanValue.startsWith(country.dial)) {
        cleanValue = cleanValue.replace(country.dial, '').trim()
      } else {
        // Try to match other dials if possible
        const hasDial = COUNTRIES.find((c) => value.startsWith(c.dial))
        if (hasDial && hasDial.dial !== country.dial) {
          setCountry(hasDial)
          cleanValue = value.replace(hasDial.dial, '').trim()
        }
      }

      setPhoneNumber(cleanValue)
    }
  }, [value, country.dial])

  const handleCountryChange = (val: string) => {
    const newCountry = COUNTRIES.find((c) => c.code === val) || COUNTRIES[0]
    setCountry(newCountry)
    onChange(`${newCountry.dial} ${phoneNumber}`)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    let formatted = val

    // Apply specific masks
    if (country.code === 'BR') {
      if (val.length > 11) val = val.slice(0, 11)
      if (val.length > 10) {
        formatted = val.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
      } else if (val.length > 2) {
        formatted = val.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
      }
    } else if (country.code === 'US') {
      if (val.length > 10) val = val.slice(0, 10)
      if (val.length > 6) {
        formatted = val.replace(/^(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
      } else if (val.length > 3) {
        formatted = val.replace(/^(\d{3})(\d{0,3})/, '($1) $2')
      }
    } else if (country.code === 'JP') {
      if (val.length > 11) val = val.slice(0, 11)
      if (val.length > 7) {
        formatted = val.replace(/^(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
      }
    } else {
      if (val.length > 15) val = val.slice(0, 15) // Max generic length
      formatted = val
    }

    setPhoneNumber(formatted)
    onChange(`${country.dial} ${formatted}`)
  }

  return (
    <div className={cn('flex gap-2', className)}>
      <Select value={country.code} onValueChange={handleCountryChange}>
        <SelectTrigger className="w-[110px] shrink-0">
          <SelectValue placeholder="Code" />
        </SelectTrigger>
        <SelectContent>
          {COUNTRIES.map((c) => (
            <SelectItem key={c.code} value={c.code}>
              <span className="mr-1 font-bold">{c.code}</span> {c.dial}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        value={phoneNumber}
        onChange={handlePhoneChange}
        placeholder={country.mask}
        className="flex-1"
        type="tel"
      />
    </div>
  )
}
