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
} from 'lucide-react';

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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Your Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{currentDate}</p>
          </div>
          <Badge variant="outline" className="px-4 py-2">
            <Activity className="w-4 h-4 mr-2" />
            {safeData.weeklyTrends.currentWeek} Rides This Week
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{safeData.totalBookings}</div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                <span>
                  {trendSymbol} {Math.abs(weeklyTrend).toFixed(1)}% vs last week
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${safeData.totalExpenditure.toLocaleString()}
              </div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <Clock className="w-3 h-3 mr-1 text-blue-500" />
                <span>Lifetime spending</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Weekly Activity</CardTitle>
              <Car className="w-5 h-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{safeData.weeklyTrends.currentWeek}</div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <Activity className="w-3 h-3 mr-1 text-purple-500" />
                <span>vs {safeData.weeklyTrends.previousWeek} last week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Per Ride</CardTitle>
              <DollarSign className="w-5 h-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${averagePerRide.toFixed(2)}
              </div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <Clock className="w-3 h-3 mr-1 text-yellow-500" />
                <span>
                  {safeData.totalBookings > 0 ? 'Average spending' : 'No rides yet'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Driver Assignment Section */}
        {activeBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Active Rides</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeBookings.map((booking) => (
                <Card key={booking.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Car className="w-5 h-5 text-blue-500" />
                        <span>Active Ride Details</span>
                      </div>
                      <Badge 
                        variant="default" 
                        className={`${
                          booking.status === 'in_progress' 
                            ? 'bg-green-500 animate-pulse' 
                            : booking.status === 'accepted'
                            ? 'bg-yellow-500'
                            : 'bg-blue-500'
                        }`}
                      >
                        {booking.status === 'in_progress' ? 'In Progress' : 
                         booking.status === 'accepted' ? 'Driver Accepted' : booking.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Booking #{booking.id}</span>
                        <span>•</span>
                        <span>{new Date(booking.pickup_time).toLocaleString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Enhanced Route Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <Route className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Pickup Location</p>
                            <p className="text-xs text-blue-600 dark:text-blue-300">
                              {(booking as any).start_address || `${booking.start_latitude?.toFixed(4)}, ${booking.start_longitude?.toFixed(4)}`}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {booking.start_latitude && booking.start_longitude && 
                                `${Math.abs(booking.start_latitude).toFixed(4)}°${booking.start_latitude >= 0 ? 'N' : 'S'}, ${Math.abs(booking.start_longitude).toFixed(4)}°${booking.start_longitude >= 0 ? 'E' : 'W'}`
                              }
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                            <MapPin className="w-4 h-4 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-red-800 dark:text-red-200">Destination</p>
                            <p className="text-xs text-red-600 dark:text-red-300">
                              {(booking as any).end_address || `${booking.end_latitude?.toFixed(4)}, ${booking.end_longitude?.toFixed(4)}`}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {booking.end_latitude && booking.end_longitude && 
                                `${Math.abs(booking.end_latitude).toFixed(4)}°${booking.end_latitude >= 0 ? 'N' : 'S'}, ${Math.abs(booking.end_longitude).toFixed(4)}°${booking.end_longitude >= 0 ? 'E' : 'W'}`
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Trip Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
                          <p className="text-xs text-gray-500">Distance</p>
                          <p className="text-sm font-semibold">{(booking as any).distance?.toFixed(1) || 'N/A'} km</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
                          <p className="text-xs text-gray-500">Duration</p>
                          <p className="text-sm font-semibold">{(booking as any).estimated_duration || 'N/A'} min</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
                          <p className="text-xs text-gray-500">Fare</p>
                          <p className="text-sm font-semibold">${booking.fare?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
                          <p className="text-xs text-gray-500">Vehicle</p>
                          <p className="text-sm font-semibold">{(booking as any).vehicle_type || 'Standard'}</p>
                        </div>
                      </div>

                      {/* Enhanced Driver Info */}
                      {booking.driver_id && (
                        <div className="border-t pt-4">
                          <h4 className="font-semibold mb-3 flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            Driver Information
                          </h4>
                          
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                                <User className="w-8 h-8 text-white" />
                              </div>
                              {trackingBooking?.id === booking.id && driverLocation && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-lg">
                                    {(booking.driver as any)?.name || `Driver #${booking.driver_id}`}
                                  </p>
                                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                                    <div className="flex items-center">
                                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                      <span className="ml-1">{(booking.driver as any)?.rating || 4.8}</span>
                                    </div>
                                    <span>•</span>
                                    <span>{(booking.driver as any)?.total_rides || 0} rides</span>
                                    <span>•</span>
                                    <span>{(booking.driver as any)?.vehicle?.license_plate || 'N/A'}</span>
                                  </div>
                                </div>
                                
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">Vehicle</p>
                                  <p className="text-sm font-medium">
                                    {(booking.driver as any)?.vehicle?.make || 'Toyota'} {(booking.driver as any)?.vehicle?.model || 'Camry'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {(booking.driver as any)?.vehicle?.color || 'Black'} • {(booking.driver as any)?.vehicle?.year || '2020'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Real-time Location Status */}
                          {trackingBooking?.id === booking.id && driverLocation && (
                            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                    Live Tracking Active
                                  </span>
                                </div>
                                <span className="text-xs text-green-600 dark:text-green-300">
                                  Updated: {new Date().toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                                Current: {driverLocation.latitude}, {driverLocation.longitude.toFixed(6)}
                              </p>
                            </div>
                          )}

                          {/* Driver Actions */}
                          <div className="grid grid-cols-3 gap-2 mt-4">
                            <Button size="sm" variant="outline" className="flex items-center justify-center">
                              <Phone className="w-4 h-4 mr-1" />
                              Call
                            </Button>
                            <Button size="sm" variant="outline" className="flex items-center justify-center">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              Message
                            </Button>
                            <Button 
                              size="sm" 
                              variant={trackingBooking?.id === booking.id ? "default" : "outline"}
                              className="flex items-center justify-center"
                              onClick={() => handleTrackDriver(booking)}
                            >
                              <Navigation className="w-4 h-4 mr-1" />
                              {trackingBooking?.id === booking.id ? 'Tracking' : 'Track'}
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
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Real-time Driver Tracking</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowDriverMap(false)}
                >
                  Hide Map
                </Button>
              </CardTitle>
              <CardDescription>
                Live location of Driver #{trackingBooking.driver_id} for Booking #{trackingBooking.id}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 rounded-lg overflow-hidden">
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
              
              {/* Driver Status Info */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-sm font-medium">Status</p>
                  <Badge variant="default" className="mt-1">
                    {trackingBooking.status}
                  </Badge>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-sm font-medium">Estimated Fare</p>
                  <p className="text-lg font-bold">${trackingBooking.fare?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-sm font-medium">Pickup Time</p>
                  <p className="text-sm">{new Date(trackingBooking.pickup_time).toLocaleTimeString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rest of the existing tabs content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trips">Recent Trips</TabsTrigger>
            <TabsTrigger value="spending">Spending</TabsTrigger>
            <TabsTrigger value="drivers">Driver Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Monthly Activity</CardTitle>
                  <CardDescription>Your ride statistics over time</CardDescription>
                </CardHeader>
                <CardContent>
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

              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Expenditure Trends</CardTitle>
                  <CardDescription>Daily spending patterns</CardDescription>
                </CardHeader>
                <CardContent>
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
        </Tabs>
      </div>
    </div>
    </>
  );
}
