import { Input } from '@/components/ui/input'
import React, { useState, useEffect } from 'react'

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string
  onChange: (value: string) => void
  countryCode?: 'BR' | 'US' | string
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, countryCode = 'BR', ...props }, ref) => {
    const [localValue, setLocalValue] = useState(value || '')

    useEffect(() => {
      if (value !== undefined && value !== localValue) {
        setLocalValue(value)
      }
    }, [value])

    const applyMask = (val: string, code: string) => {
      let digits = val.replace(/\D/g, '')
      if (code === 'US') {
        if (digits.length > 10) digits = digits.slice(0, 10)
        if (digits.length <= 3) return digits
        if (digits.length <= 6)
          return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
      } else {
        // BR Mask
        if (digits.length > 11) digits = digits.slice(0, 11)
        if (digits.length <= 2) return digits
        if (digits.length <= 7)
          return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const masked = applyMask(e.target.value, countryCode)
      setLocalValue(masked)
      if (onChange) onChange(masked)
    }

    return (
      <Input
        {...props}
        ref={ref}
        value={localValue}
        onChange={handleChange}
        placeholder={
          countryCode === 'US' ? '(000) 000-0000' : '(00) 00000-0000'
        }
      />
    )
  },
)
PhoneInput.displayName = 'PhoneInput'
