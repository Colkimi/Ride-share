import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBookings, deleteBooking, updateBooking, type Booking, type UpdateBookingData, Status } from '@/api/Bookings'
import styles from '../FormStyles.module.css'
import { Toaster, toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { CreateBookingForm } from '@/Forms/CreateBookingForm'

function AdminBookingList() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { data: allBookings, isLoading, isError } = useQuery<Booking[]>({
    queryKey: ['bookings'],
    queryFn: getBookings,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteBooking(id),
    onSuccess: () => {
      toast.success('Booking deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
    onError: () => {
      toast.error('Failed to delete booking')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateBookingData) => updateBooking(data),
    onSuccess: () => {
      toast.success('Booking updated successfully')
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      setEditingBooking(null)
    },
    onError: () => {
      toast.error('Failed to update booking')
    },
  })

  const [editingBooking, setEditingBooking] = useState<Booking & { id: number } | null>(null)


  const bookings = user?.role === 'admin' 
    ? allBookings 
    : allBookings?.filter(booking => (booking as any).userId === user?.userId) || []

  if (isLoading) {
    return <div className="p-6">Loading bookings...</div>
  }

  if (isError) {
    return <div className="p-6">Error loading bookings.</div>
  }

  const handleDelete = (id?: number) => {
    if (!id) return
    if (window.confirm('Are you sure you want to delete this booking?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleEditClick = (booking: Booking) => {
    if (booking.id === undefined) {
      console.error('Booking id is undefined, cannot edit')
      return
    }
    setEditingBooking(booking as Booking & { id: number })
  }

  const handleCancelEdit = () => {
    setEditingBooking(null)
  }

  const handleUpdate = (updatedBooking: UpdateBookingData) => {
    if (updatedBooking.id === undefined) {
      console.error('Booking id is undefined, cannot update')
      return
    }
    updateMutation.mutate(updatedBooking as UpdateBookingData)
  }
 const [showCreateForm, setShowCreateForm] = useState(false)
 const [showContent, setShowContent] = useState(true)
  return ( 
    <div className="p-6">
      <Toaster richColors position="top-center" closeButton={false} />
      
      <div className="flex justify-between items-center mb-6">
        { showContent && (
        <h1 className="text-2xl font-bold">
          {user?.role === 'admin' ? 'All Bookings' : 'My Bookings'}
        </h1>
        )}
        {showCreateForm && (
        <div 
          >
         <CreateBookingForm />
          <img src='/cancel.png' width={25} className='absolute right-1 ' onClick={() => {
           setShowCreateForm(false)
          setShowContent(true)
          }} />
        </div>
          )}
        {user?.role === 'admin' | user?.role === 'customer' &&  (
          showContent &&(
        <button
       className={`${styles.actionButton} ${styles.edit}`}
     onClick={() => {
window.location.href = '/create'
      }}     
       >
      Create New Booking
       </button>
        ))}
      </div>

      {editingBooking && (
        <div className="mb-6 shadow-lg">
          <EditBookingForm
            booking={editingBooking}
            onCancel={handleCancelEdit}
            onUpdate={handleUpdate}
          />
        </div>
      )}

      {bookings &&  bookings.length > 0 ? showContent && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Start Location</th>
                <th>End Location</th>
                <th>Pickup Time</th>
                <th>Dropoff Time</th>
                <th>Status</th>
                <th>Fare</th>
                <th>Distance</th>
                <th>Duration</th>
                {user?.role === 'admin' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.id}</td>
                  <td>
                    {booking.start_latitude.toFixed(4)}, {booking.start_longitude.toFixed(4)}
                  </td>
                  <td>
                    {booking.end_latitude.toFixed(4)}, {booking.end_longitude.toFixed(4)}
                  </td>
                  <td>{new Date(booking.pickup_time).toLocaleString()}</td>
                  <td>{new Date(booking.dropoff_time).toLocaleString()}</td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      booking.status === Status.Completed ? 'bg-green-100 text-green-800' :
                      booking.status === Status.Requested ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === Status.Accepted ? 'bg-blue-100 text-blue-800' :
                      booking.status === Status.In_progress ? 'bg-purple-100 text-purple-800' :
                      booking.status === Status.Cancelled ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>${booking.fare?.toFixed(2)}</td>
                  <td>{booking.distance?.toFixed(2)} km</td>
                  <td>{booking.duration?.toFixed(0)} min</td>
                  {user?.role === 'admin' && (
                    <td className={styles.actions}>
                      <button 
                        className={`${styles.actionButton} ${styles.edit}`} 
                        onClick={() => handleEditClick(booking)}
                      >
                        Edit
                      </button>
                      <button 
                        className={`${styles.actionButton} ${styles.delete}`} 
                        onClick={() => handleDelete(booking.id)}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">No bookings found.</p>
          {user?.role === 'customer' && (
            <button 
              className={`${styles.actionButton} ${styles.edit} mt-4`}
              onClick={() => window.location.href = '/create'}
            >
              Book Your First Ride
            </button>
          )}
        </div>
      )}
    </div>
  )
}

type EditBookingFormProps = {
  booking: Booking
  onCancel: () => void
  onUpdate: (updatedBooking: UpdateBookingData) => void
}

function EditBookingForm({ booking, onCancel, onUpdate }: EditBookingFormProps) {
  const [formData, setFormData] = useState<UpdateBookingData>(booking)

  const handleChange = (field: keyof UpdateBookingData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(formData)
  }

  return (
    <form className={styles.formContainer} onSubmit={handleSubmit}>
      <div className={styles.formTitle}>Edit Booking</div>

      <label className={styles.label}>Pickup Time:</label>
      <input
        className={styles.input}
        type="datetime-local"
        value={formData.pickup_time}
        onChange={(e) => handleChange('pickup_time', e.target.value)}
      />

      <label className={styles.label}>Dropoff Time:</label>
      <input
        className={styles.input}
        type="datetime-local"
        value={formData.dropoff_time}
        onChange={(e) => handleChange('dropoff_time', e.target.value)}
      />

      <label className={styles.label}>Status:</label>
      <select
        className={styles.select}
        value={formData.status}
        onChange={(e) => handleChange('status', e.target.value as Status)}
      >
        {Object.values(Status).map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>

      <label className={styles.label}>Fare:</label>
      <input
        className={styles.input}
        type="number"
        value={formData.fare || 0}
        onChange={(e) => handleChange('fare', parseFloat(e.target.value))}
      />

      <label className={styles.label}>Distance:</label>
      <input
        className={styles.input}
        type="number"
        value={formData.distance || 0}
        onChange={(e) => handleChange('distance', parseFloat(e.target.value))}
      />

      <label className={styles.label}>Duration:</label>
      <input
        className={styles.input}
        type="number"
        value={formData.duration || 0}
        onChange={(e) => handleChange('duration', parseFloat(e.target.value))}
      />

      <div className="pt-4 space-y-2">
        <button className={styles.button} type="submit">
          Update Booking
        </button>
        <button className={styles.button} type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default AdminBookingList
