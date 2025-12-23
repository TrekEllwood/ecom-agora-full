import { useState, useEffect } from 'react'

export type Page = 'home' | 'product' | 'cart' | 'admin' | 'seller'

export function useNav() {
  const [page, setPage] = useState<Page>('home')
  const [activeSku, setActiveSku] = useState<string | null>(null)

  const go = (next: Page, sku?: string) => {
    setPage(next)
    setActiveSku(sku ?? null)

    // build URL for history
    let url = '/'
    if (next === 'product' && sku) {
      url = `/product/${sku}`
    } else if (next !== 'home') {
      url = `/${next}`
    }

    window.history.pushState({ page: next, sku }, '', url)
  }

  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      if (e.state?.page) {
        setPage(e.state.page as Page)
        setActiveSku(e.state.sku ?? null)
      } else {
        setPage('home')
        setActiveSku(null)
      }
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  return { page, activeSku, go }
}
