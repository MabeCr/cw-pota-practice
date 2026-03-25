import { watch } from "vue";
import { useChatStore } from "@/stores/chatStore";
import type { Message } from "@/types/message";
import type { Store } from "pinia";
import type { Station } from "@/types/station";
import { QSO_STEPS, type QsoSteps } from "@/constants/qsoStates";
import { useQsoUtils } from "@/composables/useQsoUtils";
import { US_STATES } from "@/constants/states";

export class ConversationAiService {

    private callingStations: Station[];

    /**
     * Initializes a new instance of the ConversationAiService class.
     * Sets the initial list of calling stations to an empty array.
     */
    constructor() {
        this.callingStations = [];
    }

    /**
     * Retrieves the list of calling stations.
     * @returns {Station[]} The list of calling stations.
     */
    getCallingStations(): Station[] {
        return this.callingStations;
    }

    /**
     * Adds a calling station to the list of calling stations.
     * @param {Station} station - The calling station to be added.
     */
    addCallingStation(station: Station): void {
        this.callingStations.push(station);
    }

    /**
     * Removes a calling station from the list of calling stations.
     * @param {Station} station - The calling station to be removed.
     */
    removeCallingStation(station: Station): void {
        this.callingStations = this.callingStations.filter(filterStation => filterStation !== station);
    }

    /**
     * Advances the QSO step for the given station.
     * The QSO step will be advanced to the next step in the QSO process.
     * If the current QSO step is 'CQ', it will be advanced to 'EXCHANGE'.
     * If the current QSO step is 'EXCHANGE', it will be advanced to 'CONFIRM'.
     * If the current QSO step is 'CONFIRM', it will be advanced to 'LOGGING'.
     * If the current QSO step is 'LOGGING', it will be advanced to 'COMPLETED'.
     * @param {Station} station - The station whose QSO step is to be advanced.
     */
    advanceQsoStep(station: Station): void {
        if (station.qsoStep === 'CQ') {
            station.qsoStep = 'EXCHANGE';
        } else if (station.qsoStep === 'EXCHANGE') {
            station.qsoStep = 'CONFIRM';
        } else if (station.qsoStep === 'CONFIRM') {
            station.qsoStep = 'LOGGING';
        } else if (station.qsoStep === 'LOGGING') {
            station.qsoStep = 'COMPLETED';
        }
    }

    /**
     * Sends a message to the chat store.
     * @param {Message} message - The message to be sent.
     */
    sendMessage(message: Message): void {
        const chatStore = useChatStore()
        chatStore.addMessage(message.originator, message.message);
    }

    /**
     * Watches the chat store for new messages from the user and sends a
     * copy of the message back to the chat store with the originator
     * set to 'AI'.
     */
    parrotWatcher(): void {
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

    messageStoreWatcher(): void {
        const chatStore = useChatStore();

        watch(() => chatStore.messages, async () => {
            const message = chatStore.messages[chatStore.messages.length - 1];
            if (message !== undefined && message.originator === 'You' && message.message.includes('CQ')) {
                if (this.callingStations.length < 1) {
                    this.addCallingStation({
                        callsign: useQsoUtils().generateCall(),
                        state: US_STATES[Math.floor(Math.random() * US_STATES.length)] || { code: 'OH', name: 'Ohio' },
                        park2parkID: null,
                        qsoStep: "CQ"
                    });
                }
            }
        
        }, { deep: true });
    }
}