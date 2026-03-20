import { defineStore } from 'pinia';

interface Message {
    originator: string;
    message: string;
}

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