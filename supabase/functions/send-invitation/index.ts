import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } },
    )

    const { email, name, role, company_id } = await req.json()

    if (!email) throw new Error('Email is required')

    // Create user via Admin API
    const { data: userData, error: userError } =
      await supabaseClient.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { name, role: role || 'merchant' },
        password: 'ChangeMe123!', // Default password for invited users
      })

    if (userError) throw userError

    // Wait a brief moment to allow the handle_new_user trigger to execute
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Update profile
    if (userData.user && company_id) {
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .update({ company_id, role: role || 'merchant', name })
        .eq('id', userData.user.id)

      if (profileError) {
        console.error('Error updating profile:', profileError)
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
