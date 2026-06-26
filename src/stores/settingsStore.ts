import { defineStore } from 'pinia';

export type KeyerType = 'straight' | 'iambic-a' | 'iambic-b';

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
        callsign:   (saved.callsign   as string)    ?? '',
        frequency:  (saved.frequency  as number)    ?? 600,
        wpm:        (saved.wpm        as number)    ?? 20,
        rampTime:   (saved.rampTime   as number)    ?? 8,        // ms
        hunterMaxWpm:   (saved.hunterMaxWpm   as number) ?? 20,
        hunterCount:    (saved.hunterCount    as number) ?? 3,
        noiseLevel:     (saved.noiseLevel     as number) ?? 15,
        ditKey:     (saved.ditKey     as string)    ?? 'BracketLeft',
        dahKey:     (saved.dahKey     as string)    ?? 'BracketRight',
        keyerType:  (saved.keyerType  as KeyerType) ?? 'iambic-a' as KeyerType,
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
        setHunterMaxWpm(value: number) {
            this.hunterMaxWpm = value;
            saveToStorage(this.$state);
        },
        setHunterCount(value: number) {
            this.hunterCount = value;
            saveToStorage(this.$state);
        },
        setNoiseLevel(value: number) {
            this.noiseLevel = value;
            saveToStorage(this.$state);
        },
        setDitKey(value: string) {
            this.ditKey = value;
            saveToStorage(this.$state);
        },
        setDahKey(value: string) {
            this.dahKey = value;
            saveToStorage(this.$state);
        },
        setKeyerType(value: KeyerType) {
            this.keyerType = value;
            saveToStorage(this.$state);
        },
    },
});
