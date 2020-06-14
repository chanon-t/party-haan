import React, { useEffect } from 'react';
import { Router, Switch, Route } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Modal } from 'react-bootstrap';
import { useTranslation } from "react-i18next";

import { history } from "./util/history";
import { PrivateRoute } from './routing';

import LoginPage from './page/login.page';
import SignupPage from './page/signup.page';
import PartyListPage from './page/party-list.page';
import PartyFormPage from './page/party-form';

import { dialogActions } from './store/actions/dialog.action';

import Nav from './components/nav.component';

export default function App() {
    const { t } = useTranslation();
    const dialog = useSelector(state => state.dialog);
    const dispatch = useDispatch();

    const handleClose = () => {
        dispatch(dialogActions.clear());
    };

    useEffect(() => {
        history.listen(() => {
            dispatch(dialogActions.clear());
        });
    });

    return (
        <>
            {(dialog && dialog.type && <div className="fade modal-backdrop show" style={{ zIndex: 1051 }}></div>)}
            <Modal show={(dialog && dialog.type && true)} onHide={handleClose} backdrop="static" centered size="sm" animation={false} style={{ zIndex: 1052 }}>
                <Modal.Header>
                    <Modal.Title></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center">{dialog.message}</div>
                </Modal.Body>
                <Modal.Footer className="d-flex h-center">
                    <button
                        className="btn btn-secondary"
                        onClick={() => {
                            handleClose();
                            if (typeof dialog.onClose == 'function') {
                                dialog.onClose();
                            }
                            else if (typeof dialog.onCancel == 'function') {
                                dialog.onCancel();
                            }
                        }}
                    >{(dialog.type === 'confirm') ? t('cancel.label') : t('ok.label')}</button>
                    {(dialog.type === 'confirm') && <button
                        className="btn btn-primary"
                        onClick={() => {
                            handleClose();
                            if (typeof dialog.onOk == 'function') {
                                dialog.onOk();
                            }
                        }}
                    >{t('confirm.label')}</button>}
                </Modal.Footer>
            </Modal>
            <Router history={history}>
                <Switch>
                    <Route path="/login" component={LoginPage} />
                    <Route path="/signup" component={SignupPage} />
                    <React.Fragment>
                        <Nav />
                        <main>
                            <PrivateRoute exact path="/" component={PartyListPage} />
                            <PrivateRoute exact path="/party-form" component={PartyFormPage} />
                            <PrivateRoute path="/party-form/:partyId" component={PartyFormPage} />
                        </main>
                    </React.Fragment>
                </Switch>
            </Router>
        </>
    );
}