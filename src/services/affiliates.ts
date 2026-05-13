import { supabase } from '@/lib/supabase/client'

export const searchAffiliateDeals = async (
  query: string,
  limit: number = 10,
  affiliateIds?: any,
) => {
  try {
    const { data, error } = await supabase.functions.invoke(
      'search-affiliate-deals',
      {
        body: { query, limit, affiliateIds },
      },
    )

    if (error) throw error

    return data?.items || []
  } catch (error) {
    console.error(
      'Error searching affiliate deals via Supabase Edge Function:',
      error,
    )
    return []
  }
}
