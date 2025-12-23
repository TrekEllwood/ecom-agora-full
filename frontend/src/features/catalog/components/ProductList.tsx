import type { FC } from 'react'
import type { Product } from '@/shared/types/domain'
import ProductRow from '../components/ProductRow'

type Props = {
  items: Product[]
  onView: (sku: string) => void
  onAdd: (sku: string, qty: number) => void
}
const ProductList: FC<Props> = ({ items, onView, onAdd }) => (
  <div className="mt-4 space-y-4">
    {items.map(p => <ProductRow key={p.sku} p={p} onView={onView} onAdd={onAdd} />)}
  </div>
)
export default ProductList
