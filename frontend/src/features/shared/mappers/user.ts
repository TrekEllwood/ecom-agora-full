import type { User } from '../types/domain'
import type { UserDTO } from '@/services/api/types'

export function toUser(dto: UserDTO): User {
  const roles = Array.from(
    new Set(
      (Array.isArray(dto.roles) ? dto.roles : [])
        .filter((r): r is string => typeof r === 'string')
        .map((r) => r.trim().toLowerCase())
        .filter(Boolean)
    )
  )

  return {
    user_id: dto.user_id ?? 0,
    username: dto.username ?? '',
    email: dto.email ?? '',
    roles,
  }
}
