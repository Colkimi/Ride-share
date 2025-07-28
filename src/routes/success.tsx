import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/success')({
  component: RouteComponent,
})

function RouteComponent() {
  const [loading, setLoading] = useState(true)
  const [bookingDetails, setBookingDetails] = useState<any>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const bookingId = urlParams.get('bookingId')
    const rideType = urlParams.get('rideType') || 'Ride'
    const startTime = urlParams.get('startTime')
    const endTime = urlParams.get('endTime')
    const price = urlParams.get('price')
    const pickup = urlParams.get('pickup') || 'Pickup location'
    const destination = urlParams.get('destination') || 'Destination'

    setTimeout(() => {
      setLoading(false)
      setBookingDetails({
        bookingId,
        rideType,
        startTime: startTime ? new Date(startTime).toLocaleString() : '10:00 AM',
        endTime: endTime ? new Date(endTime).toLocaleString() : '11:00 AM',
        price: localStorage.getItem('fare'),
        pickup: localStorage.getItem('pickup address') || pickup,
        destination: localStorage.getItem('dropoff address') || destination
      })
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Confirming your booking...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 mb-6">
            Your ride has been successfully booked. You'll receive a confirmation email shortly.
          </p>
          
          {bookingDetails && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-800 mb-3">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking ID:</span>
                  <span className="font-medium">{bookingDetails.bookingId || 'BK-' + Date.now().toString().slice(-6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ride Type:</span>
                  <span className="font-medium">{bookingDetails.rideType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">From:</span>
                  <span className="font-medium">{bookingDetails.pickup}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">To:</span>
                  <span className="font-medium">{bookingDetails.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Time:</span>
                  <span className="font-medium">{bookingDetails.startTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium text-green-600">$ {bookingDetails.price}</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-700">
              <strong>What's next?</strong> Your driver will contact you shortly. You can track your ride in real-time from the bookings page.
            </p>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={() => navigate({ to: '/bookings' })}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
            >
              View My Bookings
            </button>
            
            <div className="flex space-x-3">
              <button 
                onClick={() => navigate({ to: '/create' })}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-200"
              >
                Book Another Ride
              </button>
              
              <button 
                onClick={() => navigate({ to: '/landing' })}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition duration-200"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
