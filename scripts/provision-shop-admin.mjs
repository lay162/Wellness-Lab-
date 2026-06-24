/**
 * One-time: create the shared shop admin login (support@thewellnesslab.uk).
 *
 * Requires in .env (do NOT commit the service role key):
 *   SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret
 *
 * Run: node scripts/provision-shop-admin.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { existsSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const ADMIN_EMAIL = 'support@thewellnesslab.uk'
const TEMP_PASSWORD = 'WellnessLab26'
const FULL_NAME = 'Chan & Jordan — Wellness Lab'

function loadEnv() {
  const path = join(root, '.env')
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const i = trimmed.indexOf('=')
    if (i === -1) continue
    const key = trimmed.slice(0, i).trim()
    const val = trimmed.slice(i + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
}

loadEnv()

const url = process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url) {
  console.error('Missing VITE_SUPABASE_URL in .env')
  process.exit(1)
}

if (!serviceKey) {
  console.error(`
Missing SUPABASE_SERVICE_ROLE_KEY in .env

1. Supabase Dashboard → Project Settings → API
2. Copy the "service_role" secret key (not the publishable/anon key)
3. Add one line to .env:
   SUPABASE_SERVICE_ROLE_KEY=eyJ...

4. Re-run: node scripts/provision-shop-admin.mjs
5. Remove the service role line from .env when done (never commit it)

Or create the user manually in Dashboard → Authentication → Users → Add user
then run supabase/admin-setup.sql in the SQL Editor.
`)
  process.exit(1)
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function findUserByEmail(email) {
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 })
  if (error) throw error
  return data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase()) ?? null
}

async function main() {
  console.log(`Provisioning shop admin: ${ADMIN_EMAIL}`)

  let user = await findUserByEmail(ADMIN_EMAIL)

  if (user) {
    console.log('User already exists — updating password and admin profile…')
    const { error } = await admin.auth.admin.updateUserById(user.id, {
      password: TEMP_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: FULL_NAME,
        is_staff_provisioned: true,
      },
    })
    if (error) throw error
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: TEMP_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: FULL_NAME,
        is_staff_provisioned: true,
      },
    })
    if (error) throw error
    user = data.user
    console.log('Created auth user:', user.id)
  }

  const { error: profileError } = await admin.from('profiles').upsert({
    id: user.id,
    full_name: FULL_NAME,
    email: ADMIN_EMAIL,
    company_name: 'The Wellness Lab',
    role: 'admin',
    status: 'approved',
    must_change_password: true,
    terms_accepted: true,
    compliance_accepted: true,
  }, { onConflict: 'id' })

  if (profileError) {
    const { error: updateError } = await admin.from('profiles').update({
      full_name: FULL_NAME,
      role: 'admin',
      status: 'approved',
      must_change_password: true,
      company_name: 'The Wellness Lab',
    }).eq('id', user.id)
    if (updateError) throw updateError
  }

  console.log(`
Done. Share with Chan & Jordan:

  Admin login:  https://thewellnesslab.uk/private-portal/login?mode=admin
  Email:        ${ADMIN_EMAIL}
  Temp password: ${TEMP_PASSWORD}

They will be prompted to set a new password on first sign-in, then land on the admin dashboard.
`)
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
