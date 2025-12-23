import React, { useEffect, useId, useRef } from 'react'
import type { FC } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  onLogin: (username: string, password: string) => void
  onOpenRegister: () => void
  loginDisabled?: boolean
}

const LoginModal: FC<Props> = ({ open, onClose, onLogin, onOpenRegister, loginDisabled = false }) => {
  if (!open) return null

  const titleId = useId()
  const userId = useId()
  const passId = useId()

  const userRef = useRef<HTMLInputElement>(null)
  const passRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    userRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (loginDisabled) return
    onLogin(userRef.current?.value || '', passRef.current?.value || '')
  }

  const onBackdropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={onBackdropMouseDown}
    >
      <div ref={dialogRef} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 id={titleId} className="text-lg font-semibold">Login</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none"
            aria-label="Close login dialog"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor={userId} className="block text-sm mb-1">Username</label>
            <input
              id={userId}
              name="username"
              ref={userRef}
              className="w-full rounded border px-3 py-2"
              placeholder="enter username"
              autoComplete="username"
              required
              disabled={loginDisabled}
            />
          </div>
          <div>
            <label htmlFor={passId} className="block text-sm mb-1">Password</label>
            <input
              id={passId}
              name="password"
              ref={passRef}
              type="password"
              className="w-full rounded border px-3 py-2"
              placeholder="••••••••••••"
              autoComplete="current-password"
              required
              disabled={loginDisabled}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              className="px-4 py-2 rounded bg-gray-900 text-white disabled:opacity-50"
              disabled={loginDisabled}
            >
              {loginDisabled ? 'Login Unavailable' : 'Login'}
            </button>
            <button
              type="button"
              onClick={() => { onClose(); onOpenRegister() }}
              className="px-4 py-2 rounded bg-gray-200 text-gray-900"
              disabled={loginDisabled}
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginModal
