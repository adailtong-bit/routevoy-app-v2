import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      },
    )

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { invoice_id, payment_method } = await req.json()
    if (!invoice_id) {
      throw new Error('Missing invoice_id')
    }

    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('ad_invoices')
      .select('*')
      .eq('id', invoice_id)
      .single()

    if (invoiceError || !invoice) {
      throw new Error('Invoice not found or unauthorized')
    }

    if (invoice.status === 'paid') {
      throw new Error('Invoice already paid')
    }

    /* 
    // Real Stripe Integration (Uncomment when STRIPE_SECRET_KEY is configured)
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(invoice.amount * 100),
      currency: 'usd',
      payment_method: payment_method,
      confirm: true,
      return_url: `${Deno.env.get('FRONTEND_URL')}/merchant/finance`,
    });

    const gateway_reference = paymentIntent.id;
    */

    // Simulated Gateway Reference for Demo/Testing
    const gateway_reference = `gw_sim_${Math.random().toString(36).substr(2, 12)}`

    // Update invoice status using admin client
    const { error: updateError } = await supabaseAdmin
      .from('ad_invoices')
      .update({ status: 'paid', gateway_reference })
      .eq('id', invoice_id)

    if (updateError) throw updateError

    // Insert to financial_ledger
    const { error: ledgerError } = await supabaseAdmin
      .from('financial_ledger')
      .insert({
        company_id: invoice.advertiser_id,
        amount: invoice.amount,
        type: 'credit',
        description: `Payment for Ad Invoice ${invoice.reference_number}`,
        category: 'ads',
        status: 'completed',
        reference_id: invoice.id,
        reference_type: 'ad_invoice',
      })

    if (ledgerError) {
      console.error('Error inserting ledger:', ledgerError)
    }

    // Auto-approve campaign if needed
    if (invoice.ad_id) {
      const { data: campaign } = await supabaseAdmin
        .from('ad_campaigns')
        .select('status')
        .eq('id', invoice.ad_id)
        .single()

      if (campaign && campaign.status === 'pending') {
        await supabaseAdmin
          .from('ad_campaigns')
          .update({ status: 'active' })
          .eq('id', invoice.ad_id)
      }
    }

    return new Response(
      JSON.stringify({ success: true, invoice_id, gateway_reference }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
