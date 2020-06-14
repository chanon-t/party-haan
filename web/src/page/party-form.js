import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from "react-i18next";

import { history } from '../util/history';

import { partyService } from '../services/party.service';
import { fileService } from '../services/file.service';
import { dialogActions } from '../store/actions/dialog.action';

import Spinner from '../components/spinner.component';

export default function PartyFormPage() {
    let { partyId } = useParams();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const { register, setValue, handleSubmit, errors } = useForm();
    const [picture, setPicture] = useState();
    const [selectedFile, setSelectedFile] = useState();
    const dispatch = useDispatch();

    useEffect(() => {
        let loadParty = async () => {
            setLoading(true);
            let result = await partyService.getPartyById(partyId);
            setLoading(false);
            setValue([{
                "name": result.title
            }, {
                "remain": result.quantity.total
            }]);
        }

        if (partyId) {
            loadParty();
        }

    }, [partyId, setValue]);

    async function onSubmit(data) {
        setLoading(true);
        let picture = null;
        if (selectedFile) {
            let result = await fileService.uploadPicture(selectedFile);
            picture = result[0];           
        }
        let partyData = {
            title: data.name,
            quantity: data.remain
        };
        if (picture) {
            partyData.picture = picture;
        }
        let result = await partyService.createParty(partyData);
        setLoading(false);
        if (result.error) {
            dispatch(dialogActions.error(result.error.message));
        }
        else {
            dispatch(dialogActions.success(t('create_new_party_success.msg'), function() {
                history.push("/");
            }));
        }
    }

    function onChangeHandler(event) {
        var reader = new FileReader();
        reader.onload = function (e) {
            setPicture(e.target.result);
        }
        reader.readAsDataURL(event.target.files[0]);
        setSelectedFile(event.target.files[0]);
    }

    return (
        <div className="d-flex h-center container p-0 mt-md-3 mb-md-3">
            <form onSubmit={handleSubmit(onSubmit)} className="layout-md container card-panel p-relative ml-0 mr-0">
                {loading && <Spinner />}
                <h2 className="text-center mb-4 pt-3">{(partyId) ? t('edit_party.label') : t('create_new_party.label')}</h2>
                {picture && <div className="text-center"><img alt="" className="mw-100" src={picture} /></div>}
                <div className="upload-panel mt-3 mb-3">
                    <input type="file" name="file" accept="image/png, image/jpeg" onChange={onChangeHandler} />
                    <button type="submit" className="btn btn-block btn-secondary">{(!selectedFile) ? t('add_picture.label') : t('change_picture.label')}</button>
                </div>
                <div className="form-group">
                    <label>{t('party_name.label')}</label>
                    <input
                        type="text"
                        name="name"
                        ref={register({
                            required: {
                                value: true,
                                message: t('party_is_required.msg')
                            }
                        })}
                        className={'form-control' + (errors.name ? ' is-invalid' : '')}
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                </div>
                <div className="form-group">
                    <label>{t('remain_people_number.label')}</label>
                    <input
                        type="number"
                        name="remain"
                        ref={register({
                            required: {
                                value: true,
                                message: t('remain_people_number_is_required.msg')
                            },
                            min: {
                                value: 1,
                                message: "Remain number must between 1-50"
                            },
                            max: {
                                value: 50,
                                message: "Remain number must between 1-50"
                            },
                            pattern: {
                                value: /[0-9]+/,
                                message: "Remain must be a number between 1-50"
                            }
                        })}
                        className={'form-control' + (errors.remain ? ' is-invalid' : '')}
                    />
                    {errors.remain && <div className="invalid-feedback">{errors.remain.message}</div>}
                </div>
                <div className="text-center pt-2">
                    <button type="submit" className="btn btn-block btn-primary">{t('confirm.label')}</button>
                </div>
            </form>
        </div>
    )
}