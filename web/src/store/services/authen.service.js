
import config from 'react-global-configuration';

import api from '../util/api';
import qs from 'qs';

export const authenService = {
    login,
    logout
};

async function login(username, password) {
    const body = qs.stringify({
        grant_type: 'password',
        username: username,
        password: password,
        client_id: config.get('client_id'),
        client_secret: config.get('client_secret')
    });
    const token = await api.post('/oauth/token', body, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    localStorage.setItem('access_token', token.data.access_token);
    const user = await api.get('/me');
    localStorage.setItem('user', JSON.stringify(user.data));
    return user.data;
}

function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
}