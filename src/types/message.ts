/**
 * Represents a single message in a conversation.
 */
export interface Message {
    /** The identifier of the person or entity that sent the message. */
    originator: string;
    /** The content of the message. */
    message: string;
}