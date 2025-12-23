import { useEffect, useState } from 'react'

/**
 * Generic inline confirm helper for row/item deletes.
 * Usage:
 *   const confirm = useInlineConfirm<string>()
 *   confirm.request(sku) show confirm for this sku
 *   confirm.isConfirming(sku) render confirm UI for this row
 *   confirm.confirm(sku, (id) => ...) run delete when user confirms
 *   confirm.cancel() hide confirmation
 */
export function useInlineConfirm<T = string>() {
  const [current, setCurrent] = useState<T | null>(null)

  const request = (id: T) => setCurrent(id)
  const cancel = () => setCurrent(null)
  const isConfirming = (id: T) => current !== null && Object.is(current, id)

  const confirm = (id: T, onConfirm: (id: T) => void) => {
    if (isConfirming(id)) {
      onConfirm(id)
      setCurrent(null)
    }
  }

  // Optional UX: ESC key cancels when a confirmation is open
  useEffect(() => {
    if (current === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCurrent(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current])

  return { current, request, cancel, isConfirming, confirm }
}
