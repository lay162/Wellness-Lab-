export const DEFAULT_COUNTRY = 'United Kingdom'

export const EMPTY_ADDRESS = {
  line1: '',
  line2: '',
  city: '',
  county: '',
  postcode: '',
  country: DEFAULT_COUNTRY,
}

export function pickAddressFromProfile(profile, prefix) {
  return {
    line1: profile?.[`${prefix}_line1`] || '',
    line2: profile?.[`${prefix}_line2`] || '',
    city: profile?.[`${prefix}_city`] || '',
    county: profile?.[`${prefix}_county`] || '',
    postcode: profile?.[`${prefix}_postcode`] || '',
    country: profile?.[`${prefix}_country`] || DEFAULT_COUNTRY,
  }
}

export function addressToProfileFields(prefix, addr) {
  return {
    [`${prefix}_line1`]: addr.line1?.trim() || null,
    [`${prefix}_line2`]: addr.line2?.trim() || null,
    [`${prefix}_city`]: addr.city?.trim() || null,
    [`${prefix}_county`]: addr.county?.trim() || null,
    [`${prefix}_postcode`]: addr.postcode?.trim() || null,
    [`${prefix}_country`]: addr.country?.trim() || DEFAULT_COUNTRY,
  }
}

export function profileToAddressForm(profile) {
  const home = pickAddressFromProfile(profile, 'home')
  const billingSame = profile?.billing_same_as_home ?? true
  const deliverySame = profile?.delivery_same_as_billing ?? true

  return {
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    company_name: profile?.company_name || '',
    ...flattenAddress('home', home),
    billing_same_as_home: billingSame,
    delivery_same_as_billing: deliverySame,
    ...flattenAddress('billing', billingSame ? home : pickAddressFromProfile(profile, 'billing')),
    ...flattenAddress('delivery', deliverySame
      ? (billingSame ? home : pickAddressFromProfile(profile, 'billing'))
      : pickAddressFromProfile(profile, 'delivery')),
  }
}

function flattenAddress(prefix, addr) {
  return {
    [`${prefix}_line1`]: addr.line1,
    [`${prefix}_line2`]: addr.line2,
    [`${prefix}_city`]: addr.city,
    [`${prefix}_county`]: addr.county,
    [`${prefix}_postcode`]: addr.postcode,
    [`${prefix}_country`]: addr.country,
  }
}

export function unflattenAddress(form, prefix) {
  return {
    line1: form[`${prefix}_line1`] || '',
    line2: form[`${prefix}_line2`] || '',
    city: form[`${prefix}_city`] || '',
    county: form[`${prefix}_county`] || '',
    postcode: form[`${prefix}_postcode`] || '',
    country: form[`${prefix}_country`] || DEFAULT_COUNTRY,
  }
}

export function resolveBillingAddress(form) {
  if (form.billing_same_as_home) return unflattenAddress(form, 'home')
  return unflattenAddress(form, 'billing')
}

export function resolveDeliveryAddress(form) {
  if (form.delivery_same_as_billing) return resolveBillingAddress(form)
  return unflattenAddress(form, 'delivery')
}

export function formatAddressBlock(addr) {
  if (!addr?.line1?.trim()) return ''
  return [
    addr.line1,
    addr.line2,
    [addr.city, addr.county].filter(Boolean).join(', '),
    addr.postcode,
    addr.country,
  ].filter(Boolean).join('\n')
}

export function isAddressComplete(addr) {
  return Boolean(addr?.line1?.trim() && addr?.city?.trim() && addr?.postcode?.trim())
}

export function profileToSavePayload(form) {
  const home = unflattenAddress(form, 'home')
  const billing = resolveBillingAddress(form)
  const delivery = resolveDeliveryAddress(form)

  const payload = {
    full_name: form.full_name?.trim(),
    phone: form.phone?.trim() || null,
    company_name: form.company_name?.trim() || null,
    billing_same_as_home: form.billing_same_as_home,
    delivery_same_as_billing: form.delivery_same_as_billing,
    ...addressToProfileFields('home', home),
    ...addressToProfileFields('billing', billing),
    ...addressToProfileFields('delivery', delivery),
  }

  return payload
}

export function deliveryAddressFromProfile(profile) {
  const form = profileToAddressForm(profile)
  return formatAddressBlock(resolveDeliveryAddress(form))
}

/** Payment processor fields are set by backend integrations — not edited in the profile UI. */
export const PAYMENT_PROVIDER_LABELS = {
  stripe: 'Stripe',
  sumup: 'SumUp',
  manual: 'Manual / offline',
}
