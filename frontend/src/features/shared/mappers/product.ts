import type { Product } from '../types/domain'
import type { ProductDTO } from '@/services/api/types'

export function toProduct(dto: ProductDTO): Product {
  return {
    id: dto.product_id,
    sku: dto.sku,
    name: dto.name,
    category: dto.category,
    desc: dto.description ?? '',
    seller: dto.seller ?? 'unknown',
    price_cents: dto.price_cents,
    price: dto.price_dollars ?? dto.price_cents / 100,
    stock: dto.stock ?? 0,
    status: dto.status ?? 'active',
    imageUrl: dto.image_url ?? undefined,
  }
}
