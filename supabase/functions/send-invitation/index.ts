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

    const authHeader = req.headers.get('Authorization')
    let inviter_id = null
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabaseClient.auth.getUser(token)
      if (user) {
        inviter_id = user.id
      }
    }

    const { email, name, role, company_id, franchise_id } = await req.json()

    if (!email) throw new Error('Email is required')

    // 1. Save invitation to DB
    const { error: invError } = await supabaseClient
      .from('user_invitations')
      .insert({
        email,
        role: role || 'attendant',
        company_id,
        franchise_id,
        status: 'pending',
        created_by: inviter_id
      })

    if (invError) {
      console.error('Error inserting invitation:', invError)
    }

    // 2. Try to create the user via Admin API
    const { data: userData, error: userError } =
      await supabaseClient.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { name, role: role || 'attendant' },
        password: 'ChangeMe123!', // Default password for invited users
      })

    let userId = userData?.user?.id

    if (userError) {
      if (userError.message.toLowerCase().includes('already exists')) {
        // User already exists, fetch their ID from profiles
        const { data: existingProfile } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('email', email)
            .maybeSingle()
            
        if (existingProfile) {
            userId = existingProfile.id
        } else {
            console.error('User exists in auth but not in profiles:', email)
        }
      } else {
        throw userError
      }
    }

    // Wait a brief moment to allow the handle_new_user trigger to execute
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 3. Update or Insert profile if we got a user ID
    if (userId && (company_id || franchise_id)) {
      const updates: any = { 
        id: userId,
        email: email,
        role: role || 'attendant'
      }
      if (name) updates.name = name
      if (company_id) updates.company_id = company_id
      if (franchise_id) updates.franchise_id = franchise_id
      
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .upsert(updates)

      if (profileError) {
        console.error('Error updating profile:', profileError)
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error("Function error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})
