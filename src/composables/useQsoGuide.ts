import { ref, computed, type Ref } from 'vue'
import { getConversationAiService } from '@/services/conversationAiService'
import type { Station } from '@/types/station'

export type GuidePhase =
    | { phase: 'cq' }
    | { phase: 'wait_hunters' }
    | { phase: 'pick_hunter' }
    | { phase: 'wait_confirm'; hunter: Station }
    | { phase: 'close'; hunter: Station }

function getGreeting(): string {
    const hour = new Date().getHours()
    if (hour < 12) return 'GM'
    if (hour < 17) return 'GA'
    return 'GE'
}

function charMatches(typed: string, expected: string): boolean {
    return typed === expected || (expected === '9' && typed === 'N')
}

function buildResponseText(hunter: Station, activationState: string, activationPark: string): string {
    const greeting = getGreeting()
    const state = activationState.toUpperCase()
    if (hunter.park2parkID) {
        const park = activationPark.replace(/^US-/, 'K')
        return `${hunter.callsign} TU ${greeting} UR 599 599 ${state} ${state} ${park} ${park} BK`
    }
    return `${hunter.callsign} TU ${greeting} UR 599 599 ${state} ${state} BK`
}

export function useQsoGuide(
    activationCallsign: string,
    activationState: string,
    activationPark: string,
    typedMessage: Ref<string>,
) {
    const phase = ref<GuidePhase>({ phase: 'cq' })

    const expectedText = computed<string>(() => {
        const p = phase.value
        const ai = getConversationAiService()

        if (p.phase === 'cq') {
            return `CQ CQ POTA DE ${activationCallsign} K`
        }

        if (p.phase === 'pick_hunter') {
            const firstWord = typedMessage.value.trim().toUpperCase().split(/\s+/)[0] ?? ''
            if (!firstWord) return ''
            const matched = ai.getActiveStations().find(
                s => s.callsign.toUpperCase() === firstWord && s.qsoStep === 'HUNTER_CALL',
            )
            return matched ? buildResponseText(matched, activationState, activationPark) : ''
        }

        if (p.phase === 'close') {
            const sc = p.hunter.state.code.toUpperCase()
            return `BK TU ${sc} ${sc} 73 EE`
        }

        return ''
    })

    const hintLabel = computed<string>(() => {
        const p = phase.value
        const ai = getConversationAiService()

        switch (p.phase) {
            case 'cq':
                return 'Step 1: Call CQ to get hunters on the frequency'
            case 'wait_hunters':
                return 'Waiting for hunters to respond...'
            case 'pick_hunter': {
                const firstWord = typedMessage.value.trim().toUpperCase().split(/\s+/)[0] ?? ''
                const matched = firstWord
                    ? ai.getActiveStations().find(
                          s => s.callsign.toUpperCase() === firstWord && s.qsoStep === 'HUNTER_CALL',
                      )
                    : null
                if (matched) {
                    return `Working ${matched.callsign}${matched.park2parkID ? ' (P2P)' : ''}`
                }
                const calling = ai.getActiveStations().filter(s => s.qsoStep === 'HUNTER_CALL')
                if (calling.length === 0) return 'Hunters are on the way, stand by...'
                return `Hunters calling — pick one: ${calling.map(h => h.callsign).join(', ')}`
            }
            case 'wait_confirm':
                return `Waiting for ${p.hunter.callsign} to send their report...`
            case 'close':
                return `Close the QSO with ${p.hunter.callsign}${p.hunter.park2parkID ? ' (P2P)' : ''}`
        }
    })

    function isAllGreen(typed: string): boolean {
        const expected = expectedText.value
        if (!expected) return false
        const t = typed.trim().toUpperCase()
        const e = expected.toUpperCase()
        if (t.length !== e.length) return false
        return t.split('').every((c, i) => charMatches(c, e[i] ?? ''))
    }

    function onUserSend(message: string): void {
        const p = phase.value

        if (p.phase === 'cq' && isAllGreen(message)) {
            phase.value = { phase: 'wait_hunters' }
            return
        }

        if (p.phase === 'pick_hunter' && isAllGreen(message)) {
            const firstWord = message.trim().toUpperCase().split(/\s+/)[0] ?? ''
            const picked = getConversationAiService().getActiveStations()
                .find(s => s.callsign.toUpperCase() === firstWord)
            if (picked) phase.value = { phase: 'wait_confirm', hunter: picked }
            return
        }

        if (p.phase === 'close' && isAllGreen(message)) {
            const remaining = getConversationAiService().getActiveStations()
                .filter(s => s.callsign !== p.hunter.callsign)
            phase.value = remaining.length > 0
                ? { phase: 'wait_hunters' }
                : { phase: 'cq' }
        }
    }

    function onHunterMessage(originator: string): void {
        const p = phase.value

        if (p.phase === 'wait_hunters') {
            phase.value = { phase: 'pick_hunter' }
            return
        }

        if (p.phase === 'close' && originator === p.hunter.callsign) {
            const remaining = getConversationAiService().getActiveStations()
                .filter(s => s.callsign !== p.hunter.callsign)
            phase.value = remaining.length > 0
                ? { phase: 'wait_hunters' }
                : { phase: 'cq' }
            return
        }

        if (p.phase === 'wait_confirm' && originator === p.hunter.callsign) {
            phase.value = { phase: 'close', hunter: p.hunter }
        }
    }

    return { phase, expectedText, hintLabel, isAllGreen, onUserSend, onHunterMessage }
}
