import { defineStore } from 'pinia'
import { useSettingsStore } from './settingsStore'
import { useActivationStore } from './activationStore'
import { getConversationAiService } from '@/services/conversationAiService'

const COMPLETED_KEY = 'cw-pota-tutorial-completed'

// Step index constants — keep in sync with useTutorialSteps.ts order
export const T = {
    WELCOME:           0,
    START_ACTIVATING:  1,
    OP_LANDING:        2,
    PARK_SEARCH:       3,
    CALLSIGN:          4,
    STATE:             5,
    START_ACTIVATION:  6,
    PAGE_LAYOUT:       7,
    CHAT:              8,
    GUIDED_INPUT:      9,
    VOLUME:           10,
    KEYER:            11,
    LOG_INTRO:        12,
    WORK_QSO:         13,
    LOG_QSO:          14,
    SEE_TABLE:        15,
    NEARLY_THERE:     16,
    WORK_TENTH:       17,
    LOG_TENTH:        18,
    END_ACTIVATION:   19,
    DONE:             20,
} as const

export const STEP_COUNT = 21

// Which route name auto-advances each step (null = not route-gated)
export const STEP_AWAIT_ROUTES: (string | null)[] = [
    null,         // 0  welcome
    'operation',  // 1  start-activating → /operation
    null,         // 2  op-landing info
    null,         // 3  park-search
    null,         // 4  callsign
    null,         // 5  state
    'activation', // 6  start-activation → /operation/:id
    null, null, null, null, null, null, null, null, null, null, null, null, null, null,
]

// Which action name auto-advances each step (null = not action-gated)
export const STEP_AWAIT_ACTIONS: (string | null)[] = [
    null, null, null,
    'park-selected', // 3
    null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
]

const FAKE_QSOS: Array<{ theirCall: string; theirState: string }> = [
    { theirCall: 'KD8VXQ', theirState: 'MI' },
    { theirCall: 'W8TK',   theirState: 'IN' },
    { theirCall: 'N9XYZ',  theirState: 'IL' },
    { theirCall: 'KA8RST', theirState: 'KY' },
    { theirCall: 'WB4JKL', theirState: 'TN' },
    { theirCall: 'K4MNO',  theirState: 'GA' },
    { theirCall: 'WA3PQR', theirState: 'PA' },
    { theirCall: 'N5STU',  theirState: 'TX' },
]

export const useTutorialStore = defineStore('tutorial', {
    state: () => ({
        isActive: false,
        currentStep: 0,
        completed: localStorage.getItem(COMPLETED_KEY) === 'true',
        tutorialActivationId: null as string | null,
        prevGuidedQsos: false,
        shouldOpenNewActivationDialog: false,
    }),

    actions: {
        start() {
            const settings = useSettingsStore()
            this.prevGuidedQsos = settings.guidedQsos
            settings.setGuidedQsos(true)
            getConversationAiService().enableTutorialMode()
            this.currentStep = 0
            this.isActive = true
        },

        advance() {
            // Side effect: when leaving the "see table" step, secretly add 8 QSOs
            if (this.currentStep === T.SEE_TABLE && this.tutorialActivationId) {
                const store = useActivationStore()
                const now = new Date()
                for (const q of FAKE_QSOS) {
                    now.setMinutes(now.getMinutes() - 1)
                    const h = String(now.getUTCHours()).padStart(2, '0')
                    const m = String(now.getUTCMinutes()).padStart(2, '0')
                    store.addQso(this.tutorialActivationId, {
                        date: `${h}${m}z`,
                        theirCall: q.theirCall,
                        sentRST: '599',
                        receivedRST: '599',
                        theirState: q.theirState,
                        theirPark: '',
                    })
                }
            }

            // Side effect: when leaving OP_LANDING, signal the dialog to open
            if (this.currentStep === T.OP_LANDING) {
                this.shouldOpenNewActivationDialog = true
            }

            if (this.currentStep < STEP_COUNT - 1) {
                this.currentStep++
            } else {
                this.finish()
            }
        },

        back() {
            if (this.currentStep > 0) this.currentStep--
        },

        notifyAction(action: string) {
            if (!this.isActive) return
            if (STEP_AWAIT_ACTIONS[this.currentStep] === action) {
                this.advance()
            }
        },

        finish() {
            const settings = useSettingsStore()
            settings.setGuidedQsos(this.prevGuidedQsos)
            if (this.tutorialActivationId) {
                useActivationStore().deleteActivation(this.tutorialActivationId)
                this.tutorialActivationId = null
            }
            getConversationAiService().disableTutorialMode()
            this.isActive = false
            this.completed = true
            localStorage.setItem(COMPLETED_KEY, 'true')
        },
    },
})
