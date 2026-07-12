interface CepResult {
  street: string
  neighborhood: string
  city: string
  state: string
}

export function formatPostalCode(value: string, country: string): string {
  const digits = value.replace(/\D/g, '')
  if (country === 'Brasil' || country === 'Brazil') {
    const limited = digits.slice(0, 8)
    if (limited.length > 5) {
      return limited.replace(/^(\d{5})(\d{0,3})/, '$1-$2').replace(/-$/, '')
    }
    return limited
  }
  if (country === 'USA' || country === 'United States') {
    const limited = digits.slice(0, 9)
    if (limited.length > 5) {
      return limited.replace(/^(\d{5})(\d{0,4})/, '$1-$2').replace(/-$/, '')
    }
    return limited
  }
  if (country === 'Portugal') {
    const limited = digits.slice(0, 7)
    if (limited.length > 4) {
      return limited.replace(/^(\d{4})(\d{0,3})/, '$1-$2').replace(/-$/, '')
    }
    return limited
  }
  return value
}

export function isPostalCodeComplete(value: string, country: string): boolean {
  const digits = value.replace(/\D/g, '')
  if (country === 'Brasil' || country === 'Brazil') return digits.length === 8
  if (country === 'USA' || country === 'United States')
    return digits.length >= 5
  if (country === 'Portugal') return digits.length >= 7
  return digits.length >= 3
}

export async function lookupCep(cep: string): Promise<CepResult | null> {
  const digits = cep.replace(/\D/g, '')
  if (digits.length !== 8) return null
  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
    const data = await res.json()
    if (data.erro) return null
    return {
      street: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
    }
  } catch {
    return null
  }
}

export function getPostalCodeLabel(country: string): string {
  if (country === 'Brasil' || country === 'Brazil') return 'CEP'
  if (country === 'USA' || country === 'United States') return 'Zip Code'
  if (country === 'Portugal') return 'Código Postal'
  return 'Postal Code'
}

export function getPostalCodePlaceholder(country: string): string {
  if (country === 'Brasil' || country === 'Brazil') return '00000-000'
  if (country === 'USA' || country === 'United States') return '00000-0000'
  if (country === 'Portugal') return '0000-000'
  return '00000'
}
