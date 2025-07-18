import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/failed')({
  component: RouteComponent,
})

function RouteComponent() {
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string>('Payment could not be processed')
  const navigate = useNavigate()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get('error')
    const reason = urlParams.get('reason')
    
    setTimeout(() => {
      setLoading(false)
      if (error) {
        setErrorMessage(decodeURIComponent(error))
      } else if (reason) {
        setErrorMessage(decodeURIComponent(reason))
      }
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing payment failure...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-gray-600 mb-4">
            We couldn't process your payment. Please try again or contact support.
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600 mb-6">
            <p>Common reasons for payment failure:</p>
            <ul className="text-left space-y-1 mt-2">
              <li>• Insufficient funds in your account</li>
              <li>• Card has expired or been cancelled</li>
              <li>• Bank declined the transaction</li>
              <li>• Network connectivity issues</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={() => navigate({ to: '/bookings' })}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Try Again
            </button>
            
            <div className="flex space-x-3">
              <button 
                onClick={() => navigate({ to: '/landing' })}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition duration-200"
              >
                Go Home
              </button>
              
              <button 
                onClick={() => navigate({ to: '/support' })}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition duration-200"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
