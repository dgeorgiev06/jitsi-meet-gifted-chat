/**
 * The type of the action which signals feedback was closed without submitting.
 *
 * {
 *     type: CANCEL_FEEDBACK,
 *     message: string,
 *     score: number
 * }
 */
export const CANCEL_FEEDBACK = Symbol('CANCEL_FEEDBACK');

/**
 * The type of the action which signals feedback was submitted for recording.
 *
 * {
 *     type: SUBMIT_FEEDBACK,
 *     message: string,
 *     score: number
 * }
 */
export const SUBMIT_FEEDBACK = Symbol('SUBMIT_FEEDBACK');
