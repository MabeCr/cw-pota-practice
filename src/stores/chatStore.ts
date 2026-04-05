import { defineStore } from 'pinia';
import type { Message } from '../types/message';

/**
 * Pinia store for managing the chat conversation state.
 */
export const useChatStore = defineStore('chat', {
    /**
     * The state of the chat store.
     */
    state: () => ({
        /** An array of messages in the current conversation. */
        messages: [] as Message[],
    }),
    actions: {
        /**
         * Adds a new message to the conversation.
         * 
         * @param originator - The sender of the message.
         * @param message - The content of the message.
         */
        addMessage(originator: string, message: string) {
            this.messages.push({ originator, message });
        },
    },
});