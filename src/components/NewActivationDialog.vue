<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'
import {
    isPotaReference,
    lookupParkByRef,
    searchParks,
    type ParkEntry,
} from '@/composables/usePotaParks'

const emit = defineEmits<{
    start: [parkReference: string, parkName: string, callsign: string, parkState: string]
    cancel: []
}>()

const settings = useSettingsStore()

const parkQuery    = ref('')
const parkState    = ref('')
const callsign     = ref(settings.callsign)
const results      = ref<ParkEntry[]>([])
const selectedPark = ref<ParkEntry | null>(null)

let debounceTimer: ReturnType<typeof setTimeout> | null = null
let suppressSearch = false

watch(parkQuery, (val) => {
    if (suppressSearch) { suppressSearch = false; return }
    selectedPark.value = null
    results.value = []
    if (!val.trim()) return

    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => runSearch(val.trim()), 400)
})

function runSearch(query: string) {
    if (isPotaReference(query)) {
        const single = lookupParkByRef(query)
        results.value = single ? [single] : []
    } else {
        results.value = searchParks(query)
    }
}

function selectPark(park: ParkEntry) {
    selectedPark.value = park
    suppressSearch = true
    parkQuery.value = `${park.reference} — ${park.name}`
    parkState.value = park.states[0] ?? ''
    results.value = []
}

const canStart = computed(() => parkQuery.value.trim().length > 0 && callsign.value.trim().length > 0)

function handleStart() {
    if (!canStart.value) return
    const ref   = selectedPark.value?.reference ?? ''
    const name  = selectedPark.value?.name       ?? parkQuery.value.trim()
    const state = parkState.value.trim().toUpperCase().slice(0, 2)
    emit('start', ref, name, callsign.value.trim().toUpperCase(), state)
}
</script>

<template>
  <div class="overlay" @click.self="emit('cancel')">
    <div class="dialog">
      <h2 class="dialog-title">New Activation</h2>

      <div class="field">
        <label class="field-label">Park Reference or Name</label>
        <div class="search-wrapper">
          <input
            v-model="parkQuery"
            class="field-input"
            type="text"
            placeholder="US-1234 or Park Name…"
            autocomplete="off"
            spellcheck="false"
          />
          <ul v-if="results.length" class="results-list">
            <li
              v-for="park in results"
              :key="park.reference"
              class="result-item"
              @click="selectPark(park)"
            >
              <span class="result-ref">{{ park.reference }}</span>
              <span class="result-name">{{ park.name }}<span v-if="park.states.length" class="result-loc">, {{ park.states.join('/') }}</span></span>
            </li>
          </ul>
          <div v-else-if="parkQuery && results.length === 0 && !selectedPark" class="search-hint muted">
            No parks found — your text will be used as the park name
          </div>
        </div>
      </div>

      <div class="field">
        <label class="field-label">Your Callsign</label>
        <input
          v-model="callsign"
          class="field-input"
          type="text"
          placeholder="N0CALL"
          autocomplete="off"
          spellcheck="false"
          @input="callsign = callsign.toUpperCase()"
        />
      </div>

      <div class="field">
        <label class="field-label">Park State <span class="field-optional">(2-letter code)</span></label>
        <input
          v-model="parkState"
          class="field-input field-input--narrow"
          type="text"
          placeholder="OH"
          autocomplete="off"
          spellcheck="false"
          maxlength="2"
          @input="parkState = parkState.toUpperCase()"
        />
      </div>

      <div class="dialog-actions">
        <button class="btn-cancel" @click="emit('cancel')">Cancel</button>
        <button class="btn-start" :disabled="!canStart" @click="handleStart">
          Start Activation
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.dialog {
  background: #fff;
  border-radius: 10px;
  padding: 32px 36px 28px;
  width: 420px;
  max-width: 90vw;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}

.dialog-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 24px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.field {
  margin-bottom: 18px;
}

.field-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 6px;
}

.search-wrapper {
  position: relative;
}

.field-input {
  width: 100%;
  padding: 9px 11px;
  border: 1px solid #c0c0c0;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: monospace;
  box-sizing: border-box;
  transition: border-color 0.15s, box-shadow 0.15s;
  background: #fafafa;
}

.field-input:focus {
  outline: none;
  border-color: #3771d4;
  background: #fff;
  box-shadow: 0 0 0 2px rgba(55, 113, 212, 0.18);
}

.field-input--narrow {
  width: 80px;
}

.field-optional {
  font-weight: 400;
  color: #aaa;
  text-transform: none;
  letter-spacing: 0;
  font-size: 0.7rem;
}

.results-list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #c0c0c0;
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  list-style: none;
  margin: 0;
  padding: 4px 0;
  z-index: 10;
  max-height: 220px;
  overflow-y: auto;
}

.result-item {
  display: flex;
  flex-direction: column;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.1s;
}

.result-item:hover {
  background: #f0f4ff;
}

.result-ref {
  font-family: monospace;
  font-weight: 600;
  font-size: 0.85rem;
  color: #3771d4;
}

.result-name {
  font-size: 0.88rem;
  color: #333;
}

.result-loc {
  color: #888;
}

.search-hint {
  font-size: 0.78rem;
  color: #3771d4;
  margin-top: 4px;
}

.search-hint.muted {
  color: #999;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 28px;
}

.btn-cancel {
  padding: 8px 18px;
  background: none;
  border: 1px solid #c0c0c0;
  border-radius: 5px;
  font-size: 0.9rem;
  cursor: pointer;
  color: #555;
  transition: background 0.15s;
}

.btn-cancel:hover {
  background: #f5f5f5;
}

.btn-start {
  padding: 8px 22px;
  background: #3771d4;
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-start:hover:not(:disabled) {
  background: #2b5aab;
}

.btn-start:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
