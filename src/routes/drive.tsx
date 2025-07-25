import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'
import DriverDashboard from '../components/DriverDashboard'
import CustomerLocations from '../components/CustomerLocation'
import AdminDriverManagement from '../components/AdminDriverManagement'
import DemoTrackingPage from '../components/Demo'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute('/drive')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <DemoTrackingPage />
  }

  // Route based on user role
  switch (user.role?.toLowerCase()) {
    case 'driver':
      return <DriverDashboard />
    case 'customer':
      return <CustomerLocations />
    case 'admin':
      return <AdminDriverManagement />
    default:
      return <DemoTrackingPage />
  }
}
