import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from "react-i18next";

import { authenActions } from '../store/actions/authen.action';
import { dialogActions } from '../store/actions/dialog.action';

export default function Nav() {
    const user = useSelector(state => state.authen.user);
    const { t } = useTranslation();
    const dispatch = useDispatch();

    function handleLogout() {
        dispatch(dialogActions.confirm(t('confirm_to_logout.msg'), () => dispatch(authenActions.logout())));
    };

    return (
        <nav className="navbar">
            <div className="container p-0">
                <div className="d-flex v-center w-100">
                    <Link to="/">
                        <img alt="Party Haan Logo" id="logo" src="./assets/images/icon.png" />
                    </Link>
                    <div className="flex ml-3 mr-3 display-name">{user && user.name}</div>
                    <Link to="/party-form" className="btn-icon">
                        <span className="material-icons">add</span>
                    </Link>
                    <div className="btn-icon" onClick={handleLogout}>
                        <span className="material-icons">exit_to_app</span>
                    </div>
                </div>
            </div>
        </nav>
    )
}