import { handleApiResponse } from './apiUtils';

const url = 'http://localhost:8000';

export enum RideshareStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

export enum ShareType {
  PICKUP_SHARE = 'pickup_share',
  ROUTE_SHARE = 'route_share',
  DESTINATION_SHARE = 'destination_share'
}

export interface SearchRidesRequest {
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  pickupTime: string;
  maxPickupDistance?: number;
  maxRouteDeviation?: number;
  timeWindow?: number;
}

export interface AvailableRide {
  bookingId: number;
  primaryUser: {
    userId: number;
    firstName: string;
    lastName: string;
    rating?: number;
  };
  startLocation: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  endLocation: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  pickup_time: Date;
  originalFare: number;
  estimatedSharedFare: number;
  availableSeats: number;
  distance: number;
  matchPercentage: number;
  shareType: ShareType;
}

export interface CreateRideshareRequest {
  primaryBookingId: number;
  shareType: ShareType;
  sharer_pickup_latitude: number;
  sharer_pickup_longitude: number;
  sharer_dropoff_latitude: number;
  sharer_dropoff_longitude: number;
  sharer_notes?: string;
  pickup_time?: Date;
}

export interface Rideshare {
  id: number;
  primaryBooking: {
    id: number;
    start_latitude: number;
    start_longitude: number;
    end_latitude: number;
    end_longitude: number;
    pickup_time: string;
    fare: number;
  };
  sharerUser: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  shareType: ShareType;
  status: RideshareStatus;
  sharer_pickup_latitude: number;
  sharer_pickup_longitude: number;
  sharer_dropoff_latitude: number;
  sharer_dropoff_longitude: number;
  shared_fare: number;
  distance_deviation?: number;
  time_deviation?: number;
  sharer_notes?: string;
  primary_user_notes?: string;
  accepted_at?: Date;
  pickup_time: Date;
  created_at: Date;
  updated_at: Date;
}

// Search for available rides to join
export const searchAvailableRides = async (searchRequest: SearchRidesRequest): Promise<AvailableRide[]> => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  const response = await fetch(`${url}/rideshare/search`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(searchRequest),
  });

  await handleApiResponse(response);
  return response.json();
};

// Create a rideshare request
export const createRideshareRequest = async (request: CreateRideshareRequest): Promise<Rideshare> => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  const response = await fetch(`${url}/rideshare`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  await handleApiResponse(response);
  return response.json();
};

// Get user's rideshares
export const getMyRideshares = async (): Promise<Rideshare[]> => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  const response = await fetch(`${url}/rideshare/my-rideshares`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  await handleApiResponse(response);
  return response.json();
};

// Accept rideshare request
export const acceptRideshareRequest = async (rideshareId: number, notes?: string): Promise<Rideshare> => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  const response = await fetch(`${url}/rideshare/${rideshareId}/accept`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ notes }),
  });

  await handleApiResponse(response);
  return response.json();
};

// Decline rideshare request
export const declineRideshareRequest = async (rideshareId: number, notes?: string): Promise<Rideshare> => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  const response = await fetch(`${url}/rideshare/${rideshareId}/decline`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ notes }),
  });

  await handleApiResponse(response);
  return response.json();
};

// Get all rideshares (admin)
export const getAllRideshares = async (): Promise<Rideshare[]> => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  const response = await fetch(`${url}/rideshare`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  await handleApiResponse(response);
  return response.json();
};

// Get specific rideshare details
export const getRideshareById = async (id: number): Promise<Rideshare> => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  const response = await fetch(`${url}/rideshare/${id}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  await handleApiResponse(response);
  return response.json();
};

// Update rideshare
export const updateRideshare = async (id: number, updates: Partial<Rideshare>): Promise<Rideshare> => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  const response = await fetch(`${url}/rideshare/${id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  await handleApiResponse(response);
  return response.json();
};

// Cancel/Delete rideshare
export const cancelRideshare = async (id: number): Promise<void> => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  const response = await fetch(`${url}/rideshare/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  await handleApiResponse(response);
};