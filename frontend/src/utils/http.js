import axios from 'axios';

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL
});

// Automatically include the token in all requests
instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');  // Get token on every request
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default instance;
