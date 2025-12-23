import type { FC } from 'react'
import { useCategories } from '../hooks/useCategories'

type Props = { onPick: (cat: string | null) => void }

const CategorySidebar: FC<Props> = ({ onPick }) => {
  const { items, loading, error } = useCategories()

  // Mobile dropdown
  const mobile = (
    <div className="block md:hidden mb-4">
      <label className="block text-sm font-semibold mb-1">Categories</label>
      <select
        onChange={(e) => onPick(e.target.value || null)}
        className="w-full rounded border px-3 py-2"
        disabled={loading || !!error}
      >
        <option value="">All</option>
        {items.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      {loading && <div className="text-xs text-gray-500 mt-1">Loading…</div>}
      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
    </div>
  )

  // Desktop sidebar
  const desktop = (
    <aside className="hidden md:block col-span-3 bg-white rounded-xl p-4 h-fit shadow">
      <h2 className="font-semibold mb-2">Categories</h2>
      {loading && <div className="text-xs text-gray-500">Loading…</div>}
      {error && <div className="text-xs text-red-600">{error}</div>}
      {!loading && !error && (
        <ul className="list-disc ml-6 text-sm space-y-2">
          {items.map((c) => (
            <li key={c}>
              <button onClick={() => onPick(c)} className="hover:underline">{c}</button>
            </li>
          ))}
          <li>
            <button onClick={() => onPick(null)} className="hover:underline">All</button>
          </li>
        </ul>
      )}
    </aside>
  )

  return (
    <>
      {mobile}
      {desktop}
    </>
  )
}

export default CategorySidebar
