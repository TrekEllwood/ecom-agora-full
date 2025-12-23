import type { CategoriesResponse } from './types'
import { API_BASE } from './config'

export async function getCategories(): Promise<CategoriesResponse> {
  const r = await fetch(`${API_BASE}/categories.php`, {
    credentials: 'include',
  })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return (await r.json()) as CategoriesResponse
}
