export enum Status {
  Requested = 'requested',
  Accepted = 'accepted',
  In_progress = 'in_progress',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export interface Booking {
    id: number,
    start_latitude: number,
    start_longitude: number,
    end_latitude: number,
    end_longitude: number,
    pickup_time: string,
    dropoff_time: string,
    status?: Status,
    fare?: number,
    distance?:number,
    duration?:number,
    paymentMethodId?: number,
    paymentStatus?: 'pending' | 'paid' | 'failed',
    driver_id?: number,
    driver?: {
      driver_id: number;
      license_number: string;
      rating: number;
      isAvailable: boolean;
    };
}

export interface RouteResponse {
  distance: number;
  duration: number;
  geometry: {
    coordinates: [number, number][];
    type: string;
  };
}

export interface NearbyDriver {
  driverId: number;
  latitude: number;
  longitude: number;
  distance: number;
  lastUpdate: number;
  estimatedTimeToPickup: number;
  driver: {
    driver_id: number;
    license_number: string;
    rating: number;
    isAvailable: boolean;
  };
}

export type CreateBookingData = Partial<Booking>;
export type UpdateBookingData = Partial<Booking> & { id: number };

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

export const getRoute = async (
  startLatitude: number,
  startLongitude: number,
  endLatitude: number,
  endLongitude: number
): Promise<RouteResponse> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(
    `http://localhost:8000/bookings/route?startLat=${startLatitude}&startLng=${startLongitude}&endLat=${endLatitude}&endLng=${endLongitude}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );
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
  return response.json();
};

export interface PaginatedBookings {
  bookings: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export const updateBookingStatus = async (bookingId: number, status: string): Promise<Booking> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/bookings/${bookingId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ status }),
  });
  await handleApiResponse(response);
  return response.json();
};

export const getRouteInstructions = async (bookingId: number) => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/bookings/${bookingId}/route-instructions`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  await handleApiResponse(response);
  return response.json();
};

export const getBookings = async (page: number = 1, limit: number = 10): Promise<PaginatedBookings> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/bookings?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  await handleApiResponse(response);
  const data = await response.json();
  
  if (Array.isArray(data)) {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBookings = data.slice(startIndex, endIndex);
    
    return {
      bookings: paginatedBookings,
      total: data.length,
      page,
      limit,
      totalPages: Math.ceil(data.length / limit)
    };
  } else {
    // New API response - paginated object
    return data;
  }
};

export const getUserBookings = async (): Promise<Booking[]> => {
  console.warn('getUserBookings: Customers and drivers cannot fetch all bookings. Need specific booking IDs.');
  return [];
};

export const getMyBookings = async (): Promise<Booking[]> => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  const response = await fetch(`${url}/bookings/my-bookings`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
      throw new Error('Authentication failed');
    }
    throw new Error(`Failed to fetch bookings: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('My bookings API response:', data);
  
  // Handle different response formats
  if (Array.isArray(data)) {
    return data;
  } else if (data.bookings && Array.isArray(data.bookings)) {
    return data.bookings;
  } else if (data.data && Array.isArray(data.data)) {
    return data.data;
  } else {
    console.warn('Unexpected bookings data format:', data);
    return [];
  }
};

export const getDriverBookings = async (): Promise<Booking[]> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/bookings/driver-bookings`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  await handleApiResponse(response);
  return response.json();
};

export const getBooking = async (id: number): Promise<Booking> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/bookings/${id}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  await handleApiResponse(response);
  return response.json();
};

export const createBooking = async (data: CreateBookingData): Promise<Booking> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/bookings`, {
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

export const updateBooking = async (data: UpdateBookingData): Promise<Booking> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/bookings/${data.id}`, {
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

export const deleteBooking = async (id: number): Promise<void> => {
  if (isNaN(id) || id <= 0) {
    throw new Error(`Invalid booking ID: ${id}`);
  }
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/bookings/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  await handleApiResponse(response);
};

export const assignSpecificDriver = async (
  bookingId: number,
  driverId: number
): Promise<Booking> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/bookings/${bookingId}/assign-driver`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bookingId, driverId }),
  });
  await handleApiResponse(response);
  return response.json();
};

export const autoAssignDriver = async (bookingId: number): Promise<Booking> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/bookings/${bookingId}/auto-assign`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  await handleApiResponse(response);
  return response.json();
};

export const getNearbyDrivers = async (
  bookingId: number,
  maxRadiusKm: number = 5,
  maxResults: number = 10
): Promise<NearbyDriver[]> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(
    `${url}/bookings/${bookingId}/nearby-drivers?maxRadiusKm=${maxRadiusKm}&maxResults=${maxResults}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );
  await handleApiResponse(response);
  return response.json();
};
