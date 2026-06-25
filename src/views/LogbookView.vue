<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useActivationStore } from '@/stores/activationStore'
import type { Activation } from '@/types/activation'

const router = useRouter()
const activationStore = useActivationStore()

const activations = computed<Activation[]>(() =>
    [...activationStore.activations].sort(
        (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    )
)

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
</script>

<template>
  <div class="logbook-container">
    <div class="logbook-header">
      <h2 class="logbook-title">Logbook</h2>
      <span class="logbook-count">{{ activations.length }} activation{{ activations.length !== 1 ? 's' : '' }}</span>
    </div>

    <div class="table-wrapper">
      <table class="logbook-table" v-if="activations.length">
        <thead>
          <tr>
            <th>Park</th>
            <th>Callsign</th>
            <th>Date</th>
            <th class="center">QSOs</th>
            <th class="center">Activated</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="act in activations" :key="act.id">
            <td>
              <span v-if="act.parkReference" class="park-ref">{{ act.parkReference }}</span>
              <span class="park-name">{{ act.parkName }}</span>
            </td>
            <td class="mono">{{ act.callsign }}</td>
            <td class="mono">{{ formatDate(act.startedAt) }}</td>
            <td class="mono center">{{ act.qsoList.length }}</td>
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
            <td class="action-cell">
              <button :class="act.endedAt ? 'view-btn' : 'resume-btn'" @click="resume(act.id)">
                {{ act.endedAt ? 'View' : 'Resume' }}
              </button>
              <button class="delete-btn" @click="deleteActivation(act.id, act.parkName)" title="Delete activation">
                ✕
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="empty-state">
        <p>No activations yet.</p>
        <p class="empty-sub">Head to <strong>Operation</strong> to start your first one.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.logbook-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px 24px 16px;
  box-sizing: border-box;
}

.logbook-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  flex-shrink: 0;
}

.logbook-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.logbook-count {
  font-size: 0.82rem;
  color: #888;
}

.table-wrapper {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #c0c0c0;
  border-radius: 6px;
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
  background: #f0f0f3;
}

.logbook-table tbody tr:hover td {
  background: #e8e8ed;
}

.park-ref {
  font-family: monospace;
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
  font-family: monospace;
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

.badge-active {
  background: #dbeafe;
  color: #1d4ed8;
}

.badge-ended {
  background: #f0f0f0;
  color: #666;
}

.activated-icon {
  font-size: 1rem;
  font-weight: 700;
}

.icon-yes {
  color: #16a34a;
}

.icon-no {
  color: #d1d5db;
}

.action-cell {
  text-align: right;
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

.resume-btn {
  background: #16a34a;
  color: #fff;
}

.resume-btn:hover {
  background: #15803d;
}

.view-btn {
  background: #3771d4;
  color: #fff;
}

.view-btn:hover {
  background: #2b5aab;
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

.empty-state p {
  margin: 0;
}

.empty-sub {
  font-size: 0.88rem;
  color: #bbb;
}

.empty-sub strong {
  color: #888;
}
</style>
