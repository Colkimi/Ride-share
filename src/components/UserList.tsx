import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUsers, deleteUser, updateUser, type User, type UpdateUserData } from '@/api/Users'
import styles from '../FormStyles.module.css'
import { Toaster, toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { AdminCreateUserForm } from '@/Forms/AdminCreateUserForm'

function UserList() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { data: users, isLoading, isError } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: getUsers,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      toast.success('User deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: () => {
      toast.error('Failed to delete user')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateUserData) => updateUser(data),
    onSuccess: () => {
      toast.success('User updated successfully')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setEditingUser(null)
    },
    onError: () => {
      toast.error('Failed to update user')
    },
  })

  const [editingUser, setEditingUser] = useState<User | null>(null)

  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-red-500 font-semibold">Access Denied</p>
          <p className="text-gray-600 mt-2">Only administrators can manage users.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <div className="p-6">Loading users...</div>
  }

  if (isError) {
    return <div className="p-6">Error loading users.</div>
  }

  const handleDelete = (id?: number) => {
    if (!id) return
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleEditClick = (user: User) => {
    if (user.userId === undefined) {
      console.error('User id is undefined, cannot edit')
      return
    }
    setEditingUser(user)
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
  }

  const handleUpdate = (updatedUser: UpdateUserData) => {
    if (updatedUser.userId === undefined) {
      console.error('User id is undefined, cannot update')
      return
    }
    updateMutation.mutate(updatedUser)
  }

  return (
    <div className="p-6">
      <Toaster richColors position="top-center" closeButton={false} />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button 
          className={`${styles.actionButton} ${styles.edit}`}
          onClick={AdminCreateUserForm}
        >
          Create New User
        </button>
      </div>

      {editingUser && (
        <div className="mb-6">
          <EditUserForm user={editingUser} onCancel={handleCancelEdit} onUpdate={handleUpdate} />
        </div>
      )}

      {users && users.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.userId}>
                  <td>{user.userId}</td>
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'driver' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'customer' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className={styles.actions}>
                    <button 
                      className={`${styles.actionButton} ${styles.edit}`} 
                      onClick={() => handleEditClick(user)}
                    >
                      Edit
                    </button>
                    <button 
                      className={`${styles.actionButton} ${styles.delete}`} 
                      onClick={() => handleDelete(user.userId)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">No users found.</p>
        </div>
      )}
    </div>
  )
}

type EditUserFormProps = {
  user: User
  onCancel: () => void
  onUpdate: (updatedUser: UpdateUserData) => void
}

function EditUserForm({ user, onCancel, onUpdate }: EditUserFormProps) {
  const [formData, setFormData] = useState<UpdateUserData>(user)

  const handleChange = (field: keyof UpdateUserData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(formData)
  }

  return (
    <form className={styles.formContainer} onSubmit={handleSubmit}>
      <div className={styles.formTitle}>Edit User</div>

      <label className={styles.label}>First Name:</label>
      <input
        className={styles.input}
        type="text"
        value={formData.firstName || ''}
        onChange={(e) => handleChange('firstName', e.target.value)}
      />

      <label className={styles.label}>Last Name:</label>
      <input
        className={styles.input}
        type="text"
        value={formData.lastName || ''}
        onChange={(e) => handleChange('lastName', e.target.value)}
      />

      <label className={styles.label}>Email:</label>
      <input
        className={styles.input}
        type="email"
        value={formData.email || ''}
        onChange={(e) => handleChange('email', e.target.value)}
      />

      <label className={styles.label}>Role:</label>
      <select
        className={styles.select}
        value={formData.role || ''}
        onChange={(e) => handleChange('role', e.target.value)}
      >
        <option value="">Select Role</option>
        <option value="admin">admin</option>
        <option value="customer">customer</option>
        <option value="hod">hod</option>
      </select>

      <div className="pt-4 space-y-2">
        <button className={styles.button} type="submit">
          Update User
        </button>{' '}
        <button className={styles.button} type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default UserList
