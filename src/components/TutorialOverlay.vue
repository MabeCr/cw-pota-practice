<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useTutorialStore, STEP_AWAIT_ROUTES, STEP_AWAIT_ACTIONS, STEP_COUNT, T } from '@/stores/tutorialStore'
import { TUTORIAL_STEPS } from '@/composables/useTutorialSteps'
import { useMobileDetect } from '@/composables/useMobileDetect'

const tutorial = useTutorialStore()
const router   = useRouter()
const { isMobile } = useMobileDetect()

const spotlightRect  = ref<DOMRect | null>(null)
const tooltipVisible = ref(true)
const canAdvanceNow  = ref(true)
let pollTimer: ReturnType<typeof setInterval> | null = null

const step       = computed(() => TUTORIAL_STEPS[tutorial.currentStep])
const isLastStep = computed(() => tutorial.currentStep === STEP_COUNT - 1)

// Show Next button when:
//   - not route/action gated, AND
//   - either no canAdvance, OR canAdvance with manualAdvance (user must click Next)
const showNextButton = computed(() => {
    const idx = tutorial.currentStep
    if (STEP_AWAIT_ROUTES[idx] || STEP_AWAIT_ACTIONS[idx]) return false
    if (step.value?.canAdvance && !step.value.manualAdvance) return false
    return true
})

// Hide Back at step 0 (nothing before) and at PAGE_LAYOUT (activation just created;
// going back would show the dialog card while already inside the activation).
const showBackButton = computed(() =>
    tutorial.currentStep > 0 && tutorial.currentStep !== T.PAGE_LAYOUT
)

// ── Spotlight positioning ─────────────────────────────────────────────────────

function updateSpotlight() {
    const s = step.value
    if (!s?.target) {
        spotlightRect.value = null
        tooltipVisible.value = true
        return
    }
    const primary   = document.querySelector(s.target)
    const preferred = s.preferredTarget ? document.querySelector(s.preferredTarget) : null
    const spotlightEl = preferred ?? primary
    spotlightRect.value = spotlightEl ? spotlightEl.getBoundingClientRect() : null
    tooltipVisible.value = primary !== null
}

const PAD = 10

const spotlightStyle = computed(() => {
    const r = spotlightRect.value
    if (!r) return null
    return {
        top:    `${r.top    - PAD}px`,
        left:   `${r.left   - PAD}px`,
        width:  `${r.width  + PAD * 2}px`,
        height: `${r.height + PAD * 2}px`,
    }
})

// ── Blocker strips for interactive steps ──────────────────────────────────────
// Four rectangles that surround the spotlight area — everything outside the
// spotlight is blocked; the spotlight hole passes through to the underlying UI.

const blockerStrips = computed(() => {
    const r = spotlightRect.value
    if (!r) return null
    const sTop    = Math.max(0, r.top    - PAD)
    const sLeft   = Math.max(0, r.left   - PAD)
    const sRight  = Math.min(window.innerWidth,  r.right  + PAD)
    const sBottom = Math.min(window.innerHeight, r.bottom + PAD)
    const h = `${sBottom - sTop}px`
    return [
        { position: 'fixed', top: '0',          left: '0', right: '0',          height: `${sTop}px`   },
        { position: 'fixed', top: `${sBottom}px`, left: '0', right: '0',         bottom: '0'            },
        { position: 'fixed', top: `${sTop}px`,  left: '0', width: `${sLeft}px`, height: h              },
        { position: 'fixed', top: `${sTop}px`,  left: `${sRight}px`, right: '0', height: h             },
    ]
})

// ── Tooltip positioning ───────────────────────────────────────────────────────

const TOOLTIP_W = 360
const TOOLTIP_MARGIN = 16

const tooltipStyle = computed(() => {
    const r = spotlightRect.value
    if (!r) {
        return {
            position: 'fixed' as const,
            top: '50%',
            left: '50%',
            width: `${TOOLTIP_W}px`,
            transform: 'translate(-50%, -50%)',
        }
    }

    const placement = step.value?.placement ?? 'bottom'
    const GAP = 16

    let top: number, left: number

    const sCenterX = r.left - PAD + (r.width  + PAD * 2) / 2
    const sCenterY = r.top  - PAD + (r.height + PAD * 2) / 2

    if (placement === 'center') {
        top  = sCenterY - 110
        left = sCenterX - TOOLTIP_W / 2
    } else if (placement === 'bottom') {
        top  = r.bottom + PAD + GAP
        left = sCenterX - TOOLTIP_W / 2
    } else if (placement === 'top') {
        top  = r.top - PAD - GAP - 300
        left = sCenterX - TOOLTIP_W / 2
    } else if (placement === 'left') {
        top  = sCenterY - 110
        left = r.left - PAD - GAP - TOOLTIP_W
    } else {
        top  = sCenterY - 110
        left = r.right + PAD + GAP
    }

    left = Math.max(TOOLTIP_MARGIN, Math.min(left, window.innerWidth  - TOOLTIP_W - TOOLTIP_MARGIN))
    top  = Math.max(TOOLTIP_MARGIN, Math.min(top,  window.innerHeight - 240 - TOOLTIP_MARGIN))

    return {
        position: 'fixed' as const,
        top:  `${top}px`,
        left: `${left}px`,
        width: `${TOOLTIP_W}px`,
    }
})

// ── canAdvance polling ────────────────────────────────────────────────────────

function checkCanAdvance() {
    const s = step.value
    if (!s?.canAdvance) {
        canAdvanceNow.value = true
        return
    }
    const ready    = s.canAdvance({ tutorialActivationId: tutorial.tutorialActivationId })
    const wasReady = canAdvanceNow.value
    canAdvanceNow.value = ready
    // Auto-advance only for non-manual steps (work-qso, log-qso, end-activation)
    if (ready && !wasReady && !s.manualAdvance) {
        void nextTick(() => tutorial.advance())
    }
}

// ── Step change handling ──────────────────────────────────────────────────────

watch(
    () => tutorial.currentStep,
    async (newStep, oldStep) => {
        const goingBack = newStep < oldStep
        canAdvanceNow.value = false
        if (step.value?.target) tooltipVisible.value = false
        await nextTick()
        updateSpotlight()
        if (goingBack) {
            // Going backward: pre-fill canAdvanceNow with the current state so the
            // poll timer sees wasReady=true and does NOT immediately re-advance.
            const s = step.value
            canAdvanceNow.value = s?.canAdvance
                ? s.canAdvance({ tutorialActivationId: tutorial.tutorialActivationId })
                : true
        } else {
            checkCanAdvance()
        }
    },
)

watch(
    () => tutorial.isActive,
    async (active, wasActive) => {
        if (active) {
            await nextTick()
            updateSpotlight()
            checkCanAdvance()
        } else if (wasActive) {
            void router.push('/')
        }
    },
)

// ── Router-gated auto-advance ─────────────────────────────────────────────────

let unsubRouter: (() => void) | null = null

onMounted(() => {
    window.addEventListener('resize', updateSpotlight)
    window.addEventListener('scroll', updateSpotlight, true)

    pollTimer = setInterval(() => {
        checkCanAdvance()
        if (!spotlightRect.value && step.value?.target) updateSpotlight()
    }, 400)

    unsubRouter = router.afterEach((to) => {
        if (!tutorial.isActive) return
        const awaitRoute = STEP_AWAIT_ROUTES[tutorial.currentStep]
        if (!awaitRoute || to.name !== awaitRoute) return
        if (to.name === 'activation' && typeof to.params.id === 'string') {
            tutorial.tutorialActivationId = to.params.id
        }
        void nextTick(() => tutorial.advance())
    })
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', updateSpotlight)
    window.removeEventListener('scroll', updateSpotlight, true)
    if (pollTimer) clearInterval(pollTimer)
    unsubRouter?.()
})

// ── Actions ───────────────────────────────────────────────────────────────────

function handleNext() {
    if (!canAdvanceNow.value) return
    tutorial.advance()
}

async function handleBack() {
    const from = tutorial.currentStep
    tutorial.back()
    // Going back from op-landing (at /operation) returns to the landing page
    if (from === T.OP_LANDING) {
        await router.push('/')
    }
}
</script>

<template>
  <Teleport to="body">
    <!-- Mobile: tutorial requires desktop -->
    <template v-if="tutorial.isActive && isMobile">
      <div class="tutorial-dimmer" />
      <div class="tutorial-tooltip mobile-notice">
        <p class="mobile-notice-text">The tutorial is only available on desktop. Please open the app on a larger screen to take the guided walkthrough.</p>
        <button class="tutorial-btn tutorial-btn--next" @click="tutorial.finish()">Got it</button>
      </div>
    </template>

    <template v-else-if="tutorial.isActive && step">

      <!-- Visual spotlight (pointer-events: none — purely decorative) -->
      <div
        v-if="spotlightStyle"
        class="tutorial-spotlight"
        :style="spotlightStyle"
      />
      <!-- Full-screen dimmer for steps with no spotlight target -->
      <div v-else class="tutorial-dimmer" />

      <!-- ── Background blockers ─────────────────────────────────────────── -->

      <!-- Interactive steps: four strips around the spotlight hole so only the
           spotlit area receives pointer events -->
      <template v-if="step.blockBackground && step.allowInteraction">
        <template v-if="blockerStrips">
          <div
            v-for="(strip, i) in blockerStrips"
            :key="i"
            class="tutorial-blocker"
            :style="strip"
          />
        </template>
        <!-- Fallback: spotlight rect not computed yet, block everything -->
        <div v-else class="tutorial-blocker tutorial-blocker--full" />
      </template>

      <!-- Non-interactive steps: single full-screen blocker -->
      <div
        v-else-if="step.blockBackground && !step.allowInteraction"
        class="tutorial-blocker tutorial-blocker--full"
      />

      <!-- ── Tooltip card ────────────────────────────────────────────────── -->
      <div v-show="tooltipVisible" class="tutorial-tooltip" :style="tooltipStyle">
        <div class="tutorial-progress">
          <span class="tutorial-step-num">Step {{ tutorial.currentStep + 1 }} of {{ STEP_COUNT }}</span>
          <button class="tutorial-skip" @click="tutorial.finish()">Skip tutorial</button>
        </div>

        <h3 class="tutorial-title">{{ step.title }}</h3>
        <p class="tutorial-body">{{ step.body }}</p>

        <div class="tutorial-actions">
          <button
            v-if="showBackButton"
            class="tutorial-btn tutorial-btn--back"
            @click="handleBack"
          >← Back</button>

          <div class="tutorial-actions-right">
            <!-- Auto-advance steps show "Waiting…" instead of Next -->
            <span v-if="!showNextButton" class="tutorial-waiting">Waiting…</span>
            <!-- Manual-advance steps show a hint when the condition isn't met yet -->
            <span v-else-if="step.hint && step.manualAdvance && !canAdvanceNow" class="tutorial-hint">
              {{ step.hint }}
            </span>
            <button
              v-if="showNextButton"
              class="tutorial-btn tutorial-btn--next"
              :disabled="!canAdvanceNow"
              @click="handleNext"
            >
              {{ isLastStep ? 'Finish' : 'Next →' }}
            </button>
          </div>
        </div>
      </div>

    </template>
  </Teleport>
</template>

<style scoped>
.tutorial-spotlight {
    position: fixed;
    border-radius: 10px;
    box-shadow:
        0 0 0 9999px rgba(0, 0, 0, 0.6),
        0 0 0 3px var(--accent),
        0 0 0 5px rgba(255, 255, 255, 0.15);
    pointer-events: none;
    z-index: 9997;
    transition: top 0.3s ease, left 0.3s ease, width 0.3s ease, height 0.3s ease;
}

.tutorial-dimmer {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    pointer-events: none;
    z-index: 9997;
}

/* Sits between app content and the spotlight/tooltip so it catches pointer
   events without obscuring the visual overlay. */
.tutorial-blocker {
    position: fixed;
    z-index: 9996;
    pointer-events: all;
    background: transparent;
    cursor: default;
}

.tutorial-blocker--full {
    inset: 0;
}

.tutorial-tooltip {
    position: fixed;
    z-index: 9999;
    background: var(--bg-surface);
    border: 1px solid var(--border-strong);
    border-radius: 12px;
    padding: 20px 22px 18px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.28);
    pointer-events: all;
    transition: top 0.3s ease, left 0.3s ease;
}

.tutorial-progress {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
}

.tutorial-step-num {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--accent-text);
}

.tutorial-skip {
    background: none;
    border: none;
    font-size: 0.72rem;
    color: var(--text-faint);
    cursor: pointer;
    padding: 0;
    transition: color 0.15s;
}

.tutorial-skip:hover { color: var(--text-muted); }

.tutorial-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 8px;
}

.tutorial-body {
    font-size: 0.88rem;
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0 0 18px;
}

.tutorial-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
}

.tutorial-actions-right {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-left: auto;
}

.tutorial-waiting {
    font-size: 0.75rem;
    color: var(--text-faint);
    font-style: italic;
}

.tutorial-hint {
    font-size: 0.75rem;
    color: var(--accent-text);
    font-style: italic;
    max-width: 180px;
    text-align: right;
    line-height: 1.4;
}

.tutorial-btn {
    padding: 7px 16px;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: background 0.15s, opacity 0.15s;
}

.tutorial-btn--back {
    background: var(--bg-surface-alt);
    border: 1px solid var(--border-default);
    color: var(--text-secondary);
}

.tutorial-btn--back:hover { background: var(--border-default); }

.tutorial-btn--next {
    background: var(--accent);
    color: #fff;
}

.tutorial-btn--next:hover:not(:disabled) { background: var(--accent-hover); }

.tutorial-btn--next:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.mobile-notice {
    position: fixed;
    top: 50%;
    left: 50%;
    width: min(340px, 88vw);
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
    text-align: center;
}

.mobile-notice-text {
    margin: 0;
    font-size: 0.95rem;
    color: var(--text-secondary);
    line-height: 1.5;
}
</style>
