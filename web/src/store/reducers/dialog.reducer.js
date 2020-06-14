export const dialogConstants = {
    SUCCESS: 'DIALOG_SUCCESS',
    ERROR: 'DIALOG_ERROR',
    CONFIRM: 'DIALOG_CONFIRM',
    CLEAR: 'DIALOG_CLEAR'
};

export function dialog(state = {}, action) {
    switch (action.type) {
        case dialogConstants.SUCCESS:
            return {
                type: 'success',
                message: action.message,
                onClose: action.onClose
            };
        case dialogConstants.ERROR:
            return {
                type: 'error',
                message: action.message,
                onClose: action.onClose                
            };
        case dialogConstants.CONFIRM:
            return {
                type: 'confirm',
                message: action.message,
                onOk: action.onOk,
                onCancel: action.onCancel
            };
        case dialogConstants.CLEAR:
            return {};
        default:
            return state
    }
}