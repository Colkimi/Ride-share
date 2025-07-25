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

export interface PaginatedUsers {
    users: User[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
}

export type CreateUserData = Omit<User, 'userId'>

export type UpdateUserData = Partial<User>;

export const getUsers = async (page: number = 1, limit: number = 10): Promise<PaginatedUsers> => {
  try {
    console.log(`Fetching users - page: ${page}, limit: ${limit}`);
    
    const response = await authenticatedFetch(
      `${API_BASE_URL}/user?page=${page}&limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Raw API Response:', data);
    
    // Handle different response formats from your backend
    if (Array.isArray(data)) {
      // If API returns array directly (no pagination)
      console.log('API returned array format');
      return {
        users: data,
        currentPage: page,
        totalPages: Math.ceil(data.length / limit),
        totalCount: data.length
      };
    } else if (data.users && Array.isArray(data.users)) {
      // If API returns paginated format
      console.log('API returned paginated format');
      return {
        users: data.users,
        currentPage: data.currentPage || page,
        totalPages: data.totalPages || Math.ceil((data.totalCount || data.users.length) / limit),
        totalCount: data.totalCount || data.users.length
      };
    } else if (data.data && Array.isArray(data.data)) {
      // Alternative paginated format
      console.log('API returned alternative paginated format');
      return {
        users: data.data,
        currentPage: data.page || page,
        totalPages: data.totalPages || Math.ceil((data.total || data.data.length) / limit),
        totalCount: data.total || data.data.length
      };
    } else {
      // Unknown format
      console.warn('Unexpected API response format:', data);
      return {
        users: [],
        currentPage: page,
        totalPages: 1,
        totalCount: 0
      };
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
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

