import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

Deno.serve(async (req) => {
  try {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const { data: txs } = await supabase
      .from('financial_ledger')
      .select('amount, status')
      .gte('created_at', oneWeekAgo.toISOString())
    const totalTransactions = txs?.length || 0
    const completedTxs = txs?.filter((t) => t.status === 'completed') || []
    const totalVolume = completedTxs.reduce(
      (acc, t) => acc + Number(t.amount),
      0,
    )

    const { data: campaigns } = await supabase
      .from('ad_campaigns')
      .select('id, views, clicks')
      .eq('status', 'active')
    const activeCampaigns = campaigns?.length || 0
    const totalClicks =
      campaigns?.reduce((acc, c) => acc + Number(c.clicks || 0), 0) || 0

    // Construct the summary
    const summary = {
      totalTransactions,
      completedVolume: totalVolume,
      activeCampaigns,
      totalClicks,
      period: `${oneWeekAgo.toISOString().split('T')[0]} to ${new Date().toISOString().split('T')[0]}`,
    }

    // In a real scenario, we would trigger send-email function here
    // await supabase.functions.invoke('send-email', { body: { to: 'admin@routevoy.com', subject: 'Weekly Summary', text: JSON.stringify(summary) } })

    // Log the summary generation
    await supabase
      .from('site_settings')
      .upsert({ key: `weekly_summary_${Date.now()}`, value: summary })

    return new Response(JSON.stringify({ success: true, digest: summary }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
