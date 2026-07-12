export interface GeoResult {
  lat: number
  lng: number
}

export interface CitySuggestion {
  name: string
  state: string
  country: string
  lat: number
  lng: number
}

const COUNTRY_CODE_MAP: Record<string, string> = {
  Brasil: 'br',
  Brazil: 'br',
  'United States': 'us',
  USA: 'us',
  Portugal: 'pt',
  France: 'fr',
  Germany: 'de',
  Italy: 'it',
  Spain: 'es',
  China: 'cn',
  Japan: 'jp',
  Mexico: 'mx',
}

export function getCountryCode(country: string): string {
  return COUNTRY_CODE_MAP[country] || ''
}

export async function geocodeAddress(query: string): Promise<GeoResult | null> {
  if (!query || query.trim().length < 3) return null
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
    )
    const data = await res.json()
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    }
  } catch {
    // ignore
  }
  return null
}

export async function searchCities(
  query: string,
  country?: string,
): Promise<CitySuggestion[]> {
  if (query.length < 3) return []
  try {
    const params = new URLSearchParams({
      format: 'json',
      q: query,
      addressdetails: '1',
      limit: '5',
      'accept-language': 'pt-BR,pt,en',
    })
    const code = country ? getCountryCode(country) : ''
    if (code) params.set('countrycodes', code)

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    )
    const data = await res.json()
    if (!Array.isArray(data)) return []

    return data
      .map((item: any) => ({
        name:
          item.address?.city ||
          item.address?.town ||
          item.address?.village ||
          item.address?.municipality ||
          item.name ||
          '',
        state: item.address?.state || '',
        country: item.address?.country || '',
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      }))
      .filter((s: CitySuggestion) => s.name)
  } catch {
    return []
  }
}

export function getCountryConfig(country: string) {
  const isBrazil = country === 'Brasil' || country === 'Brazil'
  const isUSA = country === 'USA' || country === 'United States'
  const isPortugal = country === 'Portugal'

  return {
    stateLabel: isBrazil
      ? 'Estado'
      : isPortugal
        ? 'Distrito'
        : isUSA
          ? 'State'
          : 'State/Province',
    cityLabel: isBrazil ? 'Cidade' : 'City',
    neighborhoodLabel: isBrazil
      ? 'Bairro'
      : isPortugal
        ? 'Freguesia'
        : 'Neighborhood/Area',
    streetLabel: isBrazil ? 'Rua / Logradouro' : 'Street / Address',
    numberLabel: isBrazil ? 'Número' : 'Number',
    isBrazil,
  }
}
