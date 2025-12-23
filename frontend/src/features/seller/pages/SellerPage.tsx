import type { FC } from 'react'
import type { Product, User } from '@/shared/types/domain'
import { useSeller } from '../hooks/useSeller'
import { useInlineConfirm } from '@/shared/hooks/useInlineConfirm'
import { InlineConfirm } from '@/shared/components/InlineConfirm'

type Props = {
  user: User | null
  create: (p: Partial<Product>) => Promise<Product>
  update: (p: Partial<Product>) => Promise<Product>
  remove: (sku: string) => Promise<void>
  myListings: Product[]
}

const SellerPage: FC<Props> = ({ user, create, update, remove, myListings }) => {
  if (!user) {
    return (
      <main className="max-w-6xl mx-auto px-4 mt-6 text-sm text-red-600">
        You must log in as a seller.
      </main>
    )
  }

  const vm = useSeller(user, { create, update, remove })
  const confirm = useInlineConfirm<string>()

  return (
    <main className="max-w-6xl mx-auto px-4 mt-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Seller Dashboard</h2>
        <div className="text-sm text-gray-600">Signed in as: {user.username}</div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl p-4 shadow">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold mb-3">
            {vm.mode === 'edit' ? `Edit Listing (${vm.editingSku})` : 'Add New Listing'}
          </h3>
          {vm.mode === 'edit' && (
            <button
              type="button"
              onClick={vm.cancelEdit}
              className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
              title="Exit edit mode"
            >
              Cancel
            </button>
          )}
        </div>

        {vm.error && (
          <div className="mb-3 rounded bg-red-50 text-red-700 px-3 py-2" role="alert">
            {vm.error}
          </div>
        )}
        {vm.ok && (
          <div className="mb-3 rounded bg-green-50 text-green-700 px-3 py-2" role="status" aria-live="polite">
            {vm.ok}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SKU */}
          <div>
            <label className="block text-sm mb-1">SKU</label>
            <input
              value={vm.fields.sku}
              onChange={e => vm.fields.setSku(e.target.value)}
              className="w-full rounded border px-3 py-2 disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="SKU-1000"
              disabled={vm.mode === 'edit'}
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input
              value={vm.fields.name}
              onChange={e => vm.fields.setName(e.target.value)}
              className="w-full rounded border px-3 py-2"
              placeholder="Product Name"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm mb-1">Price</label>
            <input
              type="number"
              step="0.01"
              value={vm.fields.price === null ? '' : vm.fields.price}
              onChange={e => {
                const val = e.target.value
                vm.fields.setPrice(val === '' ? null : Number(val))
              }}
              className="w-full rounded border px-3 py-2"
              placeholder="00.00"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm mb-1">Stock</label>
            <input
              type="number"
              value={vm.fields.stock === null ? '' : vm.fields.stock}
              onChange={e => {
                const val = e.target.value
                vm.fields.setStock(val === '' ? null : parseInt(val, 10))
              }}
              className="w-full rounded border px-3 py-2"
              placeholder="0"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm mb-1">Category</label>
            <select
              value={vm.fields.category}
              onChange={e => vm.fields.setCategory(e.target.value as any)}
              className="w-full rounded border px-3 py-2"
            >
              <option>Electronics</option>
              <option>Clothing</option>
              <option>Books</option>
              <option>Misc</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm mb-1">Status</label>
            <select
              value={vm.fields.status}
              onChange={e => vm.fields.setStatus(e.target.value as any)}
              className="w-full rounded border px-3 py-2"
            >
              <option>active</option>
              <option>archived</option>
              <option>pending</option>
            </select>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Description</label>
            <textarea
              rows={3}
              value={vm.fields.desc}
              onChange={e => vm.fields.setDesc(e.target.value)}
              className="w-full rounded border px-3 py-2"
              placeholder="Short description..."
            />
          </div>

          {/* Image */}
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Image</label>
            <div className="flex items-start gap-4">
              <div className="w-28 h-28 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                {vm.fields.imageUrl ? (
                  <img src={vm.fields.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-500">No image</span>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => vm.fields.handleImage(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm file:mr-3 file:rounded file:border-0 file:bg-gray-800 file:text-white file:px-3 file:py-2 file:hover:bg-gray-700"
                />
                <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to a few MB (mock, stored in memory)</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="md:col-span-2 flex justify-end gap-2">
            {vm.mode === 'edit' ? (
              <>
                <button
                  type="button"
                  onClick={vm.submit}
                  className="px-4 py-2 rounded bg-blue-600 text-white"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={vm.cancelEdit}
                  className="px-4 py-2 rounded border border-gray-300"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={vm.submit}
                className="px-4 py-2 rounded bg-gray-900 text-white"
              >
                Create Listing
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="bg-white rounded-xl p-4 shadow">
        <h3 className="font-semibold mb-2">My Listings</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Image</th>
              <th>SKU</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th className="w-1"></th>
            </tr>
          </thead>
          <tbody>
            {myListings.map((r) => {
              const isEditing = vm.mode === 'edit' && vm.editingSku === r.sku
              const isConfirming = confirm.isConfirming(r.sku)

              return (
                <tr key={r.sku} className={`border-b ${isEditing ? 'bg-blue-50' : ''}`}>
                  <td className="py-2">
                    <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden flex items-center justify-center">
                      {r.imageUrl ? (
                        <img src={r.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-gray-500">No image</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2">{r.sku}</td>
                  <td>{r.name}</td>
                  <td>${r.price}</td>
                  <td>{r.stock ?? '—'}</td>
                  <td>{r.status}</td>
                  <td className="py-2 text-right">
                    {!isConfirming ? (
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => vm.loadForEdit(r)}
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
                        onConfirm={() => confirm.confirm(r.sku, (sku) => vm.deleteListing(sku))}
                        onCancel={confirm.cancel}
                      />
                    )}
                  </td>
                </tr>
              )
            })}
            {myListings.length === 0 && (
              <tr>
                <td className="py-3 text-gray-500" colSpan={7}>No listings yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}

export default SellerPage
