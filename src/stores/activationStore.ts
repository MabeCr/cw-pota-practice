import { defineStore } from 'pinia'
import type { Activation, QSO, ChatMessage, GroundTruthEntry } from '../types/activation'
import type { Station } from '../types/station'
import { useSettingsStore } from './settingsStore'

// ── Validation helpers (module-level, no reactivity needed) ───────────────────

function normalizeRst(s: string): string {
    return s.toUpperCase().replace(/N/g, '9')
}

function normalizePark(s: string): string {
    return s.toUpperCase().replace(/-/g, '')
}

function findGroundTruth(activation: Activation, callsign: string): GroundTruthEntry | undefined {
    const norm = callsign.toUpperCase()
    const entries = (activation.qsoGroundTruth ?? []).filter(g => g.callsign.toUpperCase() === norm)
    return entries[entries.length - 1]
}

function checkCorrectness(qso: QSO, gt: GroundTruthEntry): boolean {
    const callOk  = qso.theirCall.toUpperCase() === gt.callsign.toUpperCase()
    const rstOk   = normalizeRst(qso.receivedRST) === normalizeRst(gt.rst)
    const stateOk = qso.theirState.toUpperCase() === gt.stateCode.toUpperCase()
    const parkOk  = gt.park2parkId
        ? normalizePark(qso.theirPark ?? '') === normalizePark(gt.park2parkId)
        : true
    return callOk && rstOk && stateOk && parkOk
}

function annotateQso(activation: Activation, qso: QSO): QSO {
    const mode = activation.validationMode
    if (!mode || mode === 'none') return qso
    const gt = findGroundTruth(activation, qso.theirCall)
    if (!gt) return qso
    const isCorrect = checkCorrectness(qso, gt)
    if (mode === 'immediate') return { ...qso, correct: isCorrect }
    // completed: reveal only after activation has ended
    return { ...qso, correct: activation.endedAt ? isCorrect : null }
}

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
        createActivation(parkReference: string, parkName: string, callsign: string, parkState?: string): string {
            const id = crypto.randomUUID()
            this.activations.push({
                id,
                parkReference,
                parkName,
                parkState,
                callsign,
                startedAt: new Date().toISOString(),
                endedAt: null,
                qsoList: [],
                chatHistory: [],
                validationMode: useSettingsStore().qsoValidation,
                qsoGroundTruth: [],
            })
            save(this.activations)
            return id
        },

        addQso(id: string, qso: QSO): void {
            const a = this.activations.find(x => x.id === id)
            if (!a) return
            a.qsoList.push(annotateQso(a, qso))
            save(this.activations)
        },

        addGroundTruth(id: string, entry: GroundTruthEntry): void {
            const a = this.activations.find(x => x.id === id)
            if (!a) return
            if (!a.qsoGroundTruth) a.qsoGroundTruth = []
            a.qsoGroundTruth.push(entry)
            save(this.activations)
        },

        saveChatHistory(id: string, history: ChatMessage[]): void {
            const a = this.activations.find(x => x.id === id)
            if (!a) return
            a.chatHistory = [...history]
            save(this.activations)
        },

        saveHunters(id: string, hunters: Station[]): void {
            const a = this.activations.find(x => x.id === id)
            if (!a) return
            a.activeHunters = [...hunters]
            save(this.activations)
        },

        updateQso(id: string, index: number, qso: QSO): void {
            const a = this.activations.find(x => x.id === id)
            if (!a || index < 0 || index >= a.qsoList.length) return
            a.qsoList[index] = annotateQso(a, qso)
            save(this.activations)
        },

        deleteQso(id: string, index: number): void {
            const a = this.activations.find(x => x.id === id)
            if (!a || index < 0 || index >= a.qsoList.length) return
            a.qsoList.splice(index, 1)
            save(this.activations)
        },

        endActivation(id: string): void {
            const a = this.activations.find(x => x.id === id)
            if (!a) return
            a.endedAt = new Date().toISOString()
            // Reveal pending QSOs for completed validation mode
            if (a.validationMode === 'completed') {
                a.qsoList = a.qsoList.map(qso => {
                    if (qso.correct !== null) return qso  // undefined or already revealed
                    const gt = findGroundTruth(a, qso.theirCall)
                    return { ...qso, correct: gt ? checkCorrectness(qso, gt) : false }
                })
            }
            save(this.activations)
        },

        reopenActivation(id: string): void {
            const a = this.activations.find(x => x.id === id)
            if (!a) return
            a.endedAt = null
            save(this.activations)
        },

        updateActivation(id: string, fields: { parkReference?: string; parkName?: string; parkState?: string; callsign?: string }): void {
            const a = this.activations.find(x => x.id === id)
            if (!a) return
            if (fields.parkReference !== undefined) a.parkReference = fields.parkReference
            if (fields.parkName      !== undefined) a.parkName      = fields.parkName
            if (fields.parkState     !== undefined) a.parkState     = fields.parkState
            if (fields.callsign      !== undefined) a.callsign      = fields.callsign
            save(this.activations)
        },

        deleteActivation(id: string): void {
            this.activations = this.activations.filter(x => x.id !== id)
            save(this.activations)
        },
    },
})
