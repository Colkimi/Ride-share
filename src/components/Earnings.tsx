import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from '@tanstack/react-router';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths } from 'date-fns';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  ArrowLeft,
  Car,
  Clock,
  Star,
  Wallet,
  CreditCard,
  PiggyBank,
  Target
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getDriverBookings } from '@/api/Driver';
import { type Booking } from '@/api/Bookings';

interface EarningsSummary {
  totalEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  tripCount: number;
  averagePerTrip: number;
  weeklyChange: number;
  monthlyChange: number;
}

interface EarningsBreakdown {
  baseFare: number;
  tips: number;
  bonuses: number;
  fees: number;
}

const Earnings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const token = localStorage.getItem('accessToken') || '';

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['driverEarnings', user?.userId],
    queryFn: () => getDriverBookings(token, user?.userId),
    enabled: !!token && !!user?.userId,
  });

  const exportEarningsReport = () => {
    if (!bookings || bookings.length === 0) {
      alert('No data available to export');
      return;
    }
    
    const csvLines: string[] = [];
    
    csvLines.push('EARNINGS REPORT');
    csvLines.push(`Generated on: ${format(new Date(), 'MMMM dd, yyyy HH:mm:ss')}`);
    csvLines.push('');
    
    csvLines.push('EARNINGS SUMMARY');
    csvLines.push(`Total Earnings,$${earningsSummary.totalEarnings.toFixed(2)}`);
    csvLines.push(`Weekly Earnings,$${earningsSummary.weeklyEarnings.toFixed(2)}`);
    csvLines.push(`Monthly Earnings,$${earningsSummary.monthlyEarnings.toFixed(2)}`);
    csvLines.push(`Total Trips,${earningsSummary.tripCount}`);
    csvLines.push(`Average per Trip,$${earningsSummary.averagePerTrip.toFixed(2)}`);
    csvLines.push(`Weekly Change,${earningsSummary.weeklyChange.toFixed(1)}%`);
    csvLines.push(`Monthly Change,${earningsSummary.monthlyChange.toFixed(1)}%`);
    csvLines.push('');
    
    csvLines.push('EARNINGS BREAKDOWN');
    csvLines.push(`Base Fare,$${earningsBreakdown.baseFare.toFixed(2)}`);
    csvLines.push(`Tips,$${earningsBreakdown.tips.toFixed(2)}`);
    csvLines.push(`Bonuses,$${earningsBreakdown.bonuses.toFixed(2)}`);
    csvLines.push(`Platform Fees,-$${earningsBreakdown.fees.toFixed(2)}`);
    csvLines.push('');
    
    csvLines.push('TRIP DETAILS');
    csvLines.push('Date,Trip ID,Pickup Time,Pickup Location,Dropoff Location,Fare Amount,Status,Duration');
    
    interface CsvBookingRow {
      pickupDate: string;
      tripId: string;
      pickupTime: string;
      pickupLocation: string;
      dropoffLocation: string;
      fareAmount: string;
      status: string;
      duration: string;
    }

    const completedBookings: Booking[] = bookings
      .filter((b: Booking) => b.status === 'completed');

    completedBookings
      .sort((a: Booking, b: Booking) => new Date(b.pickup_time).getTime() - new Date(a.pickup_time).getTime())
      .forEach((booking: Booking) => {
        const pickupLocation: string =
          (booking.start_latitude && booking.start_longitude ? 
            `${booking.start_latitude.toFixed(4)}, ${booking.start_longitude.toFixed(4)}` : 
            'N/A');
        
        const dropoffLocation: string = 
          (booking.end_latitude && booking.end_longitude ? 
            `${booking.end_latitude.toFixed(4)}, ${booking.end_longitude.toFixed(4)}` : 
            'N/A');
        
        const csvRow: CsvBookingRow = {
          pickupDate: format(new Date(booking.pickup_time), 'yyyy-MM-dd'),
          tripId: `Trip #${booking.id}`,
          pickupTime: format(new Date(booking.pickup_time), 'HH:mm'),
          pickupLocation: `"${pickupLocation}"`,
          dropoffLocation: `"${dropoffLocation}"`,
          fareAmount: `$${(booking.fare || 0).toFixed(2)}`,
          status: booking.status ?? '',
          duration: '~30 min'
        };

        csvLines.push([
          csvRow.pickupDate,
          csvRow.tripId,
          csvRow.pickupTime,
          csvRow.pickupLocation,
          csvRow.dropoffLocation,
          csvRow.fareAmount,
          csvRow.status,
          csvRow.duration
        ].join(','));
      });

    // Create CSV content
    const csvContent = csvLines.join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `earnings-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up
    }
  };

  const earningsSummary: EarningsSummary = React.useMemo(() => {
    if (!bookings) return {
      totalEarnings: 0,
      weeklyEarnings: 0,
      monthlyEarnings: 0,
      tripCount: 0,
      averagePerTrip: 0,
      weeklyChange: 0,
      monthlyChange: 0
    };

    const completedBookings = bookings.filter((b: Booking) => b.status === 'completed');
    const totalEarnings = completedBookings.reduce((sum: number, booking: Booking) => sum + (booking.fare || 0), 0);
    
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    const weeklyBookings = completedBookings.filter((b: Booking) => {
      const bookingDate = new Date(b.pickup_time);
      return bookingDate >= weekStart && bookingDate <= weekEnd;
    });
    
    const monthlyBookings = completedBookings.filter((b: Booking) => {
      const bookingDate = new Date(b.pickup_time);
      return bookingDate >= monthStart && bookingDate <= monthEnd;
    });
    
    const weeklyEarnings = weeklyBookings.reduce((sum: number, booking: Booking) => sum + (booking.fare || 0), 0);
    const monthlyEarnings = monthlyBookings.reduce((sum: number, booking: Booking) => sum + (booking.fare || 0), 0);
    
    const prevWeekStart = startOfWeek(subWeeks(now, 1));
    const prevWeekEnd = endOfWeek(subWeeks(now, 1));
    const prevMonthStart = startOfMonth(subMonths(now, 1));
    const prevMonthEnd = endOfMonth(subMonths(now, 1));
    
    const prevWeeklyEarnings = completedBookings
      .filter((b: Booking) => {
        const bookingDate = new Date(b.pickup_time);
        return bookingDate >= prevWeekStart && bookingDate <= prevWeekEnd;
      })
      .reduce((sum: number, booking: Booking) => sum + (booking.fare || 0), 0);
      
    const prevMonthlyEarnings = completedBookings
      .filter((b: Booking) => {
        const bookingDate = new Date(b.pickup_time);
        return bookingDate >= prevMonthStart && bookingDate <= prevMonthEnd;
      })
      .reduce((sum: number, booking: Booking) => sum + (booking.fare || 0), 0);

    return {
      totalEarnings,
      weeklyEarnings,
      monthlyEarnings,
      tripCount: completedBookings.length,
      averagePerTrip: completedBookings.length > 0 ? totalEarnings / completedBookings.length : 0,
      weeklyChange: prevWeeklyEarnings > 0 ? ((weeklyEarnings - prevWeeklyEarnings) / prevWeeklyEarnings) * 100 : 0,
      monthlyChange: prevMonthlyEarnings > 0 ? ((monthlyEarnings - prevMonthlyEarnings) / prevMonthlyEarnings) * 100 : 0
    };
  }, [bookings]);

  const dailyEarningsData = React.useMemo(() => {
    if (!bookings) return [];
    
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayBookings = bookings.filter((b: Booking) => {
        const bookingDate = new Date(b.pickup_time);
        return bookingDate.toDateString() === date.toDateString() && b.status === 'completed';
      });
      
      return {
        date: format(date, 'EEE'),
        earnings: dayBookings.reduce((sum: number, booking: Booking) => sum + (booking.fare || 0), 0),
        trips: dayBookings.length
      };
    });
    
    return last7Days;
  }, [bookings]);

  const weeklyEarningsData = React.useMemo(() => {
    if (!bookings) return [];
    
    const last8Weeks = Array.from({ length: 8 }, (_, i) => {
      const weekStart = startOfWeek(subWeeks(new Date(), 7 - i));
      const weekEnd = endOfWeek(subWeeks(new Date(), 7 - i));
      
      const weekBookings = bookings.filter((b: Booking) => {
        const bookingDate = new Date(b.pickup_time);
        return bookingDate >= weekStart && bookingDate <= weekEnd && b.status === 'completed';
      });
      
      return {
        week: format(weekStart, 'MMM d'),
        earnings: weekBookings.reduce((sum: number, booking: Booking) => sum + (booking.fare || 0), 0),
        trips: weekBookings.length
      };
    });
    
    return last8Weeks;
  }, [bookings]);

  const earningsBreakdown: EarningsBreakdown = {
    baseFare: earningsSummary.totalEarnings * 0.85, 
    tips: earningsSummary.totalEarnings * 0.1, 
    bonuses: earningsSummary.totalEarnings * 0.05, 
    fees: earningsSummary.totalEarnings * 0.15 
  };

  const pieData = [
    { name: 'Base Fare', value: earningsBreakdown.baseFare, color: '#3b82f6' },
    { name: 'Tips', value: earningsBreakdown.tips, color: '#10b981' },
    { name: 'Bonuses', value: earningsBreakdown.bonuses, color: '#f59e0b' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-48"></div>
            <div className="grid grid-cols-4 gap-4">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: '/dashboard' })}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Earnings Overview
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track your income and performance
              </p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={exportEarningsReport}
            disabled={!bookings || bookings.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${earningsSummary.totalEarnings.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                From {earningsSummary.tripCount} completed trips
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                ${earningsSummary.weeklyEarnings.toFixed(2)}
              </div>
              <div className="flex items-center text-xs">
                {earningsSummary.weeklyChange >= 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1 text-red-500" />
                )}
                <span className={earningsSummary.weeklyChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(earningsSummary.weeklyChange).toFixed(1)}% vs last week
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Target className="w-4 h-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                ${earningsSummary.monthlyEarnings.toFixed(2)}
              </div>
              <div className="flex items-center text-xs">
                {earningsSummary.monthlyChange >= 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1 text-red-500" />
                )}
                <span className={earningsSummary.monthlyChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(earningsSummary.monthlyChange).toFixed(1)}% vs last month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average per Trip</CardTitle>
              <Car className="w-4 h-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                ${earningsSummary.averagePerTrip.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Per completed ride
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Earnings Trend */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Earnings Trend</CardTitle>
                <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <TabsList className="grid grid-cols-2 w-48">
                    <TabsTrigger value="week">Daily</TabsTrigger>
                    <TabsTrigger value="month">Weekly</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                {selectedPeriod === 'week' ? (
                  <BarChart data={dailyEarningsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Earnings']} />
                    <Bar dataKey="earnings" fill="#3b82f6" />
                  </BarChart>
                ) : (
                  <LineChart data={weeklyEarningsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Earnings']} />
                    <Line type="monotone" dataKey="earnings" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Earnings Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Earnings Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Base Fare:</span>
                  <span className="font-medium">${earningsBreakdown.baseFare.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tips:</span>
                  <span className="font-medium text-green-600">${earningsBreakdown.tips.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Bonuses:</span>
                  <span className="font-medium text-yellow-600">${earningsBreakdown.bonuses.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span>Platform Fees:</span>
                  <span className="font-medium text-red-600">-${earningsBreakdown.fees.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3">Date</th>
                    <th className="text-left py-3">Trip</th>
                    <th className="text-left py-3">Duration</th>
                    <th className="text-left py-3">Amount</th>
                    <th className="text-left py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings?.filter((b: Booking) => b.status === 'completed')
                    .sort((a: Booking, b: Booking) => new Date(b.pickup_time).getTime() - new Date(a.pickup_time).getTime())
                    .slice(0, 10)
                    .map((booking: Booking) => (
                    <tr key={booking.id} className="border-b">
                      <td className="py-3">{format(new Date(booking.pickup_time), 'MMM d, HH:mm')}</td>
                      <td className="py-3 text-sm">
                        Trip #{booking.id}
                      </td>
                      <td className="py-3 text-sm">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {/* Calculate duration if dropoff_time exists */}
                        ~30 min
                      </td>
                      <td className="py-3 font-semibold text-green-600">
                        ${booking.fare?.toFixed(2) || '0.00'}
                      </td>
                      <td className="py-3">
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Paid
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!bookings || bookings.filter((b: Booking) => b.status === 'completed').length === 0) && (
                <div className="text-center py-12">
                  <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                  <p className="text-gray-500 text-lg">No earnings yet</p>
                  <p className="text-sm text-gray-400">Complete some trips to start earning</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Instant Payout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Transfer your earnings instantly to your bank account
              </p>
              <Button className="w-full" disabled={earningsSummary.totalEarnings === 0}>
                Cash Out ${earningsSummary.totalEarnings.toFixed(2)}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PiggyBank className="w-5 h-5 mr-2" />
                Savings Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Set a weekly earnings target to stay motivated
              </p>
              <Button variant="outline" className="w-full">
                Set Weekly Goal
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="w-5 h-5 mr-2" />
                Tax Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Download your earnings summary for tax purposes
              </p>
              <Button variant="outline" className="w-full">
                Download 1099
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Earnings;