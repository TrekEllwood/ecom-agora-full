import { useEffect, useRef, useState } from 'react'
import type { FC } from 'react'
import type { Product, User } from '@/shared/types/domain'
import { useInlineConfirm } from '@/shared/hooks/useInlineConfirm'
import { InlineConfirm } from '@/shared/components/InlineConfirm'
import { API_BASE } from '@/services/api/config'

// ---------------- USERS MODAL ----------------
const AdminUsersModal: FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE}/users.php?action=list`, { credentials: 'include' })
        if (!res.ok) throw new Error('Failed to fetch users')
        const data = await res.json()
        setUsers(data.items || [])
      } catch (err) {
        console.error(err)
        setError('Could not load users.')
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h3 className="text-lg font-semibold">Active Users</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-sm font-semibold"
          >
            ✕ Close
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-center text-sm text-gray-500 py-6">Loading users...</p>
          ) : error ? (
            <p className="text-center text-sm text-red-600 py-6">{error}</p>
          ) : users.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-6">No users found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b bg-gray-50">
                  <th className="py-2 px-3">User ID</th>
                  <th className="px-3">Username</th>
                  <th className="px-3">Email</th>
                  <th className="px-3">Roles</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.user_id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3">{u.user_id ?? '—'}</td>
                    <td className="px-3 font-medium">{u.username}</td>
                    <td className="px-3">{u.email || '—'}</td>
                    <td className="px-3">
                      {u.roles?.length ? (
                        <span className="inline-block rounded bg-blue-100 text-blue-700 px-2 py-0.5 text-xs font-semibold">
                          {u.roles.join(', ')}
                        </span>
                      ) : (
                        <span className="text-gray-400">no roles</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------- MAIN ADMIN PAGE ----------------
type Props = {
  rows: Product[]
  onSave: (data: Partial<Product>) => void
  onRemove: (sku: string) => void
}

const AdminPage: FC<Props> = ({ rows, onSave, onRemove }) => {
  const skuRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const priceRef = useRef<HTMLInputElement>(null)
  const sellerRef = useRef<HTMLInputElement>(null)
  const categoryRef = useRef<HTMLSelectElement>(null)
  const statusRef = useRef<HTMLSelectElement>(null)

  const [editingSku, setEditingSku] = useState<string | null>(null)
  const confirm = useInlineConfirm<string>()

  // --- Logo Upload ---
  const [logoUrl, setLogoUrl] = useState<string | null>(() => localStorage.getItem('siteLogo') || null)

  const handleLogoUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`${API_BASE}/upload.php`, { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      setLogoUrl(data.url)
      localStorage.setItem('siteLogo', data.url)
      alert('Logo updated successfully!')
    } catch (err) {
      console.error(err)
      alert('Logo upload failed.')
    }
  }

  const handleDeleteLogo = () => {
    if (window.confirm('Are you sure you want to delete the logo and revert to default?')) {
      localStorage.removeItem('siteLogo')
      setLogoUrl(null)
      alert('Logo reverted to default.')
    }
  }

  const fillForm = (r: Product) => {
    if (skuRef.current) skuRef.current.value = r.sku
    if (nameRef.current) nameRef.current.value = r.name
    if (priceRef.current) priceRef.current.value = String(r.price)
    if (sellerRef.current) sellerRef.current.value = r.seller
    if (categoryRef.current) categoryRef.current.value = r.category
    if (statusRef.current) statusRef.current.value = r.status || 'active'
    setEditingSku(r.sku)
  }

  const clearForm = () => {
    if (skuRef.current) skuRef.current.value = ''
    if (nameRef.current) nameRef.current.value = ''
    if (priceRef.current) priceRef.current.value = ''
    if (sellerRef.current) sellerRef.current.value = ''
    if (categoryRef.current) categoryRef.current.value = 'Misc'
    if (statusRef.current) statusRef.current.value = 'active'
    setEditingSku(null)
  }

  // --- Modal state
  const [showUsersModal, setShowUsersModal] = useState(false)

  return (
    <main className="max-w-6xl mx-auto px-4 mt-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Admin Dashboard</h2>
        <button
          onClick={() => setShowUsersModal(true)}
          className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          View Users
        </button>
      </div>

      {/* Website Logo Section */}
      <div className="bg-white rounded-xl p-4 shadow">
        <h3 className="font-semibold mb-3">Website Logo</h3>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-28 h-28 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-gray-500">No logo (default in use)</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleLogoUpload(file)
              }}
              className="block text-sm file:mr-3 file:rounded file:border-0 file:bg-gray-800 file:text-white file:px-3 file:py-2 file:hover:bg-gray-700"
            />
            {logoUrl && (
              <button
                type="button"
                onClick={handleDeleteLogo}
                className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 text-red-600"
              >
                Delete Logo (Revert)
              </button>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Upload PNG/JPG — updates the site logo immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Product Form */}
      <form className="bg-white rounded-xl p-4 shadow grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">SKU</label>
          <input ref={skuRef} className="w-full rounded border px-3 py-2" placeholder="SKU-1000" />
        </div>
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input ref={nameRef} className="w-full rounded border px-3 py-2" placeholder="Product Name" />
        </div>
        <div>
          <label className="block text-sm mb-1">Price</label>
          <input ref={priceRef} type="number" step="0.01" className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Seller</label>
          <input ref={sellerRef} className="w-full rounded border px-3 py-2" placeholder="sally" />
        </div>
        <div>
          <label className="block text-sm mb-1">Category</label>
          <select ref={categoryRef} className="w-full rounded border px-3 py-2">
            <option>Electronics</option>
            <option>Clothing</option>
            <option>Books</option>
            <option>Misc</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Status</label>
          <select ref={statusRef} className="w-full rounded border px-3 py-2">
            <option>active</option>
            <option>archived</option>
            <option>pending</option>
          </select>
        </div>

        <div className="col-span-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={() =>
              onSave({
                sku: skuRef.current?.value,
                name: nameRef.current?.value,
                price: parseFloat(priceRef.current?.value || '0'),
                seller: sellerRef.current?.value,
                category: (categoryRef.current?.value as Product['category']) || 'Misc',
                status: statusRef.current?.value as NonNullable<Product['status']>,
              })
            }
            className="px-4 py-2 rounded bg-gray-900 text-white"
          >
            Save (Mock)
          </button>
        </div>
      </form>

      {/* Product List */}
      <div className="bg-white rounded-xl p-4 shadow">
        <h3 className="font-semibold mb-2">Product Listings (Mock)</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">SKU</th>
              <th>Name</th>
              <th>Price</th>
              <th>Seller</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const isConfirming = confirm.isConfirming(r.sku)
              return (
                <tr key={r.sku} className="border-b">
                  <td className="py-2">{r.sku}</td>
                  <td>{r.name}</td>
                  <td>${r.price}</td>
                  <td>{r.seller}</td>
                  <td>{r.status}</td>
                  <td className="text-right py-2">
                    {!isConfirming ? (
                      <div className="inline-flex gap-3">
                        <button
                          type="button"
                          onClick={() => fillForm(r)}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => confirm.request(r.sku)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <InlineConfirm
                        confirming
                        onConfirm={() =>
                          confirm.confirm(r.sku, (sku) => {
                            onRemove(sku)
                            if (editingSku === sku) clearForm()
                          })
                        }
                        onCancel={confirm.cancel}
                      />
                    )}
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td className="py-3 text-gray-500" colSpan={6}>
                  No products.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Users Modal */}
      <AdminUsersModal open={showUsersModal} onClose={() => setShowUsersModal(false)} />
    </main>
  )
}

export default AdminPage
