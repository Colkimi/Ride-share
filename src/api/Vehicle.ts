export interface Vehicle {
    vehicle_id?: number,
    make: string,
    model: string,
    year:  number,
    license_plate: string,
    color: string,
    capacity: number,
    type: string,
    approved?: boolean,
}

export type CreateVehicleData = Omit<Vehicle, 'vehicle_id'>;
export type UpdateVehicleData = Partial<Vehicle> & { vehicle_id: number };

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

export const getVehicles = async (): Promise<Vehicle[]> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/vehicle`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  await handleApiResponse(response);
  return response.json();
};

export const getVehiclesByDriverId = async (driverId: number): Promise<Vehicle[]> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/driver/${driverId}/vehicles`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  await handleApiResponse(response);
  return response.json();
};

export const getVehicle = async (id: number): Promise<Vehicle> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/vehicle/${id}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  await handleApiResponse(response);
  return response.json();
};

export const createVehicle = async (data: CreateVehicleData): Promise<Vehicle> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/vehicle`, {
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

export const updateVehicle = async (data: UpdateVehicleData): Promise<Vehicle> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/vehicle/${data.vehicle_id}`, {
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

export const deleteVehicle = async (id: number): Promise<void> => {
  if (isNaN(id) || id <= 0) {
    throw new Error(`Invalid vehicle ID: ${id}`);
  }
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/vehicle/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  await handleApiResponse(response);
};
