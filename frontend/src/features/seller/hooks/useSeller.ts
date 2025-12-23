import { useCallback, useMemo, useState } from 'react'
import type { Product, User } from '@/shared/types/domain'
import { API_BASE } from '@/services/api/config'

// --- helpers for cents/dollars conversion ---
const centsToDollars = (cents: number) => +(cents / 100).toFixed(2)
const dollarsToCents = (dollars: number) => Math.round(dollars * 100)

type Deps = {
  create: (p: Partial<Product>) => Promise<Product>
  update: (p: Partial<Product>) => Promise<Product>
  remove: (sku: string) => Promise<void>
}

type Mode = 'create' | 'edit'

export function useSeller(user: User, { create, update, remove }: Deps) {
  // --- state ---
  const [mode, setMode] = useState<Mode>('create')
  const [editingSku, setEditingSku] = useState<string | null>(null)

  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState<number | null>(null)
  const [category, setCategory] = useState<Product['category']>('Electronics' as any)
  const [desc, setDesc] = useState('')
  const [stock, setStock] = useState<number | null>(null)
  const [status, setStatus] = useState<Product['status']>('active' as any)
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined)

  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  // --- helpers ---
  const resetFields = useCallback(() => {
    setSku('')
    setName('')
    setPrice(null)
    setCategory('Electronics' as any)
    setDesc('')
    setStock(null)
    setStatus('active' as any)
    setImageUrl(undefined)
  }, [])

  const handleImage = async (file: File | null) => {
    setError(null)
    if (!file) {
      setImageUrl(undefined)
      return
    }

    // Upload to PHP
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch(`${API_BASE}/upload.php`, { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      setImageUrl(data.url)
    } catch (err) {
      console.error(err) // DEBUG
      setError('Image upload failed.')
    }
  }

  // --- edit mode load ---
  const loadForEdit = useCallback((p: Product) => {
    setSku(p.sku)
    setName(p.name)
    setPrice(centsToDollars(p.price_cents ?? 0)) // convert cents → dollars for editing
    setCategory(p.category as any)
    setDesc(p.desc ?? '')
    setStock(Number(p.stock ?? 0) || 0)
    setStatus((p.status ?? 'active') as any)
    setImageUrl(p.imageUrl)
    setEditingSku(p.sku)
    setMode('edit')
    setError(null)
    setOk(null)
  }, [])

  const cancelEdit = useCallback(() => {
    resetFields()
    setEditingSku(null)
    setMode('create')
    setError(null)
    setOk(null)
  }, [resetFields])

  const validate = useCallback(() => {
    if (!user || !user.roles.map(r => r.toLowerCase()).includes('seller')) {
      return 'You must be logged in as a seller.'
    }
    if (!sku.trim() || !name.trim()) return 'SKU and Name are required.'
    if (price == null || price < 0) return 'Price must be ≥ 0.'
    if (stock == null || stock < 0) return 'Stock must be ≥ 0.'
    return null
  }, [user, sku, name, price, stock])

  // --- submit (async) ---
  const submit = useCallback(async () => {
    setError(null)
    setOk(null)
    const v = validate()
    if (v) {
      setError(v)
      return
    }

    const payload: Partial<Product> = {
      sku,
      name,
      price_cents: dollarsToCents(price ?? 0), // backend expects cents
      category,
      desc,
      stock: stock ?? 0,
      status,
      imageUrl,
      seller: user.username,
    }

    try {
      if (mode === 'edit') {
        const updated = await update({ ...payload, sku: editingSku ?? sku })
        setOk(`Updated ${updated.sku}`)
        cancelEdit()
      } else {
        const created = await create(payload)
        setOk(`Listing created: ${created.sku}`)
        resetFields()
      }
    } catch (err) {
      console.error(err) // DEBUG
      setError('Failed to save listing.')
    }
  }, [
    validate,
    sku,
    name,
    price,
    category,
    desc,
    stock,
    status,
    imageUrl,
    user?.username,
    mode,
    editingSku,
    update,
    create,
    cancelEdit,
    resetFields,
  ])

  // --- delete listing ---
  const deleteListing = useCallback(
    async (skuToDelete: string) => {
      try {
        if (editingSku && editingSku === skuToDelete) {
          cancelEdit()
        }
        await remove(skuToDelete)
        setOk(`Deleted ${skuToDelete}`)
        setError(null)
      } catch (err) {
        console.error(err) // DEBUG
        setError('Failed to delete listing.')
      }
    },
    [remove, editingSku, cancelEdit]
  )

  const fields = useMemo(
    () => ({
      sku,
      setSku,
      name,
      setName,
      price,
      setPrice,
      category,
      setCategory,
      desc,
      setDesc,
      stock,
      setStock,
      status,
      setStatus,
      imageUrl,
      handleImage,
    }),
    [sku, name, price, category, desc, stock, status, imageUrl]
  )

  return {
    mode,
    editingSku,
    fields,
    submit,
    loadForEdit,
    cancelEdit,
    deleteListing,
    error,
    ok,
  }
}
