import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingBag, MapPin } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import PageHero from '../../components/ui/PageHero'
import { formatCurrency, formatProductPrice, productHasPrice } from '../../lib/utils'
import { shopPathsForPortal, portalShopPaths } from '../../lib/shopPaths'
import { deliveryAddressFromProfile, isAddressComplete, resolveDeliveryAddress, profileToAddressForm } from '../../lib/profileAddresses'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { Textarea } from '../../components/ui/Input'

export default function CartPage({ portal = false }) {
  const paths = shopPathsForPortal(portal)
  const { items, removeItem, updateQuantity, clearCart, total } = useCart()
  const { user, isRejected, isSuspended, profile } = useAuth()
  const navigate = useNavigate()
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const submitOrder = async () => {
    if (items.length === 0) return

    if (!user) {
      toast('Sign in or create an account to complete your order')
      navigate(paths.login, { state: { from: { pathname: paths.cart } } })
      return
    }

    if (isRejected || isSuspended) {
      toast.error('Your account cannot place orders. Please contact us.')
      return
    }

    const deliveryAddr = profile ? resolveDeliveryAddress(profileToAddressForm(profile)) : null
    if (!isAddressComplete(deliveryAddr)) {
      toast.error('Please add a delivery address in your profile before checkout.')
      navigate(paths.profile)
      return
    }

    setLoading(true)

    const { data: order, error: orderError } = await supabase.from('orders').insert({
      user_id: user.id,
      total_amount: total,
      customer_notes: notes,
      delivery_address: deliveryAddressFromProfile(profile),
      status: 'requested',
      payment_status: 'pending',
    }).select().single()

    if (orderError) {
      toast.error(orderError.message)
      setLoading(false)
      return
    }

    const orderItems = items
      .filter(i => !String(i.id).startsWith('seed-'))
      .map(i => ({
        order_id: order.id,
        product_id: i.id,
        product_name: i.name,
        quantity: i.quantity,
        unit_price: i.price,
      }))

    if (orderItems.length === 0) {
      toast.error('Please add products from the live catalogue before checkout.')
      setLoading(false)
      return
    }

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) {
      toast.error(itemsError.message)
      setLoading(false)
      return
    }

    clearCart()
    toast.success('Order request submitted!')
    setLoading(false)
    navigate(paths.order(order.id))
  }

  const emptyCart = (
    <div className="text-center py-16">
      <ShoppingBag className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-40" />
      <h1 className="text-xl font-bold text-text mb-2">Your cart is empty</h1>
      <p className="text-text-muted mb-6">Browse the shop to add products</p>
      <Link to={paths.catalogue}><Button>Browse shop</Button></Link>
    </div>
  )

  const cartContent = (
    <div className={portal ? 'max-w-3xl mx-auto' : 'max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16'}>
      <h1 className="text-2xl font-bold text-text mb-8">Shopping cart</h1>

      <div className="space-y-4 mb-8">
        {items.map(item => (
          <Card key={item.id} className="p-4 flex items-center gap-4">
            {item.image_url ? (
              <img src={item.image_url} alt="" className="w-16 h-16 rounded-xl object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-accent flex items-center justify-center text-primary font-bold">{item.name.charAt(0)}</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text truncate">{item.name}</p>
              <p className="text-sm text-primary font-medium">{formatProductPrice(item)}</p>
            </div>
            <div className="flex items-center border border-gray-200 rounded-lg">
              <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 text-sm">−</button>
              <span className="px-3 text-sm font-medium">{item.quantity}</span>
              <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 text-sm">+</button>
            </div>
            <p className="font-medium text-sm w-24 text-right">
              {!productHasPrice(item) ? 'Enquiry' : formatCurrency(item.price * item.quantity)}
            </p>
            <button type="button" onClick={() => removeItem(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
              <Trash2 className="w-4 h-4" />
            </button>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        {!user && (
          <p className="text-sm text-text-muted mb-4 p-3 rounded-xl bg-accent/50 border border-primary/10">
            <Link to={paths.login} state={{ from: { pathname: paths.cart } }} className="text-primary font-medium hover:underline">Sign in</Link>
            {' or '}
            <Link to={paths.register} className="text-primary font-medium hover:underline">create an account</Link>
            {' '}to submit your order. Payment details will be arranged once your payment processor is connected.
          </p>
        )}
        {user && profile && (
          <div className="mb-4 p-4 rounded-xl border border-gray-100 bg-accent/30">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text">Delivery address</p>
                {isAddressComplete(resolveDeliveryAddress(profileToAddressForm(profile))) ? (
                  <p className="text-sm text-text-muted mt-1 whitespace-pre-line">{deliveryAddressFromProfile(profile)}</p>
                ) : (
                  <p className="text-sm text-amber-700 mt-1">
                    No delivery address saved.{' '}
                    <Link to={paths.profile} className="text-primary font-medium hover:underline">Add one in your profile</Link>
                    {' '}before checkout.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        <Textarea label="Order notes (optional)" rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
          <div>
            <p className="text-sm text-text-muted">Total</p>
            <p className="text-2xl font-bold text-text">
              {total > 0 ? formatCurrency(total) : 'Price confirmed on review'}
            </p>
          </div>
          <Button onClick={submitOrder} loading={loading} size="lg">
            {user ? 'Submit order request' : 'Sign in to order'}
          </Button>
        </div>
      </Card>
    </div>
  )

  if (items.length === 0) {
    return portal ? emptyCart : (
      <>
        <PageHero title="Your cart" subtitle="Review items before placing your order." />
        {emptyCart}
      </>
    )
  }

  if (portal) return cartContent

  return (
    <>
      <PageHero title="Your cart" subtitle="Review items and submit your order request." />
      {cartContent}
    </>
  )
}
