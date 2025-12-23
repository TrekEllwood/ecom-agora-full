import { useRef, useState } from 'react'
import type { FC } from 'react'
import toast from 'react-hot-toast'
import { CheckCircle } from 'lucide-react'
import { API_BASE } from '@/services/api/config'

export type RegisterData = {
  username: string
  email: string
  firstName: string
  lastName: string
  phone: string
  street: string
  city: string
  postal: string
  country: string
  roles: Array<'buyer' | 'seller'>
  password: string
}

type Props = {
  open: boolean
  onClose: () => void
  onRegister?: (data: RegisterData) => void
  onLoginSuccess?: (user: { user_id: number; username: string; roles: string[] }) => void
}

const RegisterModal: FC<Props> = ({ open, onClose, onRegister, onLoginSuccess }) => {
  if (!open) return null

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const usernameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const firstRef = useRef<HTMLInputElement>(null)
  const lastRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const streetRef = useRef<HTMLInputElement>(null)
  const cityRef = useRef<HTMLInputElement>(null)
  const postalRef = useRef<HTMLInputElement>(null)
  const countryRef = useRef<HTMLInputElement>(null)
  const buyerRef = useRef<HTMLInputElement>(null)
  const sellerRef = useRef<HTMLInputElement>(null)
  const passRef = useRef<HTMLInputElement>(null)
  const confirmPassRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async () => {
    const username = usernameRef.current?.value.trim() || ''
    const email = emailRef.current?.value.trim() || ''
    const firstName = firstRef.current?.value.trim() || ''
    const lastName = lastRef.current?.value.trim() || ''
    const phone = phoneRef.current?.value.trim() || ''
    const street = streetRef.current?.value.trim() || ''
    const city = cityRef.current?.value.trim() || ''
    const postal = postalRef.current?.value.trim() || ''
    const country = countryRef.current?.value.trim() || ''
    const pass = passRef.current?.value || ''
    const confirm = confirmPassRef.current?.value || ''

    const roles: Array<'buyer' | 'seller'> = []
    if (buyerRef.current?.checked) roles.push('buyer')
    if (sellerRef.current?.checked) roles.push('seller')

    const newErrors: Record<string, string> = {}
    if (!username) newErrors.username = 'Username is required'
    if (!email) newErrors.email = 'Email is required'
    if (!street) newErrors.street = 'Street address is required'
    if (!city) newErrors.city = 'City is required'
    if (!postal) newErrors.postal = 'Postal code is required'
    if (!country) newErrors.country = 'Country is required'
    if (roles.length === 0) newErrors.roles = 'Select at least Buyer or Seller'
    if (pass.length < 12) newErrors.password = 'Password must be at least 12 characters'
    if (pass !== confirm) newErrors.confirm = 'Passwords do not match'

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    const payload = {
      username,
      email,
      password: pass,
      roles,
      firstName: firstRef.current?.value || '',
      lastName: lastRef.current?.value || '',
      phone: phoneRef.current?.value || '',
      street: streetRef.current?.value || '',
      city: cityRef.current?.value || '',
      postal: postalRef.current?.value || '',
      country: countryRef.current?.value || '',
    }

    try {
      setLoading(true)

      // --- Register user
      const res = await fetch(`${API_BASE}/users.php?action=register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')

      toast.success('Account created successfully', {
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      })

      // --- Auto-login immediately
      const loginRes = await fetch(`${API_BASE}/users.php?action=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password: pass }),
      })
      const loginData = await loginRes.json()
      if (!loginRes.ok) throw new Error(loginData.error || 'Auto-login failed')

      // --- Notify parent (AppShell) that login succeeded
      onLoginSuccess?.({
        user_id: loginData.user_id,
        username: loginData.username,
        roles: loginData.roles,
      })

      onRegister?.({
        username,
        email,
        firstName,
        lastName,
        phone,
        street,
        city,
        postal,
        country,
        roles,
        password: pass,
      })

      onClose()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (key?: string) =>
    `w-full rounded border px-3 py-2 bg-white ${key && errors[key] ? 'border-red-500' : ''}`

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className="w-full sm:max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-gray-800 text-white px-6 py-3 flex items-center justify-between sticky top-0 z-10">
            <h3 className="text-lg font-semibold">Register</h3>
            <button onClick={onClose} className="text-2xl leading-none">×</button>
          </div>

          {/* Body */}
          <div className="bg-gray-100 px-6 py-5 overflow-y-auto">
            {/* Personal Info */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Personal Information</h4>
                <div className="flex items-center gap-4">
                  <label className="text-sm flex items-center gap-2">
                    <input ref={buyerRef} type="checkbox" defaultChecked className="rounded" />
                    Buyer
                  </label>
                  <label className="text-sm flex items-center gap-2">
                    <input ref={sellerRef} type="checkbox" className="rounded" />
                    Seller
                  </label>
                </div>
              </div>
              {errors.roles && <p className="text-red-600 text-xs">{errors.roles}</p>}
              <hr className="border-gray-300" />

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm mb-1">Username:</label>
                  <input ref={usernameRef} className={inputClass('username')} aria-invalid={!!errors.username} />
                  {errors.username && <p className="text-red-600 text-xs mt-1">{errors.username}</p>}
                </div>
                <div>
                  <label className="block text-sm mb-1">Email:</label>
                  <input ref={emailRef} type="email" className={inputClass('email')} aria-invalid={!!errors.email} />
                  {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1">First Name:</label>
                    <input ref={firstRef} className={inputClass()} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Last Name:</label>
                    <input ref={lastRef} className={inputClass()} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1">Contact Number:</label>
                  <input ref={phoneRef} type="tel" className={inputClass()} />
                </div>
              </div>
            </section>

            {/* Order Information */}
            <section className="space-y-3 mt-6">
              <h4 className="font-medium">Order Information</h4>
              <hr className="border-gray-300" />
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm mb-1">Street Address:</label>
                  <input ref={streetRef} className={inputClass('street')} aria-invalid={!!errors.street} />
                  {errors.street && <p className="text-red-600 text-xs mt-1">{errors.street}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1">City:</label>
                    <input ref={cityRef} className={inputClass('city')} aria-invalid={!!errors.city} />
                    {errors.city && <p className="text-red-600 text-xs mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Postal / Zip Code:</label>
                    <input ref={postalRef} className={inputClass('postal')} aria-invalid={!!errors.postal} />
                    {errors.postal && <p className="text-red-600 text-xs mt-1">{errors.postal}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1">Country:</label>
                  <input ref={countryRef} className={inputClass('country')} aria-invalid={!!errors.country} />
                  {errors.country && <p className="text-red-600 text-xs mt-1">{errors.country}</p>}
                </div>
              </div>
            </section>

            {/* Security */}
            <section className="space-y-3 mt-6">
              <h4 className="font-medium">Security</h4>
              <hr className="border-gray-300" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Password:</label>
                  <input ref={passRef} type="password" className={inputClass('password')} aria-invalid={!!errors.password} />
                  {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm mb-1">Re-enter Password:</label>
                  <input ref={confirmPassRef} type="password" className={inputClass('confirm')} aria-invalid={!!errors.confirm} />
                  {errors.confirm && <p className="text-red-600 text-xs mt-1">{errors.confirm}</p>}
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="bg-gray-100 px-6 py-4 flex flex-col sm:flex-row gap-2 justify-center">
            <button
              disabled={loading}
              onClick={handleSubmit}
              className="px-6 py-2 rounded-full bg-purple-200 text-gray-900 border border-purple-300 disabled:opacity-70"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
            <button onClick={onClose} className="px-6 py-2 rounded-full bg-gray-200 text-gray-900 border">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterModal
