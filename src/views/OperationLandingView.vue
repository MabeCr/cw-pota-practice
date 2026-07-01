<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import NewActivationDialog from '@/components/NewActivationDialog.vue'
import { useActivationStore } from '@/stores/activationStore'

const router = useRouter()
const activationStore = useActivationStore()
const showDialog = ref(false)

// If an activation is already in progress, go straight back to it
const active = activationStore.inProgress[0]
if (active) {
    void router.replace(`/operation/${active.id}`)
}

function onStart(parkReference: string, parkName: string, callsign: string, parkState: string) {
    const id = activationStore.createActivation(parkReference, parkName, callsign, parkState)
    showDialog.value = false
    void router.push(`/operation/${id}`)
}
</script>

<template>
  <div class="landing">
    <div class="hero">
      <p class="hero-sub">Parks on the Air</p>
      <h1 class="hero-title">Ready to activate?</h1>
      <p class="hero-desc">
        Select a park, set your callsign, and start logging contacts.<br />
        Each activation is saved to your logbook automatically.
      </p>
      <button class="start-btn" @click="showDialog = true">
        Start New Activation
      </button>
    </div>

    <NewActivationDialog
      v-if="showDialog"
      @start="onStart"
      @cancel="showDialog = false"
    />
  </div>
</template>

<style scoped>
.landing {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.hero {
  text-align: center;
  max-width: 640px;
}

.hero-sub {
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #3771d4;
  margin: 0 0 16px;
}

.hero-title {
  font-size: 3.4rem;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 20px;
  letter-spacing: -0.01em;
}

.hero-desc {
  font-size: 1.15rem;
  color: #666;
  line-height: 1.65;
  margin: 0 0 40px;
}

.start-btn {
  padding: 16px 44px;
  background: #3771d4;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  letter-spacing: 0.02em;
}

.start-btn:hover {
  background: #2b5aab;
  transform: translateY(-1px);
}

.start-btn:active {
  transform: translateY(0);
}
</style>
