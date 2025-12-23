import type { FC } from 'react'

type Props = {
  confirming: boolean
  onConfirm: () => void
  onCancel: () => void
  className?: string
  label?: string
}

export const InlineConfirm: FC<Props> = ({
  confirming,
  onConfirm,
  onCancel,
  className = '',
  label = 'Confirm delete?',
}) => {
  if (!confirming) return null
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className="text-xs text-gray-600 mr-1">{label}</span>
      <button
        type="button"
        onClick={onConfirm}
        className="px-2 py-1 rounded bg-red-600 text-white text-xs"
      >
        Confirm
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="px-2 py-1 rounded border border-gray-300 text-xs"
      >
        Cancel
      </button>
    </div>
  )
}
