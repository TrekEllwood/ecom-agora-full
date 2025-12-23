import { useMemo, useState, useCallback, useEffect } from 'react'
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/services/api/products'
import { toProduct } from '@/shared/mappers/product'
import type { Product } from '@/shared/types/domain'

export function useCatalog() {
  const [db, setDb] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)

  // --- FETCH ALL PRODUCTS ---
  useEffect(() => {
    setLoading(true)
    getProducts()
      .then(res => setDb(res.items.map(toProduct)))
      .catch(e => setError(e.message ?? 'Failed to load products'))
      .finally(() => setLoading(false))
  }, [])

  // --- FILTERING ---
  const list = useMemo(
    () =>
      db.filter(
        p =>
          (!category || p.category === category) &&
          p.name.toLowerCase().includes(query.toLowerCase())
      ),
    [db, query, category]
  )

  // --- HELPERS ---
  const find = useCallback(
    (sku: string) => db.find(p => p.sku === sku) || null,
    [db]
  )

  const bySeller = useCallback(
    (username: string) => db.filter(p => p.seller === username),
    [db]
  )

  // --- CREATE (backend) ---
  const create = useCallback(async (data: Partial<Product>): Promise<Product> => {
    const res = await createProduct(data)
    // backend returns { product_id: number }, combine + map
    const newProduct = toProduct({ ...data, ...res } as any)
    setDb(prev => [...prev, newProduct])
    return newProduct
  }, [])

  // --- UPDATE (backend) ---
  const update = useCallback(async (data: Partial<Product>): Promise<Product> => {
    if (!data.sku) throw new Error('Missing SKU for update')

    const existing = db.find(p => p.sku === data.sku)
    if (!existing) throw new Error(`Product not found for SKU: ${data.sku}`)

    // merge old + new and convert
    const merged = { ...existing, ...data } as Product

    await updateProduct(merged.id, merged)
    setDb(prev => prev.map(p => (p.id === merged.id ? merged : p)))

    return merged
  }, [db])

  // --- DELETE (backend) ---
  const remove = useCallback(async (sku: string): Promise<void> => {
    const target = db.find(p => p.sku === sku)
    if (!target) throw new Error(`Product not found for SKU: ${sku}`)

    await deleteProduct(target.id)
    setDb(prev => prev.filter(p => p.id !== target.id))
  }, [db])

  return {
    loading,
    error,
    query,
    setQuery,
    category,
    setCategory,
    list,
    find,
    bySeller,
    create,
    update,
    remove,
  }
}
