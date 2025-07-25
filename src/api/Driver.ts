import { API_BASE_URL } from './apiUtils';
export enum Status {
  Verified = 'verified',
  Unverified = 'unverified',
  REJECTED = 'rejected',
}
export interface Driver {
    driver_id?: number;
    license_number: number;
    rating: number;
    verification_status: Status;
    total_trips: number,
    isAvailable: boolean,
}

export type CreateDriverData = Omit<Driver, 'driver_id'>;
export type UpdateDriverData = Partial<Driver> & { driver_id: number };

const url = 'http://localhost:8000';

const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    let errorData = `Error: ${response.status} ${response.statusText}`;

    try {
      const data = response.headers.get('Content-Type');
      if (data && data.includes('application/json')) {
        const errorInfo = await response.json();
        errorData = errorInfo.message || errorInfo.error || JSON.stringify(errorData);
      } else {
        const errorText = await response.text();
        if (errorText) {
          errorData = errorText;
        }
      }
    } catch (parseError) {
      console.warn('Failed to parse error response:', parseError);
    }
    throw new Error(errorData);
  }
  return response;
};

export const getDrivers = async (): Promise<Driver[]> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/driver`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  await handleApiResponse(response);
  return response.json();
};
export async function getDriverBookings(token: string, driverId?: number) {
  console.log('Fetching driver bookings with token:', token ? 'present' : 'missing', 'driverId:', driverId);
  const url = driverId 
    ? `${API_BASE_URL}/driver/bookings?driver_id=${driverId}`
    : `${API_BASE_URL}/driver/bookings`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('Driver bookings response status:', res.status);
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Driver bookings error:', errorText);
    throw new Error(`Failed to fetch driver bookings: ${res.status} ${errorText}`);
  }
  const data = await res.json();
  console.log('Driver bookings data:', data);
  return data;
}

export async function getDriverPendingBookings(token: string, driverId?: number) {
  console.log('Fetching pending bookings with token:', token ? 'present' : 'missing', 'driverId:', driverId);
  const url = driverId 
    ? `${API_BASE_URL}/driver/bookings/pending?driver_id=${driverId}`
    : `${API_BASE_URL}/driver/bookings/pending`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('Pending bookings response status:', res.status);
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Pending bookings error:', errorText);
    throw new Error(`Failed to fetch pending bookings: ${res.status} ${errorText}`);
  }
  const data = await res.json();
  console.log('Pending bookings data:', data);
  return data;
}

export async function getDriverStats(token: string, driverId: number) {
  const res = await fetch(`${API_BASE_URL}/driver/${driverId}/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch driver stats');
  return res.json();
}

export async function updateDriverAvailability(token: string, driverId: number, isAvailable: boolean) {
  const res = await fetch(`${API_BASE_URL}/driver/${driverId}/availability`, {
    method: 'PATCH',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isAvailable }),
  });
  if (!res.ok) throw new Error('Failed to update driver availability');
  return res.json();
}

export const acceptDriverBooking = async (token: string, bookingId: number) => {
  const response = await fetch(`${API_BASE_URL}/driver/bookings/${bookingId}/accept`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to accept booking: ${response.status}`);
  }

  return response.json();
};

export const rejectDriverBooking = async (token: string, bookingId: number) => {
  const response = await fetch(`${API_BASE_URL}/driver/bookings/${bookingId}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to reject booking: ${response.status}`);
  }

  return response.json();
};

export const getDriver = async (id: number): Promise<Driver> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/driver/${id}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  await handleApiResponse(response);
  return response.json();
};

export const getDriverByUserId = async (userId: number): Promise<Driver> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/driver/by-user/${userId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  await handleApiResponse(response);
  return response.json();
};

export const createDriver = async (data: CreateDriverData): Promise<Driver> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/driver`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });
  await handleApiResponse(response);
  return response.json();
};

export const updateDriver = async (data: UpdateDriverData): Promise<Driver> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/driver/${data.driver_id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });
  await handleApiResponse(response);
  return response.json();
};

export const deleteDriver = async (id: number): Promise<void> => {
  if (isNaN(id) || id <= 0) {
    throw new Error(`Invalid driver ID: ${id}`);
  }
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/driver/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  await handleApiResponse(response);
};
