import Axios from "axios";
import config from 'react-global-configuration';

const api = Axios.create({
    baseURL: config.get('service_url'),
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
}, error => {
    console.log(error);
    return Promise.reject(error);
});

api.interceptors.response.use(response => {
    return response;
}, error => {
    return Promise.reject(error.response);
});

export default api;