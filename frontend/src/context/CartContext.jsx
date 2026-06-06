import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'billiard_cart'

export function useCart() {
  return useContext(CartContext)
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
      return Array.isArray(stored) ? stored : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (food, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === food.id)
      if (existing) {
        return prev.map((i) =>
          i.id === food.id ? { ...i, quantity: i.quantity + qty } : i,
        )
      }
      return [
        ...prev,
        {
          id: food.id,
          name: food.name,
          price: Number(food.price),
          image_url: food.image_url,
          quantity: qty,
        },
      ]
    })
  }

  const setQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i)),
    )
  }

  const removeItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const clear = () => setItems([])

  const totalQuantity = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  )

  // Display-only estimate. The backend always recomputes the real total.
  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  )

  const value = {
    items,
    addItem,
    setQuantity,
    removeItem,
    clear,
    totalQuantity,
    totalPrice,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
