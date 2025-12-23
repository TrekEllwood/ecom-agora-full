import { useEffect, useState } from 'react'
import { API_BASE } from '@/services/api/config'

export function useCategories() {
  const [items, setItems] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_BASE}/categories.php`, {
          credentials: 'include',
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const data = await res.json()
        const names = (data.items ?? [])
          .map((c: any) => c.name)
          .filter(Boolean)
          .sort((a: string, b: string) => a.localeCompare(b))

        setItems(names)
      } catch (err: any) {
        console.error('Failed to load categories', err)
        setError(err.message ?? 'Failed to load categories')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { items, loading, error }
}
