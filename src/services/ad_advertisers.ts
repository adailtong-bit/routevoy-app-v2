import { supabase } from '@/lib/supabase/client'

export interface AdvertiserContact {
  name: string
  position: string
  phone: string
  email: string
}

export interface Advertiser {
  id?: string
  company_name: string
  contact_name?: string | null
  environment?: string
  tax_id?: string | null
  email?: string | null
  phone?: string | null
  street?: string | null
  address_number?: string | null
  city?: string | null
  state?: string | null
  zip?: string | null
  status?: string | null
  created_at?: string | null
  contacts?: AdvertiserContact[]
}

export const fetchAdvertisers = async (
  environment?: string,
): Promise<Advertiser[]> => {
  let query = supabase
    .from('ad_advertisers')
    .select('*')
    .order('created_at', { ascending: false })

  if (environment) {
    query = query.eq('environment', environment)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching advertisers:', error)
    throw new Error(error.message)
  }

  return data as Advertiser[]
}

export const createAdvertiser = async (
  advertiser: Advertiser,
): Promise<Advertiser> => {
  const { data, error } = await supabase
    .from('ad_advertisers')
    .insert([advertiser])
    .select()
    .single()

  if (error) {
    console.error('Error creating advertiser:', error)
    throw new Error(error.message)
  }

  return data as Advertiser
}
