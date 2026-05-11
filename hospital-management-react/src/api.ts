import axios from 'axios';

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || window.location.origin;

export const API_BASE = `${API_ORIGIN}/api`;
export const WS_BASE = API_ORIGIN;

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 globally - logout and redirect
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

export const getApiErrorMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError<{ message?: string }>(error)) {
        return error.response?.data?.message || fallback;
    }
    return fallback;
};
