import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3001/auth',
});

export const register = async (name:string, role_id: number, email: string, password: string) => {
    const response = await api.post('/register', { name, role_id, email, password });
    return response.data.token;
};

export const login = async (email: string, password: string) => {
    const response = await api.post('/login', { email, password });
    return response.data.token;
};