import { supabase } from './supabase'

export function generateTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let pwd = ''
  for (let i = 0; i < 12; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)]
  }
  return pwd
}

export async function createStaffUser({ email, fullName, tempPassword }) {
  const { data, error } = await supabase.functions.invoke('create-staff-user', {
    body: { email, fullName, tempPassword },
  })
  if (error) return { error }
  if (data?.error) return { error: new Error(data.error) }
  return { data }
}
