import { defineStore } from 'pinia';
import type { Message } from '../types/message';

export const useChatStore = defineStore('chat', {
    state: () => ({
        messages: [] as Message[],
    }),
    actions: {
        addMessage(originator: string, message: string) {
            this.messages.push({ originator, message });
        },
    },
});