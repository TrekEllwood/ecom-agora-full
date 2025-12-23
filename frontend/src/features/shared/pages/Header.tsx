import { useState, useEffect } from 'react'
import type { FC } from 'react'
import { ShoppingCart, Menu } from 'lucide-react'
import type { User } from '../types/domain'

type Props = {
  cartCount: number
  query: string
  onSearch: (value: string) => void
  onNav: (page: 'home' | 'cart' | 'seller' | 'admin' | 'profile') => void
  onOpenLogin: () => void
  onOpenRegister: () => void
  user: User | null
  onLogout: () => void
  isSeller: boolean
  isAdmin: boolean
  isBuyer: boolean
  canSeeAdmin: boolean
}

const Header: FC<Props> = ({
  cartCount,
  query,
  onSearch,
  onNav,
  onOpenLogin,
  onOpenRegister,
  user,
  onLogout,
  isSeller,
  canSeeAdmin,
}) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  // Load logo from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('siteLogo')
    if (stored) setLogoUrl(stored)
  }, [])

  return (
    <header className="bg-gray-800 text-white">
      <div className="max-w-6xl mx-auto flex items-center gap-4">
        {/* Logo image */}
        <div className="flex items-center h-full">
          <img
            src={logoUrl || 'https://placehold.co/200x200?text=ECOM%0ASTORE'}
            alt="Logo"
            className="h-full w-auto max-h-20 min-h-[40px] min-w-[40px] object-cover cursor-pointer"
            onClick={() => onNav('home')}
          />
        </div>

        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full rounded-full py-2 pl-10 pr-10 bg-gray-700 placeholder-gray-300 text-white focus:outline-none"
              placeholder="Search products"
            />
            <span className="absolute left-3 top-2.5 opacity-70">🔍</span>
          </div>
        </div>

        {/* Auth section */}
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm hidden sm:inline">
              Hi,&nbsp;
              <button
                onClick={() => onNav('profile')}
                className="font-semibold underline cursor-pointer hover:text-purple-300 transition"
              >
                {user.username || 'User'}
              </button>{' '}
              <span className="opacity-80">
                (
                {user.roles.includes('admin')
                  ? 'admin'
                  : user.roles.filter((r) => r !== 'admin').join(' / ') || 'user'}
                )
              </span>
            </span>

            <button
              onClick={onLogout}
              className="px-3 py-1 rounded-full bg-red-500 text-white font-medium"
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden sm:flex gap-2">
              <button
                onClick={onOpenLogin}
                className="px-3 py-1 rounded-full bg-purple-300 text-gray-900 font-medium"
              >
                Login
              </button>
              <button
                onClick={onOpenRegister}
                className="px-3 py-1 rounded-full bg-gray-200 text-gray-900 font-medium"
              >
                Register
              </button>
            </div>

            {/* Mobile */}
            <div className="sm:hidden relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded bg-gray-700"
              >
                <Menu className="w-5 h-5" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 bg-white text-gray-900 rounded shadow-md w-32">
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      onOpenLogin()
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      onOpenRegister()
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="bg-gray-700">
        <div className="max-w-6xl mx-auto px-4">
          <ul className="flex gap-6 py-2 text-sm items-center">
            <li>
              <button onClick={() => onNav('home')} className="font-semibold hover:underline">
                Home
              </button>
            </li>

            <li>
              <button
                onClick={() => onNav('cart')}
                className="font-semibold hover:underline flex items-center gap-1 relative"
              >
                <ShoppingCart className="w-4 h-4" />
                Cart
                {cartCount > 0 && (
                  <span className="ml-1 inline-block min-w-5 text-center text-xs rounded bg-white/20 px-1">
                    {cartCount}
                  </span>
                )}
              </button>
            </li>

            {isSeller && (
              <li>
                <button onClick={() => onNav('seller')} className="font-semibold hover:underline">
                  Seller
                </button>
              </li>
            )}

            {canSeeAdmin && (
              <li className="ml-auto">
                <button onClick={() => onNav('admin')} className="font-semibold hover:underline">
                  Admin
                </button>
              </li>
            )}
            {!canSeeAdmin && <li className="ml-auto" />}
          </ul>
        </div>
      </nav>
    </header>
  )
}

export default Header
