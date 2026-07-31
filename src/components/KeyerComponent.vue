<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useSettingsStore } from '@/stores/settingsStore';
import { useKeyer } from '@/composables/useKeyer';
import { keyLabel } from '@/utils/keyLabel';
import { useMobileDetect } from '@/composables/useMobileDetect';

const emit = defineEmits<{
    character:    [char: string];
    'delete-word': [];
    send:         [];
}>();

const settings = useSettingsStore();
const { isMobile } = useMobileDetect();

const showOnScreenKeys = computed(() =>
    isMobile.value && settings.mobileInputMethod === 'on-screen'
);
const {
    onDitDown, onDitUp, onDahDown, onDahUp, cleanup,
    isDitPressed, isDahPressed,
    decodedCharCount, lastDecodedChar, errorSignal,
} = useKeyer();

watch(decodedCharCount, () => { emit('character', lastDecodedChar.value); });
watch(errorSignal,      () => { emit('delete-word'); });

const isFocused = ref(false);

const keyerTypeLabel = computed(() => {
    switch (settings.keyerType) {
        case 'straight':  return 'Straight Key';
        case 'iambic-a':  return 'Iambic A';
        case 'iambic-b':  return 'Iambic B';
    }
});

const ditLabel = computed(() => settings.keyerType === 'straight' ? 'Key' : 'Dit');
const dahLabel = computed(() => settings.keyerType === 'straight' ? 'Key' : 'Dah');

function onFocus() {
    isFocused.value = true;
}

function onBlur() {
    isFocused.value = false;
    cleanup();
}

function onKeyDown(event: KeyboardEvent) {
    const isDit = event.code === settings.ditKey || event.key === settings.ditKey;
    const isDah = event.code === settings.dahKey || event.key === settings.dahKey;

    if (isDit) {
        event.preventDefault();
        onDitDown();
    }
    if (isDah) {
        event.preventDefault();
        onDahDown();
    }
    if (!isDit && !isDah && !event.repeat && event.key === 'Enter') {
        event.preventDefault();
        emit('send');
    }
}

function onKeyUp(event: KeyboardEvent) {
    if (event.code === settings.ditKey || event.key === settings.ditKey) {
        event.preventDefault();
        onDitUp();
    }
    if (event.code === settings.dahKey || event.key === settings.dahKey) {
        event.preventDefault();
        onDahUp();
    }
}

// On mobile, the hidden <input> in GuidedInput stays focused after the user
// dismisses the keyboard. Tapping a paddle button while a text input is focused
// causes Android to reopen the keyboard. Blurring the active element first
// prevents that without affecting keyer functionality.
function onDitPress() {
    (document.activeElement as HTMLElement)?.blur();
    onDitDown();
}

function onDahPress() {
    (document.activeElement as HTMLElement)?.blur();
    onDahDown();
}
</script>

<template>
  <!-- On-screen paddle buttons (mobile, on-screen mode) -->
  <div v-if="showOnScreenKeys" class="on-screen-keyer" data-tutorial="keyer-area">
    <button
      class="paddle-btn dit-btn"
      :class="{ lit: isDitPressed }"
      @pointerdown.prevent="onDitPress"
      @pointerup.prevent="onDitUp"
      @pointerleave="onDitUp"
      @pointercancel="onDitUp"
    >
      <span class="paddle-label">{{ ditLabel }}</span>
      <span class="paddle-sub">·</span>
    </button>
    <button
      class="paddle-btn dah-btn"
      :class="{ lit: isDahPressed }"
      @pointerdown.prevent="onDahPress"
      @pointerup.prevent="onDahUp"
      @pointerleave="onDahUp"
      @pointercancel="onDahUp"
    >
      <span class="paddle-label">{{ dahLabel }}</span>
      <span class="paddle-sub">− − −</span>
    </button>
  </div>

  <!-- Keyboard keyer (desktop or mobile keyboard mode) -->
  <div
    v-else
    class="keyer-area"
    :class="{ focused: isFocused }"
    tabindex="0"
    data-tutorial="keyer-area"
    @focus="onFocus"
    @blur="onBlur"
    @keydown="onKeyDown"
    @keyup="onKeyUp"
  >
    <div class="keyer-header">
      <span class="keyer-prompt">{{ isFocused ? 'Keyer Active' : 'Click to use keyer' }}</span>
      <span class="keyer-type-badge">{{ keyerTypeLabel }}</span>
    </div>
    <div class="key-indicators">
      <div class="key-square" :class="{ lit: isDitPressed }">
        <span class="key-label">{{ ditLabel }}</span>
        <span class="key-binding">{{ keyLabel(settings.ditKey) }}</span>
      </div>
      <div class="key-square" :class="{ lit: isDahPressed }">
        <span class="key-label">{{ dahLabel }}</span>
        <span class="key-binding">{{ keyLabel(settings.dahKey) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.keyer-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 80%;
  margin-top: 12px;
  padding: 10px 16px;
  border: 2px solid var(--border-default);
  border-radius: 8px;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s, background-color 0.15s;
  user-select: none;
}

.keyer-area.focused {
  border-color: var(--accent);
  background-color: var(--accent-light);
  cursor: default;
}

.keyer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.keyer-prompt {
  font-size: 0.82rem;
  color: var(--text-faint);
}

.keyer-area.focused .keyer-prompt {
  color: var(--accent-text);
  font-weight: 500;
}

.keyer-type-badge {
  font-size: 0.72rem;
  padding: 2px 8px;
  background: var(--bg-surface-alt);
  border-radius: 10px;
  color: var(--text-muted);
}

.keyer-area.focused .keyer-type-badge {
  background: var(--accent-light-2);
  color: var(--accent-text);
}

.key-indicators {
  display: flex;
  gap: 16px;
}

.key-square {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 72px;
  height: 60px;
  border: 2px solid var(--border-default);
  border-radius: 6px;
  background: var(--bg-surface-alt);
  transition: background-color 0.04s, border-color 0.04s;
}

.key-square.lit {
  background: var(--accent);
  border-color: var(--accent-hover);
}

.key-label {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.key-square.lit .key-label {
  color: rgba(255, 255, 255, 0.8);
}

.key-binding {
  font-size: 1.15rem;
  font-family: monospace;
  font-weight: 700;
  color: var(--text-secondary);
}

.key-square.lit .key-binding {
  color: #fff;
}

/* ── On-screen paddle buttons ─────────────────────────────────── */

.on-screen-keyer {
  display: flex;
  width: 80%;
  gap: 12px;
  margin-top: 12px;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}

.paddle-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 88px;
  border: 2px solid var(--border-default);
  border-radius: 10px;
  background: var(--bg-surface-alt);
  cursor: pointer;
  transition: background-color 0.04s, border-color 0.04s, transform 0.04s;
  touch-action: none;
  -webkit-touch-callout: none;
}

.paddle-btn:active,
.paddle-btn.lit {
  background: var(--accent);
  border-color: var(--accent-hover);
  transform: scale(0.97);
}

.paddle-label {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.paddle-sub {
  font-size: 1.25rem;
  font-family: var(--font-mono);
  color: var(--text-muted);
  letter-spacing: 0.15em;
}

.paddle-btn.lit .paddle-label,
.paddle-btn.lit .paddle-sub {
  color: #fff;
}
</style>
