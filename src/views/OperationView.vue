<script setup lang="ts">
import { computed, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LogComponent from '@/components/LogComponent.vue'
import ConversationComponent from '@/components/ConversationComponent.vue'
import { useActivationStore } from '@/stores/activationStore'
import { useChatStore } from '@/stores/chatStore'
import { getConversationAiService } from '@/services/conversationAiService'
import type { QSO } from '@/types/activation'

const route  = useRoute()
const router = useRouter()
const activationStore = useActivationStore()
const chatStore       = useChatStore()

const activationId = route.params.id as string
const activation   = computed(() => activationStore.getById(activationId))

// Load history synchronously so ConversationComponent's watchers see it
// as the baseline state — prevents replaying old messages or re-triggering the AI.
if (activation.value) {
    chatStore.loadMessages(activation.value.chatHistory)
    getConversationAiService().prepareForActivation(activationId, activation.value.chatHistory.length)
} else {
    void router.replace('/operation')
}

onBeforeUnmount(() => {
    activationStore.saveChatHistory(activationId, chatStore.messages)
})

// Keep chat history in sync on every new message
watch(() => chatStore.messages.length, () => {
    activationStore.saveChatHistory(activationId, chatStore.messages)
})

function onAddQso(qso: QSO) {
    activationStore.addQso(activationId, qso)
}

function toggleActivation() {
    if (!activation.value) return
    if (activation.value.endedAt) {
        activationStore.reopenActivation(activationId)
    } else {
        activationStore.endActivation(activationId)
    }
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
    })
}
</script>

<template>
  <div v-if="activation" class="operation-root">

    <div class="activation-bar">
      <div class="activation-info">
        <span v-if="activation.parkReference" class="park-ref">{{ activation.parkReference }}</span>
        <span class="park-name">{{ activation.parkName }}</span>
        <span class="bar-sep">·</span>
        <span class="bar-callsign">{{ activation.callsign }}</span>
        <span class="bar-sep">·</span>
        <span class="bar-date">{{ formatDate(activation.startedAt) }}</span>
        <span v-if="activation.endedAt" class="badge-ended">Ended</span>
      </div>
      <button
        class="toggle-btn"
        :class="activation.endedAt ? 'btn-reopen' : 'btn-end'"
        @click="toggleActivation"
      >
        {{ activation.endedAt ? 'Reopen Activation' : 'End Activation' }}
      </button>
    </div>

    <div v-if="activation.endedAt" class="ended-banner">
      Activation ended — Log and Send are disabled.
    </div>

    <div class="app-container">
      <div class="left-half">
        <LogComponent
          :qso-list="activation.qsoList"
          :readonly="!!activation.endedAt"
          @add-qso="onAddQso"
        />
      </div>
      <div class="right-half">
        <ConversationComponent :readonly="!!activation.endedAt" />
      </div>
    </div>

  </div>
</template>

<style scoped>
.operation-root {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.activation-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px;
  background: #f7f7f8;
  border-bottom: 1px solid #c0c0c0;
  flex-shrink: 0;
  gap: 12px;
}

.activation-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  flex-wrap: wrap;
}

.park-ref {
  font-family: monospace;
  font-weight: 700;
  color: #3771d4;
}

.park-name {
  color: #1a1a1a;
  font-weight: 500;
}

.bar-sep {
  color: #ccc;
}

.bar-callsign {
  font-family: monospace;
  color: #444;
}

.bar-date {
  color: #888;
  font-size: 0.82rem;
}

.badge-ended {
  padding: 1px 8px;
  border-radius: 999px;
  background: #f0f0f0;
  color: #888;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.ended-banner {
  padding: 6px 20px;
  background: #fef3c7;
  border-bottom: 1px solid #fcd34d;
  font-size: 0.8rem;
  color: #92400e;
  flex-shrink: 0;
}

.toggle-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 5px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
  flex-shrink: 0;
}

.btn-end {
  background: #fee2e2;
  color: #b91c1c;
}

.btn-end:hover {
  background: #fecaca;
}

.btn-reopen {
  background: #d1fae5;
  color: #065f46;
}

.btn-reopen:hover {
  background: #a7f3d0;
}

.app-container {
  display: flex;
  flex-direction: row;
  flex: 1;
  overflow: hidden;
}

.left-half {
  flex: 1;
  overflow: hidden;
}

.right-half {
  flex: 1;
  overflow: hidden;
}
</style>
