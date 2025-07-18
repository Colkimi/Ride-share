export enum Label {
  HOME = 'home',
  WORK = 'work',
  CUSTOM = 'custom',
}

export interface Location {
    location_id?: number,
    label: Label,
    address: string,
    latitude?: number,
    longitude?: number,
    is_default: boolean,
}

export type CreateLocationData = Omit<Location, 'location_id'>;
export type UpdateLocationData = Partial<Location> & { location_id: number };

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

export const getLocations = async (): Promise<Location[]> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/location`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  await handleApiResponse(response);
  return response.json();
};

export const getLocation = async (id: number): Promise<Location> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/location/${id}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  await handleApiResponse(response);
  return response.json();
};

export const createLocation = async (data: CreateLocationData): Promise<Location> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/location`, {
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

export const updateLocation = async (data: UpdateLocationData): Promise<Location> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/location/${data.location_id}`, {
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

export const deleteLocation = async (id: number): Promise<void> => {
  if (isNaN(id) || id <= 0) {
    throw new Error(`Invalid location ID: ${id}`);
  }
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/location/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  await handleApiResponse(response);
};
