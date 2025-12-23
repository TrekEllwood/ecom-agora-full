import { useState, useEffect, useCallback } from 'react'
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/services/api/products'
import { toProduct } from '@/shared/mappers/product'
import type { Product } from '@/shared/types/domain'

export function useAdmin() {
  const [rows, setRows] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // --- FETCH ALL PRODUCTS ---
  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    getProducts()
      .then(res => setRows(res.items.map(toProduct)))
      .catch(e => setError(e?.message ?? 'Failed to load products'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  // --- CREATE or UPDATE ---
  const save = useCallback(async (data: Partial<Product>) => {
    if (!data.sku) return

    try {
      const existing = rows.find(r => r.sku === data.sku)

      if (existing) {
        // UPDATE existing record
        const updated = { ...existing, ...data }
        await updateProduct(existing.id, updated)
        setRows(prev => prev.map(r => (r.id === existing.id ? updated : r)))
      } else {
        // CREATE new record
        const res = await createProduct(data)
        const newProduct = toProduct({ ...data, product_id: res.product_id } as any)
        setRows(prev => [...prev, newProduct])
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message ?? 'Failed to save product')
    }
  }, [rows])

  // --- DELETE ---
  const remove = useCallback(async (sku: string) => {
    const target = rows.find(r => r.sku === sku)
    if (!target) return
    try {
      await deleteProduct(target.id)
      setRows(prev => prev.filter(r => r.id !== target.id))
    } catch (err: any) {
      console.error(err)
      setError(err.message ?? 'Failed to delete product')
    }
  }, [rows])

  const get = useCallback((sku: string) => {
    return rows.find(r => r.sku === sku) ?? null
  }, [rows])

  return {
    rows,
    save,
    remove,
    get,
    reload,
    loading,
    error,
  }
}
