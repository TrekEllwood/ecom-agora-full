import type { FC } from 'react'
import CategorySidebar from '../components/CategorySidebar'
import ProductList from '@/catalog/components/ProductList'
import type { Product } from '@/shared/types/domain'

type Props = {
  items: Product[]
  onCategory: (cat: string | null) => void
  onView: (sku: string) => void
  onAdd: (sku: string, qty: number) => void
}

const HomePage: FC<Props> = ({ items, onCategory, onView, onAdd }) => (
  <main className="max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
    {/* Sidebar */}
    <CategorySidebar onPick={onCategory} />

    {/* Products */}
    <section className="col-span-1 md:col-span-9 space-y-6">
      <h2 className="text-xl font-semibold">Featured Products</h2>
      <ProductList items={items} onView={onView} onAdd={onAdd} />
    </section>
  </main>
)

export default HomePage
