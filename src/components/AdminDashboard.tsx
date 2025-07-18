import { useAdminDashboard } from '@/hooks/useAnalytics';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Users, Car, DollarSign, Calendar, TrendingUp, TrendingDown } from 'lucide-react';

export function AdminDashboard() {
  const { data: adminData, isLoading, error } = useAdminDashboard();

  // Mock data based on AdminDashboardDto structure
  const mockAdminDashboardData = {
    systemOverview: {
      totalUsers: 1250,
      totalDrivers: 350,
      totalBookings: 5280,
      totalRevenue: 125000.75,
      activeBookings: 45,
    },
    monthlyAnalytics: [
      { day: '2024-01-01', income: 4500, expenditure: 1200, profit: 3300, bookingCount: 25 },
      { day: '2024-01-02', income: 5200, expenditure: 1400, profit: 3800, bookingCount: 30 },
      { day: '2024-01-03', income: 4800, expenditure: 1100, profit: 3700, bookingCount: 28 },
      { day: '2024-01-04', income: 6100, expenditure: 1600, profit: 4500, bookingCount: 35 },
      { day: '2024-01-05', income: 5500, expenditure: 1300, profit: 4200, bookingCount: 32 },
    ],
    incomeDistribution: [
      { range: '$0-$50', count: 150, percentage: 30, color: '#3b82f6' },
      { range: '$50-$100', count: 200, percentage: 40, color: '#10b981' },
      { range: '$100-$200', count: 100, percentage: 20, color: '#f59e0b' },
      { range: '$200+', count: 50, percentage: 10, color: '#ef4444' },
    ],
    rideTimeAnalytics: {
      morning: { count: 45, percentage: 35.5 },
      afternoon: { count: 60, percentage: 47.2 },
      evening: { count: 22, percentage: 17.3 },
    },
    pendingActions: {
      driverVerifications: 12,
      systemMaintenance: 1,
      newDiscounts: 3,
      governmentDeals: 2,
    },
    weeklyRevenue: 8750.25,
    revenueTrend: 15.5,
  };

  const data = mockAdminDashboardData;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <h3 className="text-red-800 dark:text-red-200 font-semibold text-lg mb-2">Error Loading Analytics</h3>
            <p className="text-red-600 dark:text-red-400">
              {error?.message || 'Failed to load dashboard data'}
            </p>
          </div>
        </div>
      </div>
    );
