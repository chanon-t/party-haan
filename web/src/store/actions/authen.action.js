import { history } from "../../util/history";

import { authenConstants } from "../reducers/authen.reducer";
import { authenService } from "../../services/authen.service";
import { dialogActions } from "./dialog.action";

export const authenActions = {
    login,
    logout
};

function login(username, password) {
    return dispatch => {
        dispatch(request({ username }));

        authenService.login(username, password)
            .then(
                user => { 
                    dispatch(success(user));
                    history.push('/');
                },
                error => {
                    dispatch(failure(error.data));
                    dispatch(dialogActions.error(error.data.error.message));
                }
            );
    };

    function request(user) { return { type: authenConstants.LOGIN_REQUEST, user } }
    function success(user) { return { type: authenConstants.LOGIN_SUCCESS, user } }
    function failure(error) { return { type: authenConstants.LOGIN_FAILURE, error } }
}

function logout() {
    authenService.logout();
    history.push('/login');
    return { type: authenConstants.LOGOUT };
}