// @flow

import React, { Component } from 'react';

// eslint-disable-next-line react-native/split-platform-components
import { BackAndroid, BackHandler, StatusBar, View, Text } from 'react-native';
import { connect as reactReduxConnect } from 'react-redux';

import { appNavigate } from '../../app';
import { connect, disconnect } from '../../base/connection';
import { getParticipantCount } from '../../base/participants';
import { Container, LoadingIndicator, TintedView } from '../../base/react';
import {
    makeAspectRatioAware
} from '../../base/responsive-ui';
import { TestConnectionInfo } from '../../base/testing';
import { createDesiredLocalTracks } from '../../base/tracks';
import { ConferenceNotification } from '../../calendar-sync';
import {
    Filmstrip,
    isFilmstripVisible,
    TileView
} from '../../filmstrip';
import { LargeVideo } from '../../large-video';
import { CalleeInfoContainer } from '../../invite';
import { Captions } from '../../subtitles';
import { setToolboxVisible, Toolbox } from '../../toolbox';
import { shouldDisplayTileView } from '../../video-layout';

import styles from './styles';

import { ChatButton, toggleChat, Chat, clearChat } from '../../chat';
import { getUnreadCount } from '../../chat/functions';
import {
    toolbarButtonStyles,
    toolbarToggledButtonStyles
} from '../../toolbox/components/native/styles';

// Displays unread message count when the chat is closed
import IconBadge from 'react-native-icon-badge';

// The chat is displayed in the modal
import Modal from 'react-native-modal';

/**
 * The type of the React {@code Component} props of {@link Conference}.
 */
type Props = {

    /**
     * The indicator which determines that we are still connecting to the
     * conference which includes establishing the XMPP connection and then
     * joining the room. If truthy, then an activity/loading indicator will be
     * rendered.
     *
     * @private
     */
    _connecting: boolean,

    /**
     * Set to {@code true} when the filmstrip is currently visible.
     *
     * @private
     */
    _filmstripVisible: boolean,

    /**
     * Current conference's full URL.
     *
     * @private
     */
    _locationURL: URL,

    /**
     * The handler which dispatches the (redux) action connect.
     *
     * @private
     * @returns {void}
     */
    _onConnect: Function,

    /**
     * The handler which dispatches the (redux) action disconnect.
     *
     * @private
     * @returns {void}
     */
    _onDisconnect: Function,

    /**
     * Handles a hardware button press for back navigation. Leaves the
     * associated {@code Conference}.
     *
     * @private
     * @returns {boolean} As the associated conference is unconditionally left
     * and exiting the app while it renders a {@code Conference} is undesired,
     * {@code true} is always returned.
     */
    _onHardwareBackPress: Function,

    /**
     * The number of participants in the conference.
     *
     * @private
     */
    _participantCount: number,

    /**
     * The indicator which determines whether the UI is reduced (to accommodate
     * smaller display areas).
     *
     * @private
     */
    _reducedUI: boolean,

    /**
     * The current conference room name.
     *
     * @private
     */
    _room: string,

    /**
     * The handler which dispatches the (redux) action {@link setToolboxVisible}
     * to show/hide the {@link Toolbox}.
     *
     * @param {boolean} visible - {@code true} to show the {@code Toolbox} or
     * {@code false} to hide it.
     * @private
     * @returns {void}
     */
    _setToolboxVisible: Function,

    /**
     * Whether or not the layout should change to support tile view mode.
     *
     * @private
     */
    _shouldDisplayTileView: boolean,

    /**
     * The indicator which determines whether the Toolbox is visible.
     *
     * @private
     */
    _toolboxVisible: boolean,

    /**
     * The indicator which determines whether the Toolbox is always visible.
     *
     * @private
     */
    _toolboxAlwaysVisible: boolean,

    // True when chat is open
    _isChatOpen: boolean,

    // Dispatches a toggle chat action when the screen is touched to the side
    // of the chat, which results in closing the chat
    _onToggleChat: Function,

    // Unread message count is displayed when the chat is closed
    _unreadMessageCount: number

};

/**
 * The conference page of the mobile (i.e. React Native) application.
 */
class Conference extends Component<Props> {
    _backHandler: ?BackHandler;

    /**
     * Initializes a new Conference instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        // Bind event handlers so they are only bound once per instance.
        this._onClick = this._onClick.bind(this);
        this._onHardwareBackPress = this._onHardwareBackPress.bind(this);
    }

    /**
     * Implements {@link Component#componentDidMount()}. Invoked immediately
     * after this component is mounted.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentDidMount() {
        // Set handling any hardware button presses for back navigation up.
        const backHandler = BackHandler || BackAndroid;

        if (backHandler) {
            this._backHandler = backHandler;
            backHandler.addEventListener(
                'hardwareBackPress',
                this._onHardwareBackPress);
        }

        // Show the toolbox if we are the only participant; otherwise, the whole
        // UI looks too unpopulated the LargeVideo visible.
        const { _participantCount, _setToolboxVisible } = this.props;

        _participantCount === 1 && _setToolboxVisible(true);
    }

    /**
     * Implements {@link Component#componentWillMount()}. Invoked immediately
     * before mounting occurs. Connects the conference described by the redux
     * store/state.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentWillMount() {
        this.props._onConnect();
    }

    /**
     * Notifies this mounted React {@code Component} that it will receive new
     * props. Check if we need to show / hide the toolbox based on the
     * participant count.
     *
     * @inheritdoc
     * @param {Props} nextProps - The read-only React {@code Component} props
     * that this instance will receive.
     * @returns {void}
     */
    componentWillReceiveProps(nextProps: Props) {
        const {
            _locationURL: oldLocationURL,
            _participantCount: oldParticipantCount,
            _room: oldRoom,
            _setToolboxVisible
        } = this.props;
        const {
            _locationURL: newLocationURL,
            _participantCount: newParticipantCount,
            _room: newRoom
        } = nextProps;

        // If the location URL changes we need to reconnect.
        oldLocationURL !== newLocationURL && this.props._onDisconnect();

        // Start the connection process when there is a (valid) room.
        oldRoom !== newRoom && newRoom && this.props._onConnect();

        if (oldParticipantCount === 1) {
            newParticipantCount > 1 && _setToolboxVisible(false);
        } else if (oldParticipantCount > 1) {
            newParticipantCount === 1 && _setToolboxVisible(true);
        }
    }

    /**
     * Implements {@link Component#componentWillUnmount()}. Invoked immediately
     * before this component is unmounted and destroyed. Disconnects the
     * conference described by the redux store/state.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentWillUnmount() {
        // Tear handling any hardware button presses for back navigation down.
        const backHandler = this._backHandler;

        if (backHandler) {
            this._backHandler = undefined;
            backHandler.removeEventListener(
                'hardwareBackPress',
                this._onHardwareBackPress);
        }

        this.props._onDisconnect();
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const {
            _connecting,
            _reducedUI,
            _shouldDisplayTileView
        } = this.props;

        const unreadMessageCount = this.props._unreadMessageCount;

        return (
            <Container style = { styles.conference }>
                <StatusBar
                    barStyle = 'light-content'
                    hidden = { true }
                    translucent = { true } />

                <Modal
                    animationType = { 'slide' }
                    onBackdropPress = { this.props._onToggleChat }
                    transparent = { true }
                    visible = { this.props._isChatOpen }>
                    <Chat />
                </Modal>

                {/*
                  * The LargeVideo is the lowermost stacking layer.
                  */
                    _shouldDisplayTileView
                        ? <TileView onClick = { this._onClick } />
                        : <LargeVideo onClick = { this._onClick } />
                }

                {/*
                  * If there is a ringing call, show the callee's info.
                  */
                    _reducedUI || <CalleeInfoContainer />
                }

                {/*
                  * The activity/loading indicator goes above everything, except
                  * the toolbox/toolbars and the dialogs.
                  */
                    _connecting
                        && <TintedView>
                            <LoadingIndicator />
                        </TintedView>
                }

                <View
                    pointerEvents = 'box-none'
                    style = { styles.toolboxAndFilmstripContainer }>

                    <Captions onPress = { this._onClick } />

                    {/*
                      * The Toolbox is in a stacking layer bellow the Filmstrip.
                      */}
                    <Toolbox />

                    {/*
                      * The Filmstrip is in a stacking layer above the
                      * LargeVideo. The LargeVideo and the Filmstrip form what
                      * the Web/React app calls "videospace". Presumably, the
                      * name and grouping stem from the fact that these two
                      * React Components depict the videos of the conference's
                      * participants.
                      */
                        _shouldDisplayTileView ? undefined : <Filmstrip />
                    }
                    <View style = { styles.chatIconBadgeContainer }>
                        <IconBadge
                            BadgeElement = {
                                <Text style = { styles.badgeText } >
                                    { unreadMessageCount }
                                </Text>
                            }
                            Hidden = { unreadMessageCount === 0 }
                            IconBadgeStyle = {
                                styles.chatIconBadge
                            }
                            MainElement = {
                                <ChatButton
                                    iconName = { this.props._isChatOpen
                                        ? 'icon-chat toggled'
                                        : 'icon-chat' }
                                    showLabel = { false }
                                    styles = { toolbarButtonStyles }
                                    toggledStyles =
                                        { toolbarToggledButtonStyles } />
                            } />
                    </View>

                </View>

                <TestConnectionInfo />

                {
                    this._renderConferenceNotification()
                }

            </Container>
        );
    }

    _onClick: () => void;

    /**
     * Changes the value of the toolboxVisible state, thus allowing us to switch
     * between Toolbox and Filmstrip and change their visibility.
     *
     * @private
     * @returns {void}
     */
    _onClick() {
        if (this.props._toolboxAlwaysVisible) {
            return;
        }

        const toolboxVisible = !this.props._toolboxVisible;

        this.props._setToolboxVisible(toolboxVisible);
    }

    _onHardwareBackPress: () => boolean;

    /**
     * Handles a hardware button press for back navigation.
     *
     * @returns {boolean} If the hardware button press for back navigation was
     * handled by this {@code Conference}, then {@code true}; otherwise,
     * {@code false}.
     */
    _onHardwareBackPress() {
        return this._backHandler && this.props._onHardwareBackPress();
    }

    /**
     * Renders the conference notification badge if the feature is enabled.
     *
     * @private
     * @returns {React$Node}
     */
    _renderConferenceNotification() {
        // XXX If the calendar feature is disabled on a platform, then we don't
        // have its components exported so an undefined check is necessary.
        return (
            !this.props._reducedUI && ConferenceNotification
                ? <ConferenceNotification />
                : undefined);
    }
}

/**
 * Maps dispatching of some action to React component props.
 *
 * @param {Function} dispatch - Redux action dispatcher.
 * @private
 * @returns {{
 *     _onConnect: Function,
 *     _onDisconnect: Function,
 *     _onHardwareBackPress: Function,
 *     _setToolboxVisible: Function
 * }}
 */
function _mapDispatchToProps(dispatch) {
    return {
        /**
         * Dispatches actions to create the desired local tracks and for
         * connecting to the conference.
         *
         * @private
         * @returns {void}
         */
        _onConnect() {
            dispatch(createDesiredLocalTracks());
            dispatch(connect());
            dispatch(clearChat());
        },

        /**
         * Dispatches an action disconnecting from the conference.
         *
         * @private
         * @returns {void}
         */
        _onDisconnect() {
            dispatch(disconnect());
        },

        /**
         * Handles a hardware button press for back navigation. Leaves the
         * associated {@code Conference}.
         *
         * @returns {boolean} As the associated conference is unconditionally
         * left and exiting the app while it renders a {@code Conference} is
         * undesired, {@code true} is always returned.
         */
        _onHardwareBackPress() {
            dispatch(appNavigate(undefined));

            return true;
        },

        /**
         * Dispatches an action changing the visibility of the {@link Toolbox}.
         *
         * @param {boolean} visible - {@code true} to show the {@code Toolbox}
         * or {@code false} to hide it.
         * @private
         * @returns {void}
         */
        _setToolboxVisible(visible) {
            dispatch(setToolboxVisible(visible));
        },

        _onToggleChat() {
            dispatch(toggleChat());
        }
    };
}

/**
 * Maps (parts of) the redux state to the associated {@code Conference}'s props.
 *
 * @param {Object} state - The redux state.
 * @private
 * @returns {{
 *     _connecting: boolean,
 *     _filmstripVisible: boolean,
 *     _locationURL: URL,
 *     _participantCount: number,
 *     _reducedUI: boolean,
 *     _room: string,
 *     _toolboxVisible: boolean,
 *     _toolboxAlwaysVisible: boolean
 * }}
 */
function _mapStateToProps(state) {
    const { connecting, connection, locationURL }
        = state['features/base/connection'];
    const {
        conference,
        joining,
        leaving,
        room
    } = state['features/base/conference'];
    const { reducedUI } = state['features/base/responsive-ui'];
    const { alwaysVisible, visible } = state['features/toolbox'];
    const { isOpen } = state['features/chat'];
    const unreadMessageCount = getUnreadCount(state);


    // XXX There is a window of time between the successful establishment of the
    // XMPP connection and the subsequent commencement of joining the MUC during
    // which the app does not appear to be doing anything according to the redux
    // state. In order to not toggle the _connecting props during the window of
    // time in question, define _connecting as follows:
    // - the XMPP connection is connecting, or
    // - the XMPP connection is connected and the conference is joining, or
    // - the XMPP connection is connected and we have no conference yet, nor we
    //   are leaving one.
    const connecting_
        = connecting || (connection && (joining || (!conference && !leaving)));

    return {
        /**
         * The indicator which determines that we are still connecting to the
         * conference which includes establishing the XMPP connection and then
         * joining the room. If truthy, then an activity/loading indicator will
         * be rendered.
         *
         * @private
         * @type {boolean}
         */
        _connecting: Boolean(connecting_),

        /**
         * Is {@code true} when the filmstrip is currently visible.
         */
        _filmstripVisible: isFilmstripVisible(state),

        /**
         * Current conference's full URL.
         *
         * @private
         * @type {URL}
         */
        _locationURL: locationURL,

        /**
         * The number of participants in the conference.
         *
         * @private
         * @type {number}
         */
        _participantCount: getParticipantCount(state),

        /**
         * The indicator which determines whether the UI is reduced (to
         * accommodate smaller display areas).
         *
         * @private
         * @type {boolean}
         */
        _reducedUI: reducedUI,

        /**
         * The current conference room name.
         *
         * @private
         * @type {string}
         */
        _room: room,

        /**
         * Whether or not the layout should change to support tile view mode.
         *
         * @private
         * @type {boolean}
         */
        _shouldDisplayTileView: shouldDisplayTileView(state),

        /**
         * The indicator which determines whether the Toolbox is visible.
         *
         * @private
         * @type {boolean}
         */
        _toolboxVisible: visible,

        /**
         * The indicator which determines whether the Toolbox is always visible.
         *
         * @private
         * @type {boolean}
         */
        _toolboxAlwaysVisible: alwaysVisible,

        _isChatOpen: isOpen,

        _unreadMessageCount: unreadMessageCount
    };
}

// $FlowFixMe
export default reactReduxConnect(_mapStateToProps, _mapDispatchToProps)(
    makeAspectRatioAware(Conference));
