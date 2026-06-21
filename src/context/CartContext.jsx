import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { productHasPrice } from '../lib/utils'
import { normalizeProduct } from '../lib/products'

const CartContext = createContext(null)

const CART_KEY = 'wl_cart'

export function CartProvider({ children }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem(CART_KEY)
    if (saved) {
      try { setItems(JSON.parse(saved)) } catch { /* ignore */ }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((product, quantity = 1) => {
    const item = normalizeProduct(product)
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        )
      }
      return [...prev, { ...item, quantity }]
    })
  }, [])

  const removeItem = useCallback((productId) => {
    setItems(prev => prev.filter(i => i.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.id !== productId))
    } else {
      setItems(prev => prev.map(i => i.id === productId ? { ...i, quantity } : i))
    }
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const total = items.reduce((sum, i) => {
    if (!productHasPrice(i)) return sum
    return sum + (Number(i.price) || 0) * i.quantity
  }, 0)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
