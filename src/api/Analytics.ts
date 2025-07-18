import { API_BASE_URL, authenticatedFetch } from './apiUtils';

// Backend DTO interfaces matching the provided backend structure
export interface DriverAnalyticsDto {
  totalDrivers: number;
  activeDrivers: number;
  averageRating: number;
  topPerformers: Array<{
    id: number;
    rating: number;
    totalBookings: number;
  }>;
}

export interface DriverAnalyticsQueryDto {
  startDate?: string;
  endDate?: string;
}

// Backend DTO interfaces matching CustomerDashboardDto
export interface CustomerDashboardDto {
  userId: number;
  totalBookings: number;
  totalExpenditure: number;
  monthlyStats: Record<string, number>;
  rideTimeDistribution: Record<string, number>;
  recentBookings: any[];
  weeklyTrends: {
    currentWeek: number;
    previousWeek: number;
    percentageChange: number;
  };
  expenditureTrends: Array<{
    day: string;
    amount: number;
  }>;
}

export interface DriverDashboardData {
  totalEarnings: number;
  totalTrips: number;
  averageRating: number;
  monthlyPerformance: Array<{
    month: string;
    earnings: number;
    trips: number;
    rating: number;
  }>;
  topDestinations: Array<{
    location: string;
    count: number;
    earnings: number;
  }>;
  recentTrips: Array<{
    id: string;
    pickup: string;
    dropoff: string;
    fare: number;
    date: string;
    rating?: number;
  }>;
}

export interface AdminDashboardData {
  totalUsers: number;
  totalRevenue: number;
  totalBookings: number;
  activeDrivers: number;
  growthMetrics: {
    userGrowth: number;
    revenueGrowth: number;
    bookingGrowth: number;
  };
  monthlyStats: Array<{
    month: string;
    users: number;
    revenue: number;
    bookings: number;
  }>;
  topPerformingDrivers: Array<{
    id: string;
    name: string;
    earnings: number;
    trips: number;
    rating: number;
  }>;
}

export interface SystemStatusData {
  activeBookings: number;
  availableDrivers: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  activeUsers: number;
  averageResponseTime: number;
  lastUpdated: string;
}

export interface BookingAnalyticsParams {
  startDate: string;
  endDate: string;
}

export interface BookingAnalyticsData {
  totalBookings: number;
  revenue: number;
  averageFare: number;
  completionRate: number;
  cancellationRate: number;
  peakHours: Array<{
    hour: number;
    bookings: number;
  }>;
  dailyStats: Array<{
    date: string;
    bookings: number;
    revenue: number;
    completionRate: number;
  }>;
}

export interface CustomerAnalyticsParams {
  startDate: string;
  endDate: string;
}

export interface CustomerAnalyticsData {
  totalCustomers: number;
  activeCustomers: number;
  retentionRate: number;
  newCustomers: number;
  churnRate: number;
  averageSpend: number;
  customerSegments: Array<{
    segment: string;
    count: number;
    averageSpend: number;
  }>;
  topCustomers: Array<{
    id: string;
    name: string;
    totalBookings: number;
    totalSpent: number;
    averageRating: number;
  }>;
}

// Helper function to make API requests
const apiRequest = async <T>(url: string): Promise<T> => {
  const response = await authenticatedFetch(`${API_BASE_URL}${url}`);
  return response.json();
};

// Analytics API functions
export const analyticsApi = {
  // Customer dashboard
  getCustomerDashboard: async (customerId: string): Promise<CustomerDashboardDto> => {
    return apiRequest<CustomerDashboardDto>(`/analytics/dashboard/customer/${customerId}`);
  },

  // Driver dashboard
  getDriverDashboard: async (driverId: string): Promise<DriverDashboardData> => {
    return apiRequest<DriverDashboardData>(`/analytics/dashboard/driver/${driverId}`);
  },

  // Admin dashboard
  getAdminDashboard: async (): Promise<AdminDashboardData> => {
    return apiRequest<AdminDashboardData>('/analytics/dashboard/admin');
  },

  // System status
  getSystemStatus: async (): Promise<SystemStatusData> => {
    return apiRequest<SystemStatusData>('/analytics/realtime/system-status');
  },

  // Booking analytics
  getBookingAnalytics: async (params: BookingAnalyticsParams): Promise<BookingAnalyticsData> => {
    const query = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
    });
    return apiRequest<BookingAnalyticsData>(`/analytics/bookings?${query}`);
  },

  // Driver analytics - updated to match backend DTOs
  getDriverAnalytics: async (params: DriverAnalyticsQueryDto): Promise<DriverAnalyticsDto> => {
    const query = new URLSearchParams();
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    return apiRequest<DriverAnalyticsDto>(`/analytics/drivers?${query}`);
  },

  // Customer analytics
  getCustomerAnalytics: async (params: CustomerAnalyticsParams): Promise<CustomerAnalyticsData> => {
    const query = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
    });
    return apiRequest<CustomerAnalyticsData>(`/analytics/customers?${query}`);
  },
};
