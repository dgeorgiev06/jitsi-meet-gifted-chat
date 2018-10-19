// @flow

import { BoxModel, ColorPalette, createStyleSheet } from '../../../base/styles';

/**
 * Opacity of the TouchableHighlight.
 */
export const ACTIVE_OPACITY = 0.3;

/**
 * Underlay of the TouchableHighlight.
 */
export const TOUCHABLE_UNDERLAY = ColorPalette.lightGrey;

/**
 * The styles of the React {@code Components} of LiveStream.
 */
export default createStyleSheet({
    betaTag: {
        backgroundColor: ColorPalette.darkGrey,
        borderRadius: 2,
        marginLeft: 16,
        opacity: 0.90,
        paddingLeft: 6,
        paddingRight: 6
    },

    betaTagText: {
        color: ColorPalette.white,
        fontWeight: 'bold'
    },

    /**
     * Generic component to wrap form sections into achieving a unified look.
     */
    formWrapper: {
        alignItems: 'stretch',
        flexDirection: 'column',
        padding: BoxModel.padding
    },

    /**
     * Explaining text on the top of the sign in form.
     */
    helpText: {
        marginBottom: BoxModel.margin
    },

    /**
     * Wrapper for the StartLiveStreamDialog form.
     */
    startDialogWrapper: {
        flexDirection: 'column'
    },

    /**
     * Helper link text.
     */
    streamKeyHelp: {
        alignSelf: 'flex-end'
    },

    /**
     * Input field to manually enter stream key.
     */
    streamKeyInput: {
        alignSelf: 'stretch',
        height: 50
    },

    /**
     * Label for the previous field.
     */
    streamKeyInputLabel: {
        alignSelf: 'flex-start'
    },

    /**
     * Custom component to pick a broadcast from the list fetched from Google.
     */
    streamKeyPicker: {
        alignSelf: 'stretch',
        flex: 1,
        height: 40,
        marginHorizontal: 4,
        width: 300
    },

    /**
     * CTA (label) of the picker.
     */
    streamKeyPickerCta: {
        marginBottom: 8
    },

    /**
     * Style of a single item in the list.
     */
    streamKeyPickerItem: {
        padding: 4
    },

    /**
     * Additional style for the selected item.
     */
    streamKeyPickerItemHighlight: {
        backgroundColor: ColorPalette.lighterGrey
    },

    /**
     * Overall wrapper for the picker.
     */
    streamKeyPickerWrapper: {
        borderColor: ColorPalette.lightGrey,
        borderRadius: 3,
        borderWidth: 1,
        flexDirection: 'column'
    }

});
