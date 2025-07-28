import { useCustomerDashboard } from '@/hooks/useAnalytics';
import { useQuery } from '@tanstack/react-query';
import { getMyBookings, type Booking } from '@/api/Bookings';
import { getDrivers } from '@/api/Driver';
import { useState, useEffect } from 'react';
import { useDriverLocation } from '@/hooks/useDriverLocation';
import MapWithRoute from './MapWithRoute';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import {
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertCircle,
  Clock,
  Car,
  MapPin,
  Phone,
  MessageCircle,
  Navigation,
  User,
  Star,
  Route,
  UserPlus,
} from 'lucide-react';
import { DriverRegistrationForm } from '@/Forms/DriverRegistrationForm';

export function CustomerDashboard() {
  const { data: dashboardData, isLoading, error } = useCustomerDashboard();
  const [assignedDriver, setAssignedDriver] = useState<any>(null);
  const [selectedBookingForTracking, setSelectedBookingForTracking] = useState<Booking | null>(null);
  const [showDriverMap, setShowDriverMap] = useState(false);
  
  const { data: myBookings = [] } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => getMyBookings(),
    refetchInterval: 10000,
    staleTime: 0, 
  });

  // Get active bookings with drivers
  const activeBookings = myBookings.filter(
    (booking: Booking) => booking.status && ['accepted', 'in_progress'].includes(booking.status)
  );

  const trackingBooking = selectedBookingForTracking || activeBookings[0];
  const driverLocation = useDriverLocation(trackingBooking?.driver_id || null);

  const driverIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6" class="w-6 h-6">
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const handleTrackDriver = (booking: Booking) => {
    setSelectedBookingForTracking(booking);
    setShowDriverMap(true);
  };

  const currentDate = format(new Date(), 'MMMM d, yyyy');

  const calculateAverage = (total: number, count: number): number => {
    if (!count || count === 0 || !total || isNaN(total) || isNaN(count)) {
      return 0;
    }
    return total / count;
  };

  const safeData = {
    totalBookings: dashboardData?.totalBookings || 0,
    totalExpenditure: dashboardData?.totalExpenditure || 0,
    weeklyTrends: dashboardData?.weeklyTrends || { currentWeek: 0, previousWeek: 0, percentageChange: 0 },
    monthlyStats: dashboardData?.monthlyStats || {},
    expenditureTrends: dashboardData?.expenditureTrends || [],
    recentBookings: dashboardData?.recentBookings || []
  };

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-wrapper">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
            <Skeleton className="h-10 sm:h-12 w-10 sm:w-12 rounded-full dashboard-skeleton" />
            <div>
              <Skeleton className="h-8 sm:h-10 w-48 sm:w-64 mb-2 dashboard-skeleton" />
              <Skeleton className="h-4 w-64 sm:w-96 dashboard-skeleton" />
            </div>
          </div>
          <div className="dashboard-grid dashboard-grid-cols-4 mb-6 sm:mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="dashboard-card dashboard-animate-in" style={{ animationDelay: `${i * 100}ms` }}>
                <CardHeader>
                  <Skeleton className="h-4 w-24 dashboard-skeleton" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2 dashboard-skeleton" />
                  <Skeleton className="h-3 w-20 dashboard-skeleton" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Skeleton className="h-[300px] sm:h-[400px] w-full rounded-lg dashboard-skeleton" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              <h3 className="text-red-800 dark:text-red-200 font-semibold text-lg">
                Error Loading Dashboard
              </h3>
            </div>
            <p className="mt-2 text-red-600 dark:text-red-400">
              {error?.message || 'Failed to load dashboard data'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
            <h3 className="text-yellow-800 dark:text-yellow-200 font-semibold text-lg">
              No Data Available
            </h3>
            <p className="mt-2 text-yellow-600 dark:text-yellow-400">
              No dashboard data is currently available.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const monthlyData = Object.entries(safeData.monthlyStats).map(([month, count]) => ({
    month,
    rides: count || 0,
  }));

  const expenditureData = safeData.expenditureTrends;

  const weeklyTrend = safeData.weeklyTrends.percentageChange;
  const trendSymbol = weeklyTrend >= 0 ? '↑' : '↓';

  // Calculate average per ride safely
  const averagePerRide = calculateAverage(safeData.totalExpenditure, safeData.totalBookings);

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome Back
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {currentDate}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Badge variant="outline" className="px-4 py-3 bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50 transition-all duration-300">
              <Activity className="w-4 h-4 mr-2 text-blue-500" />
              <span className="font-semibold">{safeData.weeklyTrends.currentWeek} Rides This Week</span>
            </Badge>
            {activeBookings.length > 0 && (
              <Badge variant="default" className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse">
                <Car className="w-4 h-4 mr-2" />
                {activeBookings.length} Active Ride{activeBookings.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="group bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Bookings</CardTitle>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:bg-blue-200 transition-colors">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-800 dark:text-blue-200">{safeData.totalBookings}</div>
              <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 mt-2">
                <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                <span className="font-medium">
                  {trendSymbol} {Math.abs(weeklyTrend).toFixed(1)}% vs last week
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-200/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Total Spent</CardTitle>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl group-hover:bg-green-200 transition-colors">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-800 dark:text-green-200">
                ${safeData.totalExpenditure.toLocaleString()}
              </div>
              <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-2">
                <Clock className="w-3 h-3 mr-1" />
                <span className="font-medium">Lifetime spending</span>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-200/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Weekly Activity</CardTitle>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl group-hover:bg-purple-200 transition-colors">
                <Car className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-800 dark:text-purple-200">{safeData.weeklyTrends.currentWeek}</div>
              <div className="flex items-center text-xs text-purple-600 dark:text-purple-400 mt-2">
                <Activity className="w-3 h-3 mr-1" />
                <span className="font-medium">vs {safeData.weeklyTrends.previousWeek} last week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-yellow-500/10 to-orange-600/10 border-yellow-200/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Average Per Ride</CardTitle>
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl group-hover:bg-yellow-200 transition-colors">
                <DollarSign className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-800 dark:text-yellow-200">
                ${averagePerRide.toFixed(2)}
              </div>
              <div className="flex items-center text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                <Clock className="w-3 h-3 mr-1" />
                <span className="font-medium">
                  {safeData.totalBookings > 0 ? 'Average spending' : 'No rides yet'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Active Rides Section */}
        {activeBookings.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <Car className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Rides</h2>
                  <p className="text-gray-500 dark:text-gray-400">Track your ongoing journeys</p>
                </div>
              </div>
              <Badge variant="secondary" className="px-3 py-2 bg-green-100 text-green-800 border-green-200">
                {activeBookings.length} Active
              </Badge>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeBookings.map((booking, index) => (
                <Card key={booking.id} className="group bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] border-l-4 border-l-green-500" style={{ animationDelay: `${index * 150}ms` }}>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                          <Car className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <span className="text-lg font-semibold">Ride in Progress</span>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Booking #{booking.id}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge 
                          variant="default" 
                          className={`${
                            booking.status === 'in_progress' 
                              ? 'bg-green-500 hover:bg-green-600 animate-pulse shadow-lg' 
                              : booking.status === 'accepted'
                              ? 'bg-yellow-500 hover:bg-yellow-600'
                              : 'bg-blue-500 hover:bg-blue-600'
                          } transition-all duration-300`}
                        >
                          {booking.status === 'in_progress' ? '🚗 In Progress' : 
                           booking.status === 'accepted' ? '✅ Driver Assigned' : booking.status}
                        </Badge>
                      </div>
                    </CardTitle>
                    <CardDescription className="text-sm flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">
                          {new Date(booking.pickup_time).toLocaleString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="font-bold text-green-600">${booking.fare?.toFixed(2) || '0.00'}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Enhanced Route Info with better visual hierarchy */}
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                          <div className="p-3 bg-green-500 rounded-full shadow-lg">
                            <Route className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-bold text-green-800 dark:text-green-200">📍 Pickup Location</p>
                              <Badge variant="outline" className="border-green-300 text-green-700 text-xs">Start</Badge>
                            </div>
                            <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                              {(booking as any).start_address || `${booking.start_latitude?.toFixed(4)}, ${booking.start_longitude?.toFixed(4)}`}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                              {booking.start_latitude && booking.start_longitude && 
                                `${Math.abs(booking.start_latitude).toFixed(4)}°${booking.start_latitude >= 0 ? 'N' : 'S'}, ${Math.abs(booking.start_longitude).toFixed(4)}°${booking.start_longitude >= 0 ? 'E' : 'W'}`
                              }
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-center">
                          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl border border-red-200 dark:border-red-800">
                          <div className="p-3 bg-red-500 rounded-full shadow-lg">
                            <MapPin className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-bold text-red-800 dark:text-red-200">🎯 Destination</p>
                              <Badge variant="outline" className="border-red-300 text-red-700 text-xs">End</Badge>
                            </div>
                            <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                              {(booking as any).end_address || `${booking.end_latitude?.toFixed(4)}, ${booking.end_longitude?.toFixed(4)}`}
                            </p>
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                              {booking.end_latitude && booking.end_longitude && 
                                `${Math.abs(booking.end_latitude).toFixed(4)}°${booking.end_latitude >= 0 ? 'N' : 'S'}, ${Math.abs(booking.end_longitude).toFixed(4)}°${booking.end_longitude >= 0 ? 'E' : 'W'}`
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Trip Details with better styling */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                        <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
                          <div className="w-8 h-8 mx-auto mb-2 bg-blue-500 rounded-full flex items-center justify-center">
                            <Route className="w-4 h-4 text-white" />
                          </div>
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Distance</p>
                          <p className="text-sm font-bold text-blue-800 dark:text-blue-200">{(booking as any).distance?.toFixed(1) || 'N/A'} km</p>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800">
                          <div className="w-8 h-8 mx-auto mb-2 bg-purple-500 rounded-full flex items-center justify-center">
                            <Clock className="w-4 h-4 text-white" />
                          </div>
                          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Duration</p>
                          <p className="text-sm font-bold text-purple-800 dark:text-purple-200">{(booking as any).estimated_duration || 'N/A'} min</p>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800">
                          <div className="w-8 h-8 mx-auto mb-2 bg-green-500 rounded-full flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-white" />
                          </div>
                          <p className="text-xs text-green-600 dark:text-green-400 font-medium">Fare</p>
                          <p className="text-sm font-bold text-green-800 dark:text-green-200">${booking.fare?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                          <div className="w-8 h-8 mx-auto mb-2 bg-yellow-500 rounded-full flex items-center justify-center">
                            <Car className="w-4 h-4 text-white" />
                          </div>
                          <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Vehicle</p>
                          <p className="text-sm font-bold text-yellow-800 dark:text-yellow-200">{(booking as any).vehicle_type || 'Standard'}</p>
                        </div>
                      </div>

                      {/* Enhanced Driver Info */}
                      {booking.driver_id && (
                        <div className="border-t pt-6 mt-4">
                          <h4 className="font-bold mb-4 flex items-center text-lg">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            Driver Information
                          </h4>
                          
                          <div className="flex items-center space-x-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl">
                            <div className="relative">
                              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <User className="w-10 h-10 text-white" />
                              </div>
                              {trackingBooking?.id === booking.id && driverLocation && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white animate-pulse shadow-lg flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <p className="font-bold text-xl text-gray-900 dark:text-white">
                                    {(booking.driver as any)?.name || `Driver #${booking.driver_id}`}
                                  </p>
                                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
                                      <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                                      <span className="font-semibold text-yellow-700 dark:text-yellow-300">{(booking.driver as any)?.rating || 4.8}</span>
                                    </div>
                                    <div className="flex items-center bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                                      <Route className="w-4 h-4 text-blue-500 mr-1" />
                                      <span className="font-semibold text-blue-700 dark:text-blue-300">{(booking.driver as any)?.total_rides || 0} rides</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="text-right bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border">
                                  <p className="text-xs text-gray-500 font-medium">Vehicle</p>
                                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {(booking.driver as any)?.vehicle?.make || 'Toyota'} {(booking.driver as any)?.vehicle?.model || 'Camry'}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    <span className="font-medium">{(booking.driver as any)?.vehicle?.color || 'Black'}</span> • 
                                    <span className="ml-1">{(booking.driver as any)?.vehicle?.year || '2020'}</span>
                                  </p>
                                  <div className="mt-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">
                                    {(booking.driver as any)?.vehicle?.license_plate || 'ABC-123'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Enhanced Real-time Location Status */}
                          {trackingBooking?.id === booking.id && driverLocation && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800 shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                  <div className="relative">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                    <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                                  </div>
                                  <span className="text-sm font-bold text-green-800 dark:text-green-200">
                                    🔴 Live Tracking Active
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="text-xs text-green-600 dark:text-green-300 font-medium">
                                    Updated: {new Date().toLocaleTimeString()}
                                  </span>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3 mt-3">
                                <div className="bg-white dark:bg-gray-800 p-2 rounded-lg">
                                  <p className="text-xs text-gray-500 font-medium">Latitude</p>
                                  <p className="text-sm font-mono text-green-700 dark:text-green-300">{driverLocation.latitude.toFixed(6)}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-2 rounded-lg">
                                  <p className="text-xs text-gray-500 font-medium">Longitude</p>
                                  <p className="text-sm font-mono text-green-700 dark:text-green-300">{driverLocation.longitude.toFixed(6)}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Enhanced Driver Actions */}
                          <div className="grid grid-cols-3 gap-3 mt-6">
                            <Button size="sm" variant="outline" className="flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 group">
                              <Phone className="w-4 h-4 mr-2 group-hover:text-blue-600" />
                              Call Driver
                            </Button>
                            <Button size="sm" variant="outline" className="flex items-center justify-center hover:bg-green-50 hover:border-green-300 transition-all duration-300 group">
                              <MessageCircle className="w-4 h-4 mr-2 group-hover:text-green-600" />
                              Message
                            </Button>
                            <Button 
                              size="sm" 
                              variant={trackingBooking?.id === booking.id ? "default" : "outline"}
                              className={`flex items-center justify-center transition-all duration-300 ${
                                trackingBooking?.id === booking.id 
                                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg' 
                                  : 'hover:bg-purple-50 hover:border-purple-300 group'
                              }`}
                              onClick={() => handleTrackDriver(booking)}
                            >
                              <Navigation className={`w-4 h-4 mr-2 ${trackingBooking?.id === booking.id ? 'text-white' : 'group-hover:text-purple-600'}`} />
                              {trackingBooking?.id === booking.id ? '📍 Tracking' : 'Track Driver'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Driver Tracking Map */}
        {showDriverMap && trackingBooking && (
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm mb-8 shadow-2xl border border-white/20">
            <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500 rounded-xl">
                    <Navigation className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-xl font-bold">🗺️ Real-time Driver Tracking</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Live location monitoring</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowDriverMap(false)}
                  className="hover:bg-red-50 hover:border-red-300 transition-all duration-300"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Hide Map
                </Button>
              </CardTitle>
              <CardDescription className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Driver #{trackingBooking.driver_id}</span>
                </div>
                <span>•</span>
                <span>Booking #{trackingBooking.id}</span>
                <span>•</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">Live Updates</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-96 rounded-xl overflow-hidden shadow-inner border-2 border-gray-200 dark:border-gray-700">
                {driverLocation && trackingBooking.start_latitude && trackingBooking.start_longitude && 
                 trackingBooking.end_latitude && trackingBooking.end_longitude ? (
                  <MapWithRoute
                    pickupLocation={{
                      latitude: trackingBooking.start_latitude,
                      longitude: trackingBooking.start_longitude,
                      name: 'Pickup Location'
                    }}
                    dropoffLocation={{
                      latitude: trackingBooking.end_latitude,
                      longitude: trackingBooking.end_longitude,
                      name: 'Dropoff Location'
                    }}
                    driverLocation={{
                      latitude: driverLocation.latitude,
                      longitude: driverLocation.longitude,
                      name: `Driver #${trackingBooking.driver_id}`
                    }}
                  />
                ) : (
                  <MapContainer
                    center={driverLocation ? [driverLocation.latitude, driverLocation.longitude] : [40.7128, -74.0060]}
                    zoom={13}
                    className="h-full w-full"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {driverLocation && (
                      <Marker 
                        position={[driverLocation.latitude, driverLocation.longitude]}
                        icon={driverIcon}
                      >
                        <Popup>
                          <div className="text-center">
                            <p className="font-semibold">Driver #{trackingBooking.driver_id}</p>
                            <p className="text-sm">Current Location</p>
                            <p className="text-xs text-gray-600">
                              {driverLocation.latitude}, {driverLocation.longitude}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </MapContainer>
                )}
              </div>
              
              {/* Enhanced Driver Status Info */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="w-12 h-12 mx-auto mb-3 bg-blue-500 rounded-full flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-bold text-blue-800 dark:text-blue-200 mb-1">Trip Status</p>
                  <Badge variant="default" className={`${
                    trackingBooking.status === 'in_progress' ? 'bg-green-500' : 
                    trackingBooking.status === 'accepted' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}>
                    {trackingBooking.status === 'in_progress' ? '🚗 In Progress' : 
                     trackingBooking.status === 'accepted' ? '✅ Accepted' : trackingBooking.status}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="w-12 h-12 mx-auto mb-3 bg-green-500 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-bold text-green-800 dark:text-green-200 mb-1">Estimated Fare</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">${trackingBooking.fare?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800">
                  <div className="w-12 h-12 mx-auto mb-3 bg-purple-500 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-bold text-purple-800 dark:text-purple-200 mb-1">Pickup Time</p>
                  <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                    {new Date(trackingBooking.pickup_time).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Tabs Section */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-lg border border-gray-200 dark:border-gray-700 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300">
              📊 Overview
            </TabsTrigger>
            <TabsTrigger value="trips" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white transition-all duration-300">
              🚗 Recent Trips
            </TabsTrigger>
            <TabsTrigger value="spending" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-600 data-[state=active]:text-white transition-all duration-300">
              💰 Spending
            </TabsTrigger>
            <TabsTrigger value="drivers" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300">
              🗺️ Driver Tracking
            </TabsTrigger>
            <TabsTrigger value="driver-registration" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white transition-all duration-300">
              🚗 Become a Driver
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Enhanced Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500">
                <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500 rounded-xl">
                      <BarChart className="w-5 h-5 text-white" />
                    </div>
                    <span>📈 Monthly Activity</span>
                  </CardTitle>
                  <CardDescription>Your ride statistics and trends over time</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={monthlyData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="rides" fill="#3b82f6" name="Total Rides" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="text-center">
                        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600 dark:text-gray-400">No monthly data available</p>
                        <p className="text-sm text-gray-500">Take some rides to see your activity</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500">
                <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500 rounded-xl">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <span>💰 Expenditure Trends</span>
                  </CardTitle>
                  <CardDescription>Daily spending patterns and insights</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {expenditureData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={expenditureData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ fill: '#10b981' }}
                          name="Daily Spending"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="text-center">
                        <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600 dark:text-gray-400">No spending data available</p>
                        <p className="text-sm text-gray-500">Your spending trends will appear here</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Driver Tracking Map */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Driver Location</CardTitle>
                <CardDescription>Real-time tracking of your assigned drivers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Navigation className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400">Interactive driver tracking map</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                      Shows real-time location of assigned drivers
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Bookings */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Your latest rides</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {safeData.recentBookings.length > 0 ? (
                    safeData.recentBookings.slice(0, 5).map((booking, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {booking.pickupLocation || 'Pickup'} →{' '}
                              {booking.dropoffLocation || 'Dropoff'}
                            </div>
                            <div className="text-sm text-gray-500">
                              Date: {booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">${booking.fare?.toLocaleString() || '0'}</div>
                          {booking.status && (
                            <Badge
                              variant={booking.status === 'completed' ? 'default' : 'secondary'}
                            >
                              {booking.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Car className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 dark:text-gray-400">No recent bookings</p>
                      <p className="text-sm text-gray-500">Your ride history will appear here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="drivers" className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Real-time Driver Tracking</CardTitle>
                <CardDescription>Monitor your assigned drivers and their locations in real-time</CardDescription>
              </CardHeader>
              <CardContent>
                {activeBookings.length > 0 ? (
                  <div className="space-y-6">
                    {activeBookings.map((booking) => {
                      const isTracking = trackingBooking?.id === booking.id;
                      const currentDriverLocation = isTracking ? driverLocation : null;
                      
                      return (
                        <div key={booking.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-semibold">Booking #{booking.id}</h4>
                              <p className="text-sm text-gray-500">
                                {new Date(booking.pickup_time).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{booking.status}</Badge>
                              <Button
                                size="sm"
                                variant={isTracking ? "default" : "outline"}
                                onClick={() => {
                                  if (isTracking) {
                                    setSelectedBookingForTracking(null);
                                  } else {
                                    handleTrackDriver(booking);
                                  }
                                }}
                              >
                                <Navigation className="w-4 h-4 mr-2" />
                                {isTracking ? 'Stop Tracking' : 'Track Driver'}
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-medium mb-2">Driver Details</h5>
                              <div className="space-y-1 text-sm">
                                <p><strong>Driver ID:</strong> #{booking.driver_id}</p>
                                <p><strong>Rating:</strong> ⭐ {booking.driver?.rating || 4.8}</p>
                                {currentDriverLocation && (
                                  <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                                    <p className="text-green-800 dark:text-green-200 font-medium">
                                      🔴 Live Location
                                    </p>
                                    <p className="text-xs text-green-600 dark:text-green-300">
                                      {currentDriverLocation.latitude}, {currentDriverLocation.longitude}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium mb-2">Trip Details</h5>
                              <div className="space-y-1 text-sm">
                                <p><strong>Fare:</strong> ${booking.fare?.toFixed(2) || '0.00'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Car className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400">No active bookings with drivers</p>
                    <p className="text-sm text-gray-500">Your active rides will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="driver-registration" className="space-y-6">
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-xl border border-white/20">
              <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border-b">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-cyan-600 rounded-2xl shadow-lg">
                    <UserPlus className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                      Become a Driver
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                      Join our driver network and start earning money with your vehicle
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Car className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Why Drive With Us?
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-blue-800 dark:text-blue-200">Flexible schedule</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-blue-800 dark:text-blue-200">Competitive earnings</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-blue-800 dark:text-blue-200">Weekly payouts</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-blue-800 dark:text-blue-200">Driver support 24/7</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-blue-800 dark:text-blue-200">Real-time navigation</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-blue-800 dark:text-blue-200">Safety features</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-inner border border-gray-200 dark:border-gray-700">
                  <DriverRegistrationForm />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </>
  );
}
