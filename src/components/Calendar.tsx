import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth } from 'date-fns';
import { getBookings, type Booking } from '@/api/Bookings';
import { useAuth } from '@/hooks/useAuth';
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from '@/components/ui/modern-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Clock, 
  DollarSign,
  User,
  Car
} from 'lucide-react';

interface CalendarProps {
  className?: string;
}

function Calendar({ className = "" }: CalendarProps) {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get current month bounds
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const { data: bookingsData, isLoading, error } = useQuery({
    queryKey: ['bookings', format(monthStart, 'yyyy-MM')],
    queryFn: async () => {
      try {
        const response = await getBookings();
        
        if (Array.isArray(response)) {
          return response;
        } else if (response && response.bookings) {
          return response.bookings;
        } else if (response && Array.isArray(response.bookings)) {
          return response.bookings;
        } else {
          return [];
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        return [];
      }
    },
  });

  const allBookings = Array.isArray(bookingsData) ? bookingsData : [];

  // Filter bookings for the current month
  const bookings = useMemo(() => {
    return allBookings.filter((booking) => {
      if (!booking.pickup_time) return false;
      
      try {
        const bookingDate = new Date(booking.pickup_time);
        return bookingDate >= monthStart && bookingDate <= monthEnd;
      } catch (error) {
        console.error('Error parsing booking date:', error);
        return false;
      }
    });
  }, [allBookings, monthStart, monthEnd]);

  // Group bookings by date
  const bookingsByDate = useMemo(() => {
    const grouped: Record<string, Booking[]> = {};
    
    bookings.forEach((booking) => {
      try {
        const bookingDate = format(new Date(booking.pickup_time), 'yyyy-MM-dd');
        if (!grouped[bookingDate]) {
          grouped[bookingDate] = [];
        }
        grouped[bookingDate].push(booking);
      } catch (error) {
        console.error('Error grouping booking by date:', error);
      }
    });
    
    return grouped;
  }, [bookings]);

  // Get bookings for selected date
  const selectedDateBookings = selectedDate 
    ? bookingsByDate[format(selectedDate, 'yyyy-MM-dd')] || []
    : [];

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Get status color for bookings
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'in_progress':
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'accepted':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Safe date formatting function
  const formatBookingTime = (dateString: string | Date) => {
    try {
      return format(new Date(dateString), 'HH:mm');
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid time';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <ModernCard>
          <ModernCardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-32" />
              <div className="flex space-x-2">
                <Skeleton className="h-9 w-9" />
                <Skeleton className="h-9 w-9" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
          </ModernCardHeader>
          <ModernCardContent>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </ModernCardContent>
        </ModernCard>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`${className}`}>
        <ModernCard>
          <ModernCardContent className="p-8 text-center">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Error Loading Calendar
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Failed to load calendar data. Please try again.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </ModernCardContent>
        </ModernCard>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Calendar Header */}
      <ModernCard>
        <ModernCardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="h-6 w-6" />
              <ModernCardTitle className="text-white">
                {format(currentDate, 'MMMM yyyy')}
              </ModernCardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPreviousMonth}
                className="text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextMonth}
                className="text-white hover:bg-white/20"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                onClick={goToToday}
                size="sm"
                className="bg-white/20 text-white hover:bg-white/30"
              >
                Today
              </Button>
            </div>
          </div>
        </ModernCardHeader>

        <ModernCardContent className="p-6">
          {/* Calendar Grid */}
          <div className="space-y-4">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {daysInMonth.map((day) => {
                const dayStr = format(day, 'yyyy-MM-dd');
                const dayBookings = bookingsByDate[dayStr] || [];
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isTodayDate = isToday(day);
                
                return (
                  <div
                    key={day.toISOString()}
                    className={`
                      relative min-h-[80px] p-2 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer
                      transition-all duration-200 hover:shadow-md
                      ${isSelected 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600' 
                        : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }
                      ${!isSameMonth(day, currentDate) ? 'opacity-50' : ''}
                    `}
                    onClick={() => setSelectedDate(day)}
                  >
                    {/* Day Number */}
                    <div className={`
                      text-sm font-medium mb-1
                      ${isTodayDate 
                        ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center' 
                        : isSelected 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-gray-900 dark:text-gray-100'
                      }
                    `}>
                      {format(day, 'd')}
                    </div>

                    {/* Booking Indicators */}
                    {dayBookings.length > 0 && (
                      <div className="space-y-1">
                        {dayBookings.slice(0, 2).map((booking, index) => (
                          <div
                            key={booking.id || index}
                            className={`
                              text-xs px-1 py-0.5 rounded text-center truncate
                              ${getStatusColor(booking.status ?? '')}
                            `}
                            title={`${booking.status} - ${formatBookingTime(booking.pickup_time)}`}
                          >
                            {formatBookingTime(booking.pickup_time)}
                          </div>
                        ))}
                        {dayBookings.length > 2 && (
                          <div className="text-xs text-center text-gray-500 font-medium">
                            +{dayBookings.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>

      {/* Selected Date Details */}
      {selectedDate && (
        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle>
              Bookings for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            {selectedDateBookings.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">
                  No bookings scheduled for this date
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDateBookings.map((booking, index) => (
                  <div
                    key={booking.id || index}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {formatBookingTime(booking.pickup_time)}
                        </span>
                        <Badge className={getStatusColor(booking.status ?? '')}>
                          {booking.status}
                        </Badge>
                      </div>
                      {booking.fare && (
                        <div className="flex items-center text-green-600 font-semibold">
                          <DollarSign className="h-4 w-4 mr-1" />
                          ${typeof booking.fare === 'number' ? booking.fare.toFixed(2) : booking.fare}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">Pickup</div>
                            <div className="text-gray-600 dark:text-gray-400">
                              {booking.start_latitude && booking.start_longitude
                                ? `${booking.start_latitude.toFixed(4)}, ${booking.start_longitude.toFixed(4)}`
                                : 'Location not available'
                              }
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">Destination</div>
                            <div className="text-gray-600 dark:text-gray-400">
                              {booking.end_latitude && booking.end_longitude
                                ? `${booking.end_latitude.toFixed(4)}, ${booking.end_longitude.toFixed(4)}`
                                : 'Location not available'
                              }
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {booking.driver_id && (
                          <div className="flex items-center space-x-2">
                            <Car className="h-4 w-4 text-blue-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                              Driver ID: {booking.driver_id}
                            </span>
                          </div>
                        )}
                        

                        {booking.distance && (
                          <div className="text-gray-600 dark:text-gray-400">
                            Distance: {typeof booking.distance === 'number' ? booking.distance.toFixed(2) : booking.distance} km
                          </div>
                        )}

                        {booking.duration && (
                          <div className="text-gray-600 dark:text-gray-400">
                            Duration: {booking.duration} min
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ModernCardContent>
        </ModernCard>
      )}

    {/* only if user is admin show this */}
    {user?.role === 'admin' && (
      <ModernCard>
        <ModernCardHeader>
          <ModernCardTitle>Monthly Overview</ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {bookings.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {bookings.filter(b => b.status?.toLowerCase() === 'completed').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {bookings.filter(b => ['accepted', 'in_progress', 'in-progress'].includes(b.status?.toLowerCase())).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                ${bookings
                  .filter(b => b.status?.toLowerCase() === 'completed')
                  .reduce((sum, b) => {
                    const fare = typeof b.fare === 'number' ? b.fare : parseFloat(b.fare || '0');
                    return sum + fare;
                  }, 0)
                  .toFixed(2)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Revenue</div>
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>
    )}
    </div>
  );
}

export default Calendar;