import { useEffect, useState, useCallback } from 'react'

export type Profile = {
  user_id: number
  username: string
  email: string
  first_name: string
  last_name: string
  phone: string
  street: string
  city: string
  postal: string
  country: string
}

export type UpdatePayload = Omit<Profile, 'user_id' | 'username'>

/**
 * useProfile hook:
 * - Loads current user profile
 * - Allows updating via PUT /api/profiles.php
 */
export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const loadProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/profiles.php', { credentials: 'include' })
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
      const data = await res.json()
      setProfile(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (data: UpdatePayload) => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/profiles.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(`Failed to update: ${res.status}`)
      await loadProfile()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }, [loadProfile])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  return { profile, loading, saving, error, loadProfile, updateProfile }
}
