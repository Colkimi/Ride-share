import { API_BASE_URL, handleApiResponse } from './apiUtils';
import { jwtDecode } from 'jwt-decode';

export interface LoginUser {
    email: string;
    password: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface JWTPayload {
    sub: number;
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'driver' | 'customer';
    phone?: string;
    exp: number;
    iat: number;
}

export type loginUserData = Omit<LoginUser, 'id'>;
export type logoutUserData = Omit<LoginUser, 'id'>;

export const decodeToken = (token: string): JWTPayload | null => {
    try {
        return jwtDecode<JWTPayload>(token);
    } catch (error) {
        console.error('Failed to decode JWT token:', error);
        return null;
    }
}

export const isTokenExpired = (token: string): boolean => {
    try {
        const decoded = jwtDecode<JWTPayload>(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    } catch (error) {
        console.error('Failed to check token expiration:', error);
        return true;
    }
}

export const isTokenValid = (token: string): boolean => {
    if (!token) return false;
    try {
        const decoded = jwtDecode<JWTPayload>(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp > currentTime;
    } catch (error) {
        console.error('Invalid token:', error);
        return false;
    }
}

export const loginUser = async (data: LoginUser): Promise<AuthTokens> => {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    await handleApiResponse(response);
    return response.json();
}

export const logoutUser = async (id: number): Promise<void> => {
    if (!id) {
        throw new Error('User ID is required to logout');
    }

    const response = await fetch(`${API_BASE_URL}/auth/signout/${id}`, {
        method: 'GET',
    });
    await handleApiResponse(response);
    return response.json();
}
