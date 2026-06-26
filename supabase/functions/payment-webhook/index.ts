import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    })
  }

  try {
    const payload = await req.json()
    // Expected structure (example for Stripe/Pagar.me abstracted):
    // { event: 'payment.success' | 'payment.failed', data: { reference_id: string, amount: number, type: 'invoice' | 'ledger' } }

    if (payload.event === 'payment.success') {
      if (payload.data?.type === 'invoice') {
        await supabase
          .from('ad_invoices')
          .update({ status: 'paid' })
          .eq('id', payload.data.reference_id)
      } else {
        await supabase
          .from('financial_ledger')
          .update({ status: 'completed' })
          .eq('reference_id', payload.data.reference_id)
      }
    } else if (payload.event === 'payment.failed') {
      if (payload.data?.type === 'invoice') {
        await supabase
          .from('ad_invoices')
          .update({ status: 'draft' })
          .eq('id', payload.data.reference_id) // or payment_failed status
      } else {
        await supabase
          .from('financial_ledger')
          .update({ status: 'failed' })
          .eq('reference_id', payload.data.reference_id)
      }
    }

    // Log the webhook
    await supabase
      .from('site_settings')
      .insert({
        key: `webhook_log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        value: payload,
      })

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
