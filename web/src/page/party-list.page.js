import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Modal } from 'react-bootstrap';
import { useTranslation } from "react-i18next";
import dateFormat from 'dateformat';

import Spinner from '../components/spinner.component';

import { partyService } from '../services/party.service';
import { dialogActions } from '../store/actions/dialog.action';

export default function PartyListPage() {
    const user = useSelector(state => state.authen.user);
    const [parties, setParties] = useState([]);
    const [party, setParty] = useState();
    const [loading, setLoading] = useState(false);
    const [loadingParty, setLoadingParty] = useState(false);
    const [show, setShow] = useState(false);
    const { t } = useTranslation();
    const dispatch = useDispatch();

    let loadPartyList = async () => {
        setLoading(true);
        let data = await partyService.getAllParty();
        setLoading(false);
        setParties(data.data);
    };
    useEffect(() => {
        loadPartyList();
    }, []);

    const handleClose = () => {
        setShow(false);
        setParty(null);
    }
    const handleOpenParty = async (partyId) => {
        setShow(true);
        setLoadingParty(true);
        let data = await partyService.getPartyById(partyId);
        setLoadingParty(false);
        setParty(data);
    };

    async function handleJoin(p) {
        dispatch(
            dialogActions.confirm(
                t('confirm_to_join_party.msg'),
                async () => {
                    setLoadingParty(true);
                    await partyService.joinParty(p.id);
                    setLoadingParty(false);
                    setShow(false);

                    loadPartyList();
                }
            )
        );
    }

    async function handleLeave(p) {
        const isCreator = p.creator.id === user.id;
        dispatch(
            dialogActions.confirm(
                (isCreator) ? t('confirm_to_delete_party.msg') : t('confirm_to_leave_party.msg'),
                async () => {
                    setLoadingParty(true);
                    if (isCreator) {
                        await partyService.deleteParty(p.id);
                    }
                    else {
                        await partyService.leaveParty(p.id);
                    }
                    setLoadingParty(false);
                    setShow(false);
            
                    loadPartyList();
                }
            )
        );
    }

    return (
        <>
            {loading && <Spinner />}
            <div className="container p-2">
                <div className="row">
                    {parties.map(party => (
                        <div key={party.id} className="col-lg-3 col-6 col-spacing">
                            <Card onClick={() => { handleOpenParty(party.id); }}>
                                <div className={'tag-status' + ((party.quantity.join >= party.quantity.total)? ' exceed': '')}>
                                    {(party.quantity.join < party.quantity.total)? t('available.label') : t('exceed.label')}
                                </div>
                                <Card.Img
                                    className="primary-bg"
                                    variant="top"
                                    src={party.picture + '_w320xh320'}>
                                </Card.Img>
                                <Card.Body>
                                    <Card.Title>{party.title}</Card.Title>
                                    <Card.Text className="mb-1 pt-2 bt-line d-flex v-center">
                                        <span className="material-icons md-18 mr-2">group</span>
                                        {t('quantity.label') + ' ' + party.quantity.join + '/' + party.quantity.total + ' ' + t('people.label')}
                                    </Card.Text>
                                    <Card.Text className="d-flex v-center">
                                        <span className="material-icons md-18 mr-2">schedule</span>
                                        {dateFormat(party.create_date, "dd/mm/yyyy HH:MM")}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
            <Modal show={show} backdrop="static" centered scrollable>
                {loadingParty && <Spinner />}
                <Modal.Header>
                    <Modal.Title>{party && <div>{party.title}</div>}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-0 pb-0">
                    {party && party.picture && <img alt={party.title} className="mw-100" src={party.picture} />}
                    {party && <>
                        <div className="d-flex pt-3 pb-3 bt-line">
                            <div className="flex d-flex v-center">
                                <span className="material-icons md-18 mr-2">group</span>
                                {t('quantity.label') + ' ' + party.quantity.join + '/' + party.quantity.total + ' ' + t('people.label')}
                            </div>
                            <div className="flex d-flex v-center">
                                <span className="material-icons md-18 mr-2">schedule</span>
                                {dateFormat(party.create_date, "dd/mm/yyyy HH:MM")}
                            </div>
                        </div>
                        <div className="bt-line pt-3"></div>
                        <b>{t('creator.label')}</b>
                        <ul className="mb-2">
                            <li>{party.creator.name}</li>
                        </ul>
                        <b>{t('member.label')} ({party.quantity.join + '/' + party.quantity.total})</b>
                        <ul>
                            {party.members.map(member => <li key={member.id}>{member.name}</li>)}
                        </ul>
                    </>}
                </Modal.Body>
                <Modal.Footer className="d-flex h-center">
                    <button className="btn btn-secondary" onClick={handleClose}>{t('close.label')}</button>
                    {party && party.quantity.join < party.quantity.total && party.creator.id !== user.id && party.members.findIndex(o => o.id === user.id) === -1 &&
                        <button
                            className="btn btn-primary"
                            onClick={() => { handleJoin(party) }}>{t('join_party.label')}
                        </button>
                    }
                    {party && (party.creator.id === user.id || party.members.findIndex(o => o.id === user.id) > -1) &&
                        <button
                            className="btn btn-danger"
                            onClick={() => { handleLeave(party) }}>{t('leave_party.label')}
                        </button>}
                </Modal.Footer>
            </Modal>
        </>
    )
}