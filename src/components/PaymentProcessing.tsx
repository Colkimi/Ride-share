import { useLocation, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { updateBooking, getBooking } from '@/api/Bookings'
import { CreatePaymentMethodForm } from '@/Forms/CreatePaymentMethodForm'
import { Toaster, toast } from 'sonner'
import { useEffect, useState } from 'react'
import type { PaymentMethod } from '@/api/PaymentMethods'

export function PaymentProcessing() {
  const { search } = useLocation()
  const bookingId = (search as { bookingId?: string }).bookingId
  const navigate = useNavigate()
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!bookingId) {
      toast.error('No booking ID provided')
      navigate({ to: '/bookings' })
      return
    }

    async function fetchBooking() {
      try {
        const data = await getBooking(Number(bookingId))
        setBooking(data)
      } catch (error) {
        console.error('Error fetching booking:', error)
        toast.error('Failed to load booking details.')
        navigate({ to: '/bookings' })
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId, navigate])

  const updateBookingMutation = useMutation({
    mutationFn: async (data: { id: number; paymentStatus: 'paid' | 'failed' }) => {
      return updateBooking(data)
    },
  })

  const handlePaymentSuccess = async (paymentMethod?: PaymentMethod) => {
    try {
      if (paymentMethod?.approvalUrl) {
        toast.success('Redirecting to approval URL...')
        window.location.href = paymentMethod.approvalUrl
      } else {
        toast.success('Payment initiated, redirecting...')
      }
    } catch (error) {
      toast.error('Failed to initiate payment. Please try again.')
      await updateBookingMutation.mutateAsync({ id: Number(bookingId), paymentStatus: 'failed' })
    }
  }

  if (loading) {
    return <div>Loading booking details...</div>
  }

  if (!booking) {
    return <div>Booking not found.</div>
  }

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white rounded shadow mt-10">
      <Toaster richColors position="top-center" closeButton={false} />
      <h2 className="text-2xl font-bold mb-4">Complete Payment for Your Booking</h2>
      <p className="mb-4">
        Booking ID: {booking.id} <br />
        Pickup location : {localStorage.getItem('pickup address')} <br />
        Dropoff location : {localStorage.getItem('dropoff address')} <br />
        Fare: {booking.fare ? `$${booking.fare.toFixed(2)}` : 'N/A'}
        {localStorage.setItem('fare', booking.fare.toString())}
      </p>
      <CreatePaymentMethodForm onSuccess={handlePaymentSuccess} />
    </div>
  )
}
