import { Link } from 'react-router-dom'
import { Trash2, ShoppingBag } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { formatCurrency, formatProductPrice } from '../../lib/utils'
import toast from 'react-hot-toast'
import { useState } from 'react'
import Input, { Textarea } from '../../components/ui/Input'

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart()
  const { user } = useAuth()
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const submitOrder = async () => {
    if (items.length === 0) return
    setLoading(true)

    const { data: order, error: orderError } = await supabase.from('orders').insert({
      user_id: user.id,
      total_amount: total,
      customer_notes: notes,
      status: 'requested',
      payment_status: 'pending',
    }).select().single()

    if (orderError) {
      toast.error(orderError.message)
      setLoading(false)
      return
    }

    const orderItems = items.map(i => ({
      order_id: order.id,
      product_id: i.id,
      product_name: i.name,
      quantity: i.quantity,
      unit_price: i.price,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) {
      toast.error(itemsError.message)
      setLoading(false)
      return
    }

    clearCart()
    toast.success('Order request submitted!')
    setLoading(false)
    window.location.href = `/private-portal/order/${order.id}`
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingBag className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-40" />
        <h1 className="text-xl font-bold text-text mb-2">Your cart is empty</h1>
        <p className="text-text-muted mb-6">Browse the catalogue to add products</p>
        <Link to="/private-portal/catalogue"><Button>Browse Catalogue</Button></Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-text mb-8">Shopping Cart</h1>

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
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 text-sm">−</button>
              <span className="px-3 text-sm font-medium">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 text-sm">+</button>
            </div>
            <p className="font-medium text-sm w-24 text-right">
              {item.price_on_enquiry || !item.price ? 'Enquiry' : formatCurrency(item.price * item.quantity)}
            </p>
            <button onClick={() => removeItem(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
              <Trash2 className="w-4 h-4" />
            </button>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <Textarea label="Order Notes (optional)" rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
          <div>
            <p className="text-sm text-text-muted">Total</p>
            <p className="text-2xl font-bold text-text">
              {total > 0 ? formatCurrency(total) : 'Price confirmed on review'}
            </p>
          </div>
          <Button onClick={submitOrder} loading={loading} size="lg">Submit Order Request</Button>
        </div>
      </Card>
    </div>
  )
}
