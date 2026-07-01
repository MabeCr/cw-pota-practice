<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useActivationStore } from '@/stores/activationStore'
import { US_STATES } from '@/constants/states'
import type { Activation, QSO } from '@/types/activation'
import EditActivationDialog from '@/components/EditActivationDialog.vue'

function activationAccuracy(act: Activation): { validated: number; wrong: number } {
    const withResult = act.qsoList.filter(q => q.correct === true || q.correct === false)
    return { validated: withResult.length, wrong: withResult.filter(q => !q.correct).length }
}

const router = useRouter()
const activationStore = useActivationStore()

const activations = computed<Activation[]>(() =>
    [...activationStore.activations].sort(
        (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    )
)

// ── Callsign lookup ───────────────────────────────────────────────────────────

const lookupQuery = ref('')
const hoveredActivationId = ref<string | null>(null)

interface LookupResult {
  activationId: string
  parkReference: string
  parkName: string
  activationDate: string
  qso: QSO
}

const lookupResults = computed<LookupResult[]>(() => {
  const q = lookupQuery.value.trim().toUpperCase()
  if (!q) return []
  const results: LookupResult[] = []
  for (const act of activations.value) {
    for (const qso of act.qsoList) {
      if (qso.theirCall.toUpperCase().includes(q)) {
        results.push({
          activationId: act.id,
          parkReference: act.parkReference,
          parkName: act.parkName,
          activationDate: formatDate(act.startedAt),
          qso,
        })
      }
    }
  }
  return results
})

// ── Heatmaps ──────────────────────────────────────────────────────────────────

const activationsByState = computed(() => {
  const counts = new Map<string, number>()
  for (const act of activations.value) {
    if (act.parkState) {
      counts.set(act.parkState, (counts.get(act.parkState) ?? 0) + 1)
    }
  }
  return counts
})

const contactsByState = computed(() => {
  const counts = new Map<string, number>()
  for (const act of activations.value) {
    for (const qso of act.qsoList) {
      const s = qso.theirState?.trim().toUpperCase()
      if (s) counts.set(s, (counts.get(s) ?? 0) + 1)
    }
  }
  return counts
})

const maxActivationCount = computed(() =>
  Math.max(1, ...activationsByState.value.values())
)

const maxContactCount = computed(() =>
  Math.max(1, ...contactsByState.value.values())
)

const hoveredActivation = computed(() =>
  hoveredActivationId.value
    ? (activations.value.find(a => a.id === hoveredActivationId.value) ?? null)
    : null
)

const hoveredParkState = computed(() =>
  hoveredActivation.value?.parkState ?? null
)

const hoveredContactStates = computed(() => {
  if (!hoveredActivation.value) return new Set<string>()
  return new Set(
    hoveredActivation.value.qsoList
      .map(q => q.theirState?.trim().toUpperCase())
      .filter((s): s is string => !!s)
  )
})

function heatBg(count: number, max: number): string {
  if (count === 0) return '#efefef'
  const t = Math.min(count / max, 1)
  const l = Math.round(75 - t * 45) // 75% (light blue) → 30% (dark blue)
  return `hsl(220, 65%, ${l}%)`
}

function heatFg(count: number, max: number): string {
  if (count === 0) return '#bbb'
  const t = Math.min(count / max, 1)
  const l = Math.round(75 - t * 45)
  return l > 52 ? '#1e3a6e' : '#fff'
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
    })
}

function resume(id: string) {
    void router.push(`/operation/${id}`)
}

function uniqueContacts(act: Activation): number {
    return new Set(act.qsoList.map(q => q.theirCall)).size
}

function deleteActivation(id: string, parkName: string) {
    if (!confirm(`Delete the activation for "${parkName}"? This cannot be undone.`)) return
    activationStore.deleteActivation(id)
}

// ── Accuracy column ──────────────────────────────────────────────────────────

const hasAnyValidation = computed(() =>
    activations.value.some(act => act.validationMode && act.validationMode !== 'none')
)

function accuracyClass(act: Activation): string {
    const { wrong } = activationAccuracy(act)
    if (wrong === 0) return 'accuracy-perfect'
    if (wrong <= 2)  return 'accuracy-warn'
    return 'accuracy-bad'
}

function accuracyTitle(act: Activation): string {
    const { validated, wrong } = activationAccuracy(act)
    if (wrong === 0) return `All ${validated} QSO${validated !== 1 ? 's' : ''} logged correctly`
    return `${wrong} mistake${wrong !== 1 ? 's' : ''} across ${validated} validated QSO${validated !== 1 ? 's' : ''}`
}

function accuracyDisplay(act: Activation): string {
    const { wrong } = activationAccuracy(act)
    return wrong === 0 ? '✓' : String(wrong)
}

// ── Edit activation ───────────────────────────────────────────────────────────

const editingActivation = ref<Activation | null>(null)

function openEdit(act: Activation) {
    editingActivation.value = act
}

function saveEdit(fields: { parkReference: string; parkName: string; parkState: string; callsign: string }) {
    if (!editingActivation.value) return
    activationStore.updateActivation(editingActivation.value.id, fields)
    editingActivation.value = null
}
</script>

<template>
  <div class="logbook-root">

    <!-- Left: activation list + heatmaps (3/4) -->
    <div class="activation-panel">
      <div class="panel-header">
        <h2 class="panel-title">Logbook</h2>
        <span class="logbook-count">{{ activations.length }} activation{{ activations.length !== 1 ? 's' : '' }}</span>
      </div>

      <div class="table-wrapper">
        <table class="logbook-table" v-if="activations.length">
          <thead>
            <tr>
              <th title="The POTA park reference number">Park</th>
              <th title="The callsign that operated the station for the activation">Callsign</th>
              <th title="The date the activation was started">Date</th>
              <th class="center" title="Unique contacts (/ total if duplicates exist)">QSOs</th>
              <th class="center" title="An indicator showing whether the park was activated">Activated</th>
              <th title="The status of the activation">Status</th>
              <th v-if="hasAnyValidation" class="center" title="QSO logging accuracy">Accuracy</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="act in activations"
              :key="act.id"
              :class="{ 'row-highlighted': act.id === hoveredActivationId }"
              @mouseenter="hoveredActivationId = act.id"
              @mouseleave="hoveredActivationId = null"
            >
              <td>
                <span v-if="act.parkReference" class="park-ref">{{ act.parkReference }}</span>
                <span class="park-name">{{ act.parkName }}</span>
              </td>
              <td class="mono">{{ act.callsign }}</td>
              <td class="mono">{{ formatDate(act.startedAt) }}</td>
              <td class="mono center">
                {{ uniqueContacts(act) }}<span v-if="act.qsoList.length !== uniqueContacts(act)" class="qso-total"> / {{ act.qsoList.length }}</span>
              </td>
              <td class="center">
                <span class="activated-icon" :class="uniqueContacts(act) >= 10 ? 'icon-yes' : 'icon-no'">
                  {{ uniqueContacts(act) >= 10 ? '✓' : '✗' }}
                </span>
              </td>
              <td>
                <span class="badge" :class="act.endedAt ? 'badge-ended' : 'badge-active'">
                  {{ act.endedAt ? 'Ended' : 'Active' }}
                </span>
              </td>
              <td v-if="hasAnyValidation" class="center">
                <template v-if="act.validationMode && act.validationMode !== 'none'">
                  <span
                    v-if="act.validationMode === 'completed' && !act.endedAt"
                    class="accuracy-pending"
                    title="Accuracy revealed when activation ends"
                  >–</span>
                  <span
                    v-else-if="activationAccuracy(act).validated > 0"
                    class="accuracy-badge"
                    :class="accuracyClass(act)"
                    :title="accuracyTitle(act)"
                  >{{ accuracyDisplay(act) }}</span>
                  <span v-else class="accuracy-none">–</span>
                </template>
                <span v-else class="accuracy-none">–</span>
              </td>
              <td class="action-cell">
                <button :class="act.endedAt ? 'view-btn' : 'resume-btn'" @click="resume(act.id)">
                  {{ act.endedAt ? 'View' : 'Resume' }}
                </button>
                <button class="edit-btn" @click.stop="openEdit(act)" title="Edit activation">✎</button>
                <button class="delete-btn" @click="deleteActivation(act.id, act.parkName)" title="Delete activation">✕</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="empty-state">
          <p>No activations yet.</p>
          <p class="empty-sub">Head to <strong>Operation</strong> to start your first one.</p>
        </div>
      </div>

      <!-- Heatmaps -->
      <div class="heatmaps-row">
        <div class="heatmap-section">
          <h3 class="heatmap-title">Activations by State</h3>
          <div class="state-grid">
            <div
              v-for="s in US_STATES"
              :key="s.code"
              class="state-tile"
              :class="{ 'state-tile--glow': hoveredParkState === s.code }"
              :style="{
                background: heatBg(activationsByState.get(s.code) ?? 0, maxActivationCount),
                color: heatFg(activationsByState.get(s.code) ?? 0, maxActivationCount),
              }"
              :title="`${s.name}: ${activationsByState.get(s.code) ?? 0} activation(s)`"
            >{{ s.code }}</div>
          </div>
        </div>

        <div class="heatmap-section">
          <h3 class="heatmap-title">Contacts by State</h3>
          <div class="state-grid">
            <div
              v-for="s in US_STATES"
              :key="s.code"
              class="state-tile"
              :class="{ 'state-tile--glow': hoveredContactStates.has(s.code) }"
              :style="{
                background: heatBg(contactsByState.get(s.code) ?? 0, maxContactCount),
                color: heatFg(contactsByState.get(s.code) ?? 0, maxContactCount),
              }"
              :title="`${s.name}: ${contactsByState.get(s.code) ?? 0} contact(s)`"
            >{{ s.code }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: callsign lookup (1/4) -->
    <div class="lookup-panel">
      <div class="panel-header">
        <h2 class="panel-title">Callsign Lookup</h2>
      </div>

      <div class="lookup-input-wrap">
        <input
          v-model="lookupQuery"
          class="lookup-input"
          type="text"
          placeholder="Search callsign…"
          autocomplete="off"
          spellcheck="false"
          @input="lookupQuery = lookupQuery.toUpperCase()"
        />
        <button
          v-if="lookupQuery"
          class="lookup-clear"
          @click="lookupQuery = ''"
          tabindex="-1"
          aria-label="Clear"
        >✕</button>
      </div>

      <div class="lookup-results">
        <div v-if="lookupQuery && !lookupResults.length" class="lookup-empty">
          No contacts found.
        </div>
        <div
          v-for="(result, i) in lookupResults"
          :key="i"
          class="lookup-card"
          @mouseenter="hoveredActivationId = result.activationId"
          @mouseleave="hoveredActivationId = null"
        >
          <div class="lookup-call">{{ result.qso.theirCall }}</div>
          <div class="lookup-detail">
            <span class="lookup-park">
              <span v-if="result.parkReference" class="lookup-park-ref">{{ result.parkReference }}</span>
              {{ result.parkName }}
            </span>
            <span class="lookup-meta">{{ result.activationDate }} · {{ result.qso.date }}</span>
          </div>
          <div class="lookup-rst">
            <span class="lookup-rst-label">S</span> {{ result.qso.sentRST }}
            <span class="lookup-rst-sep">·</span>
            <span class="lookup-rst-label">R</span> {{ result.qso.receivedRST }}
          </div>
        </div>
      </div>
    </div>

  </div>

  <EditActivationDialog
    v-if="editingActivation"
    :activation="editingActivation"
    @save="saveEdit"
    @cancel="editingActivation = null"
  />
</template>

<style scoped>
.logbook-root {
  display: flex;
  height: 100%;
  gap: 16px;
  padding: 20px 24px 16px;
  box-sizing: border-box;
}

/* ── Panels ──────────────────────────────────────── */

.activation-panel {
  flex: 3;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.07), 0 0 0 1px rgba(0, 0, 0, 0.04);
  padding: 20px 22px 16px;
}

.lookup-panel {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.07), 0 0 0 1px rgba(0, 0, 0, 0.04);
  padding: 20px 18px 16px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  flex-shrink: 0;
}

.panel-title {
  font-size: 0.72rem;
  font-weight: 700;
  color: #3771d4;
  margin: 0;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.logbook-count {
  font-size: 0.82rem;
  color: #aaa;
  font-family: var(--font-mono);
}

/* ── Activation table ────────────────────────────── */

.table-wrapper {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #e4e7ee;
  border-radius: 8px;
  min-height: 0;
}

.logbook-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}

.logbook-table thead {
  position: sticky;
  top: 0;
  z-index: 1;
}

.logbook-table th {
  background: #f7f8fb;
  color: #3771d4;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #e4e7ee;
}

.logbook-table td {
  padding: 9px 12px;
  color: #222;
  border-bottom: 1px solid #e0e0e0;
  vertical-align: middle;
}

.logbook-table tbody tr:last-child td {
  border-bottom: none;
}

.logbook-table tbody tr:nth-child(even) td {
  background: #f7f8fb;
}

.logbook-table tbody tr:hover td {
  background: #eef1f8;
}

.row-highlighted td {
  background: #fef9c3 !important;
}

.park-ref {
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: 0.82rem;
  color: #3771d4;
  display: block;
}

.park-name {
  font-size: 0.88rem;
  color: #333;
}

.mono {
  font-family: var(--font-mono);
  letter-spacing: 0.03em;
}

.logbook-table .center {
  text-align: center;
}

.badge {
  display: inline-block;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.badge-active  { background: #dbeafe; color: #1d4ed8; }
.badge-ended   { background: #f0f0f0; color: #666; }

.activated-icon { font-size: 1rem; font-weight: 700; }
.icon-yes       { color: #16a34a; }
.icon-no        { color: #d1d5db; }

.qso-total {
  color: #bbb;
  font-size: 0.8em;
}

.action-cell {
  text-align: right;
  white-space: nowrap;
}

.resume-btn,
.view-btn {
  padding: 5px 14px;
  border: none;
  border-radius: 5px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
}

.resume-btn       { background: #16a34a; color: #fff; }
.resume-btn:hover { background: #15803d; }
.view-btn         { background: #3771d4; color: #fff; }
.view-btn:hover   { background: #2b5aab; }

.edit-btn {
  margin-left: 6px;
  padding: 5px 9px;
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  font-size: 0.85rem;
  color: #aaa;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.edit-btn:hover {
  background: #eff6ff;
  color: #3771d4;
  border-color: #93c5fd;
}

.delete-btn {
  margin-left: 6px;
  padding: 5px 9px;
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  font-size: 0.75rem;
  color: #aaa;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.delete-btn:hover {
  background: #fee2e2;
  color: #b91c1c;
  border-color: #fca5a5;
}

.accuracy-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 5px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  font-family: var(--font-mono);
  cursor: default;
}

.accuracy-perfect { background: #d1fae5; color: #065f46; }
.accuracy-warn    { background: #fef3c7; color: #92400e; }
.accuracy-bad     { background: #fee2e2; color: #b91c1c; }
.accuracy-pending,
.accuracy-none    { color: #ccc; font-size: 0.82rem; font-family: var(--font-mono); }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
  color: #aaa;
  font-style: italic;
  gap: 6px;
}

.empty-state p { margin: 0; }
.empty-sub { font-size: 0.88rem; color: #bbb; }
.empty-sub strong { color: #888; }

/* ── Heatmaps ────────────────────────────────────── */

.heatmaps-row {
  display: flex;
  gap: 16px;
  flex-shrink: 0;
  margin-top: 14px;
}

.heatmap-section {
  flex: 1;
  min-width: 0;
}

.heatmap-title {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #888;
  margin: 0 0 8px;
  padding-bottom: 5px;
  border-bottom: 1px solid #e0e0e0;
}

.state-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 3px;
}

.state-tile {
  aspect-ratio: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.58rem;
  font-family: var(--font-mono);
  font-weight: 700;
  border-radius: 3px;
  letter-spacing: 0.03em;
  cursor: default;
  transition: filter 0.1s;
}

.state-tile:hover {
  filter: brightness(0.88);
}

.state-tile--glow {
  position: relative;
  box-shadow: 0 0 0 2px #f59e0b, 0 0 7px 2px rgba(245, 158, 11, 0.55);
  z-index: 1;
}

/* ── Callsign lookup ─────────────────────────────── */

.lookup-input-wrap {
  position: relative;
  flex-shrink: 0;
  margin-bottom: 10px;
}

.lookup-input {
  width: 100%;
  padding: 8px 30px 8px 10px;
  border: 1px solid #dde0e8;
  border-radius: 6px;
  font-size: 0.9rem;
  font-family: var(--font-mono);
  letter-spacing: 0.05em;
  box-sizing: border-box;
  background: #fafbfc;
}

.lookup-input:focus {
  outline: none;
  border-color: #3771d4;
  background: #fff;
  box-shadow: 0 0 0 2px rgba(55, 113, 212, 0.18);
}

.lookup-clear {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 2px 4px;
  font-size: 0.7rem;
  color: #bbb;
  cursor: pointer;
  line-height: 1;
  border-radius: 3px;
  transition: color 0.12s;
}

.lookup-clear:hover {
  color: #888;
}

.lookup-results {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.lookup-empty {
  font-size: 0.85rem;
  color: #aaa;
  font-style: italic;
  text-align: center;
  padding: 24px 0;
}

.lookup-card {
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #fafafa;
  cursor: default;
  transition: background 0.12s, border-color 0.12s;
}

.lookup-card:hover {
  background: #fef9c3;
  border-color: #fcd34d;
}

.lookup-call {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 1rem;
  color: #1a1a1a;
  letter-spacing: 0.05em;
  margin-bottom: 3px;
}

.lookup-detail {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin-bottom: 5px;
}

.lookup-park      { font-size: 0.78rem; color: #555; }
.lookup-park-ref  { font-family: var(--font-mono); font-weight: 600; color: #3771d4; margin-right: 3px; }
.lookup-meta      { font-size: 0.72rem; color: #999; }

.lookup-rst       { font-family: var(--font-mono); font-size: 0.78rem; color: #666; }
.lookup-rst-label { font-weight: 700; color: #999; font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.05em; }
.lookup-rst-sep   { margin: 0 5px; color: #ddd; }
</style>
