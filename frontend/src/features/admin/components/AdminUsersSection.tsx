import { useEffect, useState } from 'react'
import type { FC } from 'react'
import type { User } from '@/shared/types/domain'
import { API_BASE } from '@/services/api/config'

const AdminUsersSection: FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE}/users.php?action=list`)
        if (!res.ok) throw new Error('Failed to fetch users')
        const data = await res.json()
        setUsers(data.items || [])
      } catch (err) {
        console.error(err)
        setError('Could not load users.')
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 shadow text-sm text-gray-500">
        Loading users...
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-4 shadow text-sm text-red-600">
        {error}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow">
      <h3 className="font-semibold mb-3 text-lg">Active Users</h3>
      {users.length === 0 ? (
        <p className="text-gray-500 text-sm">No users found.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 px-2">User ID</th>
              <th className="px-2">Username</th>
              <th className="px-2">Email</th>
              <th className="px-2">Roles</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.user_id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-2">{u.user_id ?? '—'}</td>
                <td className="px-2 font-medium">{u.username}</td>
                <td className="px-2">{u.email || '—'}</td>
                <td className="px-2">
                  {u.roles && u.roles.length > 0 ? (
                    <span className="inline-block rounded bg-blue-100 text-blue-700 px-2 py-0.5 text-xs font-semibold">
                      {u.roles.join(', ')}
                    </span>
                  ) : (
                    <span className="text-gray-400">no roles</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default AdminUsersSection
