import { API_BASE_URL, authenticatedFetch, handleApiResponse } from './apiUtils';

export enum methodPay {
  PAYPAL = 'paypal',
  MASTER_CARD = 'master_card',
  MPESA = 'mpesa',
}

export interface PaymentMethod {
  id?: number;
  payment_type: methodPay;
  amount?: number;
  currency?: string;
  details?: string;
  approvalUrl?: string,
}

export type CreatePaymentMethodData = Omit<PaymentMethod, 'id'>;

export type UpdatePaymentMethodData = Partial<PaymentMethod> & { id: number };

export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/payment-method`);
  return response.json();
};
export const getPaymentMethod = async (id: number): Promise<PaymentMethod> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/payment-method/${id}`);
  return response.json();
};

export const createPaymentMethod = async (data: CreatePaymentMethodData): Promise<PaymentMethod> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/payment-method`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
};

export const updatePaymentMethod = async (data: UpdatePaymentMethodData): Promise<PaymentMethod> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/payment-method/${data.id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return response.json();
};

export const deletePaymentMethod = async (id: number): Promise<void> => {
  if (isNaN(id) || id <= 0) {
    throw new Error("Invalid payment method ID: " + id);
  }
  await authenticatedFetch(`${API_BASE_URL}/payment-method/${id}`, {
    method: 'DELETE',
  });
};
