import type { FC } from 'react'
import type { CartItem, User } from '@/shared/types/domain'

type Props = {
  items: CartItem[]
  subtotal: number
  onQty: (sku: string, qty: number) => void
  onRemove: (sku: string) => void
  onPlaceOrder: () => void
  user: User | null
  isBuyer: boolean
}

const CartPage: FC<Props> = ({ items, subtotal, onQty, onRemove, onPlaceOrder, user, isBuyer }) => {
  return (
    <main className="max-w-6xl mx-auto px-4 mt-6 space-y-6">
      <h2 className="text-xl font-semibold">Your Cart</h2>

      <div className="bg-white rounded-xl p-4 shadow">
        {items.length === 0 ? (
          <p className="text-gray-500">Your cart is empty.</p>
        ) : (
          <>
            <ul className="divide-y">
              {items.map(item => (
                <li key={item.sku} className="py-2 flex justify-between items-center">
                  <div>
                    {item.name}
                    <span className="ml-2 text-sm text-gray-500">x{item.qty}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onQty(item.sku, Math.max(1, item.qty - 1))}
                        className="px-2 py-1 border rounded"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={item.stock ?? 99}
                        value={item.qty}
                        onChange={(e) =>
                          onQty(item.sku, Math.min(Math.max(+e.target.value || 1, 1), item.stock ?? Infinity))
                        }
                        className="w-16 rounded border px-2 py-1 text-center"
                      />
                      <button
                        onClick={() =>
                          onQty(item.sku, Math.min(item.qty + 1, item.stock ?? Infinity))
                        }
                        className="px-2 py-1 border rounded"
                      >
                        +
                      </button>
                    </div>
                    <button onClick={() => onRemove(item.sku)} className="text-red-600 text-sm">
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex justify-between items-center">
              <div className="text-lg font-semibold">Subtotal: ${subtotal.toFixed(2)}</div>
              <button
                onClick={onPlaceOrder}
                disabled={!user || !isBuyer}
                className={`px-4 py-2 rounded text-white font-medium ${!user || !isBuyer
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                Place Order
              </button>
            </div>

            {(!user || !isBuyer) && (
              <p className="mt-2 text-xs text-gray-500">
                You must be logged in as a <b>buyer</b> to place an order.
              </p>
            )}
          </>
        )}
      </div>
    </main>
  )
}

export default CartPage
