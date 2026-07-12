import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { searchCities, type CitySuggestion } from '@/lib/geocoding'

interface CityAutocompleteProps {
  value: string
  onChange: (city: string, state?: string, lat?: number, lng?: number) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  country?: string
}

export function CityAutocomplete({
  value,
  onChange,
  onBlur,
  placeholder,
  disabled,
  country,
}: CityAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.length < 3) {
      setSuggestions([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      const results = await searchCities(value, country)
      setSuggestions(results)
      setLoading(false)
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [value, country])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (suggestion: CitySuggestion) => {
    onChange(suggestion.name, suggestion.state, suggestion.lat, suggestion.lng)
    setShowSuggestions(false)
    setSuggestions([])
  }

  return (
    <div className="relative" ref={containerRef}>
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setShowSuggestions(true)
        }}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
      />
      {showSuggestions && (suggestions.length > 0 || loading) && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-48 overflow-y-auto">
          {loading && (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              Buscando...
            </div>
          )}
          {suggestions.map((s, i) => (
            <button
              key={`${s.name}-${i}`}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
              onClick={() => handleSelect(s)}
            >
              <span className="font-medium">{s.name}</span>
              {s.state && (
                <span className="text-muted-foreground">, {s.state}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
