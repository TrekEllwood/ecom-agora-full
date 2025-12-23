// import type { ProductsSearchResponse } from './types'
// import type { CategoriesResponse } from './types'
// import type { UserDTO } from './types'

// export async function getProductsMock(): Promise<ProductsSearchResponse> {
//   return {
//     items: [
//       {
//         sku: 'CAM-7000',
//         name: '4K Action Camera',
//         category: 'Electronics',
//         desc: 'Rugged action camera with 4K/60fps.',
//         seller: 'seller01',
//         price_dollars: 349,
//         stock: 12,
//         status: 'active',
//         imageUrl: 'https://picsum.photos/seed/camera/300/300',
//       },
//       {
//         sku: 'BK-3000',
//         name: 'Clean Code',
//         category: 'Books',
//         desc: 'Agile craftsmanship handbook.',
//         seller: 'both01',
//         price_dollars: 69,
//         stock: 20,
//         status: 'active',
//         imageUrl: 'https://picsum.photos/seed/book/300/300',
//       },
//       {
//         sku: 'HDP-1100',
//         name: 'Noise-Cancel Headphones',
//         category: 'Electronics',
//         desc: 'Over-ear ANC, 30h battery life.',
//         seller: 'seller02',
//         price_dollars: 199,
//         stock: 8,
//         status: 'active',
//         imageUrl: 'https://picsum.photos/seed/headphones/300/300',
//       },
//       {
//         sku: 'CL-9000',
//         name: 'Eco T-Shirt',
//         category: 'Clothing',
//         desc: 'Organic cotton T-shirt with eco-friendly dyes.',
//         seller: 'seller03',
//         price_dollars: 29,
//         stock: 50,
//         status: 'active',
//         imageUrl: 'https://picsum.photos/seed/tshirt/300/300',
//       },
//     ],
//     meta: {
//       page: 1,
//       per: 20,
//       total: 4,
//       pages: 1,
//       sort: 'created_desc',
//     },
//   }
// }

// export async function getCategoriesMock(): Promise<CategoriesResponse> {
//   return { items: ['Electronics', 'Clothing', 'Books', 'Misc'] }
// }

// export async function getUsersMock(): Promise<UserDTO[]> {
//   return [
//     {
//       username: 'admin',
//       roles: ['admin'],
//       password: 'admin'
//     },
//     {
//       username: 'buyer01',
//       roles: ['buyer'],
//       password: 'buyer01'
//     },
//     {
//       username: 'seller01',
//       roles: ['seller'],
//       password: 'seller01'
//     },
//     {
//       username: 'both01',
//       roles: ['buyer','seller'],
//       password: 'both01'
//     },
//   ]
// }

// export async function getRolesMock(): Promise<CategoriesResponse> {
//   return { items: ['buyer', 'seller', 'admin'] }
// }
