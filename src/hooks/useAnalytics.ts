import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api/Analytics';
import { useAuth } from './useAuth';

export const useCustomerDashboard = (customerId?: string) => {
  const { user } = useAuth();
  const id = customerId || user?.userId?.toString();
  
  return useQuery({
    queryKey: ['customer-dashboard', id],
    queryFn: () => analyticsApi.getCustomerDashboard(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useDriverDashboard = (driverId?: string) => {
  const { user } = useAuth();
  const id = driverId || user?.userId?.toString();
  
  return useQuery({
    queryKey: ['driver-dashboard', id],
    queryFn: () => analyticsApi.getDriverDashboard(id!),
    enabled: !!id && (user?.role === 'driver' || user?.role === 'admin'),
    staleTime: 5 * 60 * 1000,
  });
};

export const useAdminDashboard = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: analyticsApi.getAdminDashboard,
    enabled: user?.role === 'admin',
    staleTime: 5 * 60 * 1000,
  });
};

export const useSystemStatus = () => {
  return useQuery({
    queryKey: ['system-status'],
    queryFn: analyticsApi.getSystemStatus,
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  });
};

export const useBookingAnalytics = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['booking-analytics', startDate, endDate],
    queryFn: () => analyticsApi.getBookingAnalytics({ startDate, endDate }),
    enabled: !!startDate && !!endDate,
  });
};

export const useDriverAnalytics = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['driver-analytics', startDate, endDate],
    queryFn: () => analyticsApi.getDriverAnalytics({ startDate, endDate }),
    enabled: !!startDate && !!endDate,
  });
};

export const useCustomerAnalytics = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['customer-analytics', startDate, endDate],
    queryFn: () => analyticsApi.getCustomerAnalytics({ startDate, endDate }),
    enabled: !!startDate && !!endDate,
  });
};
