import { handleApiResponse } from './apiUtils';

const url = 'http://localhost:8000';

export enum Label {
  HOME = 'home',
  WORK = 'work',
  CUSTOM = 'custom'
}

export interface Location {
  location_id?: number;
  id?: string;
  name?: string;
  label?: Label | string;
  address?: string;
  latitude: number;
  longitude: number;
  user_id?: number;
  is_default?: boolean;
  type?: 'home' | 'work' | 'other';
  created_at?: string;
  updated_at?: string;
}

export interface CreateLocationData {
  label: Label | string;
  address: string;
  latitude: number;
  longitude: number;
  is_default?: boolean;
}

export interface UpdateLocationData {
  location_id: number;
  label?: Label | string;
  address?: string;
  latitude?: number;
  longitude?: number;
  is_default?: boolean;
}

// Get current user's saved locations using new endpoint
export const getUserLocations = async (): Promise<Location[]> => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  const response = await fetch(`${url}/location/my-locations`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  
  await handleApiResponse(response);
  return response.json();
};

export const getLocationsByUserId = async (userId: number): Promise<Location[]> => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  const response = await fetch(`${url}/location/user/${userId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  
  await handleApiResponse(response);
  return response.json();
};

// Create a new location for the current user
export const createUserLocation = async (data: CreateLocationData): Promise<Location> => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  console.log('Creating location with data:', data); // Debug log

  const response = await fetch(`${url}/location`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      label: data.label,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      is_default: data.is_default || false, // Explicitly include is_default
    }),
  });
  
  await handleApiResponse(response);
  return response.json();
};

// Update user's location
export const updateUserLocation = async (data: UpdateLocationData): Promise<Location> => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  console.log('Updating location with data:', data); // Debug log

  const response = await fetch(`${url}/location/${data.location_id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      label: data.label,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      is_default: data.is_default, // Explicitly include is_default
    }),
  });
  
  await handleApiResponse(response);
  return response.json();
};

// Delete user's location
export const deleteUserLocation = async (locationId: number): Promise<void> => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  const response = await fetch(`${url}/location/${locationId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  await handleApiResponse(response);
};

export const getAutocompleteSuggestions = async (query: string): Promise<{ label: string; coordinates: {latitude: number; longitude: number} }[]> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/bookings/autocomplete?query=${encodeURIComponent(query)}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  await handleApiResponse(response);
  const data = await response.json();
  return data.map((item: any) => ({
    label: item.label,
    coordinates: {
      latitude: item.coordinates[1],
      longitude: item.coordinates[0],
    },
  }));
};

// Keep existing functions for backward compatibility
export const getLocations = getUserLocations;
export const createLocation = createUserLocation;
export const updateLocation = updateUserLocation;
