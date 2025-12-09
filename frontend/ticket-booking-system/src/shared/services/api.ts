import axios from 'axios';
import { API_URL } from '../../config/api.config';

export const api = axios.create({
    baseURL: API_URL,
});

export const register = async (newUser: any) => {
    const {first_name, last_name, middle_name, role_id, email, password} = newUser;
    try {
        console.log('[api] register request:', { email });
        const response = await api.post('/auth/register', {first_name, last_name, middle_name, role_id, email, password });
        console.log('[api] register response:', response.status, response.data);
        return response.data;
    } catch (error: any) {
        console.error('[api] register error:', error?.response?.status, error?.response?.data || error.message);
        throw error;
    }
};

export const login = async (email: string, password: string) => {
    try {
        console.log('[api] login request:', { email });
        const response = await api.post('/auth/login', { email, password });
        console.log('[api] login response:', response.status, response.data);
        return response.data;
    } catch (error: any) {
        console.error('[api] login error:', error?.response?.status, error?.response?.data || error.message);
        throw error;
    }
};

export const setupAxiosInterceptors = (refreshAccessToken: () => Promise<void>, logout: () => Promise<void>) => {
    api.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                try {
                    await refreshAccessToken();
                    const accessToken = localStorage.getItem('accessToken');
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    await logout();
                    return Promise.reject(refreshError);
                }
            }
            return Promise.reject(error);
        }
    );
};

export default api;