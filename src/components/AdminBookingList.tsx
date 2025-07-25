import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBookings, deleteBooking, updateBooking, type Booking, type UpdateBookingData, Status } from '@/api/Bookings'
import { getDrivers, type Driver } from '@/api/Driver'
import styles from '../FormStyles.module.css'
import { Toaster, toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { CreateBookingForm } from '@/Forms/CreateBookingForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { DriverAssignmentModal } from './DriverAssignment';

function AdminBookingList() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  
  const { data: paginatedData, isLoading, isError } = useQuery({
    queryKey: ['bookings', page, limit],
    queryFn: () => getBookings(page, limit),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteBooking(id),
    onSuccess: () => {
      toast.success('Booking deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['bookings', page, limit] })
    },
    onError: () => {
      toast.error('Failed to delete booking')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateBookingData) => updateBooking(data),
    onSuccess: () => {
      toast.success('Booking updated successfully')
      queryClient.invalidateQueries({ queryKey: ['bookings', page, limit] })
      setEditingBooking(null)
    },
    onError: () => {
      toast.error('Failed to update booking')
    },
  })

  const [editingBooking, setEditingBooking] = useState<Booking & { id: number } | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showContent, setShowContent] = useState(true)
  const [assigningBooking, setAssigningBooking] = useState<Booking | null>(null);

  // Fetch driver data if user is a driver
  const { data: driverData } = useQuery({
    queryKey: ['driver', user?.userId],
    queryFn: () => user?.role === 'driver' && user?.userId ? getDrivers() : undefined,
    enabled: user?.role === 'driver' && !!user?.userId,
  });

  // Fix the bookings filtering logic
  if (isLoading) {
    return <div className="p-6">Loading bookings...</div>
  }

  if (isError) {
    return <div className="p-6">Error loading bookings.</div>
  }

  const bookings = (() => {
    if (!paginatedData?.bookings) return [];
    
    switch (user?.role) {
      case 'admin':
        // Admins can see all bookings
        return paginatedData.bookings;
      case 'customer':
        // Customers only see their own bookings
        return paginatedData.bookings.filter(booking => 
          (booking as any).user_id === user?.userId || 
          (booking as any).customer_id === user?.userId
        );
      case 'driver':
        // Drivers only see bookings assigned to them
        const driver = Array.isArray(driverData) ? driverData[0] : undefined;
        return paginatedData.bookings.filter(booking => 
          booking.driver_id === driver?.driver_id
        );
      default:
        return [];
    }
  })();

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

  const handleAssignDriver = (booking: Booking) => {
    setAssigningBooking(booking);
  };

  const totalPages = paginatedData?.totalPages || 0

  const getPageNumbers = () => {
    const delta = 2; 
    const range = [];
    const rangeWithDots = [];

    if (totalPages <= 1) return [1];

    for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      range.push(i);
    }

    rangeWithDots.push(1);

    if (page - delta > 2) {
      rangeWithDots.push('...');
    }

    range.forEach(p => {
      if (p !== 1 && p !== totalPages) {
        rangeWithDots.push(p);
      }
    });

    if (page + delta < totalPages - 1) {
      rangeWithDots.push('...');
    }

    if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return ( 
    <div className="p-6">
      <Toaster richColors position="top-center" closeButton={false} />
      
      <div className="flex justify-between items-center mb-6">
        {showContent && (
        <h1 className="text-2xl font-bold">
          {user?.role === 'admin' ? 'All Bookings' : 'My Bookings'}
        </h1>
        )}
        {showCreateForm && (
        <div>
         <CreateBookingForm />
          <img src='/cancel.png' width={25} className='absolute right-1 ' onClick={() => {
           setShowCreateForm(false)
          setShowContent(true)
          }} />
        </div>
          )}
        {(user?.role === 'admin' || user?.role === 'customer') && (
          showContent && (
        <button
       className={`${styles.actionButton} ${styles.edit}`}
     onClick={() => window.location.href = '/create'}     
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

      {/* Enhanced Pagination Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Items per page selector */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Items per page:</label>
            <select 
              value={limit} 
              onChange={(e) => {
                setLimit(Number(e.target.value))
                setPage(1) // Reset to first page when changing page size
              }}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Page info */}
          <div className="text-sm text-gray-600">
            Showing {Math.min((page - 1) * limit + 1, paginatedData?.total || 0)} to{' '}
            {Math.min(page * limit, paginatedData?.total || 0)} of {paginatedData?.total || 0} bookings
          </div>

          {/* Navigation buttons */}
          {totalPages > 1 && (
            <div className="flex items-center space-x-1">
              {/* First Page */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-2"
                title="First page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>

              {/* Previous Page */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {/* Page Numbers */}
              {getPageNumbers().map((pageNum, index) => (
                <Button
                  key={index}
                  variant={pageNum === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => typeof pageNum === 'number' && setPage(pageNum)}
                  disabled={pageNum === '...'}
                  className="min-w-[40px]"
                >
                  {pageNum}
                </Button>
              ))}

              {/* Next Page */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

              {/* Last Page */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="px-2"
                title="Last page"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Quick jump to page */}
        {totalPages > 10 && (
          <div className="flex items-center justify-center mt-4 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Jump to page:</label>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={page}
                onChange={(e) => {
                  const newPage = parseInt(e.target.value);
                  if (newPage >= 1 && newPage <= totalPages) {
                    setPage(newPage);
                  }
                }}
                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-500">of {totalPages}</span>
            </div>
          </div>
        )}
      </div>

      {paginatedData?.bookings && paginatedData.bookings.length > 0 ? (
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
              {paginatedData.bookings.map((booking) => (
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
                      {/* Add the Assign Driver button here */}
                      {!booking.driver_id && (booking.status === Status.Requested || booking.status === Status.Accepted) && (
                        <button 
                          className={`${styles.actionButton} bg-blue-500 hover:bg-blue-600 text-white ml-2`}
                          onClick={() => handleAssignDriver(booking)}
                        >
                          Assign Driver
                        </button>
                      )}
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

      {/* Add the Driver Assignment Modal */}
      {assigningBooking && (
        <DriverAssignmentModal
          booking={assigningBooking}
          isOpen={!!assigningBooking}
          onClose={() => setAssigningBooking(null)}
          onSuccess={() => {
            setAssigningBooking(null);
            // Refresh the bookings list
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
          }}
        />
      )}

      {/* ...rest of existing code... */}
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
