<script lang="ts" setup>
import { ref, computed, watch, nextTick } from 'vue'

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

const inputEl = ref<HTMLElement | null>(null)
const isFocused = ref(false)

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

// Restore focus after keyer appends a character externally
watch(() => props.modelValue, async () => {
    if (!isFocused.value) return
    await nextTick()
    inputEl.value?.focus()
})
</script>

<template>
  <div class="guided-input-wrapper" data-tutorial="guided-input">
    <div class="guide-hint-label">{{ hintLabel }}</div>
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
  </div>
</template>

<style scoped>
.guided-input-wrapper {
    display: flex;
    flex-direction: column;
    width: 80%;
    gap: 6px;
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
