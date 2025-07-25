import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { type Booking } from '@/api/Bookings';
import { DriverPickupAPI } from '@/api/DriverPickup';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useBookingSync } from '@/hooks/useBookingSync';

interface DriverPickupControlsProps {
  booking: Booking | null; 
  driverId: number;
  onStatusUpdate?: () => void;
}

const DriverPickupControls: React.FC<DriverPickupControlsProps> = ({
  booking,
  driverId,
  onStatusUpdate,
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Use the booking sync hook for real-time updates
  const { data: syncedBooking, forceRefetch } = useBookingSync({
    bookingId: booking?.id || null,
    enabled: true,
    refetchInterval: 1000, // Poll every 1 second for critical updates
  });

  // Use synced booking data if available, otherwise use props
  const currentBooking = syncedBooking || booking;

  if (!currentBooking) {
    return null;
  }

  const handleConfirmPickup = async () => {
    setIsConfirming(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!currentBooking.start_latitude || !currentBooking.start_longitude) {
        throw new Error('Invalid pickup location coordinates');
      }

      await DriverPickupAPI.confirmPickup({
        bookingId: currentBooking.id,
        driverId: driverId,
        pickupTime: new Date().toISOString(),
        pickupLatitude: currentBooking.start_latitude,
        pickupLongitude: currentBooking.start_longitude,
      });
      
      setSuccess('Pickup confirmed successfully!');
      
      // Aggressively invalidate all booking-related queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['bookings'] }),
        queryClient.invalidateQueries({ queryKey: ['driverBookings'] }),
        queryClient.invalidateQueries({ queryKey: ['driverPendingBookings'] }),
        queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
        queryClient.invalidateQueries({ queryKey: ['driver-assigned-booking'] }),
        // Add any specific query keys used in your app
      ]);
      
      // Force refetch
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['driver-assigned-booking', driverId] }),
        queryClient.refetchQueries({ queryKey: ['bookings'] }),
      ]);
      
      await onStatusUpdate?.();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to confirm pickup';
      setError(errorMessage);
      console.error('Failed to confirm pickup:', error);
    } finally {
      setIsConfirming(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleCompleteTrip = async () => {
    setIsCompleting(true);
    setError(null);
    setSuccess(null);
    
    try {
      await DriverPickupAPI.completeRide(currentBooking.id, driverId);
      setSuccess('Trip completed successfully!');
      
      // Aggressively invalidate all booking-related queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['bookings'] }),
        queryClient.invalidateQueries({ queryKey: ['driverBookings'] }),
        queryClient.invalidateQueries({ queryKey: ['driverPendingBookings'] }),
        queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
        queryClient.invalidateQueries({ queryKey: ['driver-assigned-booking'] }),
        // Add driver-specific queries
        queryClient.invalidateQueries({ queryKey: ['driverData'] }),
        queryClient.invalidateQueries({ queryKey: ['driverStats'] }),
      ]);
      
      // Force refetch
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['driver-assigned-booking', driverId] }),
        queryClient.refetchQueries({ queryKey: ['bookings'] }),
        queryClient.refetchQueries({ queryKey: ['driverData'] }),
      ]);
      
      await onStatusUpdate?.();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete trip';
      setError(errorMessage);
      console.error('Failed to complete trip:', error);
    } finally {
      setIsCompleting(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="space-y-3">
      {error && (
        <Alert variant="destructive" className="animate-in fade-in-0">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="bg-green-50 border-green-200 animate-in fade-in-0">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {currentBooking && currentBooking.status === 'accepted' && (
        <Button
          onClick={handleConfirmPickup}
          disabled={isConfirming}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          {isConfirming ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Confirming Pickup...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirm Pickup
            </>
          )}
        </Button>
      )}

      {currentBooking && currentBooking.status === 'in_progress' && (
        <Button
          onClick={handleCompleteTrip}
          disabled={isCompleting}
          className="w-full bg-green-600 hover:bg-green-700"
          size="lg"
        >
          {isCompleting ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Completing Trip...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete Trip
            </>
          )}
        </Button>
      )}

      {currentBooking && (currentBooking.status === 'requested' || currentBooking.status === 'completed' || currentBooking.status === 'cancelled') && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            {currentBooking.status === 'requested' && 'Waiting for customer confirmation'}
            {currentBooking.status === 'completed' && 'This trip has been completed'}
            {currentBooking.status === 'cancelled' && 'This booking has been cancelled'}
          </p>
        </div>
      )}
    </div>
  );
};

export default DriverPickupControls;
