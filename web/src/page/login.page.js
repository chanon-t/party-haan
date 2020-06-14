import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from "react-i18next";

import { authenActions } from '../store/actions/authen.action';

import Spinner from '../components/spinner.component';

export default function LoginPage() {
    const { t } = useTranslation();
    const { register, handleSubmit, errors } = useForm();
    const dispatch = useDispatch();
    const loggingIn = useSelector(state => state.authen.loggingIn);

    async function onSubmit(data) { 
        dispatch(authenActions.login(data.username, data.password));
    };

    return (
        <div className="fill-dock primary-bg d-flex center-center">
            {loggingIn && <Spinner />}
            <form onSubmit={handleSubmit(onSubmit)} className="layout-sm white-form container">
                <div className="mb-3 text-center">
                    <img alt="Party Haan - Logo" src="./assets/images/logo.png" className="mw-100" />
                </div>
                <div className="form-group">
                    <label>{t('username.label')}</label>
                    <input
                        type="text"
                        name="username"
                        autoComplete="off"
                        ref={register({ 
                            required: {
                                value: true,
                                message: t('username_is_required.msg')
                            }
                        })}
                        className={'form-control' + (errors.username ? ' is-invalid' : '')}
                    />
                    {errors.username && <div className="invalid-feedback">{errors.username.message}</div>}
                </div>
                <div className="form-group">
                    <label>{t('password.label')}</label>
                    <input
                        type="password"
                        name="password"
                        autoComplete="off"
                        ref={register({ 
                            required: {
                                value: true,
                                message: t('password_is_required.msg')
                            }
                        })}
                        className={'form-control' + (errors.password ? ' is-invalid' : '')}
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                </div>
                <div className="text-center pt-2">
                    <button type="submit" className="btn btn-block btn-success">{t('login.label')}</button>
                </div>
                <div className="text-center mt-3">
                    <Link to="/signup">
                        <button type="button" className="btn btn-block btn-line">{t('create_new_account.label')}</button>
                    </Link>
                </div>
            </form>            
        </div>
    )
}