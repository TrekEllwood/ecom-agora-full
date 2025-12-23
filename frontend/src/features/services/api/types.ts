export type ProductDTO = {
  product_id: number
  sku: string
  name: string
  category: string
  description?: string
  seller?: string
  price_cents: number
  price_dollars?: number
  stock?: number
  status?: string
  image_url?: string
}

export interface UserDTO {
  user_id?: number
  username: string
  email?: string
  roles: string[]
  // password?: string // for mock login only
}


export interface ProductsSearchResponse {
  items: ProductDTO[]
  meta: {
    page: number
    per: number
    total: number
    pages: number
    sort: string
  }
}

export interface CategoriesResponse {
  items: string[]
}

export interface RolesResponse {
  items: string[]
}

export interface ApiError {
  error: string
}

export type ProductResponse = {
  product_id: number
}

