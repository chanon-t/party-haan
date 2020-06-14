
import api from '../util/api';

export const userService = {
    signup
};

async function signup(data) {
    let response = await api.post("/signup", data);
    return response.data;
}