import { watch } from "vue";
import { useChatStore } from "@/stores/chatStore";
import type { Message } from "@/types/message";
import type { Store } from "pinia";

/**
 * Service responsible for handling AI-driven conversation logic.
 */
export class ConversationAiService {

    constructor() {
        
    }

    /**
     * Sends a message to the chat store.
     * 
     * @param message - The message object to be added to the chat.
     */
    sendMessage(message: Message) {
        const chatStore = useChatStore()
        chatStore.addMessage(message.originator, message.message);
    }

    /**
     * Sets up a watcher to automatically "parrot" messages sent by the user.
     * If the last message was from 'You', the AI will respond with the same message after a delay.
     */
    parrotWatcher() {
        const chatStore = useChatStore();

        watch(() => chatStore.messages, async () => {
            const message = chatStore.messages[chatStore.messages.length - 1];
            if (message !== undefined && message.originator === 'You') {
                await setTimeout(() => {
                    this.sendMessage({originator: 'AI', message: message.message});
                }, 1000);
            }
        
        }, { deep: true });
    }
}