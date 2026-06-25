<script lang="ts" setup>
import { ref, nextTick, watch, useTemplateRef, computed } from 'vue'
import { useQsoUtils } from '../composables/useQsoUtils'
import type { QSO } from '../types/activation'

const props = defineProps<{ qsoList: QSO[] }>()
const emit  = defineEmits<{ 'add-qso': [qso: QSO] }>()

const tableContainer   = useTemplateRef<HTMLDivElement>('tableContainer')
const theirCallInput   = useTemplateRef<HTMLInputElement>('theirCallInput')
const sentRSTInput     = useTemplateRef<HTMLInputElement>('sentRSTInput')
const receivedRSTInput = useTemplateRef<HTMLInputElement>('receivedRSTInput')
const theirStateInput  = useTemplateRef<HTMLInputElement>('theirStateInput')
const theirParkInput   = useTemplateRef<HTMLInputElement>('theirParkInput')

const uniqueContactCount = computed(() => new Set(props.qsoList.map(q => q.theirCall)).size)
const isActivated = computed(() => uniqueContactCount.value >= 10)

const isP2P = ref(false)
const newQSO = ref<QSO>({ date: '', theirCall: '', sentRST: '', receivedRST: '', theirState: '' })

const theirCallError   = computed(() => newQSO.value.theirCall.length   > 0 && !useQsoUtils().validateCall(newQSO.value.theirCall.toUpperCase()))
const sentRstError     = computed(() => newQSO.value.sentRST.length     > 0 && !useQsoUtils().validateRST(newQSO.value.sentRST))
const receivedRstError = computed(() => newQSO.value.receivedRST.length > 0 && !useQsoUtils().validateRST(newQSO.value.receivedRST))
const stateError = computed(() => newQSO.value.theirState.length > 0 && !useQsoUtils().validateState(newQSO.value.theirState))

function toggleP2P() {
  isP2P.value = !isP2P.value
  if (!isP2P.value) newQSO.value.theirPark = ''
}

function onStateEnter() {
  if (isP2P.value) theirParkInput.value?.focus()
  else addQSO()
}

function addQSO() {
  newQSO.value.theirCall   = newQSO.value.theirCall.toUpperCase().replace(/\s+/g, '')
  newQSO.value.sentRST     = newQSO.value.sentRST.replace(/\s+/g, '')
  newQSO.value.receivedRST = newQSO.value.receivedRST.replace(/\s+/g, '')
  newQSO.value.date        = new Date().toLocaleTimeString('en-US', {
    timeZone: 'UTC', hour12: false, hour: '2-digit', minute: '2-digit',
  }) + 'z'

  if (!useQsoUtils().validateCall(newQSO.value.theirCall))  return
  if (!useQsoUtils().validateRST(newQSO.value.sentRST))     return
  if (!useQsoUtils().validateRST(newQSO.value.receivedRST)) return

  newQSO.value.theirState = newQSO.value.theirState.toUpperCase().replace(/\s+/g, '')
  if (!useQsoUtils().validateState(newQSO.value.theirState)) return

  if (isP2P.value) {
    newQSO.value.theirPark = (newQSO.value.theirPark ?? '').toUpperCase().replace(/\s+/g, '')
    if (!newQSO.value.theirPark) return
  } else {
    newQSO.value.theirPark = ''
  }

  emit('add-qso', { ...newQSO.value })
  newQSO.value = { date: '', theirCall: '', sentRST: '', receivedRST: '', theirState: '' }
  isP2P.value = false
  theirCallInput.value?.focus()
}

function onRstKeydown(event: KeyboardEvent, field: 'sentRST' | 'receivedRST', next: HTMLInputElement | null) {
  if (event.key !== 'Enter') return
  if (!newQSO.value[field]) {
    event.preventDefault()
    newQSO.value[field] = '599'
    next?.focus()
  } else {
    addQSO()
  }
}

watch(() => props.qsoList.length, async () => {
  await nextTick()
  if (tableContainer.value) tableContainer.value.scrollTop = tableContainer.value.scrollHeight
})
</script>

<template>
  <div class="log-container">

    <div class="log-header">
      <h2 class="log-title">QSO Log</h2>
      <div class="activation-badge" :class="{ activated: isActivated }">
        <span v-if="!isActivated">{{ uniqueContactCount }}&thinsp;/&thinsp;10</span>
        <span v-else>✓ Activated</span>
      </div>
    </div>

    <div class="table-wrapper" ref="tableContainer">
      <table class="qso-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Callsign</th>
            <th>Sent</th>
            <th>Rcvd</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(qso, index) in qsoList" :key="index">
            <td class="mono">{{ qso.date }}</td>
            <td class="mono">{{ qso.theirCall }}</td>
            <td class="mono">{{ qso.sentRST }}</td>
            <td class="mono">{{ qso.receivedRST }}</td>
            <td class="mono exch-cell">
              {{ qso.theirState }}<template v-if="qso.theirPark"><span class="exch-sep">·</span>{{ qso.theirPark }}<span class="p2p-badge">P2P</span></template>
            </td>
          </tr>
          <tr v-if="qsoList.length === 0" class="empty-row">
            <td colspan="5">No contacts logged yet.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="input-row">
      <div class="input-field">
        <label for="callsign">Callsign</label>
        <input
          id="callsign"
          ref="theirCallInput"
          v-model="newQSO.theirCall"
          type="text"
          autocomplete="off" spellcheck="false" autocorrect="off"
          @input="newQSO.theirCall = newQSO.theirCall.toUpperCase()"
          :class="{ error: theirCallError }"
          @keydown.enter="addQSO"
        />
      </div>

      <div class="input-field input-field--fixed">
        <label for="sentRST">Sent RST</label>
        <input
          id="sentRST"
          ref="sentRSTInput"
          v-model="newQSO.sentRST"
          type="text"
          autocomplete="off" spellcheck="false"
          :class="{ error: sentRstError }"
          @keydown="onRstKeydown($event, 'sentRST', receivedRSTInput)"
        />
      </div>

      <div class="input-field input-field--fixed">
        <label for="receivedRST">Rcvd RST</label>
        <input
          id="receivedRST"
          ref="receivedRSTInput"
          v-model="newQSO.receivedRST"
          type="text"
          autocomplete="off" spellcheck="false"
          :class="{ error: receivedRstError }"
          @keydown="onRstKeydown($event, 'receivedRST', theirStateInput)"
        />
      </div>

      <div class="input-field input-field--fixed">
        <label for="theirState">State</label>
        <input
          id="theirState"
          ref="theirStateInput"
          v-model="newQSO.theirState"
          type="text"
          autocomplete="off" spellcheck="false"
          @input="newQSO.theirState = newQSO.theirState.toUpperCase()"
          :class="{ error: stateError }"
          @keydown.enter="onStateEnter"
        />
      </div>

      <div class="input-field input-field--p2p">
        <label>&nbsp;</label>
        <button class="p2p-toggle" :class="{ active: isP2P }" @click.prevent="toggleP2P" tabindex="-1">P2P</button>
      </div>

      <div v-if="isP2P" class="input-field input-field--narrow">
        <label for="theirPark">Park Ref</label>
        <input
          id="theirPark"
          ref="theirParkInput"
          v-model="newQSO.theirPark"
          type="text"
          placeholder="K1995"
          autocomplete="off" spellcheck="false"
          @input="newQSO.theirPark = (newQSO.theirPark ?? '').toUpperCase()"
          @keydown.enter="addQSO"
        />
      </div>

      <div class="input-field input-field--btn">
        <label>&nbsp;</label>
        <button class="add-button" @click="addQSO">Log</button>
      </div>
    </div>

  </div>
</template>

<style scoped>
.log-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px 24px 16px;
  box-sizing: border-box;
  background: #fff;
}

.log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  flex-shrink: 0;
}

.log-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.activation-badge {
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 600;
  background: #f0f0f0;
  color: #555;
  letter-spacing: 0.03em;
  transition: background-color 0.3s, color 0.3s;
}

.activation-badge.activated {
  background: #d1fae5;
  color: #065f46;
}

.table-wrapper {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #c0c0c0;
  border-radius: 6px;
  margin-bottom: 14px;
}

.qso-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}

.qso-table thead {
  position: sticky;
  top: 0;
  z-index: 1;
}

.qso-table th {
  background: #f7f7f8;
  color: #666;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #c0c0c0;
}

.qso-table td {
  padding: 7px 12px;
  color: #222;
  border-bottom: 1px solid #e0e0e0;
}

.qso-table tbody tr:last-child td {
  border-bottom: none;
}

.qso-table tbody tr:nth-child(even) td {
  background: #f0f0f3;
}

.qso-table tbody tr:hover td {
  background: #e8e8ed;
}

.mono {
  font-family: monospace;
  letter-spacing: 0.04em;
}

.empty-row td {
  text-align: center;
  color: #aaa;
  font-style: italic;
  padding: 24px 0;
}

.input-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  flex-shrink: 0;
}

.input-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 2;
}

.input-field--narrow {
  flex: 1;
}

.input-field--fixed {
  flex: 0 0 72px;
}

.input-field--p2p {
  flex: 0 0 auto;
}

.input-field--btn {
  flex: 0 0 auto;
}

.input-field label {
  font-size: 0.72rem;
  font-weight: 600;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.input-field input {
  width: 100%;
  padding: 7px 9px;
  border: 1px solid #d4d4d4;
  border-radius: 5px;
  font-size: 0.9rem;
  font-family: monospace;
  box-sizing: border-box;
  transition: border-color 0.15s, box-shadow 0.15s;
  background: #fafafa;
}

.input-field input:focus {
  outline: none;
  border-color: #3771d4;
  background: #fff;
  box-shadow: 0 0 0 2px rgba(55, 113, 212, 0.18);
}

.input-field input.error {
  border-color: #e53e3e;
  box-shadow: 0 0 0 2px rgba(229, 62, 62, 0.15);
}

.add-button {
  padding: 7px 18px;
  background: #3771d4;
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s;
  white-space: nowrap;
}

.add-button:hover {
  background: #2b5aab;
}

.p2p-toggle {
  width: 100%;
  padding: 7px 9px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  border: 1px solid #d4d4d4;
  border-radius: 5px;
  background: #fafafa;
  color: #aaa;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.p2p-toggle.active {
  background: #dbeafe;
  color: #1d4ed8;
  border-color: #93c5fd;
}

.p2p-toggle:hover:not(.active) {
  border-color: #b0b0b0;
  color: #777;
}

.exch-cell {
  white-space: nowrap;
}

.exch-sep {
  margin: 0 5px;
  color: #ccc;
  font-weight: 400;
}

.p2p-badge {
  margin-left: 5px;
  padding: 1px 5px;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 4px;
  vertical-align: middle;
}
</style>
