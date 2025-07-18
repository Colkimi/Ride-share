import { useCustomerDashboard } from '@/hooks/useAnalytics';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export function CustomerDashboard() {
  const { data: dashboardData, isLoading, error } = useCustomerDashboard();

  if (isLoading) return <div className="p-6">Loading dashboard data...</div>;
  if (error) return <div className="p-6">Error loading dashboard data: {error.message}</div>;
  if (!dashboardData) return <div className="p-6">No dashboard data available</div>;

  // Transform monthlyStats for chart
  const monthlyData = Object.entries(dashboardData.monthlyStats || {}).map(([month, count]) => ({
    month,
    rides: count
  }));

  // Transform expenditureTrends for chart
  const expenditureData = dashboardData.expenditureTrends || [];

  // Calculate weekly trend percentage
  const weeklyTrend = dashboardData.weeklyTrends?.percentageChange || 0;
  const trendColor = weeklyTrend >= 0 ? 'text-green-600' : 'text-red-600';
  const trendSymbol = weeklyTrend >= 0 ? '↑' : '↓';

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Monthly Stats</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${trendColor} text-sm`}>{trendSymbol} {Math.abs(weeklyTrend).toFixed(1)}% vs last week</p>
              <p className="text-gray-600 text-sm">Total bookings: {dashboardData.totalBookings}</p>
            </div>
            <button className="text-blue-600 text-sm">View Report</button>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="rides" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Ride Time Distribution</h3>
          <p className="text-gray-600 text-sm mb-4">Based on your recent rides</p>
          <div className="text-center">
            <div className="text-2xl font-bold mb-2">{dashboardData.totalBookings} rides</div>
            <div className="text-sm text-gray-600">Total bookings</div>
          </div>
          <div className="mt-4 space-y-2">
            {Object.entries(dashboardData.rideTimeDistribution || {}).map(([range, count]) => (
              <div key={range} className="flex justify-between text-sm">
                <span>{range}</span>
                <span>{count} rides</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Expenditure</h3>
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-bold">${dashboardData.totalExpenditure.toFixed(2)}</div>
            <button className="text-blue-600 text-sm">View Report</button>
          </div>
          <p className="text-gray-600 text-sm mb-4">Total spent on rides</p>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={expenditureData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Monthly Analysis</h3>
          <p className="text-gray-600 text-sm mb-4">See your monthly expenditures</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={expenditureData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#06b6d4" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
          <p className="text-gray-600 text-sm mb-4">Your latest rides</p>
          <div className="space-y-3">
            {dashboardData.recentBookings?.slice(0, 4).map((booking: any, index: number) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm">{booking.pickupLocation || 'Pickup'} → {booking.dropoffLocation || 'Dropoff'}</span>
                <span className="text-sm font-semibold">${booking.fare || 0}</span>
              </div>
            ))}
            {(!dashboardData.recentBookings || dashboardData.recentBookings.length === 0) && (
              <p className="text-sm text-gray-500">No recent bookings</p>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Expenditures</h3>
          <p className="text-2xl font-bold">${dashboardData.totalExpenditure.toFixed(2)}</p>
          <div className="mt-4">
            <h4 className="text-md font-semibold mb-2">Weekly Trends</h4>
            <ul className="space-y-1">
              <li className="text-sm">Current Week: {dashboardData.weeklyTrends?.currentWeek || 0} rides</li>
              <li className="text-sm">Previous Week: {dashboardData.weeklyTrends?.previousWeek || 0} rides</li>
              <li className={`text-sm ${trendColor}`}>
                Change: {trendSymbol} {Math.abs(weeklyTrend).toFixed(1)}%
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
