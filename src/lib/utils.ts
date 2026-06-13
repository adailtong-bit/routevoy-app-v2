import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeString(str: string) {
  if (!str) return ''
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function formatCurrency(value: number | null | undefined) {
  if (value === undefined || value === null || isNaN(value as number)) return ''
  const locale =
    typeof window !== 'undefined'
      ? localStorage.getItem('app_locale') || 'pt-BR'
      : 'pt-BR'
  const currency =
    typeof window !== 'undefined'
      ? localStorage.getItem('app_currency') || 'BRL'
      : 'BRL'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value)
}

export function formatDate(date: string | Date | null | undefined) {
  if (!date) return ''
  const locale =
    typeof window !== 'undefined'
      ? localStorage.getItem('app_locale') || 'pt-BR'
      : 'pt-BR'
  return new Intl.DateTimeFormat(locale).format(new Date(date))
}

export function extractContactInfo(contacts: any[] | null) {
  if (!contacts || !Array.isArray(contacts)) return { phone: '', email: '' }
  const phone =
    contacts.find((c: any) => c.type === 'phone' || c.type === 'whatsapp')
      ?.value || ''
  const email = contacts.find((c: any) => c.type === 'email')?.value || ''
  return { phone, email }
}

export function formatAddress(address: any) {
  if (!address) return ''
  if (typeof address === 'string') return address
  const { street, number, city, state, country } = address
  const parts = [street, number, city, state, country].filter(Boolean)
  return parts.join(', ')
}
