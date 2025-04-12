// axiosConfig.js
import axios from 'axios';
import {getCookie} from "../hooks/useCrf.ts";
import Config from "../assets/config.ts";

const request = axios.create({
    baseURL: Config.baseURL,
    withCredentials: true,
    headers: {
        // 'Content-Type': 'application/json'
    }
});

request.interceptors.response.use(
    response => response,
    async error => {
        if (error.response && error.response.status === 403) {
            console.warn('CSRF token might be expired. Refreshing...');
            try {
                await request.get('/api/csrf/');
                request.defaults.headers['X-CSRFToken'] = getCookie('csrftoken');
                return request.request(error.config);
            } catch (refreshError) {
                console.error('Failed to refresh CSRF token.', refreshError);
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default request;
