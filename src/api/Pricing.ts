export interface Pricing {
    id?: number,
    basefare: number,
    cost_per_km: number,
    cost_per_minute: number,
    service_fee: number,
    minimum_fare: number,
    conditions_multiplier: number,
}

export type CreatePricingData = Omit<Pricing, 'id'>;
export type UpdatePricingData = Partial<Pricing> & { id: number };

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

export const getPricings = async (): Promise<Pricing[]> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/pricing`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  await handleApiResponse(response);
  return response.json();
};

export const getPricing = async (id: number): Promise<Pricing> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/pricing/${id}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  await handleApiResponse(response);
  return response.json();
};

export const createPricing = async (data: CreatePricingData): Promise<Pricing> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/pricing`, {
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

export const updatePricing = async (data: UpdatePricingData): Promise<Pricing> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/pricing/${data.id}`, {
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

export const deletePricing = async (id: number): Promise<void> => {
  if (isNaN(id) || id <= 0) {
    throw new Error(`Invalid pricing ID: ${id}`);
  }
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/pricing/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  await handleApiResponse(response);
};
