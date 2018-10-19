// @flow

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Dialog, DialogContent } from '../../base/dialog';
import { translate } from '../../base/i18n';

import { updateCalendarEvent } from '../actions';

type Props = {

    /**
     * The Redux dispatch function.
     */
    dispatch: Function,

    /**
     * The ID of the event to be updated.
     */
    eventId: string,

    /**
     * Function to translate i18n labels.
     */
    t: Function
};

/**
 * Component for the add Jitsi link confirm dialog.
 */
class UpdateCalendarEventDialog extends Component<Props> {
    /**
     * Initializes a new {@code UpdateCalendarEventDialog} instance.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);

        this._onSubmit = this._onSubmit.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <Dialog
                okTitleKey = 'dialog.confirm'
                onSubmit = { this._onSubmit }
                titleKey = 'calendarSync.confirmAddLinkTitle'
                width = 'small'>
                <DialogContent>
                    { this.props.t('calendarSync.confirmAddLink') }
                </DialogContent>
            </Dialog>
        );
    }

    _onSubmit: () => boolean;

    /**
     * Callback for the confirm button.
     *
     * @private
     * @returns {boolean} - True (to note that the modal should be closed).
     */
    _onSubmit() {
        this.props.dispatch(updateCalendarEvent(this.props.eventId, ''));

        return true;
    }
}

export default translate(connect()(UpdateCalendarEventDialog));
