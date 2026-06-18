import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

const CART_KEY = 'wl_cart'

export function CartProvider({ children }) {
  const { isApproved } = useAuth()
  const [items, setItems] = useState([])

  useEffect(() => {
    if (isApproved) {
      const saved = localStorage.getItem(CART_KEY)
      if (saved) {
        try { setItems(JSON.parse(saved)) } catch { /* ignore */ }
      }
    } else {
      setItems([])
      localStorage.removeItem(CART_KEY)
    }
  }, [isApproved])

  useEffect(() => {
    if (isApproved) localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items, isApproved])

  const addItem = useCallback((product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        return prev.map(i =>
          i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        )
      }
      return [...prev, { ...product, quantity }]
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

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
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
