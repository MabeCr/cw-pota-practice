import { useChatStore } from '@/stores/chatStore'
import { useActivationStore } from '@/stores/activationStore'

export interface TutorialStepDef {
    id: string
    target?: string        // CSS selector using data-tutorial attribute
    title: string
    body: string
    placement?: 'top' | 'bottom' | 'left' | 'right' | 'center'
    canAdvance?: (ctx: { tutorialActivationId: string | null }) => boolean
}

export const TUTORIAL_STEPS: TutorialStepDef[] = [
    // 0
    {
        id: 'welcome',
        title: 'Welcome to CW POTA Practice',
        body: "This tutorial walks you through creating and running a simulated POTA activation. You'll send CQ, work a contact with W1AW, log your QSOs, and end the session — just like the real thing. Click Next whenever you're ready.",
    },
    // 1
    {
        id: 'start-activating',
        target: '[data-tutorial="landing-start-btn"]',
        title: 'Start Activating',
        body: "Click 'Start Activating' to go to the activation setup page.",
        placement: 'top',
    },
    // 2
    {
        id: 'op-landing',
        title: 'The Activation Page',
        body: "This is where you start and manage activations. Each activation is tied to a specific park, your callsign, and a state. Click Next, then click 'Start New Activation' to open the setup form.",
    },
    // 3
    {
        id: 'park-search',
        target: '[data-tutorial="new-activation-dialog"]',
        title: 'Find Your Park',
        body: "Type a park name or POTA reference in the first field — try 'Caesar Creek'. Matching parks appear in a dropdown; click the result to select it.",
        placement: 'right',
    },
    // 4
    {
        id: 'callsign',
        target: '[data-tutorial="callsign-input"]',
        title: 'Your Callsign',
        body: "Fill in your callsign in this field. This is what gets sent in your CQ and during each exchange.",
        placement: 'right',
    },
    // 5
    {
        id: 'state',
        target: '[data-tutorial="state-field"]',
        title: 'Park State — Auto-filled',
        body: "The state code was automatically filled in from the park you selected. Caesar Creek is in Ohio, so you'll see 'OH' here. You can edit it if needed.",
        placement: 'right',
    },
    // 6
    {
        id: 'start-activation',
        target: '[data-tutorial="start-activation-btn"]',
        title: 'Start the Activation',
        body: "Everything looks good. Click 'Start Activation' to begin — you'll be taken to the operation view.",
        placement: 'bottom',
    },
    // 7
    {
        id: 'page-layout',
        title: 'The Operation View',
        body: "You're now in your activation. The left half is your QSO logbook — this is where you'll record each contact. The right half is the radio — this is where you'll communicate with simulated hunters.",
    },
    // 8
    {
        id: 'chat-area',
        target: '[data-tutorial="chat-area"]',
        title: 'The Chat Window',
        body: "Messages from hunters appear here as they respond to your calls. Your own transmissions show up on the left side in green. Incoming messages animate character by character, just like copying CW.",
        placement: 'left',
    },
    // 9
    {
        id: 'guided-input-tour',
        target: '[data-tutorial="guided-input"]',
        title: 'The Guided Input',
        body: "With Guided QSOs enabled, the suggested exchange text appears in gray. Start typing and the characters turn green as you match them — or red if something doesn't fit. Press Enter to send. You don't have to use the guide, but it's there to help.",
        placement: 'top',
    },
    // 10
    {
        id: 'volume',
        target: '[data-tutorial="volume-control"]',
        title: 'Audio Controls',
        body: "Hunters respond in Morse code over simulated audio. Use the volume slider to adjust the level, or click the speaker icon to mute. Try turning up the volume so you can hear W1AW when they call back.",
        placement: 'top',
    },
    // 11
    {
        id: 'keyer',
        target: '[data-tutorial="keyer-area"]',
        title: 'The CW Keyer',
        body: "This simulates a set of paddles. Click the keyer to focus it, then use the keyboard shortcuts shown to key dit and dah. Characters appear in the input above as you decode them. If you send HH (8 dits), it clears the last word — the standard error correction prosign.",
        placement: 'top',
    },
    // 12
    {
        id: 'log-intro',
        target: '[data-tutorial="log-container"]',
        title: 'The QSO Log',
        body: "The log is where you record each contact. The counter at the top shows your progress — you need 10 unique contacts to complete the activation. Let's work your first contact now!",
        placement: 'right',
    },
    // 13
    {
        id: 'work-qso',
        target: '[data-tutorial="conversation-area"]',
        title: 'Work Your First Contact',
        body: "Time to get on the air. The guide shows you what to send — type it out and press Enter to call CQ, then follow the guide through the full exchange with W1AW. This step will advance automatically once the QSO is complete.",
        placement: 'left',
        canAdvance({ tutorialActivationId: _ }) {
            return useChatStore().messages.some(
                m => m.originator === 'W1AW' && m.message === 'EE'
            )
        },
    },
    // 14
    {
        id: 'log-qso',
        target: '[data-tutorial="log-form"]',
        title: 'Log the Contact',
        body: "Great QSO! Fill in the highlighted form: W1AW for callsign, 599 for RSTs (press Enter in an empty RST field to auto-fill), and OH for state. Press Enter or click Log when done.",
        placement: 'right',
        canAdvance({ tutorialActivationId }) {
            if (!tutorialActivationId) return false
            return (useActivationStore().getById(tutorialActivationId)?.qsoList.length ?? 0) >= 1
        },
    },
    // 15
    {
        id: 'see-table',
        target: '[data-tutorial="log-table"]',
        title: 'Your Log Table',
        body: "W1AW is now in your log. Each row shows the UTC time, callsign, sent and received RSTs, and their state. Click a row to edit it, or use the × button to remove a contact. Click Next to continue.",
        placement: 'center',
    },
    // 16
    {
        id: 'nearly-there',
        target: '[data-tutorial="activation-badge"]',
        title: 'Almost There!',
        body: "You now have 9 contacts logged — one away from a full activation. Let's work one final contact to complete it.",
        placement: 'bottom',
    },
    // 17
    {
        id: 'work-tenth',
        target: '[data-tutorial="conversation-area"]',
        title: 'Work the Final Contact',
        body: "Send CQ again and work one more contact. Follow the guide through the exchange. This step will advance automatically once the exchange wraps up.",
        placement: 'left',
        canAdvance({ tutorialActivationId: _ }) {
            return useChatStore().messages.some(
                m => m.originator === 'KM4BE' && m.message === 'EE'
            )
        },
    },
    // 18
    {
        id: 'log-tenth',
        target: '[data-tutorial="log-form"]',
        title: 'Log the Final Contact',
        body: "Log this last contact. Watch the counter at the top — it'll flip to 'Activated' once you save it.",
        placement: 'top',
        canAdvance({ tutorialActivationId }) {
            if (!tutorialActivationId) return false
            return (useActivationStore().getById(tutorialActivationId)?.qsoList.length ?? 0) >= 10
        },
    },
    // 19
    {
        id: 'end-activation',
        target: '[data-tutorial="toggle-activation-btn"]',
        title: 'End the Activation',
        body: "When you're done working contacts, click 'End Activation' to close out the session. This marks the activation complete, disables the chat and log form, and locks in your results.",
        placement: 'bottom',
        canAdvance({ tutorialActivationId }) {
            if (!tutorialActivationId) return false
            return useActivationStore().getById(tutorialActivationId)?.endedAt != null
        },
    },
    // 20
    {
        id: 'done',
        title: "You're Ready to Activate!",
        body: "That's everything you need to know. The logbook saves all your activations, the Exchange page has a full CW POTA reference, and Preferences lets you tune the difficulty. Good luck on the air — 73!",
    },
]
