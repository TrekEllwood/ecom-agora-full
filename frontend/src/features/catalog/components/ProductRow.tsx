import { useRef } from 'react'
import type { FC } from 'react'
import { ShoppingCart, Image as ImageIcon } from 'lucide-react'
import type { Product } from '@/shared/types/domain'

type Props = {
  p: Product
  onView: (sku: string) => void
  onAdd: (sku: string, qty: number) => void
}

const ProductRow: FC<Props> = ({ p, onView, onAdd }) => {
  const qtyRef = useRef<HTMLInputElement>(null)

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white rounded-xl p-4 shadow items-start">
      {/* Image */}
      <div className="w-full h-40 md:col-span-2 md:h-24 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
        {p.imageUrl ? (
          <img
            src={p.imageUrl}
            alt={p.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-[10px] text-gray-500">
            <ImageIcon className="w-6 h-6 mb-1 opacity-60" />
            No image
          </div>
        )}
      </div>

      {/* Name and seller */}
      <div className="md:col-span-4 font-medium">
        {p.name}
        <div className="text-xs text-gray-500">by {p.seller}</div>
      </div>

      {/* Price */}
      <div className="md:col-span-2 font-semibold">${p.price}</div>

      {/* Qty and Buttons */}
      <div className="md:col-span-4 flex flex-col gap-2">
        <div className="flex flex-col gap-2 w-fit">
          <input
            ref={qtyRef}
            defaultValue={1}
            min={1}
            type="number"
            className="w-full rounded border px-2 py-1 text-center"
          />
          <button
            onClick={() => onView(p.sku)}
            className="w-full px-3 py-2 rounded bg-gray-100 border"
          >
            View
          </button>
          <button
            onClick={() =>
              onAdd(p.sku, parseInt(qtyRef.current?.value || '1', 10))
            }
            className="px-3 py-2 rounded bg-blue-600 text-white flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductRow
