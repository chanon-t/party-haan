import { dialogConstants } from "../reducers/dialog.reducer";

export const dialogActions = {
    success,
    error,
    confirm,
    clear
};

function success(message, onClose) {
    return { type: dialogConstants.SUCCESS, message, onClose };
}

function error(message, onClose) {
    return { type: dialogConstants.ERROR, message, onClose };
}

function confirm(message, onOk, onCancel) {
    return { type: dialogConstants.CONFIRM, message, onOk, onCancel };
}

function clear() {
    return { type: dialogConstants.CLEAR };
}