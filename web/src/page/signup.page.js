import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { history } from '../util/history';
import { userService } from '../services/user.service';
import { dialogActions } from '../store/actions/dialog.action';

import Spinner from '../components/spinner.component';

export default function SignupPage() {
    const { t } = useTranslation();
    const { register, handleSubmit, errors } = useForm();
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    async function onSubmit(data) {
        setLoading(true);
        let result = await userService.signup({
            username: data.username,
            password: data.password,
            name: data.display_name
        });
        setLoading(false);
        if (result.error) {
            dispatch(dialogActions.error(result.error.message));
        }
        else {
            dispatch(dialogActions.success(t('create_new_account_success.msg'), function() {
                history.push("/login");
            }));
        }
    }

    return (
        <div className="fill-dock d-flex center-center">
            <form onSubmit={handleSubmit(onSubmit)} className="layout-sm container card-panel p-relative">
                {loading && <Spinner />}
                <h2 className="text-center mb-4 pt-3">{t('create_new_account.label')}</h2>
                <div className="form-group">
                    <label>{t('display_name.label')}</label>
                    <input
                        type="text"
                        name="display_name"
                        ref={register({
                            required: {
                                value: true,
                                message: t('display_name_is_required.msg')
                            }
                        })}
                        className={'form-control' + (errors.display_name ? ' is-invalid' : '')}
                    />
                    {errors.display_name && <div className="invalid-feedback">{errors.display_name.message}</div>}
                </div>
                <div className="form-group">
                    <label>{t('username.label')}</label>
                    <input
                        type="text"
                        name="username"
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
                        ref={register({
                            required: {
                                value: true,
                                message: t('password_is_required.msg')
                            },
                            minLength: {
                                value: 6,
                                message: t('password_must_be_min_6.msg'),
                            }
                        })}
                        className={'form-control' + (errors.password ? ' is-invalid' : '')}
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                </div>
                <div className="checkbox">
                    <label>
                        <input 
                            name="accept_policy"
                            type="checkbox" 
                            ref={register({ 
                                required: {
                                    value: true,
                                    message: t('accept_policy_is_required.msg')
                                }
                            })}                             
                        />
                        <i className="helper"></i>{t('accept_policy.msg')}
                        <div className={(errors.accept_policy ? 'is-invalid' : '')}></div>
                        {errors.accept_policy && <div className="invalid-feedback">{errors.accept_policy.message}</div>}
                    </label>
                </div>
                <div className="checkbox">
                    <label>
                        <input 
                            name="receive_news"
                            type="checkbox" 
                            ref={register}                             
                        />
                        <i className="helper"></i>{t('allow_to_receive_news.msg')}
                    </label>
                </div>
                <div className="text-center pt-2">
                    <button type="submit" className="btn btn-block btn-success">{t('confirm.label')}</button>
                </div>
                <div className="text-center mt-3">
                    <Link to="/login">
                        <button type="button" className="btn btn-block btn-primary-line">{t('login.label')}</button>
                    </Link>
                </div>
            </form>
        </div>
    );
}