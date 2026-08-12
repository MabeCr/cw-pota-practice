import { useChatStore } from '@/stores/chatStore'
import { useActivationStore } from '@/stores/activationStore'
import { useTutorialStore } from '@/stores/tutorialStore'
import { isValidCallsign } from '@/utils/callsign'

export interface TutorialStepDef {
    id: string
    target?: string           // CSS selector — primary spotlight target
    preferredTarget?: string  // when found in DOM, overrides target for spotlight only
    title: string
    body: string
    placement?: 'top' | 'bottom' | 'left' | 'right' | 'center'
    canAdvance?: (ctx: { tutorialActivationId: string | null }) => boolean
    // When true with canAdvance: show Next button (disabled until ready) instead of auto-advancing.
    manualAdvance?: boolean
    // Hint shown beneath the disabled Next button when manualAdvance is true and canAdvance is false.
    hint?: string
    // Block all background pointer events so only the tutorial card (and spotlight for
    // allowInteraction steps) can be interacted with.
    blockBackground?: boolean
    // When blockBackground is true, allow the spotlit element to remain interactive.
    allowInteraction?: boolean
}

export const TUTORIAL_STEPS: TutorialStepDef[] = [
    // 0 — WELCOME
    {
        id: 'welcome',
        title: 'Welcome to CW POTA Practice',
        body: "This tutorial walks you through creating and running a simulated POTA activation. You'll send CQ, work a contact with N9MET, log your QSOs, and end the session just like the real thing. Click Next whenever you're ready.",
    },
    // 1 — START_ACTIVATING
    {
        id: 'start-activating',
        target: '[data-tutorial="landing-start-btn"]',
        title: 'Start Activating',
        body: "Click 'Start Activating' to go to the activation setup page.",
        placement: 'top',
        blockBackground: true,
        allowInteraction: true,
    },
    // 2 — OP_LANDING
    {
        id: 'op-landing',
        title: 'The Activation Page',
        body: "This is where you start and manage activations. Each activation is tied to a specific park, your callsign, and a state. Click Next to open the setup form.",
        blockBackground: true,
    },
    // 3 — PARK_SEARCH
    {
        id: 'park-search',
        target: '[data-tutorial="park-search"]',
        preferredTarget: '[data-tutorial="park-result"]',
        title: 'Find Your Park',
        body: "Type 'Caesar Creek' in this field and select Caesar Creek State Park (US-1940) from the dropdown. The Next button will enable once the correct park is selected.",
        placement: 'right',
        manualAdvance: true,
        hint: 'Please select Caesar Creek State Park (US-1940) to continue.',
        canAdvance() {
            return useTutorialStore().pendingParkRef === 'US-1940'
        },
    },
    // 4 — CALLSIGN
    {
        id: 'callsign',
        target: '[data-tutorial="callsign-input"]',
        title: 'Your Callsign',
        body: "Enter your amateur radio callsign. The Next button will enable once a valid callsign is entered.",
        placement: 'right',
        manualAdvance: true,
        hint: 'Please enter a valid amateur radio callsign (e.g. N9MET).',
        canAdvance() {
            return isValidCallsign(useTutorialStore().pendingCallsign)
        },
    },
    // 5 — STATE
    {
        id: 'state',
        target: '[data-tutorial="state-field"]',
        title: 'Park State',
        body: "Caesar Creek State Park is in Ohio. Make sure the state field shows 'OH'. The Next button will enable once it's correct.",
        placement: 'right',
        manualAdvance: true,
        hint: "Caesar Creek is in Ohio — the state must be 'OH'.",
        canAdvance() {
            return useTutorialStore().pendingState === 'OH'
        },
    },
    // 6 — START_ACTIVATION
    {
        id: 'start-activation',
        target: '[data-tutorial="start-activation-btn"]',
        title: 'Start the Activation',
        body: "Everything looks good. Click 'Start Activation' to begin. You'll then be taken to the operation view.",
        placement: 'bottom',
    },
    // 7 — PAGE_LAYOUT
    {
        id: 'page-layout',
        title: 'The Operation View',
        body: "You're now in your activation. The left half is your QSO logbook, where you'll record each contact. The right half is the \"radio\", where you'll communicate with simulated hunters.",
        blockBackground: true,
    },
    // 8 — CHAT
    {
        id: 'chat-area',
        target: '[data-tutorial="chat-area"]',
        title: 'The Chat Window',
        body: "Messages from hunters appear here as they respond to your calls. Your own transmissions show up on the left side in green. Incoming messages animate character by character, just like copying CW.",
        placement: 'left',
        blockBackground: true,
    },
    // 9 — GUIDED_INPUT
    {
        id: 'guided-input-tour',
        target: '[data-tutorial="guided-input"]',
        title: 'The Guided Input',
        body: "With Guided QSOs enabled, the suggested exchange text appears in gray. Start typing and the characters turn green as you match them correctly. They will turn red if something doesn't fit. Press Enter to send.",
        placement: 'top',
        blockBackground: true,
    },
    // 10 — VOLUME
    {
        id: 'volume',
        target: '[data-tutorial="volume-control"]',
        title: 'Audio Controls',
        body: "Hunters respond in CW over simulated audio. Use the volume slider to adjust the level, or click the speaker icon to mute. Try turning up the volume so you can hear N9MET when they call back.",
        placement: 'top',
        blockBackground: true,
    },
    // 11 — KEYER
    {
        id: 'keyer',
        target: '[data-tutorial="keyer-area"]',
        title: 'The CW Keyer',
        body: "This simulates a set of paddles. Click the keyer to focus it, then use the keyboard shortcuts shown to key dit and dah. Characters appear in the input above as you decode them. If you send HH (8 dits), it clears the last word you were typing.",
        placement: 'top',
        blockBackground: true,
    },
    // 12 — LOG_INTRO
    {
        id: 'log-intro',
        target: '[data-tutorial="log-container"]',
        title: 'The QSO Log',
        body: "The log is where you record each contact. The counter at the top shows your progress. You need 10 unique contacts to complete the activation. Let's work your first contact now!",
        placement: 'right',
        blockBackground: true,
    },
    // 13 — WORK_QSO
    {
        id: 'work-qso',
        target: '[data-tutorial="conversation-area"]',
        title: 'Work Your First Contact',
        body: "Time to get on the air. The guide shows you what to send! Type it out and press Enter to call CQ, then follow the guide through the full exchange with N9MET. This step will advance automatically once the QSO is complete.",
        placement: 'left',
        blockBackground: true,
        allowInteraction: true,
        canAdvance({ tutorialActivationId: _ }) {
            return useChatStore().messages.some(
                m => m.originator === 'N9MET' && m.message === 'EE'
            )
        },
    },
    // 14 — LOG_QSO
    {
        id: 'log-qso',
        target: '[data-tutorial="log-form"]',
        title: 'Log the Contact',
        body: "Great QSO! Fill in the highlighted form: N9MET for callsign, 599 for RSTs (press Enter in an empty RST field to auto-fill), and OH for state. Press Enter or click Log when done.",
        placement: 'right',
        blockBackground: true,
        allowInteraction: true,
        hint: 'Log the QSO with callsign N9MET and state OH to continue.',
        canAdvance({ tutorialActivationId }) {
            if (!tutorialActivationId) return false
            return (useActivationStore().getById(tutorialActivationId)?.qsoList.length ?? 0) >= 1
        },
    },
    // 15 — SEE_TABLE
    {
        id: 'see-table',
        target: '[data-tutorial="log-table"]',
        title: 'Your Log Table',
        body: "N9MET is now in your log. Each row shows the UTC time, callsign, sent and received RSTs, and their state. Click a row to edit it, or use the × button to remove a contact. Click Next to continue.",
        placement: 'center',
        blockBackground: true,
    },
    // 16 — NEARLY_THERE
    {
        id: 'nearly-there',
        target: '[data-tutorial="activation-badge"]',
        title: 'Almost There!',
        body: "You now have 9 contacts logged, one away from a full activation! Let's work one final contact to complete it.",
        placement: 'bottom',
        blockBackground: true,
    },
    // 17 — WORK_TENTH
    {
        id: 'work-tenth',
        target: '[data-tutorial="conversation-area"]',
        title: 'Work the Final Contact',
        body: "Send CQ again. KM4BE will respond as a Park-to-Park contact, so you'll see 'P2P' in their call-in. Follow the guide through the exchange as normal; your park reference will be included automatically. This step advances once the exchange is complete.",
        placement: 'left',
        blockBackground: true,
        allowInteraction: true,
        canAdvance({ tutorialActivationId: _ }) {
            return useChatStore().messages.some(
                m => m.originator === 'KM4BE' && m.message === 'EE'
            )
        },
    },
    // 18 — LOG_TENTH
    {
        id: 'log-tenth',
        target: '[data-tutorial="log-form"]',
        title: 'Log the Final Contact',
        body: "KM4BE is a Park-to-Park contact. Fill in their callsign and RSTs, then click the P2P button and enter K1964 as their park reference. Once you save it, the counter at the top will flip to 'Activated'.",
        placement: 'right',
        blockBackground: true,
        allowInteraction: true,
        hint: 'Log the QSO with callsign KM4BE to continue.',
        canAdvance({ tutorialActivationId }) {
            if (!tutorialActivationId) return false
            return (useActivationStore().getById(tutorialActivationId)?.qsoList.length ?? 0) >= 10
        },
    },
    // 19 — END_ACTIVATION
    {
        id: 'end-activation',
        target: '[data-tutorial="toggle-activation-btn"]',
        title: 'End the Activation',
        body: "When you're done working contacts, click 'End Activation' to close out the session. This marks the activation complete, disables the chat and log form, and locks in your results.",
        placement: 'bottom',
        blockBackground: true,
        allowInteraction: true,
        canAdvance({ tutorialActivationId }) {
            if (!tutorialActivationId) return false
            return useActivationStore().getById(tutorialActivationId)?.endedAt != null
        },
    },
    // 20 — DONE
    {
        id: 'done',
        title: "You're Ready to Activate!",
        body: "That's everything you need to know. The logbook saves all your activations, the Exchange page has a full CW POTA reference, and Preferences lets you tune the difficulty. Good luck on the air and 73!",
    },
]
