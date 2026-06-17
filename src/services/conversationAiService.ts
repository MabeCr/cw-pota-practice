import { ref, watch } from "vue";
import { useChatStore } from "@/stores/chatStore";
import type { Message } from "@/types/message";
import type { Station } from "@/types/station";
import { useQsoUtils } from "@/composables/useQsoUtils";
import { US_STATES } from "@/constants/states";

const HUNTER_COUNT = 3;

export class ConversationAiService {
    private userCallsign: string = '';
    private activeStationList = ref<Station[]>([]);
    private inQsoWithCallsign: string | null = null;

    constructor() {
        this.setupWatcher();
    }

    setUserCallsign(callsign: string): void {
        this.userCallsign = callsign;
    }

    getActiveStations(): Station[] {
        return this.activeStationList.value;
    }

    sendMessage(message: Message): void {
        const chatStore = useChatStore();
        chatStore.addMessage(message.originator, message.message);
    }

    private setupWatcher(): void {
        const chatStore = useChatStore();
        watch(() => chatStore.messages, async () => {
            const messages = chatStore.messages;
            if (messages.length === 0) return;

            const lastMessage = messages[messages.length - 1];
            if (!lastMessage || lastMessage.originator !== 'You') return;

            await this.handleUserMessage(lastMessage);
        }, { deep: true });
    }

    private async handleUserMessage(message: Message): Promise<void> {
        const userMessage = message.message.trim().toUpperCase();

        if (userMessage.includes('CQ') && userMessage.includes('POTA')) {
            await this.handleCQ();
            return;
        }

        // Fire each hunter's response independently so their random delays don't stack
        for (const hunter of [...this.activeStationList.value]) {
            if (this.inQsoWithCallsign !== null && this.inQsoWithCallsign !== hunter.callsign) {
                continue; // Another QSO in progress — stay silent
            }
            void this.processHunterResponse(userMessage, hunter);
        }
    }

    private async handleCQ(): Promise<void> {
        // Always reset on a new CQ so hunters from a previous round don't linger
        this.activeStationList.value = [];
        this.inQsoWithCallsign = null;

        const hunters = Array.from({ length: HUNTER_COUNT }, () => this.createHunter());
        hunters.forEach(h => this.activeStationList.value.push(h));

        // Each hunter calls in with its own independent random delay
        hunters.forEach(hunter => void this.hunterCallIn(hunter));
    }

    private async hunterCallIn(hunter: Station): Promise<void> {
        await this.randomDelay();

        // If a QSO started while we were waiting, stay silent
        if (this.inQsoWithCallsign !== null) return;

        hunter.qsoStep = 'HUNTER_CALL';
        this.sendMessage({
            originator: hunter.callsign,
            message: hunter.callsign.toUpperCase()
        });
    }

    private async processHunterResponse(userMessage: string, hunter: Station): Promise<void> {
        const hunterCall = hunter.callsign.toUpperCase();

        if (hunter.qsoStep === 'HUNTER_CALL') {
            if (this.isFullCallInMessage(userMessage, hunterCall)) {
                this.inQsoWithCallsign = hunter.callsign; // Lock — others go silent
                hunter.qsoStep = 'ACTIVATOR_RST';
                await this.randomDelay();

                const rst = this.generateRST();
                const stateCode = hunter.state.code.toUpperCase();
                this.sendMessage({
                    originator: hunter.callsign,
                    message: `BK TU UR ${rst} ${rst} ${stateCode} ${stateCode} BK`
                });
                hunter.qsoStep = 'HUNTER_RST';

            } else if (this.isCallConfirmationQuery(userMessage, hunterCall)) {
                await this.randomDelay();
                this.sendMessage({ originator: hunter.callsign, message: `RR ${hunter.callsign}` });

            } else if (
                this.isExchangeLike(userMessage) &&
                (this.isPartialCallInMessage(userMessage, hunterCall) || this.isCallsignError(userMessage, hunterCall))
            ) {
                await this.randomDelay();
                this.sendMessage({ originator: hunter.callsign, message: `NN ${hunterCall}` });

            } else if (this.isPartialCallInMessage(userMessage, hunterCall)) {
                await this.randomDelay();
                this.sendMessage({ originator: hunter.callsign, message: hunterCall });

            } else if (this.isCallsignError(userMessage, hunterCall)) {
                await this.randomDelay();
                this.sendMessage({ originator: hunter.callsign, message: `NN ${hunterCall}` });
            }

        } else if (hunter.qsoStep === 'HUNTER_RST' && userMessage.includes('73')) {
            hunter.qsoStep = 'ACTIVATOR_FINISH';
            await this.randomDelay();

            this.sendMessage({ originator: hunter.callsign, message: 'EE' });
            hunter.qsoStep = 'HUNTER_FINISH';

            const remaining = this.activeStationList.value.filter(s => s.callsign !== hunter.callsign);
            this.activeStationList.value = remaining;
            this.inQsoWithCallsign = null;

            // Remaining hunters re-call to signal they are still available
            for (const remainingHunter of remaining) {
                remainingHunter.qsoStep = 'CQ';
                void this.hunterCallIn(remainingHunter);
            }
        }
    }

    private isFullCallInMessage(message: string, callsign: string): boolean {
        return message.split(/\s+/).includes(callsign);
    }

    private isCallConfirmationQuery(message: string, callsign: string): boolean {
        return message.split(/\s+/).some(word => word === `${callsign}?`);
    }

    private isExchangeLike(message: string): boolean {
        return message.trimEnd().endsWith('BK');
    }

    private isPartialCallInMessage(message: string, callsign: string): boolean {
        return message.split(/\s+/).some(word => {
            if (word === callsign) return false;

            const knownPart = word.replace(/\?+$/, '');
            if (knownPart.length === 0) return false;

            if (knownPart.includes('?')) return this.wildcardMatch(knownPart, callsign);

            return callsign.includes(knownPart);
        });
    }

    private isCallsignError(message: string, callsign: string): boolean {
        return message.split(/\s+/).some(word =>
            word !== callsign && this.levenshtein(word, callsign) === 1
        );
    }

    private levenshtein(a: string, b: string): number {
        let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
        for (let i = 1; i <= a.length; i++) {
            const curr = [i];
            for (let j = 1; j <= b.length; j++) {
                curr[j] = a[i - 1] === b[j - 1]
                    ? prev[j - 1]!
                    : 1 + Math.min(prev[j]!, curr[j - 1]!, prev[j - 1]!);
            }
            prev = curr;
        }
        return prev[b.length]!;
    }

    private wildcardMatch(pattern: string, str: string): boolean {
        if (pattern.length !== str.length) return false;
        const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
        const regexStr = escaped.replace(/\?/g, '.');
        return new RegExp(`^${regexStr}$`, 'i').test(str);
    }

    private generateRST(): string {
        const sOptions = [5, 7, 8, 9, 9, 9];
        const tOptions = [7, 7, 9, 9];
        const s = sOptions[Math.floor(Math.random() * sOptions.length)]!;
        const t = tOptions[Math.floor(Math.random() * tOptions.length)]!;
        return `5${s}${t}`;
    }

    private async randomDelay(): Promise<void> {
        const ms = Math.random() * 1000 + 1000;
        await new Promise(resolve => setTimeout(resolve, ms));
    }

    private createHunter(): Station {
        const state = US_STATES[Math.floor(Math.random() * US_STATES.length)] ?? { code: 'OH', name: 'Ohio' };
        return {
            callsign: useQsoUtils().generateCall(),
            state,
            park2parkID: null,
            qsoStep: 'CQ'
        };
    }
}
