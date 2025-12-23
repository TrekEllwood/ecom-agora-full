import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { User } from '@/shared/types/domain'
import { toUser } from '@/shared/mappers/user'
import { API_BASE } from '@/services/api/config'

type AuthCtx = {
  user: User | null
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  loading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  hasRole: (role: string) => boolean
  isLoggedIn: boolean
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  setUser: () => {},
  loading: false,
  login: async () => false,
  logout: async () => { },
  hasRole: () => false,
  isLoggedIn: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const fetched = useRef(false)
  const STORAGE_KEY = 'auth.user'

  // --- Restore cached user immediately ---
  useEffect(() => {
    const cached = sessionStorage.getItem(STORAGE_KEY)
    if (cached) {
      try {
        setUser(JSON.parse(cached))
      } catch {
        sessionStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  // --- Fetch session once ---
  useEffect(() => {
    if (fetched.current) return
    fetched.current = true

      ; (async () => {
        try {
          const res = await fetch(`${API_BASE}/users.php?action=me`, {
            credentials: 'include',
          })
          if (res.ok) {
            const data = await res.json()
            setUser(toUser(data))
          } else {
            setUser(null)
          }
        } catch (err) {
          console.error('Session restore failed', err)
        } finally {
          setLoading(false)
        }
      })()
  }, [])

  // --- Cache user in storage ---
  useEffect(() => {
    if (user) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else sessionStorage.removeItem(STORAGE_KEY)
  }, [user])

  // --- LOGIN ---
  async function login(username: string, password: string) {
    try {
      const res = await fetch(`${API_BASE}/users.php?action=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) return false

      const data = await res.json()
      const next = toUser(data)
      setUser(next)
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return true
    } catch (err) {
      console.error('Login failed', err)
      return false
    }
  }

  // --- LOGOUT ---
  async function logout() {
    try {
      await fetch(`${API_BASE}/users.php?action=logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // ignore
    } finally {
      setUser(null)
      sessionStorage.removeItem(STORAGE_KEY)
    }
  }

  const hasRole = (role: string) =>
    !!role && !!user?.roles?.includes(role.toLowerCase())

  const value: AuthCtx = {
    user,
    setUser,
    loading,
    login,
    logout,
    hasRole,
    isLoggedIn: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
