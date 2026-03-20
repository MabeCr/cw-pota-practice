import { watch } from "vue";
import { useChatStore } from "@/stores/chatStore";
import type { Message } from "@/types/message";
import type { Store } from "pinia";

export class ConversationAiService {

    constructor() {
        
    }

    sendMessage(message: Message) {
        const chatStore = useChatStore()
        chatStore.addMessage(message.originator, message.message);
    }

    parrotWatcher() {
        const chatStore = useChatStore();

        watch(() => chatStore.messages, async () => {
            const message = chatStore.messages[chatStore.messages.length - 1];
            if (message !== undefined && message.originator === 'You') {
                await setTimeout(() => {
                    console.log(message);
                    this.sendMessage({originator: 'AI', message: message.message});
                }, 1000);
            }
        
        }, { deep: true });
    }
}