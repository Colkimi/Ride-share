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
  const [currentPage, setCurrentPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const itemsPerPage = 10

  const { data: allUsers, isLoading, isError, error } = useQuery<User[]>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const response = await getUsers(1, 1000); // Large limit to get all users
      return Array.isArray(response) ? response : response.users || [];
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] })
      toast.success('User deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete user')
    }
  })

  const updateMutation = useMutation({
    mutationFn: (updatedUser: UpdateUserData) => updateUser(updatedUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] })
      setEditingUser(null)
      toast.success('User updated successfully')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update user')
    }
  })

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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handleCreateUser = () => {
    setShowCreateModal(true)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
  }

  const handleUserCreated = () => {
    setShowCreateModal(false)
    queryClient.invalidateQueries({ queryKey: ['allUsers'] })
    toast.success('User created successfully')
  }

  const getVisiblePages = (current: number, total: number) => {
    const pages = []
    const maxPagesToShow = 5
    let startPage = Math.max(1, current - Math.floor(maxPagesToShow / 2))
    let endPage = startPage + maxPagesToShow - 1
    if (endPage > total) {
      endPage = total
      startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    return pages
  }

  const totalUsers = allUsers || []
  const totalCount = totalUsers.length
  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const users = totalUsers.slice(startIndex, endIndex)
  const visiblePages = getVisiblePages(currentPage, totalPages)


  if (user?.role !== 'admin') {
    return (
      <div className="p-6 dark:bg-slate-900">
        <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-700 border dark:border-slate-600">
          <p className="text-red-500 dark:text-red-400 font-semibold">Access Denied</p>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Only administrators can manage users.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-6 dark:bg-slate-900">
        <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-700 border dark:border-slate-600">
          <p className="text-gray-600 dark:text-gray-300">Loading users...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-6 dark:bg-slate-900">
        <div className="text-center py-8 bg-red-50 dark:bg-red-900/20 rounded-lg shadow border border-red-200 dark:border-red-800">
          <p className="text-red-500 dark:text-red-400 font-semibold">Error loading users</p>
          <p className="text-red-600 dark:text-red-300 mt-2">
            {error && typeof error === 'object' && 'message' in error 
              ? (error as Error).message 
              : 'Failed to load user data'}
          </p>
          <button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['allUsers'] })}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded dark:bg-red-700 dark:hover:bg-red-800"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-w-full overflow-x-auto dark:bg-slate-900 min-h-screen">
      <Toaster richColors position="top-center" closeButton={false} />
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold dark:text-white">User Management</h1>
          <button 
            className={`${styles.actionButton} ${styles.edit} dark:bg-blue-600 dark:hover:bg-blue-700`}
            onClick={handleCreateUser}
          >
            Create New User
          </button>
        </div>

        {editingUser && (
          <div className="mb-6">
            <EditUserForm user={editingUser} onCancel={handleCancelEdit} onUpdate={handleUpdate} />
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto border dark:border-slate-600 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New User</h2>
                <button 
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <AdminCreateUserForm onSuccess={handleUserCreated} onCancel={handleCloseModal} />
            </div>
          </div>
        )}

        {users && users.length > 0 ? (
          <>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-700 overflow-hidden border dark:border-slate-600">
              <table className={`${styles.table} dark:bg-slate-800`}>
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    <th className="dark:text-gray-200">User ID</th>
                    <th className="dark:text-gray-200">First Name</th>
                    <th className="dark:text-gray-200">Last Name</th>
                    <th className="dark:text-gray-200">Email</th>
                    <th className="dark:text-gray-200">Role</th>
                    <th className="dark:text-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: User) => (
                    <tr key={user.userId} className="dark:bg-slate-800 dark:border-slate-600">
                      <td className="dark:text-gray-300">{user.userId}</td>
                      <td className="dark:text-gray-300">{user.firstName}</td>
                      <td className="dark:text-gray-300">{user.lastName}</td>
                      <td className="dark:text-gray-300">{user.email}</td>
                      <td>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          user.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                          user.role === 'driver' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                          user.role === 'customer' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className={styles.actions}>
                        <button 
                          className={`${styles.actionButton} ${styles.edit} dark:bg-blue-600 dark:hover:bg-blue-700`} 
                          onClick={() => handleEditClick(user)}
                        >
                          Edit
                        </button>
                        <button 
                          className={`${styles.actionButton} ${styles.delete} dark:bg-red-600 dark:hover:bg-red-700`} 
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

            {/* Pagination Controls - Only show if more than one page */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Showing {Math.min(startIndex + 1, totalCount)} - {Math.min(endIndex, totalCount)} of {totalCount} users
                  (Page {currentPage} of {totalPages})
                </div>
                <div className="flex space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500' : 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'}`}
                  >
                    Previous
                  </button>

                  {/* Page numbers */}
                  {visiblePages.map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded ${
                        page === currentPage 
                          ? 'bg-blue-500 text-white dark:bg-blue-600' 
                          : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500' : 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : totalCount === 0 ? (
          <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-700 border dark:border-slate-600">
            <p className="text-gray-500 dark:text-gray-400">No users found.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Try creating a new user or check your connection.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

// ... rest of the EditUserForm component stays the same ...
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
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-700 p-6 border dark:border-slate-600">
      <form className={styles.formContainer} onSubmit={handleSubmit}>
        <div className={`${styles.formTitle} dark:text-white`}>Edit User</div>

        <label className={`${styles.label} dark:text-gray-200`}>First Name:</label>
        <input
          className={`${styles.input} dark:bg-slate-700 dark:border-slate-600 dark:text-white`}
          type="text"
          value={formData.firstName || ''}
          onChange={(e) => handleChange('firstName', e.target.value)}
        />

        <label className={`${styles.label} dark:text-gray-200`}>Last Name:</label>
        <input
          className={`${styles.input} dark:bg-slate-700 dark:border-slate-600 dark:text-white`}
          type="text"
          value={formData.lastName || ''}
          onChange={(e) => handleChange('lastName', e.target.value)}
        />

        <label className={`${styles.label} dark:text-gray-200`}>Email:</label>
        <input
          className={`${styles.input} dark:bg-slate-700 dark:border-slate-600 dark:text-white`}
          type="email"
          value={formData.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
        />

        <label className={`${styles.label} dark:text-gray-200`}>Role:</label>
        <select
          className={`${styles.select} dark:bg-slate-700 dark:border-slate-600 dark:text-white`}
          value={formData.role || ''}
          onChange={(e) => handleChange('role', e.target.value)}
        >
          <option value="">Select Role</option>
          <option value="admin">admin</option>
          <option value="driver">driver</option>
          <option value="customer">customer</option>
        </select>

        <div className="pt-4 space-y-2">
          <button className={`${styles.button} dark:bg-blue-600 dark:hover:bg-blue-700`} type="submit">
            Update User
          </button>
          <button className={`${styles.button} dark:bg-gray-600 dark:hover:bg-gray-700`} type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default UserList

