import AdminBookingList from './AdminBookingList'
import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getBookings, getMyBookings, getRouteInstructions, Status } from '@/api/Bookings'
import { getDriverBookings, getDriverByUserId } from '@/api/Driver'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Route, Clock, Navigation, Car, User, ArrowRight, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import MapWithRoute from './MapWithRoute'
import { RoutePreview } from './RoutePreview'
import ActiveBookingCard from './ActiveBookingCard'
import { DriverAssignmentModal } from './DriverAssignment';
import { useNavigate } from '@tanstack/react-router'

interface BookingWithRoute {
  id: number;
  start_latitude: number;
  start_longitude: number;
  end_latitude: number;
  end_longitude: number;
  pickup_time: string;
  dropoff_time: string;
  status: string;
  fare: number;
  distance: number;
  duration: number;
  driverId?: number;
  driverName?: string;
}

interface RouteInstructions {
  bookingId: number;
  pickupLocation: {
    latitude: number;
    longitude: number;
  };
  dropoffLocation: {
    latitude: number;
    longitude: number;
  };
  instructions: string[]; 
  totalDistance: number;
  totalDuration: number;
  estimatedArrival: string;
}

function BookingList() {
  const [selectedBooking, setSelectedBooking] = useState<BookingWithRoute | null>(null)
  const [showRouteMap, setShowRouteMap] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [driverLocation, setDriverLocation] = useState<{lat: number, lng: number} | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [assigningBooking, setAssigningBooking] = useState<BookingWithRoute | null>(null);

  const queryClient = useQueryClient();
  const { user } = useAuth();
  const navigate = useNavigate();
  // Get driver's current location
  useEffect(() => {
    if (user?.role === 'driver' && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setDriverLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationError(null);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('Unable to get your location. Please enable location services.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000 // Cache for 1 minute
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [user?.role]);

  const { data: driverData } = useQuery({
    queryKey: ['driverData', user?.userId],
    queryFn: () => getDriverByUserId(user?.userId || 0),
    enabled: !!user?.userId && user?.role === 'driver',
  });

  const { data: customerBookingsData } = useQuery({
    queryKey: ['customerBookings', user?.userId],
    queryFn: () => getMyBookings(), 
    enabled: !!user?.userId && user?.role === 'customer',
    refetchInterval: 5000, 
  });

  const { data: driverBookingsData } = useQuery({
    queryKey: ['driverBookings', user?.userId, driverData?.driver_id],
    queryFn: () => getDriverBookings(localStorage.getItem('accessToken') || '', driverData?.driver_id),
    enabled: !!user?.userId && !!driverData?.driver_id && user?.role === 'driver',
    refetchInterval: 5000, 
  });

  const { data: allBookingsData } = useQuery({
    queryKey: ['allBookings', user?.userId, currentPage, pageSize],
    queryFn: () => getBookings(currentPage, pageSize), 
    enabled: !!user?.userId && user?.role === 'admin',
    refetchInterval: 5000, 
  });

  const rawBookings = (() => {
    switch (user?.role) {
      case 'admin':
        return allBookingsData?.bookings || [];
      case 'driver':
        return driverBookingsData || [];
      case 'customer':
        return customerBookingsData || [];
      default:
        return [];
    }
  })();

  const { data: routeInstructions, isLoading: isLoadingInstructions } = useQuery({
    queryKey: ['routeInstructions', selectedBooking?.id],
    queryFn: () => getRouteInstructions(selectedBooking!.id),
    enabled: !!selectedBooking?.id && (user?.role === 'driver' || user?.role === 'admin'),
  });

  const bookings: BookingWithRoute[] = rawBookings.map((b: any) => ({
    ...b,
    status: String(b.status ?? ''),
    distance: typeof b.distance === 'number' ? b.distance : 0,
    duration: typeof b.duration === 'number' ? b.duration : 0,
    fare: typeof b.fare === 'number' ? b.fare : 0,
    start_latitude: typeof b.start_latitude === 'number' ? b.start_latitude : 0,
    start_longitude: typeof b.start_longitude === 'number' ? b.start_longitude : 0,
    end_latitude: typeof b.end_latitude === 'number' ? b.end_latitude : 0,
    end_longitude: typeof b.end_longitude === 'number' ? b.end_longitude : 0,
  }))

  const totalPages = user?.role === 'admin' ? allBookingsData?.totalPages || 1 : 1;
  const totalItems = user?.role === 'admin' ? allBookingsData?.total || 0 : bookings.length;

  const getPageNumbers = () => {
    const delta = 4;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const handleRouteSelect = (booking: BookingWithRoute) => {
    console.log('Selected Booking:', booking);
    console.log('Start coordinates:', booking.start_latitude, booking.start_longitude);
    console.log('End coordinates:', booking.end_latitude, booking.end_longitude);
    console.log('Driver location state:', driverLocation);
    console.log('User role:', user?.role);
    
    setSelectedBooking(booking)
    
    const routeData = {
      start: { lat: booking.start_latitude, lng: booking.start_longitude },
      end: { lat: booking.end_latitude, lng: booking.end_longitude },
      driverLocation: user?.role === 'driver' && driverLocation ? driverLocation : null,
      waypoints: []
    };
    
    console.log('Setting selected route:', routeData);
    setSelectedRoute(routeData);
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedBooking(null); 
    setSelectedRoute(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bookings with Route Visualization</h1>
        <div className="flex items-center space-x-2">
          {user?.role === 'driver' && (
            <div className="flex items-center space-x-2">
              {driverLocation ? (
                <Badge variant="outline" className="text-green-600">
                  <MapPin className="w-3 h-3 mr-1" />
                  Location Active
                </Badge>
              ) : (
                <Badge variant="outline" className="text-red-600">
                  <MapPin className="w-3 h-3 mr-1" />
                  Location Unavailable
                </Badge>
              )}
            </div>
          )}
          <Button 
            onClick={() => setShowRouteMap(!showRouteMap)}
            variant="outline"
          >
            <Route className="w-4 h-4 mr-2" />
            {showRouteMap ? 'Hide Routes' : 'Show Routes'}
          </Button>
        </div>
      </div>

      {locationError && user?.role === 'driver' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <MapPin className="w-5 h-5 text-yellow-600 mr-2" />
            <p className="text-yellow-800">{locationError}</p>
          </div>
        </div>
      )}

      {/* Active Booking Section - New dedicated section */}
      {user?.role === 'driver' && selectedBooking && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-1">
          <ActiveBookingCard
            booking={{
              ...selectedBooking,
              status: selectedBooking.status as Status
            }}
            driverId={driverData?.driver_id ?? 0}
            onStatusUpdate={() => {
              queryClient.invalidateQueries({ queryKey: ['driverBookings'] });
              queryClient.invalidateQueries({ queryKey: ['booking', selectedBooking.id] });
            }}
          />
        </div>
      )}
      
      {showRouteMap && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Route Map */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Navigation className="w-5 h-5 mr-2" />
                Interactive Route Map
                {user?.role === 'driver' && driverLocation && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    Driver Location: {driverLocation.lat.toFixed(4)}, {driverLocation.lng.toFixed(4)}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedRoute ? (
                <div className="h-96">
                  <MapWithRoute
                    pickupLocation={{
                      latitude: selectedRoute.start.lat,
                      longitude: selectedRoute.start.lng,
                      name: 'Pickup Location'
                    }}
                    dropoffLocation={{
                      latitude: selectedRoute.end.lat,
                      longitude: selectedRoute.end.lng,
                      name: 'Dropoff Location'
                    }}
                    driverLocation={selectedRoute.driverLocation ? {
                      latitude: selectedRoute.driverLocation.lat,
                      longitude: selectedRoute.driverLocation.lng,
                      name: 'Driver Location'
                    } : undefined}
                  />
                </div>
              ) : (
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">Select a booking to view route</p>
                    <p className="text-sm text-gray-500 mt-2">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {user?.role === 'driver' ? 'Shows route from your location to pickup, then to dropoff' : 'Real-time traffic and route optimization'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Route Details */}
          <Card>
            <CardHeader>
              <CardTitle>Route Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedBooking ? (
                <div className="space-y-4">
                  {/* Driver Location Info for Drivers */}
                  {user?.role === 'driver' && driverLocation && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center">
                        <Car className="w-4 h-4 mr-1" />
                        Your Location
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600">
                          {driverLocation.lat.toFixed(4)}, {driverLocation.lng.toFixed(4)}
                        </p>
                        <div className="bg-green-50 p-2 rounded">
                          <p className="text-green-800 text-xs">
                            Route: Your Location → Pickup → Dropoff
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold mb-2">Trip Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Booking ID:</span>
                        <Badge variant="outline">#{selectedBooking.id}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge variant={selectedBooking.status === 'completed' ? 'default' : 'secondary'}>
                          {selectedBooking.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Distance:</span>
                        <span>{selectedBooking.distance?.toFixed(2)} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{selectedBooking.duration} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fare:</span>
                        <span>${selectedBooking.fare?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Route Points</h4>
                    <div className="space-y-2 text-sm">
                      {user?.role === 'driver' && driverLocation && (
                        <div>
                          <span className="font-medium text-blue-600">Driver (You):</span>
                          <p className="text-gray-600">
                            {driverLocation.lat.toFixed(4)}, {driverLocation.lng.toFixed(4)}
                          </p>
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Pickup:</span>
                        <p className="text-gray-600">
                          {selectedBooking.start_latitude?.toFixed(4)}, {selectedBooking.start_longitude?.toFixed(4)}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Dropoff:</span>
                        <p className="text-gray-600">
                          {selectedBooking.end_latitude?.toFixed(4)}, {selectedBooking.end_longitude?.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </div>
                  {(user?.role === 'driver' || user?.role === 'admin') && routeInstructions && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Navigation className="w-4 h-4 mr-1" />
                      Driver Instructions
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="font-medium text-blue-800">
                          Total: {(routeInstructions.totalDistance || 0).toFixed(2)} km • {Math.round((routeInstructions.totalDuration || 0) / 60)} min
                        </p>
                        <p className="text-blue-600">
                          ETA: {routeInstructions.estimatedArrival ? new Date(routeInstructions.estimatedArrival).toLocaleTimeString() : 'N/A'}
                        </p>
                      </div>
                      
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {routeInstructions.instructions?.map((instruction: string, index: number) => (
                          <div key={index} className="flex items-start space-x-2 p-2 bg-gray-50 rounded">
                            <Badge variant="outline" className="text-xs shrink-0">
                              {index + 1}
                            </Badge>
                            <div className="flex-1">
                              <p className="text-xs">{instruction}</p>
                            </div>
                            <ArrowRight className="w-3 h-3 text-gray-400 shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                    )}

                  {isLoadingInstructions && (user?.role === 'driver' || user?.role === 'admin') && (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-sm">Loading route instructions...</span>
                    </div>
                  )}

                  {selectedBooking.driverName && (
                    <div>
                      <h4 className="font-semibold mb-2">Driver</h4>
                      <div className="flex items-center space-x-2">
                        <Car className="w-4 h-4" />
                        <span>{selectedBooking.driverName}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center">Select a booking to see details</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Booking List with Route Selection */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>
                {user?.role === 'admin' ? 'All Bookings' : 'My Bookings'}
              </CardTitle>
              <CardDescription>
                Click on a booking to view its route
                {user?.role === 'admin' && (
                  <span className="ml-2">
                    • Showing {bookings.length} of {totalItems} bookings
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Bookings List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {bookings.length > 0 ? (
                bookings.map((booking: BookingWithRoute) => (
                  <div
                    key={booking.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedBooking?.id === booking.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => handleRouteSelect(booking)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">Booking #{booking.id}</h4>
                        <p className="text-sm text-gray-500">
                          {new Date(booking.pickup_time).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={booking.status === 'completed' ? 'default' : 'secondary'}>
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Start:</span>
                        <p className="text-gray-600">
                          {booking.start_latitude?.toFixed(4)}, {booking.start_longitude?.toFixed(4)}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">End:</span>
                        <p className="text-gray-600">
                          {booking.end_latitude?.toFixed(4)}, {booking.end_longitude?.toFixed(4)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex justify-between text-sm">
                      <span>{booking.distance?.toFixed(2)} km</span>
                      <span>{booking.duration} min</span>
                      <span>${booking.fare?.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No bookings found</p>
                  {user?.role === 'admin' && (
                    <p className="text-sm text-gray-400 mt-2">
                      Check if there are any bookings in the system
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Pagination Controls - Only for Admin */}
            {user?.role === 'admin' && totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} • {totalItems} total bookings
                </div>
                
                <div className="flex items-center space-x-1">
                  {/* First Page */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>

                  {/* Previous Page */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  {/* Page Numbers */}
                  {getPageNumbers().map((page, index) => (
                    <Button
                      key={index}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => typeof page === 'number' && handlePageChange(page)}
                      disabled={page === '...'}
                      className="min-w-[40px]"
                    >
                      {page}
                    </Button>
                  ))}

                  {/* Next Page */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>

                  {/* Last Page */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {(user?.role === 'admin' ) && <AdminBookingList />}

      {/* Driver Assignment Modal */}
      {assigningBooking && (
        <DriverAssignmentModal
          booking={{
            ...assigningBooking,
            status: assigningBooking.status as Status
          }}
          isOpen={!!assigningBooking}
          onClose={() => setAssigningBooking(null)}
          onSuccess={() => {
            setAssigningBooking(null);
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
          }}
        />
      )}

        {user?.role === 'customer' && (
        <Card className="mt-6">
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Need a ride?</h3>
              <p className="text-gray-600">Book your next trip with us</p>
              <Button 
                onClick={() => navigate({ to: '/create' })}
                className="bg-green-600 hover:bg-green-700"
                size="lg"
              >
                Create New Booking
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default BookingList
