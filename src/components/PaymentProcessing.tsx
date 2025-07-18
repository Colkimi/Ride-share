import { useLocation, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { updateBooking, getBooking } from '@/api/Bookings'
import { CreatePaymentMethodForm } from '@/Forms/CreatePaymentMethodForm'
import { Toaster, toast } from 'sonner'
import { useEffect, useState } from 'react'
import type { PaymentMethod } from '@/api/PaymentMethods'

export function PaymentProcessing() {
    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)
    const bookingId = searchParams.get('bookingId')
    const navigate = useNavigate()
    const [booking, setBooking] = useState<any>(null)
    const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBooking() {
      try {
        const data = await getBooking(Number(bookingId))
        setBooking(data)
      } catch (error) {
        toast.error('Failed to load booking details.')
      } finally {
        setLoading(false)
      }
    }
    fetchBooking()
  }, [bookingId])

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
        Pickup: {booking.start_latitude}, {booking.start_longitude} <br />
        Dropoff: {booking.end_latitude}, {booking.end_longitude} <br />
        Fare: {booking.fare ? `$${booking.fare.toFixed(2)}` : 'N/A'}
      </p>
      <CreatePaymentMethodForm onSuccess={handlePaymentSuccess} />
    </div>
  )
}
