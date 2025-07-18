import { API_BASE_URL, authenticatedFetch } from './apiUtils';

export interface User {
    userId?: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role: 'admin' | 'driver' | 'customer';
}

export type CreateUserData = Omit<User, 'userId'>

export type UpdateUserData = Partial<User>;

export const getUsers = async (): Promise<User[]> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/user`);
  return response.json();
};

export const getUser = async (id: number): Promise<User> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/user/${id}`);
  return response.json();
};

export const createUser = async (data: CreateUserData): Promise<User> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/user`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
};

export const updateUser = async (data: UpdateUserData): Promise<User> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/user/${data.userId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return response.json();
};

export const deleteUser = async (id: number): Promise<void> => {
    if (isNaN(id) || id <= 0) {
    throw new Error(`Invalid user ID: ${id}`);
    }
  await authenticatedFetch(`${API_BASE_URL}/user/${id}`, {
    method: 'DELETE',
  });
};

export const getUserByEmail = async (email: string): Promise<User> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/user/email/${email}`);
  return response.json();
};

