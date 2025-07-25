import { createFileRoute } from '@tanstack/react-router'
import { CustomerDashboard } from '../components/CustomerDashboard';
import { AdminDashboard } from '../components/AdminDashboard';
import DriverDashboard from '../components/DriverDashboard';
import { useAuth } from '../hooks/useAuth';
import { Link } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
})

export function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const userRole = user?.role || null;

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Loading user data...</h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Please log in to access the dashboard.</h2>
        <p><Link to="/login" className='text-blue-700 underline'>Sign in</Link></p>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (userRole) {
      case 'admin':
        return <AdminDashboard />;
      case 'driver':
        return <DriverDashboard />;
      case 'customer':
        return <CustomerDashboard />;
      default:
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Loading dashboard...</h2>
          </div>
        );
    }
  };

  return renderDashboard();
}
