import { watch } from "vue";
import { useChatStore } from "@/stores/chatStore";
import { useQsoStore } from "@/stores/qsoStore";
import { QsoScriptEngine } from "@/services/qsoScriptEngine";
import type { Message } from "@/types/message";
import type { Station } from "@/types/station";
import { QSO_STEPS, type QsoSteps } from "@/constants/qsoStates";
import { useQsoUtils } from "@/composables/useQsoUtils";
import { US_STATES } from "@/constants/states";

export class ConversationAiService {
    private qsoStore = useQsoStore();
    private qsoScriptEngine = new QsoScriptEngine();
    private userCallsign: string = '';

    constructor() {
        // Auto-start the message watcher
        this.messageStoreWatcher();
    }

    /**
     * Sets the user's callsign for the QSO
     */
    setUserCallsign(callsign: string): void {
        this.userCallsign = callsign;
    }

    /**
     * Retrieves the list of active stations
     */
    getActiveStations(): Station[] {
        return this.qsoStore.activeStations.map(state => state.station);
    }

    /**
     * Adds a calling station to the QSO tracking
     */
    addCallingStation(station: Station): void {
        this.qsoStore.addStation(station);
    }

    /**
     * Updates the QSO step for a station
     */
    updateQsoStep(callsign: string, step: QsoSteps): void {
        this.qsoStore.updateQsoStep(callsign, step);
    }

    /**
     * Completes a QSO with a station
     */
    completeQso(callsign: string): void {
        this.qsoStore.completeQso(callsign);
    }

    /**
     * Sends a message to the chat store
     */
    sendMessage(message: Message): void {
        const chatStore = useChatStore();
        chatStore.addMessage(message.originator, message.message);
    }

    /**
     * Watches the chat store for new messages and processes QSO logic
     */
    messageStoreWatcher(): void {
        const chatStore = useChatStore();

        watch(() => chatStore.messages, async () => {
            const messages = chatStore.messages;
            if (messages.length === 0) return;

            const lastMessage = messages[messages.length - 1];
            
            if (lastMessage == undefined) {
                return;
            }

            // If user sent a message
            if ( lastMessage.originator === 'You') {
                await this.handleUserMessage(lastMessage);
            }
            // If AI sent a message, process the response
            else if (lastMessage.originator !== 'You') {
                await this.handleAiMessage(lastMessage);
            }
        }, { deep: true });
    }

    /**
     * Handles messages sent by the user
     */
    private async handleUserMessage(message: Message): Promise<void> {
        const userMessage = message.message.trim();

        // Check if user is sending CQ
        if (userMessage.includes('CQ')) {
            this.userCallsign = message.originator;
            
            // Spawn a hunter if none exists
            if (this.qsoStore.activeStations.length === 0) {
                const hunter = this.createHunter();
                this.qsoStore.addStation(hunter);
                
                // Wait random time then hunter calls
                const delay = (Math.random() * 1000) + 1500;
                await new Promise(resolve => setTimeout(resolve, delay));
                
                this.sendMessage({
                    originator: hunter.callsign,
                    message: hunter.callsign
                });
            }
        }
        else {
            // User is responding to a hunter
            await this.processHunterResponse(userMessage);
        }
    }

    /**
     * Handles messages sent by AI (hunters)
     */
    private async processHunterResponse(userMessage: string): Promise<void> {
        // Find the most recent active hunter
        const activeStations = this.qsoStore.activeStations;
        if (activeStations.length === 0) return;

        const lastStation = activeStations[activeStations.length - 1];

        let lastStationCallsign: string;
        if (lastStation != undefined) {
            lastStationCallsign = lastStation.station.callsign;
        } else {
            lastStationCallsign = "error";
        }
        // Get the last station that spoke
        const stationState = this.qsoStore.getStationState(lastStationCallsign);
        
        if (!stationState) return;

        // Update message history
        this.qsoStore.addMessageToHistory(lastStationCallsign, userMessage, 'You');

        // Determine next step in QSO
        const nextStep = this.qsoScriptEngine.getNextStep(
            stationState.currentStep,
            userMessage
        );

        // Update station to next step
        this.updateQsoStep(lastStationCallsign, nextStep);

        // Generate and send response if QSO not complete
        if (nextStep !== 'COMPLETED') {
            const context = this.createScriptContext(stationState.station);
            const responseMessage = this.qsoScriptEngine.generateMessage(nextStep, context);
            
            if (responseMessage) {
                const delay = (Math.random() * 800) + 500;
                await new Promise(resolve => setTimeout(resolve, delay));
                this.sendMessage({
                    originator: lastStationCallsign,
                    message: responseMessage
                });
            }
        } else {
            // QSO complete
            this.completeQso(lastStationCallsign);
            
            // Clean up completed QSOs
            this.qsoStore.cleanupCompleted();
        }
    }

    /**
     * Handles AI messages (for future functionality)
     */
    private async handleAiMessage(message: Message): Promise<void> {
        // This can be used for AI parrot functionality or other features
    }

    /**
     * Creates a random hunter station
     */
    private createHunter(): Station {
        const stateIndex = Math.floor(Math.random() * US_STATES.length);
        const state = US_STATES[stateIndex] || { code: 'OH', name: 'Ohio' };
        
        return {
            callsign: useQsoUtils().generateCall(),
            state: state,
            park2parkID: null,
            qsoStep: 'CQ'
        };
    }

    /**
     * Creates the context for QSO script template
     */
    private createScriptContext(station: Station) {
        return {
            activatorCallsign: this.userCallsign || 'K1ABC',
            hunterCallsign: station.callsign,
            activatorState: station.state,
            hunterState: station.state.code,
            rst: this.qsoScriptEngine.generateRst(),
            timeOfDay: this.qsoScriptEngine.getTimeOfDay()
        };
    }
}