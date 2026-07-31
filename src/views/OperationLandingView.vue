<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import NewActivationDialog from '@/components/NewActivationDialog.vue'
import { useActivationStore } from '@/stores/activationStore'
import { useTutorialStore } from '@/stores/tutorialStore'

const router = useRouter()
const activationStore = useActivationStore()
const tutorial = useTutorialStore()
const showDialog = ref(false)

// Tutorial signals us to open the dialog automatically
watch(() => tutorial.shouldOpenNewActivationDialog, (should) => {
    if (should) {
        showDialog.value = true
        tutorial.shouldOpenNewActivationDialog = false
    }
}, { immediate: true })

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
      <button class="start-btn" data-tutorial="new-activation-btn" @click="showDialog = true">
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
  color: var(--accent-text);
  margin: 0 0 16px;
}

.hero-title {
  font-size: 3.4rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 20px;
  letter-spacing: -0.01em;
}

.hero-desc {
  font-size: 1.15rem;
  color: var(--text-muted);
  line-height: 1.65;
  margin: 0 0 40px;
}

.start-btn {
  padding: 16px 44px;
  background: var(--accent);
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
  background: var(--accent-hover);
  transform: translateY(-1px);
}

.start-btn:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .landing {
    align-items: flex-start;
    padding: 32px 20px;
    /* allow scrolling if content is taller than viewport */
    min-height: 100%;
    height: auto;
    justify-content: flex-start;
  }

  .hero {
    max-width: 100%;
  }

  .hero-title {
    font-size: 2.2rem;
  }

  .hero-desc {
    font-size: 1rem;
  }

  .start-btn {
    width: 100%;
    padding: 16px 24px;
  }
}
</style>
