import { useState } from 'react';
import { format } from 'date-fns';
import { useAdminDashboard } from '@/hooks/useAnalytics';
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from '@/components/ui/modern-card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Skeleton } from './ui/skeleton';
import {
  Users,
  DollarSign,
  Car,
  TrendingUp,
  Activity,
  Clock3,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Drivers } from './Drivers';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: dashboardData, isLoading, error } = useAdminDashboard();

  const currentDate = format(new Date(), 'MMMM d, yyyy');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <ModernCard key={i} className="animate-pulse">
                <ModernCardHeader>
                  <Skeleton className="h-4 w-24" />
                </ModernCardHeader>
                <ModernCardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </ModernCardContent>
              </ModernCard>
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
            <h3 className="text-red-800 dark:text-red-200 font-semibold text-lg">
              Error Loading Dashboard
            </h3>
            <p className="mt-2 text-red-600 dark:text-red-400">
              {error && typeof error === 'object' && 'message' in error 
                ? (error as Error).message 
                : 'Failed to load dashboard data'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-300">No data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Process monthly analytics for charts - filter out invalid data
  const monthlyRevenueData = dashboardData.monthlyAnalytics
    .filter(item => item.income !== null && item.profit !== null && item.expenditure !== null)
    .map(item => ({
      day: item.day,
      revenue: item.income || 0,
      profit: item.profit || 0,
      expenditure: item.expenditure || 0
    }));

  // Process ride time analytics for pie chart
  const rideTimeData = [
    { 
      name: 'Morning', 
      value: dashboardData.rideTimeAnalytics.morning.count, 
      percentage: dashboardData.rideTimeAnalytics.morning.percentage 
    },
    { 
      name: 'Afternoon', 
      value: dashboardData.rideTimeAnalytics.afternoon.count, 
      percentage: dashboardData.rideTimeAnalytics.afternoon.percentage 
    },
    { 
      name: 'Evening', 
      value: dashboardData.rideTimeAnalytics.evening.count, 
      percentage: dashboardData.rideTimeAnalytics.evening.percentage 
    }
  ];

  // Calculate totals
  const totalProfit = monthlyRevenueData.reduce((sum, item) => sum + item.profit, 0);
  const totalIncome = monthlyRevenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpenditure = monthlyRevenueData.reduce((sum, item) => sum + item.expenditure, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Real-time business insights and performance metrics</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <span className="text-sm text-gray-600 dark:text-gray-300">{currentDate}</span>
            <Badge variant="default" className="bg-green-500">
              <Activity className="w-3 h-3 mr-1" />
              Live
            </Badge>
          </div>
        </div>

        {/* Key Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <ModernCard interactive className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <ModernCardHeader>
              <ModernCardTitle className="text-white">Total Users</ModernCardTitle>
              <Users className="w-5 h-5 text-blue-100" />
            </ModernCardHeader>
            <ModernCardContent>
              <div className="text-3xl font-bold">{formatNumber(dashboardData.systemOverview.totalUsers)}</div>
              <p className="text-sm text-blue-100 mt-1">Active platform users</p>
            </ModernCardContent>
          </ModernCard>

          <ModernCard interactive className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <ModernCardHeader>
              <ModernCardTitle className="text-white">Total Drivers</ModernCardTitle>
              <Car className="w-5 h-5 text-green-100" />
            </ModernCardHeader>
            <ModernCardContent>
              <div className="text-3xl font-bold">{formatNumber(dashboardData.systemOverview.totalDrivers)}</div>
              <p className="text-sm text-green-100 mt-1">Registered drivers</p>
            </ModernCardContent>
          </ModernCard>

          <ModernCard interactive className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <ModernCardHeader>
              <ModernCardTitle className="text-white">Total Revenue</ModernCardTitle>
              <DollarSign className="w-5 h-5 text-purple-100" />
            </ModernCardHeader>
            <ModernCardContent>
              <div className="text-3xl font-bold">{formatCurrency(dashboardData.systemOverview.totalRevenue)}</div>
              <p className="text-sm text-purple-100 mt-1">Lifetime earnings</p>
            </ModernCardContent>
          </ModernCard>

          <ModernCard interactive className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <ModernCardHeader>
              <ModernCardTitle className="text-white">Total Bookings</ModernCardTitle>
              <TrendingUp className="w-5 h-5 text-orange-100" />
            </ModernCardHeader>
            <ModernCardContent>
              <div className="text-3xl font-bold">{formatNumber(dashboardData.systemOverview.totalBookings)}</div>
              <p className="text-sm text-orange-100 mt-1">Completed rides</p>
            </ModernCardContent>
          </ModernCard>

          <ModernCard interactive className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <ModernCardHeader>
              <ModernCardTitle className="text-white">Active Bookings</ModernCardTitle>
              <Activity className="w-5 h-5 text-red-100" />
            </ModernCardHeader>
            <ModernCardContent>
              <div className="text-3xl font-bold">{formatNumber(dashboardData.systemOverview.activeBookings)}</div>
              <p className="text-sm text-red-100 mt-1">Currently in progress</p>
            </ModernCardContent>
          </ModernCard>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="drivers">Drivers</TabsTrigger>
          </TabsList>
          <TabsContent value="drivers" className="space-y-4">
          <Drivers />
          </TabsContent>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Daily Revenue & Profit</CardTitle>
                  <CardDescription>Last 30 days performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
                      <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Profit" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Ride Time Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Ride Time Distribution</CardTitle>
                  <CardDescription>Bookings by time of day</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={rideTimeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {rideTimeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-700">
                <CardHeader>
                  <CardTitle>Total Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(totalIncome)}
                  </div>
                  <p className="text-sm text-gray-500">Total income over the last 30 days</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-700">
                <CardHeader>
                  <CardTitle>Total Expenditure</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(totalExpenditure)}
                  </div>
                  <p className="text-sm text-gray-500">Total expenditure over the last 30 days</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-700">
                <CardHeader>
                  <CardTitle>Net Profit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(totalProfit)}
                  </div>
                  <p className="text-sm text-gray-500">Net profit over the last 30 days</p>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Income vs Expenditure</CardTitle>
                  <CardDescription>Daily financial performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="income" fill="#3b82f6" name="Income" />
                      <Bar dataKey="expenditure" fill="#ef4444" name="Expenditure" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profit Margin</CardTitle>
                  <CardDescription>Daily profit trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} name="Profit" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Peak Hours</CardTitle>
                  <CardDescription>Most active booking times</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {rideTimeData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Clock3 className="w-4 h-4 mr-2 text-gray-500" />
                          <span>{item.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatNumber(item.value)} rides</div>
                          <div className="text-sm text-gray-500">{item.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{formatCurrency(totalProfit)}</div>
                      <div className="text-sm text-gray-500">30-Day Profit</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalIncome)}</div>
                      <div className="text-sm text-gray-500">30-Day Income</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenditure)}</div>
                      <div className="text-sm text-gray-500">30-Day Expenditure</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      <span className="text-sm">All systems operational</span>
                    </div>
                    <div className="flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2 text-yellow-500" />
                      <span className="text-sm">{dashboardData.pendingActions.systemMaintenance} maintenance tasks</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="text-sm">{dashboardData.pendingActions.driverVerifications} driver verifications pending</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Actions</CardTitle>
                  <CardDescription>Items requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-blue-900">Driver Verifications</h4>
                        <p className="text-sm text-blue-700">{dashboardData.pendingActions.driverVerifications} drivers need verification</p>
                      </div>
                      <Badge variant="default" className="bg-blue-500">{dashboardData.pendingActions.driverVerifications}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-yellow-900">System Maintenance</h4>
                      <p className="text-sm text-yellow-700">{dashboardData.pendingActions.systemMaintenance} maintenance tasks pending</p>
                      </div>
                      <Badge variant="secondary">{dashboardData.pendingActions.systemMaintenance}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-green-900">New Discounts</h4>
                        <p className="text-sm text-green-700">{dashboardData.pendingActions.newDiscounts} discount campaigns ready</p>
                      </div>
                      <Badge variant="default" className="bg-green-500">{dashboardData.pendingActions.newDiscounts}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-purple-900">Government Deals</h4>
                        <p className="text-sm text-purple-700">{dashboardData.pendingActions.governmentDeals} deals awaiting approval</p>
                      </div>
                      <Badge variant="default" className="bg-purple-500">{dashboardData.pendingActions.governmentDeals}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
<Card className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-700">
  <CardHeader>
    <CardTitle>Quick Stats</CardTitle>
    <CardDescription>Key performance indicators</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-2 gap-4">
      <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Total Revenue</p>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(dashboardData.systemOverview.totalRevenue)}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Total Users</p>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatNumber(dashboardData.systemOverview.totalUsers)}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
        <Car className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Total Drivers</p>
          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{formatNumber(dashboardData.systemOverview.totalDrivers)}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
        <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Active Bookings</p>
          <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{formatNumber(dashboardData.systemOverview.activeBookings)}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-400" />
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-300">30-Day Profit</p>
          <p className="text-lg font-bold text-red-600 dark:text-red-400">{formatCurrency(totalProfit)}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
        <AlertCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Pending Actions</p>
          <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            {Object.values(dashboardData.pendingActions).reduce((sum, count) => sum + count, 0)}
          </p>
        </div>
      </div>
    </div>
  </CardContent>
</Card>
            </div>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

     </div>
     </TabsContent>
   </Tabs>
  </div>
    </div>
  );
}


