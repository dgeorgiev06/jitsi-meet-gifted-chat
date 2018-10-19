import React from 'react';
import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';

import parseURLParams from '../../../base/config/parseURLParams';
import { i18next } from '../../../base/i18n';

import { DialInSummary } from '../dial-in-summary';

import NoRoomError from './NoRoomError';

document.addEventListener('DOMContentLoaded', () => {
    const { room } = parseURLParams(window.location, true, 'search');

    ReactDOM.render(
        <I18nextProvider i18n = { i18next }>
            { room
                ? <DialInSummary
                    className = 'dial-in-page'
                    clickableNumbers = { false }
                    room = { room } />
                : <NoRoomError className = 'dial-in-page' /> }
        </I18nextProvider>,
        document.getElementById('react')
    );
});

window.addEventListener('beforeunload', () => {
    ReactDOM.unmountComponentAtNode(document.getElementById('react'));
});
