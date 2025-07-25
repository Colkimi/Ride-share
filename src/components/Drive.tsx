import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'
import DriverDashboard from '../components/DriverDashboard'
import CustomerLocations from '../components/CustomerLocation'
import AdminDriverManagement from '../components/AdminDriverManagement'
import DemoTrackingPage from '../components/Demo'

export const Route = createFileRoute('/drive')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to access this page.</p>
          <a href="/login" className="bg-blue-600 text-white px-6 py-2 rounded">
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  if (!user?.role) {
    return <DemoTrackingPage />
  }

  switch (user.role) {
    case 'driver':
      return <DriverDashboard />
    case 'customer':
      return <CustomerLocations />
    case 'admin':
      return <AdminDriverManagement />
    default:
      return <CustomerLocations /> // Default to customer locations for regular users
  }
}