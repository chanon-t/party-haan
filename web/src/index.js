import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import './assets/scss/styles.scss';
import './config';
import './util/i18n';

import { store } from './store';

import App from './App';

render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);