import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// Request interceptor - Add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('admin_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

// API response types
export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaginatedResponse<T = any> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Generic API methods
export const apiClient = {
    get: <T = any>(url: string, config?: AxiosRequestConfig) =>
        api.get<ApiResponse<T>>(url, config),

    post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
        api.post<ApiResponse<T>>(url, data, config),

    put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
        api.put<ApiResponse<T>>(url, data, config),

    delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
        api.delete<ApiResponse<T>>(url, config),

    patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
        api.patch<ApiResponse<T>>(url, data, config),
};
