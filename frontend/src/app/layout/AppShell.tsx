import type { FC } from 'react'
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom'

import Header from '@/shared/pages/Header'
import LoginModal from '@/auth/components/LoginModal'
import RegisterModal from '@/auth/components/RegisterModal'
import HomePage from '@/catalog/pages/HomePage'
import ProductPage from '@/catalog/pages/ProductPage'
import CartPage from '@/cart/pages/CartPage'
import AdminPage from '@/admin/pages/AdminPage'
import SellerPage from '@/seller/pages/SellerPage'
import ProfilePage from '@/profile/pages/ProfilePage'

import { useCatalog } from '@/catalog/hooks/useCatalog'
import { useCart } from '@/cart/hooks/useCart'
import { useAuth } from '@/auth/hooks/useAuth'
import { useAdmin } from '@/admin/hooks/useAdmin'
import toast from 'react-hot-toast'

// Route wrapper for product detail reads sku
const ProductRoute: FC<{
  find: (sku: string) => any
  onAdd: (p: any, qty: number) => void
  onBack: () => void
}> = ({ find, onAdd, onBack }) => {
  const { sku } = useParams<{ sku: string }>()
  const product = sku ? find(sku) : null
  if (!product) return <Navigate to="/" replace />
  return (
    <ProductPage
      product={product}
      onBack={onBack}
      onAdd={(qty) => onAdd(product, qty)}
    />
  )
}

const AppShell: FC = () => {
  const navigate = useNavigate()

  const catalog = useCatalog()
  const cart = useCart()
  const auth = useAuth()
  const admin = useAdmin()

  const isAdmin = auth.isAdmin ?? !!auth.user?.roles.includes('admin')
  const isSeller = auth.isSeller ?? !!auth.user?.roles.includes('seller')
  const isBuyer = auth.isBuyer ?? !!auth.user?.roles.includes('buyer')

  const go = (page: 'home' | 'cart' | 'seller' | 'admin' | 'profile') => {
    if (page === 'home') navigate('/')
    else navigate(`/${page}`)
  }

  return (
    <>
      <Header
        cartCount={cart.count}
        query={catalog.query}
        onSearch={catalog.setQuery}
        onNav={go}
        onOpenLogin={() => auth.setShowLogin(true)}
        onOpenRegister={() => auth.setShowRegister(true)}
        user={auth.user}
        onLogout={auth.logout}
        isBuyer={isBuyer}
        isSeller={isSeller}
        canSeeAdmin={isAdmin}
        isAdmin={isAdmin}
      />

      <Routes>
        {/* Home */}
        <Route
          path="/"
          element={
            <HomePage
              items={catalog.list}
              onCategory={(c: string | null) => catalog.setCategory(c)}
              onView={(sku: string) => navigate(`/product/${sku}`)}
              onAdd={(sku: string, qty: number) => {
                const p = catalog.find(sku)
                if (p) cart.add(p, qty)
              }}
            />
          }
        />

        {/* Product detail */}
        <Route
          path="/product/:sku"
          element={
            <ProductRoute
              find={catalog.find}
              onAdd={(p, qty) => cart.add(p, qty)}
              onBack={() => navigate(-1)}
            />
          }
        />

        {/* Cart */}
        <Route
          path="/cart"
          element={
            <CartPage
              items={cart.items}
              subtotal={cart.subtotal}
              onQty={cart.updateQty}
              onRemove={cart.remove}
              onPlaceOrder={() => {
                alert('Order placed (mock)')
                cart.clear()
                navigate('/')
              }}
              user={auth.user}
              isBuyer={isBuyer}
            />
          }
        />

        {/* Seller guarded */}
        <Route
          path="/seller"
          element={
            isSeller ? (
              <SellerPage
                user={auth.user}
                create={(p) => catalog.create(p)}
                myListings={auth.user ? catalog.bySeller(auth.user.username) : []}
                update={(product) => catalog.update(product)}
                remove={(sku) => catalog.remove(sku)}
              />
            ) : (
              <main className="max-w-6xl mx-auto px-4 mt-10">
                <div className="bg-white rounded-xl shadow p-6 text-center">
                  <h2 className="text-xl font-semibold mb-2">403 — Sellers Only</h2>
                  <p className="text-sm text-gray-600">
                    You must be logged in as a <b>seller</b> to view this page.
                  </p>
                </div>
              </main>
            )
          }
        />

        {/* Admin guarded */}
        <Route
          path="/admin"
          element={
            isAdmin ? (
              <AdminPage rows={admin.rows} onSave={admin.save} onRemove={admin.remove} />
            ) : (
              <main className="max-w-6xl mx-auto px-4 mt-10">
                <div className="bg-white rounded-xl shadow p-6 text-center">
                  <h2 className="text-xl font-semibold mb-2">403 — Admins Only</h2>
                  <p className="text-sm text-gray-600">
                    You must be logged in as an <b>admin</b> to view this page.
                  </p>
                </div>
              </main>
            )
          }
        />

        {/* Profile (guarded) */}
        <Route
          path="/profile"
          element={
            auth.user ? (
              <ProfilePage />
            ) : (
              <main className="max-w-6xl mx-auto px-4 mt-10">
                <div className="bg-white rounded-xl shadow p-6 text-center">
                  <h2 className="text-xl font-semibold mb-2">401 — Please log in</h2>
                  <p className="text-sm text-gray-600">
                    You need to be logged in to view your profile.
                  </p>
                  <button
                    onClick={() => auth.setShowLogin(true)}
                    className="mt-4 px-4 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700"
                  >
                    Log In
                  </button>
                </div>
              </main>
            )
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <LoginModal
        open={auth.showLogin}
        onClose={() => auth.setShowLogin(false)}
        onLogin={auth.login}
        onOpenRegister={() => {
          auth.setShowLogin(false)
          auth.setShowRegister(true)
        }}
      // disable login if roles failed to load
      // loginDisabled={auth.roles?.length === 0}
      />

      <RegisterModal
        open={auth.showRegister}
        onClose={() => auth.setShowRegister(false)}
        onRegister={(data) => {
          console.log('Registered new user:', data)
        }}
        onLoginSuccess={(user) => {
          auth.setUser({
            user_id: user.user_id,
            username: user.username,
            roles: user.roles,
          })
          auth.setShowRegister(false)
          toast.success(`Welcome, ${user.username}!`)
        }}
      />

      <footer className="mt-10 bg-gray-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm flex flex-wrap justify-center gap-6 items-center">
          <a className="hover:underline" href="#">About Us</a>
          <a className="hover:underline" href="#">Policy</a>
          <a className="hover:underline" href="#">Contact</a>
          <span className="opacity-70">• ecom store mock</span>
        </div>
      </footer>
    </>
  )
}

export default AppShell
