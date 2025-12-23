import { useState, useMemo } from 'react'
import { useProfile } from '../hooks/useProfile'
import toast from 'react-hot-toast'
import type { UpdatePayload } from '../hooks/useProfile'

export default function ProfilePage() {
  const { profile, loading, saving, error, updateProfile } = useProfile()
  const [form, setForm] = useState<Record<string, string>>({})

  const emptyProfile: UpdatePayload = {
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    street: '',
    city: '',
    postal: '',
    country: 'NZ',
  }

  const payload = useMemo<UpdatePayload>(() => {
    if (!profile) return emptyProfile

    return {
      email: form.email ?? profile.email ?? '',
      first_name: form.first_name ?? profile.first_name ?? '',
      last_name: form.last_name ?? profile.last_name ?? '',
      phone: form.phone ?? profile.phone ?? '',
      street: form.street ?? profile.street ?? '',
      city: form.city ?? profile.city ?? '',
      postal: form.postal ?? profile.postal ?? '',
      country: form.country ?? profile.country ?? 'NZ',
    }
  }, [form, profile])

  const requiredFields = ['email', 'first_name', 'last_name', 'street', 'city', 'country']
  const missing = requiredFields.filter(
    (f) => !payload[f as keyof typeof payload] || !String(payload[f as keyof typeof payload]).trim()
  )
  const isValid = profile && missing.length === 0

  const handleChange = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    if (!isValid) {
      toast.error(`Please fill in all required fields: ${missing.join(', ')}`)
      return
    }

    try {
      await updateProfile(payload)
      toast.success('Profile updated successfully')
    } catch {
      toast.error('Failed to update profile')
    }
  }

  // --- Conditional rendering AFTER hooks ---
  if (loading) return <p className="p-6 text-gray-500">Loading profile...</p>
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>
  if (!profile) return <p className="p-6 text-gray-600">No profile data.</p>

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-2xl">
      <h2 className="text-xl font-semibold mb-4">My Profile</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Username" value={profile.username} disabled />
        <Field
          label="Email *"
          value={form.email ?? profile.email}
          onChange={(v) => handleChange('email', v)}
        />
        <Field
          label="First Name *"
          value={form.first_name ?? profile.first_name}
          onChange={(v) => handleChange('first_name', v)}
        />
        <Field
          label="Last Name *"
          value={form.last_name ?? profile.last_name}
          onChange={(v) => handleChange('last_name', v)}
        />
        <Field
          label="Phone"
          value={form.phone ?? profile.phone}
          onChange={(v) => handleChange('phone', v)}
        />
      </div>

      <hr className="my-6" />

      <h3 className="text-lg font-medium mb-3">Address</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Street *"
          value={form.street ?? profile.street}
          onChange={(v) => handleChange('street', v)}
        />
        <Field
          label="City *"
          value={form.city ?? profile.city}
          onChange={(v) => handleChange('city', v)}
        />
        <Field
          label="Postal"
          value={form.postal ?? profile.postal}
          onChange={(v) => handleChange('postal', v)}
        />
        <Field
          label="Country *"
          value={form.country ?? profile.country}
          onChange={(v) => handleChange('country', v)}
        />
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          disabled={!isValid || saving}
          className={`px-6 py-2 rounded-full text-white transition ${isValid
              ? 'bg-purple-600 hover:bg-purple-700'
              : 'bg-gray-400 cursor-not-allowed'
            }`}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

type FieldProps = {
  label: string
  value: string
  onChange?: (val: string) => void
  disabled?: boolean
}

function Field({ label, value, onChange, disabled }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={value || ''}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full border rounded px-3 py-2 ${disabled ? 'bg-gray-100 text-gray-500' : 'bg-white'
          }`}
      />
    </div>
  )
}
