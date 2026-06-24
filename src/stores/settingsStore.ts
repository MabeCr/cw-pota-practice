import { defineStore } from 'pinia';

const STORAGE_KEY = 'cw-pota-settings';

function loadFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveToStorage(state: ReturnType<typeof defaultState>) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function defaultState() {
    const saved = loadFromStorage();
    return {
        callsign:  (saved.callsign  as string)  ?? '',
        frequency: (saved.frequency as number)  ?? 600,
        wpm:       (saved.wpm       as number)  ?? 20,
        rampTime:  (saved.rampTime  as number)  ?? 8,   // ms
    };
}

export const useSettingsStore = defineStore('settings', {
    state: defaultState,
    actions: {
        setCallsign(value: string) {
            this.callsign = value.toUpperCase();
            saveToStorage(this.$state);
        },
        setFrequency(value: number) {
            this.frequency = value;
            saveToStorage(this.$state);
        },
        setWpm(value: number) {
            this.wpm = value;
            saveToStorage(this.$state);
        },
        setRampTime(value: number) {
            this.rampTime = value;
            saveToStorage(this.$state);
        },
    },
});
