import { useMemo, useState } from 'react'
import type { CartItem, Product } from '@/shared/types/domain'

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])

  const add = (p: Product, qty = 1) => {
    setItems(prev => {
      const ex = prev.find(i => i.sku === p.sku)
      if (ex) return prev.map(i => i.sku === p.sku ? { ...i, qty: i.qty + qty } : i)
      return [...prev, { sku: p.sku, name: p.name, price: p.price, qty }]
    })
  }

  const updateQty = (sku: string, qty: number) =>
    setItems(prev => prev.map(i => i.sku === sku ? { ...i, qty } : i))

  const remove = (sku: string) =>
    setItems(prev => prev.filter(i => i.sku !== sku))

  const clear = () => setItems([])

  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items])
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.qty * i.price, 0), [items])

  return { items, add, updateQty, remove, clear, count, subtotal }
}
