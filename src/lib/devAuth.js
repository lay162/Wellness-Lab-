/** Local development only — never active in production builds. */
export function isDevBypass() {
  return import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_AUTH === 'true'
}

const DEV_STORAGE_KEY = 'wl_dev_role'
const DEV_PROFILE_KEY = 'wl_dev_profile'

export const DEV_PROFILES = {
  admin: {
    id: '00000000-0000-0000-0000-000000000001',
    full_name: 'Dev Admin',
    email: 'admin@thewellnesslab.uk',
    phone: '',
    company_name: 'The Wellness Lab',
    role: 'admin',
    status: 'approved',
    must_change_password: false,
    billing_same_as_home: true,
    delivery_same_as_billing: true,
    home_country: 'United Kingdom',
    billing_country: 'United Kingdom',
    delivery_country: 'United Kingdom',
    payment_provider: null,
    payment_customer_id: null,
    created_at: new Date().toISOString(),
  },
  customer: {
    id: '00000000-0000-0000-0000-000000000002',
    full_name: 'Dev Customer',
    email: 'customer@thewellnesslab.uk',
    phone: '',
    company_name: '',
    role: 'customer',
    status: 'approved',
    must_change_password: false,
    billing_same_as_home: true,
    delivery_same_as_billing: true,
    home_country: 'United Kingdom',
    billing_country: 'United Kingdom',
    delivery_country: 'United Kingdom',
    payment_provider: null,
    payment_customer_id: null,
    created_at: new Date().toISOString(),
  },
}

export function getDevProfileOverrides(role) {
  if (!isDevBypass() || !role) return {}
  try {
    const raw = sessionStorage.getItem(`${DEV_PROFILE_KEY}_${role}`)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveDevProfileOverrides(role, data) {
  sessionStorage.setItem(`${DEV_PROFILE_KEY}_${role}`, JSON.stringify(data))
}

export function mergeDevProfile(role) {
  return { ...DEV_PROFILES[role], ...getDevProfileOverrides(role) }
}

export function getStoredDevRole() {
  if (!isDevBypass()) return null
  const role = sessionStorage.getItem(DEV_STORAGE_KEY)
  return role === 'admin' || role === 'customer' ? role : null
}

export function storeDevRole(role) {
  sessionStorage.setItem(DEV_STORAGE_KEY, role)
}

export function clearDevRole() {
  sessionStorage.removeItem(DEV_STORAGE_KEY)
}

export function devUserFromProfile(profile) {
  return { id: profile.id, email: profile.email }
}
