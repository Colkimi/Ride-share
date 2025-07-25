import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Star, Clock, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { type Booking, getNearbyDrivers, assignSpecificDriver, autoAssignDriver, type NearbyDriver } from '@/api/Bookings';

interface DriverAssignmentModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DriverAssignmentModal: React.FC<DriverAssignmentModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [showAllDrivers, setShowAllDrivers] = useState(false);
  const queryClient = useQueryClient();

  // Fetch nearby drivers
  const { data: nearbyDrivers, isLoading: isLoadingNearby } = useQuery({
    queryKey: ['nearbyDrivers', booking.id],
    queryFn: () => getNearbyDrivers(booking.id, 10, 20),
    enabled: isOpen && !!booking.id && !showAllDrivers,
  });

  // Fetch all available drivers when needed
  const { data: allDrivers, isLoading: isLoadingAll } = useQuery({
    queryKey: ['allAvailableDrivers'],
    queryFn: async () => {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/driver/available`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch available drivers');
      return response.json();
    },
    enabled: isOpen && showAllDrivers,
  });

  // Manual assignment mutation
  const assignDriverMutation = useMutation({
    mutationFn: ({ bookingId, driverId }: { bookingId: number; driverId: number }) =>
      assignSpecificDriver(bookingId, driverId),
    onSuccess: () => {
      toast.success('Driver assigned successfully!');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to assign driver');
    },
  });

  // Auto assignment mutation
  const autoAssignMutation = useMutation({
    mutationFn: (bookingId: number) => autoAssignDriver(bookingId),
    onSuccess: () => {
      toast.success('Driver auto-assigned successfully!');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to auto-assign driver');
    },
  });

  const handleManualAssign = () => {
    if (!selectedDriverId) {
      toast.error('Please select a driver');
      return;
    }
    assignDriverMutation.mutate({ bookingId: booking.id, driverId: selectedDriverId });
  };

  const handleAutoAssign = () => {
    autoAssignMutation.mutate(booking.id);
  };

  const handleShowAllDrivers = () => {
    setShowAllDrivers(true);
    setSelectedDriverId(null); // Reset selection
  };

  const handleShowNearbyDrivers = () => {
    setShowAllDrivers(false);
    setSelectedDriverId(null); // Reset selection
  };

  // Determine which drivers to display and loading state
  const driversToShow = showAllDrivers ? allDrivers : nearbyDrivers;
  const isLoadingDrivers = showAllDrivers ? isLoadingAll : isLoadingNearby;
  const hasNearbyDrivers = nearbyDrivers && nearbyDrivers.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Driver to Booking #{booking.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Info */}
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg dark:text-white">Booking Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium dark:text-gray-200">Pickup:</span>
                  <p className="text-gray-600 dark:text-gray-400">
                    {booking.start_latitude?.toFixed(4)}, {booking.start_longitude?.toFixed(4)}
                  </p>
                </div>
                <div>
                  <span className="font-medium dark:text-gray-200">Dropoff:</span>
                  <p className="text-gray-600 dark:text-gray-400">
                    {booking.end_latitude?.toFixed(4)}, {booking.end_longitude?.toFixed(4)}
                  </p>
                </div>
                <div>
                  <span className="font-medium dark:text-gray-200">Pickup Time:</span>
                  <p className="text-gray-600 dark:text-gray-400">
                    {new Date(booking.pickup_time).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="font-medium dark:text-gray-200">Status:</span>
                  <Badge variant="outline" className="dark:border-gray-600">{booking.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Auto Assignment */}
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg dark:text-white">Quick Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium dark:text-gray-200">Auto-assign nearest driver</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatically assign the closest available driver
                  </p>
                </div>
                <Button
                  onClick={handleAutoAssign}
                  disabled={autoAssignMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {autoAssignMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    'Auto Assign'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Manual Assignment */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Manual Assignment</CardTitle>
                {/* Toggle buttons */}
                <div className="flex space-x-2">
                  <Button
                    variant={!showAllDrivers ? "default" : "outline"}
                    size="sm"
                    onClick={handleShowNearbyDrivers}
                    disabled={isLoadingDrivers}
                  >
                    <MapPin className="w-4 h-4 mr-1" />
                    Nearby
                  </Button>
                  <Button
                    variant={showAllDrivers ? "default" : "outline"}
                    size="sm"
                    onClick={handleShowAllDrivers}
                    disabled={isLoadingDrivers}
                  >
                    <Users className="w-4 h-4 mr-1" />
                    All Available
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoadingDrivers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Loading {showAllDrivers ? 'all available' : 'nearby'} drivers...
                  </div>
                ) : driversToShow && driversToShow.length > 0 ? (
                  <>
                    <div className="grid gap-3 max-h-60 overflow-y-auto">
                      {driversToShow.map((driver: any) => {
                        // Handle both nearby driver format and all drivers format
                        const driverId = driver.driverId || driver.driver_id;
                        const driverInfo = driver.driver || driver;
                        const distance = driver.distance;
                        const estimatedTime = driver.estimatedTimeToPickup;
                        
                        return (
                          <Card
                            key={driverId}
                            className={`cursor-pointer transition-colors ${
                              selectedDriverId === driverId
                                ? 'ring-2 ring-blue-500 bg-blue-50'
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedDriverId(driverId)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium">
                                      {(driverInfo.license_number || driver.license_number || 'XX').toString().slice(-2)}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      {driver.user ? 
                                        `${driver.user.first_name} ${driver.user.last_name}` : 
                                        `Driver #${driverId}`
                                      }
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      License: {driverInfo.license_number || driver.license_number || 'N/A'}
                                    </p>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <div className="flex items-center">
                                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                                        <span className="text-sm">
                                          {driverInfo.rating || driver.rating || 'N/A'}
                                        </span>
                                      </div>
                                      <Badge variant="outline" className="text-xs">
                                        {(driverInfo.isAvailable !== false && driver.isAvailable !== false) ? 'Available' : 'Busy'}
                                      </Badge>
                                      {driver.verification_status && (
                                        <Badge variant="secondary" className="text-xs">
                                          {driver.verification_status}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  {distance !== undefined ? (
                                    <>
                                      <div className="flex items-center text-sm text-gray-600">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        {distance.toFixed(1)} km
                                      </div>
                                      <div className="flex items-center text-sm text-gray-600 mt-1">
                                        <Clock className="w-4 h-4 mr-1" />
                                        {Math.round(estimatedTime || 0)} min
                                      </div>
                                    </>
                                  ) : (
                                    <div className="text-sm text-gray-500">
                                      <div className="flex items-center">
                                        <Users className="w-4 h-4 mr-1" />
                                        Available
                                      </div>
                                      {driver.total_trips !== undefined && (
                                        <div className="text-xs mt-1">
                                          {driver.total_trips} trips
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <p className="text-sm text-gray-600">
                        {driversToShow.length} {showAllDrivers ? 'available' : 'nearby'} drivers
                        {!showAllDrivers && ' within 10km'}
                      </p>
                      <Button
                        onClick={handleManualAssign}
                        disabled={!selectedDriverId || assignDriverMutation.isPending}
                        variant="outline"
                      >
                        {assignDriverMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Assigning...
                          </>
                        ) : (
                          'Assign Selected Driver'
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">
                      No {showAllDrivers ? 'available' : 'nearby'} drivers found
                    </p>
                    {!showAllDrivers && !hasNearbyDrivers ? (
                      <div className="mt-4">
                        <p className="text-sm text-gray-500 mb-3">
                          No drivers found within 10km radius
                        </p>
                        <Button
                          onClick={handleShowAllDrivers}
                          variant="outline"
                          size="sm"
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Show All Available Drivers
                        </Button>
                      </div>
                    ) : showAllDrivers ? (
                      <p className="text-sm text-gray-500 mt-2">
                        No drivers are currently available
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};