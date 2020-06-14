let user = JSON.parse(localStorage.getItem('user'));
const initialState = user ? { loggedIn: true, user } : {};

export const authenConstants = {
    LOGIN_REQUEST: 'LOGIN_REQUEST',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILURE: 'LOGIN_FAILURE',    
    LOGOUT: 'LOGOUT'  
};

export function authen(state = initialState, action) {
    switch (action.type) {
        case authenConstants.LOGIN_REQUEST:
            return {
                loggingIn: true,
                user: action.user
            };
        case authenConstants.LOGIN_SUCCESS:
            return {
                loggedIn: true,
                user: action.user
            };
        case authenConstants.LOGIN_FAILURE:
            return {
                error: action.error
            };
        case authenConstants.LOGOUT:
            return {};
        default:
            return state
    }
}