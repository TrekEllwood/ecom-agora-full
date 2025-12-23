export type Category = string
export type Status = 'active' | 'archived' | 'pending' | string
export type Role = 'buyer' | 'seller' | 'admin' | string

export type Product = {
  id: number
  sku: string
  name: string
  price_cents: number
  price_dollars?: number
  price: number
  seller: string
  category: Category
  desc: string
  stock?: number
  status?: Status
  imageUrl?: string
}

export type CartItem = {
  sku: string
  name: string
  price: number
  qty: number
  stock?: number
}

export type User = {
  user_id: number
  username: string
  email?: string
  roles: Role[]
}
