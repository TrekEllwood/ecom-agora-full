import { useRef } from 'react'
import type { FC } from 'react'
import { ShoppingCart, Image as ImageIcon } from 'lucide-react'
import type { Product } from '@/shared/types/domain'

type Props = { product: Product; onBack: () => void; onAdd: (qty: number) => void }

const ProductPage: FC<Props> = ({ product, onBack, onAdd }) => {
  const qtyRef = useRef<HTMLInputElement>(null)

  return (
    <main className="max-w-6xl mx-auto px-4 mt-6">
      <button onClick={onBack} className="text-sm text-blue-600">← Back to products</button>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image */}
        <div className="bg-white rounded-xl p-0 shadow h-72 flex items-center justify-center overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-sm text-gray-500">
              <ImageIcon className="w-8 h-8 mb-2 opacity-60" />
              No image
            </div>
          )}
        </div>

        {/* Details */}
        <div className="bg-white rounded-xl p-4 shadow space-y-3">
          <h3 className="text-2xl font-bold">{product.name}</h3>
          <div className="text-sm text-gray-500">by {product.seller}</div>
          <div className="text-lg font-semibold">${product.price}</div>
          <p className="text-sm text-gray-700">{product.desc}</p>

          <div className="flex items-center gap-2">
            <label className="text-sm">Qty</label>
            <input
              ref={qtyRef}
              defaultValue={1}
              min={1}
              type="number"
              className="w-20 rounded border px-2 py-1"
            />
          </div>

          <button
            onClick={() => onAdd(parseInt(qtyRef.current?.value || '1', 10))}
            className="mt-2 px-4 py-2 rounded bg-blue-600 text-white flex items-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </button>
        </div>
      </div>
    </main>
  )
}

export default ProductPage
