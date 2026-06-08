import { supabase } from '@/lib/supabase/client'

export interface CreateItineraryDTO {
  title: string
  destination?: string
  start_date?: string
  end_date?: string
  description?: string
}

export interface Itinerary {
  id: string
  user_id: string
  title: string
  destination: string | null
  start_date: string | null
  end_date: string | null
  description: string | null
  created_at: string
}

export interface CreateItineraryItemDTO {
  itinerary_id: string
  type: 'hotel' | 'activity' | 'coupon' | 'car_rental' | 'museum'
  title: string
  description?: string | null
  address?: string | null
  start_time?: string | null
  end_time?: string | null
  reference_id?: string | null
}

export interface ItineraryItem extends CreateItineraryItemDTO {
  id: string
  created_at: string
}

export const itineraryService = {
  async create(data: CreateItineraryDTO) {
    const { data: userAuth } = await supabase.auth.getUser()
    if (!userAuth.user) throw new Error('User not authenticated')

    const {
      data: created,
      error,
      status,
    } = await supabase
      .from('itineraries' as any)
      .insert({
        ...data,
        user_id: userAuth.user.id,
      })
      .select()
      .single()

    if (error) throw error
    if (status && (status < 200 || status >= 300))
      throw new Error('Failed to create itinerary: Unexpected status code')
    return created as Itinerary
  },

  async getAll() {
    const { data: userAuth } = await supabase.auth.getUser()
    if (!userAuth.user) return []

    const { data, error } = await supabase
      .from('itineraries' as any)
      .select('*')
      .eq('user_id', userAuth.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Itinerary[]
  },

  async update(id: string, data: Partial<CreateItineraryDTO>) {
    const { data: updated, error } = await supabase
      .from('itineraries' as any)
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return updated as Itinerary
  },

  async updateDates(
    id: string,
    data: {
      start_date?: string | null
      end_date?: string | null
      title?: string | null
      destination?: string | null
      description?: string | null
    },
  ) {
    const { data: result, error } = await supabase.rpc(
      'update_itinerary_dates' as any,
      {
        p_itinerary_id: id,
        p_new_start_date: data.start_date
          ? data.start_date.split('T')[0]
          : null,
        p_new_end_date: data.end_date ? data.end_date.split('T')[0] : null,
        p_title: data.title || null,
        p_destination: data.destination || null,
        p_description: data.description || null,
      },
    )

    if (error) throw error
    if (result && !result.success) throw new Error(result.message)
    return result
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('itineraries' as any)
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  async getItems(itineraryId: string) {
    const { data, error } = await supabase
      .from('itinerary_items' as any)
      .select('*')
      .eq('itinerary_id', itineraryId)
      .order('start_time', { ascending: true, nullsFirst: false })

    if (error) throw error
    return data as ItineraryItem[]
  },

  async addItem(data: CreateItineraryItemDTO) {
    const { data: created, error } = await supabase
      .from('itinerary_items' as any)
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return created as ItineraryItem
  },

  async deleteItem(id: string) {
    const { error } = await supabase
      .from('itinerary_items' as any)
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  async updateItem(id: string, data: Partial<CreateItineraryItemDTO>) {
    const { data: updated, error } = await supabase
      .from('itinerary_items' as any)
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return updated as ItineraryItem
  },
}
