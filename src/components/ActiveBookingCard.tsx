import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, DollarSign, Navigation, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { type Booking } from '@/api/Bookings';
import DriverPickupControls from '@/components/DriverPickupControls';

interface ActiveBookingCardProps {
  booking: Booking;
  driverId: number;
  onStatusUpdate?: () => void;
}

const ActiveBookingCard: React.FC<ActiveBookingCardProps> = ({
  booking,
  driverId,
  onStatusUpdate,
}) => {
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Accepted';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status || 'Unknown';
    }
  };

  const handleStatusUpdate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onStatusUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCoordinates = (lat?: number, lng?: number) => {
    if (!lat || !lng) return 'N/A';
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };

  const isValidBooking = booking && booking.id && booking.start_latitude && booking.start_longitude;

  if (!isValidBooking) {
    return (
      <Card className="mb-4 border-red-200">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>Invalid booking data</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Active Booking #{booking.id}</span>
          <Badge className={getStatusColor(booking.status || 'pending')}>
            {getStatusText(booking.status || 'pending')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Pickup</p>
                <p className="font-medium">
                  {formatCoordinates(booking.start_latitude, booking.start_longitude)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Navigation className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Dropoff</p>
                <p className="font-medium">
                  {formatCoordinates(booking.end_latitude, booking.end_longitude)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Pickup Time</p>
                <p className="font-medium">
                  {booking.pickup_time ? format(new Date(booking.pickup_time), 'MMM d, h:mm a') : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Estimated Fare</p>
                <p className="font-medium">${booking.fare ? Number(booking.fare).toFixed(2) : '0.00'}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          <DriverPickupControls
            booking={booking}
            driverId={driverId}
            onStatusUpdate={handleStatusUpdate}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveBookingCard;
