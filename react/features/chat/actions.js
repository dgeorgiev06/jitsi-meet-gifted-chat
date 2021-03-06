import { ADD_MESSAGE, SEND_MESSAGE, TOGGLE_CHAT, CLEAR_CHAT } 
    from './actionTypes';

/* eslint-disable max-params */

/**
 * Adds a chat message to the collection of messages.
 *
 * @param {Object} messageDetails - The chat message to save.
 * @param {string} messageDetails.displayName - The displayName of the
 * participant that authored the message.
 * @param {boolean} messageDetails.hasRead - Whether or not to immediately mark
 * the message as read.
 * @param {string} messageDetails.message - The received message to display.
 * @param {string} messageDetails.messageType - The kind of message, such as
 * "error" or "local" or "remote".
 * @param {string} messageDetails.timestamp - A timestamp to display for when
 * the message was received.
 * @returns {{
 *     type: ADD_MESSAGE,
 *     displayName: string,
 *     hasRead: boolean,
 *     message: string,
 *     messageType: string,
 *     timestamp: string,
 * }}
 */
export function addMessage(messageDetails) {
    return {
        type: ADD_MESSAGE,
        ...messageDetails
    };
}

/**
 * Sends a chat message to everyone in the conference.
 *
 * @param {string} message - The chat message to send out.
 * @returns {{
 *     type: SEND_MESSAGE,
 *     message: string
 * }}
 */
export function sendMessage(message) {
    return {
        type: SEND_MESSAGE,
        message
    };
}

/**
 * Toggles display of the chat side panel.
 *
 * @returns {{
 *     type: TOGGLE_CHAT
 * }}
 */
export function toggleChat() {
    return {
        type: TOGGLE_CHAT
    };
}

/**
 * Toggles display of the chat side panel.
 *
 * @returns {{
 *     type: CLEAR_CHAT
 * }}
 */
export function clearChat() {
    return {
        type: CLEAR_CHAT
    };
}
