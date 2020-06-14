import { combineReducers } from 'redux';

import { authen } from './authen.reducer';
import { dialog } from './dialog.reducer';

const rootReducer = combineReducers({
    authen,
    dialog
});

export default rootReducer;