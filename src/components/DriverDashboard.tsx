import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDriverLocation } from '@/hooks/useDriverLocation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type Booking } from '@/api/Bookings';
import { getDriverByUserId, type Driver } from '@/api/Driver';
import { getVehicles, type Vehicle } from '@/api/Vehicle';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from '@tanstack/react-router';
import { format } from 'date-fns';
import { 
  Car, 
  DollarSign, 
  Star, 
  Clock, 
  Activity, 
  Wallet, 
  Settings, 
  Bell,
  TrendingUp,
  Calendar,
  MapPin,
  Navigation,
  CheckCircle,
  XCircle,
  Map,
  Users,
  Briefcase,
  Plus,
  Edit3,
  Trash2
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  getDriverBookings,
  getDriverPendingBookings,
  acceptDriverBooking,
  rejectDriverBooking,
} from '@/api/Driver';
import MapWithRoute from './MapWithRoute';
import DriverLocationSimulator from './DriverLocationSimulator';
import { LocationSearch } from './LocationSearch';
import type { Label, Location } from '../api/Location';

interface SavedLocation {
  id: number
  label: string
  address: string
  latitude: number
  longitude: number
  type: 'home' | 'work' | 'custom'
}

const DriverDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isOnline, setIsOnline] = useState(false);
  const [currentEarnings, setCurrentEarnings] = useState(0);
  const [completedRides, setCompletedRides] = useState(0);
  const queryClient = useQueryClient()
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([
    {
      id: 1,
      label: 'Home',
      address: '123 Main St, City',
      latitude: 40.7128,
      longitude: -74.0060,
      type: 'home'
    },
    {
      id: 2,
      label: 'Work',
      address: '456 Business Ave, City',
      latitude: 40.7589,
      longitude: -73.9851,
      type: 'work'
    }
  ]);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const token = localStorage.getItem('accessToken') || '';

  const { data: driverData, isLoading, error } = useQuery<Driver>({
    queryKey: ['driverData', user?.userId],
    queryFn: () => getDriverByUserId(user?.userId || 0),
    enabled: !!user?.userId,
  });

  const driverId = driverData?.driver_id || 3500;
  const liveLocation = useDriverLocation(driverId);

  const { data: vehicles } = useQuery({
    queryKey: ['vehicle'],
    queryFn: () => getVehicles(),
  });

  const { data: bookings, isLoading: isBookingsLoading } = useQuery({
    queryKey: ['driverBookings', user?.userId, driverData?.driver_id],
    queryFn: () => getDriverBookings(token, driverData?.driver_id),
    enabled: !!token && !!user?.userId && !!driverData?.driver_id,
    staleTime: 0, // Data is immediately stale
    gcTime: 0, // Don't cache data (was cacheTime in older versions)
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  const { data: pendingBookings } = useQuery({
    queryKey: ['driverPendingBookings', user?.userId, driverData?.driver_id],
    queryFn: () => getDriverPendingBookings(token, driverData?.driver_id),
    enabled: !!token && !!user?.userId && !!driverData?.driver_id,
    staleTime: 0, // Data is immediately stale
    gcTime: 0, // Don't cache data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 15000, // Refetch every 15 seconds for pending bookings
  });

  // Debug logging
  console.log('Driver Dashboard Debug:', {
    userId: user?.userId,
    driverId: driverData?.driver_id,
    token: token ? 'exists' : 'missing',
    bookingsCount: bookings?.length || 0,
    pendingCount: pendingBookings?.length || 0,
    bookings: bookings,
    pendingBookings: pendingBookings
  });
const acceptMutation = useMutation({
  mutationFn: (bookingId: number) => {
    console.log('Accepting booking ID:', bookingId);
    console.log('Using token:', token ? 'Token exists' : 'No token');
    return acceptDriverBooking(token, bookingId);
  },
  onSuccess: async (data) => {
    console.log('Accept booking success:', data);
    
    // Invalidate all booking-related queries
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['driverBookings'] }),
      queryClient.invalidateQueries({ queryKey: ['driverPendingBookings'] }),
      queryClient.invalidateQueries({ queryKey: ['driverBookings', user?.userId, driverData?.driver_id] }),
      queryClient.invalidateQueries({ queryKey: ['driverPendingBookings', user?.userId, driverData?.driver_id] }),
      // Also invalidate general booking queries that might be used elsewhere
      queryClient.invalidateQueries({ queryKey: ['bookings'] }),
      queryClient.invalidateQueries({ queryKey: ['driver-assigned-booking'] }),
    ]);
    
    // Force refetch immediately
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ['driverBookings', user?.userId, driverData?.driver_id] }),
      queryClient.refetchQueries({ queryKey: ['driverPendingBookings', user?.userId, driverData?.driver_id] }),
    ]);
  },
  onError: (error) => {
    console.error('Accept booking error:', error);
  },
});

const rejectMutation = useMutation({
  mutationFn: (bookingId: number) => {
    console.log('Rejecting booking ID:', bookingId);
    return rejectDriverBooking(token, bookingId);
  },
  onSuccess: async (data) => {
    console.log('Reject booking success:', data);
    
    // Invalidate all booking-related queries
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['driverBookings'] }),
      queryClient.invalidateQueries({ queryKey: ['driverPendingBookings'] }),
      queryClient.invalidateQueries({ queryKey: ['driverBookings', user?.userId, driverData?.driver_id] }),
      queryClient.invalidateQueries({ queryKey: ['driverPendingBookings', user?.userId, driverData?.driver_id] }),
      queryClient.invalidateQueries({ queryKey: ['bookings'] }),
      queryClient.invalidateQueries({ queryKey: ['driver-assigned-booking'] }),
    ]);
    
    // Force refetch immediately
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ['driverBookings', user?.userId, driverData?.driver_id] }),
      queryClient.refetchQueries({ queryKey: ['driverPendingBookings', user?.userId, driverData?.driver_id] }),
    ]);
  },
  onError: (error) => {
    console.error('Reject booking error:', error);
  },
});

  const handleOnlineToggle = async (checked: boolean) => {
    setIsOnline(checked);
    console.log('Driver status updated:', checked);
  };

  const handleLocationSelect = (loc: { label: string; coordinates: { latitude: number; longitude: number } }) => {
    setSelectedLocation({
      label: loc.label as Label,
      address: loc.label,
      latitude: loc.coordinates.latitude,
      longitude: loc.coordinates.longitude,
      is_default: false,
    });
  };

  const addSavedLocation = (location: Omit<SavedLocation, 'id'>) => {
    const newLocation = {
      ...location,
      id: Date.now()
    };
    setSavedLocations(prev => [...prev, newLocation]);
    setShowLocationForm(false);
  };

  const deleteSavedLocation = (id: number) => {
    setSavedLocations(prev => prev.filter(loc => loc.id !== id));
  };

  // Prepare chart data from bookings
  const monthlyData = React.useMemo(() => {
    if (!bookings || bookings.length === 0) return [];
    
    // Group bookings by month
    const monthlyStats = bookings
      .filter((b: Booking) => b.status === 'completed')
      .reduce((acc: any, booking: Booking) => {
        const month = format(new Date(booking.pickup_time), 'MMM yyyy');
        if (!acc[month]) {
          acc[month] = { month, earnings: 0, trips: 0 };
        }
        acc[month].earnings += booking.fare || 0;
        acc[month].trips += 1;
        return acc;
      }, {});
    
    return Object.values(monthlyStats);
  }, [bookings]);

  const topDestinations = React.useMemo(() => {
    if (!bookings || bookings.length === 0) return [];
    
    // Group by destination coordinates and count frequency
    const destinations = bookings
      .filter((b: Booking) => b.status === 'completed' && b.end_latitude && b.end_longitude)
      .reduce((acc: any, booking: Booking) => {
        const location = `${booking.end_latitude?.toFixed(3)}, ${booking.end_longitude?.toFixed(3)}`;
        if (!acc[location]) {
          acc[location] = { location, count: 0, totalFare: 0 };
        }
        acc[location].count += 1;
        acc[location].totalFare += booking.fare || 0;
        return acc;
      }, {});
    
    return Object.values(destinations)
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5);
  }, [bookings]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mb-4"></div>
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const isDriverNotFound = error.message?.includes('404') || 
                           error.message?.toLowerCase().includes('not found') ||
                           error.message?.toLowerCase().includes('driver profile not found');
    
    if (isDriverNotFound) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-8 text-center">
              <h3 className="text-yellow-800 dark:text-yellow-200 font-semibold text-2xl mb-4">
                Driver Profile Not Found
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 mb-6 max-w-md mx-auto">
                You haven't registered as a driver yet. Complete your driver registration to start earning with our platform.
              </p>
              <Button 
                onClick={() => navigate({ to: '/driver-registration' })}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Register as Driver
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <h3 className="text-red-800 dark:text-red-200 font-semibold text-lg">
              Error Loading Dashboard
            </h3>
            <p className="mt-2 text-red-600 dark:text-red-400">
              {error?.message || 'Failed to load dashboard data'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const stats = {
    totalTrips: driverData?.total_trips || (bookings?.filter((b: Booking) => b.status === 'completed').length || 0),
    totalEarnings: bookings?.filter((b: Booking) => b.status === 'completed').reduce((sum: number, booking: Booking) => sum + (booking.fare || 0), 0) || 0,
    averageRating: driverData?.rating || 0,
    onlineHours: 0, // You might want to calculate this from booking data or add a separate API
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Driver Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back, {user?.firstName || 'Driver'}
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Offline</span>
              <Switch
                checked={isOnline}
                onCheckedChange={handleOnlineToggle}
                className="data-[state=checked]:bg-green-500"
              />
              <span className="text-sm font-medium">Online</span>
            </div>
            <Badge variant={isOnline ? "default" : "secondary"} className="text-sm">
              {isOnline ? "Available" : "Offline"}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
              <Car className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalTrips}</div>
              <p className="text-xs text-muted-foreground">Completed rides</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${stats.totalEarnings}</div>
              <p className="text-xs text-muted-foreground">Lifetime earnings</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.averageRating}</div>
              <p className="text-xs text-muted-foreground">Driver rating</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Online Hours</CardTitle>
              <Clock className="w-4 h-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.onlineHours}h</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="trips">Recent Trips</TabsTrigger>
            <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Performance</CardTitle>
                  <CardDescription>Earnings and trips over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={2} name="Earnings ($)" />
                        <Line type="monotone" dataKey="trips" stroke="#3b82f6" strokeWidth={2} name="Trips" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No data available yet</p>
                        <p className="text-sm">Complete some trips to see your performance</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Destinations</CardTitle>
                  <CardDescription>Your most frequent routes</CardDescription>
                </CardHeader>
                <CardContent>
                  {topDestinations.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={topDestinations}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="location" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8b5cf6" name="Trip Count" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No destinations data yet</p>
                        <p className="text-sm">Complete some trips to see popular destinations</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {bookings?.filter((b: Booking) => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return b.status === 'completed' && new Date(b.pickup_time) > weekAgo;
                    }).length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Completed Trips</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ${bookings?.filter((b: Booking) => {
                      const monthAgo = new Date();
                      monthAgo.setMonth(monthAgo.getMonth() - 1);
                      return b.status === 'completed' && new Date(b.pickup_time) > monthAgo;
                    }).reduce((sum: number, b: Booking) => sum + (b.fare || 0), 0).toFixed(2) || '0.00'}
                  </div>
                  <p className="text-xs text-muted-foreground">Earnings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Average Trip</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    ${(stats.totalTrips > 0 ? (stats.totalEarnings / stats.totalTrips) : 0).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">Per Trip</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Your driving performance summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{stats.totalTrips}</p>
                    <p className="text-sm text-muted-foreground">Total Trips</p>
                  </div>
                  <div className="text-center">
                    <DollarSign className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">${stats.totalEarnings}</p>
                    <p className="text-sm text-muted-foreground">Total Earnings</p>
                  </div>
                  <div className="text-center">
                    <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{stats.averageRating}</p>
                    <p className="text-sm text-muted-foreground">Average Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recent Trips Tab */}
          <TabsContent value="trips" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Completed Trips</CardTitle>
                <CardDescription>Your latest completed rides</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3">Date</th>
                        <th className="text-left py-3">Pickup</th>
                        <th className="text-left py-3">Dropoff</th>
                        <th className="text-left py-3">Fare</th>
                        <th className="text-left py-3">Status</th>
                        <th className="text-left py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings?.filter((trip: Booking) => trip.status === 'completed')
                        .sort((a: Booking, b: Booking) => new Date(b.pickup_time).getTime() - new Date(a.pickup_time).getTime())
                        .slice(0, 10).map((trip: Booking) => (
                        <tr key={trip.id} className="border-b">
                          <td className="py-3">{format(new Date(trip.pickup_time), 'MMM d, yyyy HH:mm')}</td>
                          <td className="py-3 text-sm">
                            {trip.start_latitude && trip.start_longitude 
                              ? `${trip.start_latitude.toFixed(3)}, ${trip.start_longitude.toFixed(3)}`
                              : 'N/A'}
                          </td>
                          <td className="py-3 text-sm">
                            {trip.end_latitude && trip.end_longitude
                              ? `${trip.end_latitude.toFixed(3)}, ${trip.end_longitude.toFixed(3)}`
                              : 'N/A'}
                          </td>
                          <td className="py-3 font-semibold">${trip.fare || 0}</td>
                          <td className="py-3">
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              {trip.status}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <Button variant="outline" size="sm">
                              <Map className="w-4 h-4 mr-1" />
                              View Route
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {bookings?.filter((trip: Booking) => trip.status === 'completed').length === 0 && (
                    <div className="text-center py-12">
                      <Car className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground text-lg">No completed trips yet</p>
                      <p className="text-sm text-muted-foreground">Your completed rides will appear here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Trip Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Today's Trips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {bookings?.filter((b: Booking) => {
                      const today = new Date();
                      const tripDate = new Date(b.pickup_time);
                      return b.status === 'completed' && 
                             tripDate.toDateString() === today.toDateString();
                    }).length || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Longest Trip</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.max(...(bookings?.filter((b: Booking) => b.status === 'completed').map((b: Booking): number => b.fare || 0) || [0])).toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {bookings && bookings.length > 0 
                      ? Math.round((bookings.filter((b: Booking) => b.status === 'completed').length / bookings.length) * 100)
                      : 0}%
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Vehicle Tab */}
          <TabsContent value="vehicle" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Management</CardTitle>
                  <CardDescription>Your registered vehicles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(vehicles?.vehicles || []).length > 0 ? (
                      <>
                        {vehicles?.vehicles.map((vehicle: Vehicle) => (
                          <div key={vehicle.vehicle_id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{vehicle.make} {vehicle.model}</p>
                              <p className="text-sm text-muted-foreground">License: {vehicle.license_plate}</p>
                              <p className="text-sm text-muted-foreground">Year: {vehicle.year}</p>
                              <p className="text-sm text-muted-foreground">Color: {vehicle.color || 'Not specified'}</p>
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                              <Badge variant={vehicle.approved ? 'default' : 'secondary'}>
                                {vehicle.approved ? 'Active' : 'Pending Approval'}
                              </Badge>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate({ to: '/vehicle', search: { edit: vehicle.vehicle_id } })}
                              >
                                Edit
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => navigate({ to: '/vehicle' })}
                        >
                          <Car className="w-4 h-4 mr-2" />
                          Add New Vehicle
                        </Button>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <Car className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground mb-4">No vehicles registered</p>
                        <Button 
                          onClick={() => navigate({ to: '/vehicle' })}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Car className="w-4 h-4 mr-2" />
                          Register Your First Vehicle
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common driver tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => navigate({ to: '/earnings' })}
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      View Earnings Details
                    </Button>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => navigate({ to: '/account' })}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Account Settings
                    </Button>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => navigate({ to: '/calender' })}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      View Schedule
                    </Button>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => navigate({ to: '/notifications' })}
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Notifications
                    </Button>
                    
                    {/* Driver specific actions */}
                    <div className="pt-4 border-t">
                      <Button 
                        className="w-full mb-2" 
                        variant="outline"
                        onClick={() => setIsOnline(!isOnline)}
                      >
                        <Activity className="w-4 h-4 mr-2" />
                        {isOnline ? 'Go Offline' : 'Go Online'}
                      </Button>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => navigate({ to: '/support' })}
                      >
                        <Bell className="w-4 h-4 mr-2" />
                        Driver Support
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Bookings Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Your Bookings</CardTitle>
              <CardDescription>Manage your trip bookings</CardDescription>
            </CardHeader>
            <CardContent>
              {isBookingsLoading ? (
                <p>Loading bookings...</p>
              ) : (
                <div>
                  <h2 className="text-lg font-semibold mb-4">Completed Trips</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3">Date</th>
                          <th className="text-left py-3">Pickup</th>
                          <th className="text-left py-3">Dropoff</th>
                          <th className="text-left py-3">Fare</th>
                          <th className="text-left py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings?.map((trip: Booking) => (
                          <tr key={trip.id} className="border-b">
                            <td className="py-3">{format(new Date(trip.pickup_time), 'MMM d, yyyy')}</td>
                            <td className="py-3 text-sm">
                              {trip.start_latitude && trip.start_longitude 
                                ? `${trip.start_latitude.toFixed(2)}, ${trip.start_longitude.toFixed(2)}`
                                : 'N/A'}
                            </td>
                            <td className="py-3 text-sm">
                              {trip.end_latitude && trip.end_longitude
                                ? `${trip.end_latitude.toFixed(2)}, ${trip.end_longitude.toFixed(2)}`
                                : 'N/A'}
                            </td>
                            <td className="py-3">${trip.fare || 0}</td>
                            <td className="py-3">
                              <Badge variant="default">{trip.status}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(bookings?.length || 0) === 0 && (
                      <p className="text-center py-8 text-muted-foreground">No completed trips yet</p>
                    )}
                  </div>

                  <h2 className="text-lg font-semibold mt-6 mb-4">Pending Bookings</h2>
                  <div className="space-y-4">
                    {pendingBookings?.map((booking: Booking) => (
                      <div key={booking.id} className="p-4 border rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(booking.pickup_time), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            onClick={() => acceptMutation.mutate(booking.id)} 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={acceptMutation.isPending}
                          >
                            {acceptMutation.isPending ? 'Accepting...' : 'Accept'}
                          </Button>
                          <Button 
                            onClick={() => rejectMutation.mutate(booking.id)} 
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={rejectMutation.isPending}
                          >
                            {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                          </Button>
                        </div>
                      </div>
                    ))}
                    {(pendingBookings?.length || 0) === 0 && (
                      <p className="text-center py-4 text-muted-foreground">No pending bookings</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Saved Location Form Component
interface SavedLocationFormProps {
  onSave: (location: Omit<SavedLocation, 'id'>) => void
  onCancel: () => void
}

function SavedLocationForm({ onSave, onCancel }: SavedLocationFormProps) {
  const [formData, setFormData] = useState({
    label: '',
    address: '',
    latitude: 0,
    longitude: 0,
    type: 'custom' as 'home' | 'work' | 'custom'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.label && formData.address) {
      onSave(formData)
    }
  }

  return (
    <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Location Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
          >
            <option value="home">Home</option>
            <option value="work">Work</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Label</label>
          <input
            type="text"
            value={formData.label}
            onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
            placeholder="e.g., Home, Office, Gym"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
            placeholder="Enter full address"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              required
            />
          </div>
        </div>

        <div className="flex space-x-3">
          <Button type="submit" className="bg-green-600 hover:bg-green-700">
            Save Location
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

export default DriverDashboard;
