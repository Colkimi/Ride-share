import { API_BASE_URL } from './apiUtils';
import { type Booking } from './Bookings';

export interface ConfirmPickupRequest {
  bookingId: number;
  driverId: number;
  pickupTime?: string;

  pickupLatitude: number;
  pickupLongitude: number;
}

export interface CompleteRideRequest {
  bookingId: number;
  driverId: number;
  endTime?: string;
  endLocation?: {
    latitude: number;
    longitude: number;
  };
  distance?: number;
  duration?: number;
}

export const DriverPickupAPI = {
  confirmPickup: async (data: ConfirmPickupRequest) => {
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/driver/${data.driverId}/confirm-pickup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to confirm pickup');
    }
    
    return response.json();
  },

  completeRide: async (bookingId: number, driverId: number) => {
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        status: 'completed',
        driver_id: driverId,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to complete ride');
    }
    
    return response.json();
  },
};
