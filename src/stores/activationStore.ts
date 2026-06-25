import { defineStore } from 'pinia'
import type { Activation, QSO, ChatMessage } from '../types/activation'

const STORAGE_KEY = 'cw-pota-activations'

function load(): Activation[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? (JSON.parse(raw) as Activation[]) : []
    } catch {
        return []
    }
}

function save(activations: Activation[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activations))
}

export const useActivationStore = defineStore('activations', {
    state: () => ({
        activations: load(),
    }),
    getters: {
        getById: (state) => (id: string): Activation | null =>
            state.activations.find(a => a.id === id) ?? null,
        inProgress: (state): Activation[] =>
            state.activations.filter(a => a.endedAt === null),
        ended: (state): Activation[] =>
            state.activations.filter(a => a.endedAt !== null),
    },
    actions: {
        createActivation(parkReference: string, parkName: string, callsign: string): string {
            const id = crypto.randomUUID()
            this.activations.push({
                id,
                parkReference,
                parkName,
                callsign,
                startedAt: new Date().toISOString(),
                endedAt: null,
                qsoList: [],
                chatHistory: [],
            })
            save(this.activations)
            return id
        },

        addQso(id: string, qso: QSO): void {
            const a = this.activations.find(x => x.id === id)
            if (!a) return
            a.qsoList.push(qso)
            save(this.activations)
        },

        saveChatHistory(id: string, history: ChatMessage[]): void {
            const a = this.activations.find(x => x.id === id)
            if (!a) return
            a.chatHistory = [...history]
            save(this.activations)
        },

        endActivation(id: string): void {
            const a = this.activations.find(x => x.id === id)
            if (!a) return
            a.endedAt = new Date().toISOString()
            save(this.activations)
        },

        reopenActivation(id: string): void {
            const a = this.activations.find(x => x.id === id)
            if (!a) return
            a.endedAt = null
            save(this.activations)
        },

        deleteActivation(id: string): void {
            this.activations = this.activations.filter(x => x.id !== id)
            save(this.activations)
        },
    },
})
