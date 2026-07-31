<script lang="ts" setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useMobileDetect } from '@/composables/useMobileDetect'

const props = defineProps<{
    modelValue: string
    expectedText: string
    hintLabel: string
    readonly?: boolean
}>()

const emit = defineEmits<{
    'update:modelValue': [value: string]
    'send': []
}>()

const { isMobile } = useMobileDetect()

const inputEl = ref<HTMLElement | null>(null)
const mobileInputEl = ref<HTMLInputElement | null>(null)
const isFocused = ref(false)

// On mobile, the div can't open the virtual keyboard, so we overlay a real
// <input> that captures keyboard events and delegates to the same handlers.
function handleMobileInput(e: Event): void {
    if (props.readonly) return
    emit('update:modelValue', (e.target as HTMLInputElement).value.toUpperCase())
}

// When the hidden input gains focus, seed it with any value the keyer may have
// typed while the keyboard was closed so subsequent typing appends correctly.
function onMobileInputFocus(): void {
    isFocused.value = true
    if (mobileInputEl.value) mobileInputEl.value.value = props.modelValue
}

function handleKeydown(e: KeyboardEvent): void {
    if (props.readonly) return
    if (e.key === 'Enter') { e.preventDefault(); emit('send'); return }
    if (e.key === 'Backspace') {
        e.preventDefault()
        emit('update:modelValue', props.modelValue.slice(0, -1))
        return
    }
    if (e.ctrlKey || e.altKey || e.metaKey) return
    if (e.key.length === 1) {
        e.preventDefault()
        emit('update:modelValue', (props.modelValue + e.key).toUpperCase())
    }
}

function normalize(s: string): string {
    return s.replace(/<BK>/gi, 'BK')
}

function charMatches(typed: string, expected: string): boolean {
    return typed === expected || (expected === '9' && typed === 'N')
}

type CharState = 'correct' | 'incorrect' | 'hint' | 'plain'
interface DisplayChar { char: string; state: CharState }

const typedChars = computed<DisplayChar[]>(() => {
    const typed    = normalize(props.modelValue)
    const expected = normalize(props.expectedText ?? '')
    if (!expected) {
        return typed.split('').map(c => ({ char: c, state: 'plain' as const }))
    }
    return typed.split('').map((c, i) => {
        const e = expected[i]
        if (e === undefined) return { char: c, state: 'incorrect' as const }
        return {
            char: c,
            state: charMatches(c.toUpperCase(), e.toUpperCase()) ? 'correct' as const : 'incorrect' as const,
        }
    })
})

const hintChars = computed<DisplayChar[]>(() => {
    const typed    = normalize(props.modelValue)
    const expected = normalize(props.expectedText ?? '')
    if (!expected) return []
    return expected.slice(typed.length).split('').map(c => ({ char: c, state: 'hint' as const }))
})

watch(() => props.modelValue, async (val) => {
    // When message is sent the parent resets modelValue to ''.
    // Clear the hidden input so the next message starts fresh.
    if (!val && mobileInputEl.value) mobileInputEl.value.value = ''

    // Desktop: restore focus to the display div after the keyer appends a char.
    // Skip on mobile — refocusing the div would steal focus from the real input
    // and close the virtual keyboard.
    if (!isFocused.value || isMobile.value) return
    await nextTick()
    inputEl.value?.focus()
})
</script>

<template>
  <div class="guided-input-wrapper" data-tutorial="guided-input">
    <div class="guide-hint-label">{{ hintLabel }}</div>
    <div class="guided-input-outer">
      <div
        ref="inputEl"
        class="guided-input"
        :class="{ 'guided-input--focused': isFocused }"
        tabindex="0"
        @keydown="handleKeydown"
        @focus="isFocused = true"
        @blur="isFocused = false"
      >
      <span
        v-for="(ch, i) in typedChars"
        :key="`t-${i}`"
        :class="`char-${ch.state}`"
      >{{ ch.char }}</span>
      <span v-if="isFocused && !readonly" class="cursor"></span>
      <span
        v-for="(ch, i) in hintChars"
        :key="`h-${i}`"
        class="char-hint"
      >{{ ch.char }}</span>
      <span
        v-if="!modelValue && !expectedText && !isFocused"
        class="char-hint placeholder-text"
      >Type your message here...</span>
    </div>

    <!-- Transparent real input overlaid on the display div so the Android
         virtual keyboard opens on tap. The display div handles all visuals;
         this input only exists to receive native keyboard events. -->
    <input
      v-if="isMobile"
      ref="mobileInputEl"
      class="guided-input-mobile"
      type="text"
      @input="handleMobileInput"
      @keydown.enter.prevent="$emit('send')"
      @focus="onMobileInputFocus"
      @blur="isFocused = false"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
    />
    </div>
  </div>
</template>

<style scoped>
.guided-input-wrapper {
    display: flex;
    flex-direction: column;
    width: 80%;
    gap: 6px;
}

.guided-input-outer {
    position: relative;
}

/* Transparent real input that sits over the display div on mobile.
   Its only job is to open the Android virtual keyboard on tap. */
.guided-input-mobile {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: text;
    font-size: 16px; /* prevents iOS auto-zoom on focus */
    border: none;
    background: transparent;
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
}

.guide-hint-label {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    color: var(--accent-text);
    padding: 0 2px;
    min-height: 1em;
}

.guided-input {
    min-height: 52px;
    padding: 10px 12px;
    border: 1px solid var(--border-strong);
    border-radius: 6px;
    font-size: 16px;
    font-family: var(--font-mono);
    background: var(--bg-input);
    color: var(--text-primary);
    cursor: text;
    outline: none;
    white-space: pre-wrap;
    word-break: break-all;
    line-height: 1.6;
    transition: border-color 0.15s, box-shadow 0.15s;
}

.guided-input--focused {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-shadow);
}

.char-correct {
    color: #22c55e;
}

.char-incorrect {
    color: #ef4444;
}

.char-hint {
    color: var(--text-faint);
}

.char-plain {
    color: var(--text-primary);
}

.placeholder-text {
    font-family: var(--font-sans);
    font-size: 0.95rem;
    opacity: 0.6;
}

.cursor {
    display: inline-block;
    width: 2px;
    height: 1.1em;
    background-color: var(--text-primary);
    vertical-align: text-bottom;
    margin-right: -2px;
    animation: blink 1s step-end infinite;
}

@keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
}
</style>
