import React, { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, LogOut } from 'lucide-react'
import type { Role, User } from '@/shared/types/domain'
import { toUser } from '@/shared/mappers/user'
import { API_BASE } from '@/services/api/config'

const STORAGE_KEY = 'auth.user'
const norm = (s: unknown) => String(s ?? '').trim().toLowerCase()

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const fetched = useRef(false)

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
        }
      })()
  }, [])

  // --- Keep session cached ---
  useEffect(() => {
    if (user) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else sessionStorage.removeItem(STORAGE_KEY)
  }, [user])

  // --- LOGIN ---
  const login = async (username: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/users.php?action=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) {
        toast.error('Invalid credentials', {
          icon: React.createElement(XCircle, { className: 'w-5 h-5 text-red-500' }),
        })
        return false
      }

      const data = await res.json()
      const next = toUser(data)
      setUser(next)
      setShowLogin(false)
      toast.success(`Welcome ${data.username}!`, {
        icon: React.createElement(CheckCircle, { className: 'w-5 h-5 text-green-500' }),
      })
      return true
    } catch {
      toast.error('Login failed. Please try again.', {
        icon: React.createElement(XCircle, { className: 'w-5 h-5 text-red-500' }),
      })
      return false
    }
  }

  // --- LOGOUT ---
  const logout = async () => {
    try {
      await fetch(`${API_BASE}/users.php?action=logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // ignore
    } finally {
      setUser(null)
      setShowLogin(false)
      setShowRegister(false)
      toast('Logged out', {
        icon: React.createElement(LogOut, { className: 'w-5 h-5 text-gray-600' }),
      })
    }
  }

  // --- Role helpers ---
  const hasRole = (r: Role) => !!user?.roles.includes(norm(r))
  const isBuyer = useMemo(() => hasRole('buyer'), [user])
  const isSeller = useMemo(() => hasRole('seller'), [user])
  const isAdmin = useMemo(() => hasRole('admin'), [user])

  return {
    user,
    setUser,
    showLogin,
    showRegister,
    setShowLogin,
    setShowRegister,
    login,
    logout,
    hasRole,
    isBuyer,
    isSeller,
    isAdmin,
    isLoggedIn: !!user,
  }
}
