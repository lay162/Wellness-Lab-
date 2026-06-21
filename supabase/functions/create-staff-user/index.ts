import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Unauthorized' }, 401)

    const { email, fullName, tempPassword } = await req.json()
    if (!email || !fullName || !tempPassword) {
      return json({ error: 'Email, full name, and temporary password are required' }, 400)
    }
    if (String(tempPassword).length < 8) {
      return json({ error: 'Temporary password must be at least 8 characters' }, 400)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) return json({ error: 'Unauthorized' }, 401)

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    const { data: caller } = await supabaseAdmin
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .single()

    if (caller?.role !== 'admin' || caller?.status !== 'approved') {
      return json({ error: 'Admin access required' }, 403)
    }

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: String(email).trim().toLowerCase(),
      password: String(tempPassword),
      email_confirm: true,
      user_metadata: {
        full_name: String(fullName).trim(),
        is_staff_provisioned: true,
      },
    })

    if (createError) return json({ error: createError.message }, 400)

    await supabaseAdmin.from('profiles').update({
      role: 'admin',
      status: 'approved',
      must_change_password: true,
      full_name: String(fullName).trim(),
    }).eq('id', created.user.id)

    return json({ success: true, userId: created.user.id })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Unknown error' }, 500)
  }
})
