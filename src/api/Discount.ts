export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}
export enum ApplicableTo {
  ALL_USERS = 'all_users',
  SPECIFIC_USERS = 'specific_users',
}
export interface Discount {
    id?: number,
    code: string,
    discount_type: DiscountType,
    discount_value: number,
    expiry_date: Date,
    maximum_uses: number,
    current_uses:number,
    applicableTo:ApplicableTo,
}

export type CreateDiscountData = Omit<Discount, 'id'>;
export type UpdateDiscountData = Partial<Discount> & { id: number };

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

export const getDiscounts = async (): Promise<Discount[]> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/discount`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  await handleApiResponse(response);
  return response.json();
};

export const getDiscount = async (id: number): Promise<Discount> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/discount/${id}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  await handleApiResponse(response);
  return response.json();
};

export const createDiscount = async (data: CreateDiscountData): Promise<Discount> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/discount`, {
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

export const updateDiscount = async (data: UpdateDiscountData): Promise<Discount> => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/discount/${data.id}`, {
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

export const deleteDiscount = async (id: number): Promise<void> => {
  if (isNaN(id) || id <= 0) {
    throw new Error(`Invalid discount ID: ${id}`);
  }
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch(`${url}/discount/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  await handleApiResponse(response);
};
