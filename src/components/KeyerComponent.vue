<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useSettingsStore } from '@/stores/settingsStore';
import { useKeyer } from '@/composables/useKeyer';
import { keyLabel } from '@/utils/keyLabel';

const emit = defineEmits<{
    character:    [char: string];
    'delete-word': [];
    send:         [];
}>();

const settings = useSettingsStore();
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
</script>

<template>
  <div
    class="keyer-area"
    :class="{ focused: isFocused }"
    tabindex="0"
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
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s, background-color 0.15s;
  user-select: none;
}

.keyer-area.focused {
  border-color: #3771d4;
  background-color: #f0f4ff;
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
  color: #aaa;
}

.keyer-area.focused .keyer-prompt {
  color: #3771d4;
  font-weight: 500;
}

.keyer-type-badge {
  font-size: 0.72rem;
  padding: 2px 8px;
  background: #ebebeb;
  border-radius: 10px;
  color: #666;
}

.keyer-area.focused .keyer-type-badge {
  background: #d0e0ff;
  color: #3771d4;
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
  border: 2px solid #d0d0d0;
  border-radius: 6px;
  background: #f8f8f8;
  transition: background-color 0.04s, border-color 0.04s;
}

.key-square.lit {
  background: #3771d4;
  border-color: #2b5aab;
}

.key-label {
  font-size: 0.68rem;
  font-weight: 600;
  color: #999;
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
  color: #333;
}

.key-square.lit .key-binding {
  color: #fff;
}
</style>
