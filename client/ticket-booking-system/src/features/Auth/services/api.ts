import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3001/auth',
});

export const register = async (newUser: any) => {
    const {name, role_id, email, password} = newUser;
    const response = await api.post('/register', {name, role_id, email, password });
    return response.data;
};

export const login = async (email: string, password: string) => {
    const response = await api.post('/login', { email, password });
    console.log('login', response.data);
    return response.data;
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