import type { ProductsSearchResponse, ProductResponse } from './types'
import type { Product } from '@/shared/types/domain'
import { API_BASE } from './config'

// --- GET ALL PRODUCTS ---
export async function getProducts(
  params: Record<string, unknown> = {}
): Promise<ProductsSearchResponse> {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => v != null && qs.set(k, String(v)))
  const res = await fetch(`${API_BASE}/products.php?${qs.toString()}`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return (await res.json()) as ProductsSearchResponse
}

// --- CREATE PRODUCT ---
export async function createProduct(data: Partial<Product>): Promise<ProductResponse> {
  const res = await fetch(`${API_BASE}/products.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to create product (HTTP ${res.status})`)
  return (await res.json()) as ProductResponse
}

// --- UPDATE PRODUCT ---
export async function updateProduct(id: number, patch: Partial<Product>): Promise<boolean> {
  const res = await fetch(`${API_BASE}/products.php?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error(`Failed to update product (HTTP ${res.status})`)
  return true
}

// --- DELETE PRODUCT ---
export async function deleteProduct(id: number): Promise<boolean> {
  const res = await fetch(`${API_BASE}/products.php?id=${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) throw new Error(`Failed to delete product (HTTP ${res.status})`)
  return true
}
