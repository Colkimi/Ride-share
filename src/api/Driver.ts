export enum Status {
  Uverified = 'verified',
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
