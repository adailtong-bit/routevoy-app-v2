import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Fetch approved/published promotions that have links
    const { data: promotions, error } = await supabaseClient
      .from('discovered_promotions')
      .select('id, product_link, source_url')
      .in('status', ['approved', 'published'])

    if (error) throw error

    let expiredCount = 0
    const results = []

    for (const promo of promotions || []) {
      const link = promo.product_link || promo.source_url
      if (!link || !link.startsWith('http')) {
        continue
      }

      try {
        const response = await fetch(link, {
          method: 'GET',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          },
        })

        // If page is not found (404) or gone (410)
        if (response.status === 404 || response.status === 410) {
          await supabaseClient
            .from('discovered_promotions')
            .update({ status: 'expired', is_verified: false })
            .eq('id', promo.id)

          expiredCount++
          results.push({
            id: promo.id,
            link,
            status: 'expired',
            reason: `HTTP ${response.status}`,
          })
        } else if (response.ok) {
          await supabaseClient
            .from('discovered_promotions')
            .update({ is_verified: true })
            .eq('id', promo.id)

          results.push({
            id: promo.id,
            link,
            status: 'active',
            reason: `HTTP ${response.status}`,
          })
        } else {
          results.push({
            id: promo.id,
            link,
            status: 'active',
            reason: `HTTP ${response.status} (Not 404/410, keeping active)`,
          })
        }
      } catch (err: any) {
        results.push({
          id: promo.id,
          link,
          status: 'error',
          reason: err.message,
        })
      }

      // Delay to avoid being aggressive against single domains
      await new Promise((resolve) => setTimeout(resolve, 800))
    }

    if (expiredCount > 0) {
      await supabaseClient.from('audit_logs').insert({
        action: 'SYSTEM_CRON',
        entity_type: 'promotion',
        details: `Varredura noturna concluída: ${expiredCount} ofertas marcadas como expiradas.`,
        user_email: 'system@routevoy.com',
      })
    }

    return new Response(
      JSON.stringify({ success: true, expiredCount, results }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
