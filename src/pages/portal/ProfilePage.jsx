import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CreditCard, Home, MapPin, Truck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'
import Input, { Checkbox } from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import {
  DEFAULT_COUNTRY,
  PAYMENT_PROVIDER_LABELS,
  profileToAddressForm,
  profileToSavePayload,
} from '../../lib/profileAddresses'
import { portalShopPaths } from '../../lib/shopPaths'
import toast from 'react-hot-toast'

function AddressFields({ prefix, title, form, onChange, disabled }) {
  const set = (field, value) => onChange({ [`${prefix}_${field}`]: value })

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-text">{title}</h3>
      <Input
        label="Address line 1"
        value={form[`${prefix}_line1`]}
        onChange={(e) => set('line1', e.target.value)}
        disabled={disabled}
        placeholder="House name or number and street"
      />
      <Input
        label="Address line 2 (optional)"
        value={form[`${prefix}_line2`]}
        onChange={(e) => set('line2', e.target.value)}
        disabled={disabled}
        placeholder="Flat, suite, building"
      />
      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="Town / city"
          value={form[`${prefix}_city`]}
          onChange={(e) => set('city', e.target.value)}
          disabled={disabled}
        />
        <Input
          label="County (optional)"
          value={form[`${prefix}_county`]}
          onChange={(e) => set('county', e.target.value)}
          disabled={disabled}
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="Postcode"
          value={form[`${prefix}_postcode`]}
          onChange={(e) => set('postcode', e.target.value)}
          disabled={disabled}
        />
        <Input
          label="Country"
          value={form[`${prefix}_country`]}
          onChange={(e) => set('country', e.target.value)}
          disabled={disabled}
        />
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { profile, refreshProfile, isDevSession, updateDevProfile } = useAuth()
  const [form, setForm] = useState(() => profileToAddressForm(profile || {}))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (profile) setForm(profileToAddressForm(profile))
  }, [profile])

  const handleBillingSameChange = (checked) => {
    setForm((prev) => ({
      ...prev,
      billing_same_as_home: checked,
      ...(checked ? {
        billing_line1: prev.home_line1,
        billing_line2: prev.home_line2,
        billing_city: prev.home_city,
        billing_county: prev.home_county,
        billing_postcode: prev.home_postcode,
        billing_country: prev.home_country,
      } : {}),
    }))
  }

  const handleDeliverySameChange = (checked) => {
    setForm((prev) => {
      const source = prev.billing_same_as_home ? 'home' : 'billing'
      return {
        ...prev,
        delivery_same_as_billing: checked,
        ...(checked ? {
          delivery_line1: prev[`${source}_line1`],
          delivery_line2: prev[`${source}_line2`],
          delivery_city: prev[`${source}_city`],
          delivery_county: prev[`${source}_county`],
          delivery_postcode: prev[`${source}_postcode`],
          delivery_country: prev[`${source}_country`],
        } : {}),
      }
    })
  }

  const syncLinkedAddresses = (next) => {
    let updated = { ...next }
    if (updated.billing_same_as_home) {
      updated = {
        ...updated,
        billing_line1: updated.home_line1,
        billing_line2: updated.home_line2,
        billing_city: updated.home_city,
        billing_county: updated.home_county,
        billing_postcode: updated.home_postcode,
        billing_country: updated.home_country || DEFAULT_COUNTRY,
      }
    }
    if (updated.delivery_same_as_billing) {
      const source = updated.billing_same_as_home ? 'home' : 'billing'
      updated = {
        ...updated,
        delivery_line1: updated[`${source}_line1`],
        delivery_line2: updated[`${source}_line2`],
        delivery_city: updated[`${source}_city`],
        delivery_county: updated[`${source}_county`],
        delivery_postcode: updated[`${source}_postcode`],
        delivery_country: updated[`${source}_country`] || DEFAULT_COUNTRY,
      }
    }
    return updated
  }

  const updateForm = (patch) => setForm((prev) => syncLinkedAddresses({ ...prev, ...patch }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const payload = profileToSavePayload(form)

    if (isDevSession) {
      updateDevProfile(payload)
      toast.success('Profile updated (dev session)')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('profiles').update(payload).eq('id', profile.id)
    if (error) toast.error(error.message)
    else {
      toast.success('Profile updated')
      refreshProfile()
    }
    setLoading(false)
  }

  const paymentConnected = Boolean(profile?.payment_provider && profile?.payment_customer_id)

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Profile & addresses</h1>
        <p className="text-text-muted mt-1 text-sm">
          Keep your contact details and delivery information up to date for UK-wide orders.
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="space-y-5">
            <h2 className="text-lg font-semibold text-text flex items-center gap-2">
              <span className="p-2 rounded-lg bg-primary/10 text-primary"><Home className="w-4 h-4" /></span>
              Contact details
            </h2>
            <Input
              label="Full name"
              required
              value={form.full_name}
              onChange={(e) => updateForm({ full_name: e.target.value })}
            />
            <Input label="Email" value={profile?.email || ''} disabled />
            <Input
              label="Phone"
              value={form.phone}
              onChange={(e) => updateForm({ phone: e.target.value })}
              placeholder="For delivery updates"
            />
            <Input
              label="Company name (optional)"
              value={form.company_name}
              onChange={(e) => updateForm({ company_name: e.target.value })}
            />
          </section>

          <section className="space-y-4 pt-6 border-t border-gray-100">
            <h2 className="text-lg font-semibold text-text flex items-center gap-2">
              <span className="p-2 rounded-lg bg-primary/10 text-primary"><MapPin className="w-4 h-4" /></span>
              Home address
            </h2>
            <AddressFields prefix="home" title="Your home address" form={form} onChange={updateForm} />
          </section>

          <section className="space-y-4 pt-6 border-t border-gray-100">
            <h2 className="text-lg font-semibold text-text flex items-center gap-2">
              <span className="p-2 rounded-lg bg-primary/10 text-primary"><CreditCard className="w-4 h-4" /></span>
              Billing address
            </h2>
            <Checkbox
              label="Billing address is the same as home address"
              checked={form.billing_same_as_home}
              onChange={(e) => handleBillingSameChange(e.target.checked)}
            />
            {!form.billing_same_as_home && (
              <AddressFields prefix="billing" title="Billing address" form={form} onChange={updateForm} />
            )}
          </section>

          <section className="space-y-4 pt-6 border-t border-gray-100">
            <h2 className="text-lg font-semibold text-text flex items-center gap-2">
              <span className="p-2 rounded-lg bg-primary/10 text-primary"><Truck className="w-4 h-4" /></span>
              Delivery address
            </h2>
            <Checkbox
              label="Delivery address is the same as billing address"
              checked={form.delivery_same_as_billing}
              onChange={(e) => handleDeliverySameChange(e.target.checked)}
            />
            {!form.delivery_same_as_billing && (
              <AddressFields prefix="delivery" title="Delivery address" form={form} onChange={updateForm} />
            )}
          </section>

          <section className="pt-6 border-t border-gray-100">
            <h2 className="text-lg font-semibold text-text flex items-center gap-2 mb-3">
              <span className="p-2 rounded-lg bg-primary/10 text-primary"><CreditCard className="w-4 h-4" /></span>
              Payment methods
            </h2>
            {paymentConnected ? (
              <div className="rounded-xl border border-primary/20 bg-accent/40 p-4 text-sm">
                <p className="font-medium text-text">
                  {PAYMENT_PROVIDER_LABELS[profile.payment_provider] || profile.payment_provider} connected
                </p>
                <p className="text-text-muted mt-1">Your saved payment method will be available at checkout once enabled.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 p-4 text-sm text-text-muted">
                <p className="font-medium text-text">Online card payments — coming soon</p>
                <p className="mt-1">
                  We will connect your chosen payment processor (e.g. Stripe or SumUp) here. Until then, orders are submitted as requests and payment is arranged manually.
                </p>
              </div>
            )}
          </section>

          <div className="text-sm text-text-muted pt-2">
            <p>Status: <span className="font-medium capitalize">{profile?.status}</span></p>
            <p>Member since: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}</p>
          </div>

          <Button type="submit" loading={loading}>Save changes</Button>
        </form>
      </Card>

      <p className="text-sm text-text-muted">
        Delivery address is used at checkout.{' '}
        <Link to={portalShopPaths.cart} className="text-primary font-medium hover:underline">View cart</Link>
      </p>
    </div>
  )
}
