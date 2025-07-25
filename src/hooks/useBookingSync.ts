import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { getBooking } from '@/api/Bookings';

interface UseBookingSyncProps {
  bookingId: number | null;
  enabled?: boolean;
  refetchInterval?: number;
}

export function useBookingSync({ 
  bookingId, 
  enabled = true, 
  refetchInterval = 2000 // Poll every 2 seconds for critical updates
}: UseBookingSyncProps) {
  const queryClient = useQueryClient();
  const previousStatusRef = useRef<string | null>(null);

  const query = useQuery({
    queryKey: ['booking-sync', bookingId],
    queryFn: () => getBooking(bookingId!),
    enabled: enabled && !!bookingId,
    refetchInterval,
    staleTime: 0,
    gcTime: 1000,
  });

  // Force immediate refetch when bookingId changes
  useEffect(() => {
    if (bookingId && enabled) {
      queryClient.invalidateQueries({ queryKey: ['booking-sync', bookingId] });
      queryClient.refetchQueries({ queryKey: ['booking-sync', bookingId] });
    }
  }, [bookingId, enabled, queryClient]);

  // Monitor status changes
  useEffect(() => {
    if (query.data?.status && query.data.status !== previousStatusRef.current) {
      previousStatusRef.current = query.data.status;
      
      // Invalidate all related queries when status changes
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['driverBookings'] });
      queryClient.invalidateQueries({ queryKey: ['driver-assigned-booking'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      
      // Force immediate refetch
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['bookings'] });
        queryClient.refetchQueries({ queryKey: ['driverBookings'] });
        queryClient.refetchQueries({ queryKey: ['driver-assigned-booking'] });
      }, 100);
    }
  }, [query.data?.status, queryClient]);

  return {
    ...query,
    forceRefetch: () => {
      if (bookingId) {
        queryClient.invalidateQueries({ queryKey: ['booking-sync', bookingId] });
        queryClient.refetchQueries({ queryKey: ['booking-sync', bookingId] });
      }
    }
  };
}
