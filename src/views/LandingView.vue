<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useTutorialStore } from '@/stores/tutorialStore';

const router = useRouter();
const tutorial = useTutorialStore();

function startActivating() {
  router.push('/operation');
}

function startTutorial() {
  tutorial.start();
  router.push('/');
}
</script>

<template>
  <div class="landing-container">
    <div class="landing-content">

      <div class="hero">
        <p class="hero-eyebrow">Morse Code Simulator</p>
        <h1 class="landing-title">CW POTA Practice</h1>
        <div class="morse-divider" aria-hidden="true">
          <!-- C: -.-.  Q: --.-  P: .--.  O: ---  T: -  A: .- -->
          <!-- CQ -->
          <span class="dash"></span><span class="dot"></span><span class="dash"></span><span class="dot"></span>
          <span class="letterspace"></span>
          <span class="dash"></span><span class="dash"></span><span class="dot"></span><span class="dash"></span>
          <span class="wordspace"></span>
          <!-- POTA -->
          <span class="dot"></span><span class="dash"></span><span class="dash"></span><span class="dot"></span>
          <span class="letterspace"></span>
          <span class="dash"></span><span class="dash"></span><span class="dash"></span>
          <span class="letterspace"></span>
          <span class="dash"></span>
          <span class="letterspace"></span>
          <span class="dot"></span><span class="dash"></span>
          <span class="wordspace"></span>
          <!-- CQ -->
          <span class="dash"></span><span class="dot"></span><span class="dash"></span><span class="dot"></span>
          <span class="letterspace"></span>
          <span class="dash"></span><span class="dash"></span><span class="dot"></span><span class="dash"></span>
          <span class="wordspace"></span>
          <!-- POTA -->
          <span class="dot"></span><span class="dash"></span><span class="dash"></span><span class="dot"></span>
          <span class="letterspace"></span>
          <span class="dash"></span><span class="dash"></span><span class="dash"></span>
          <span class="letterspace"></span>
          <span class="dash"></span>
          <span class="letterspace"></span>
          <span class="dot"></span><span class="dash"></span>
        </div>
        <p class="landing-subtitle">
          Simulate a POTA activation and work through a real CW pileup — at your own pace.
        </p>
      </div>

      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-icon">CW</div>
          <h3 class="feature-title">Real CW Audio</h3>
          <p class="feature-desc">Hunters call in at authentic Morse speeds. Copy callsigns by ear, just like on the air.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">73</div>
          <h3 class="feature-title">POTA Exchange</h3>
          <p class="feature-desc">Practice the standard signal report and state exchange, including Park-to-Park contacts.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">LOG</div>
          <h3 class="feature-title">Activation Log</h3>
          <p class="feature-desc">Each activation is saved. Pick up where you left off and review your contact history.</p>
        </div>
      </div>

      <button class="start-button" data-tutorial="landing-start-btn" @click="startActivating">
        Start Activating
        <span class="btn-arrow">→</span>
      </button>

      <button class="tutorial-button" @click="startTutorial">
        {{ tutorial.completed ? 'Revisit the tutorial' : 'Show me how this works' }}
      </button>

    </div>
  </div>
</template>

<style scoped>
.landing-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  padding: 48px 20px;
  box-sizing: border-box;
}

.landing-content {
  max-width: 960px;
  width: 100%;
  text-align: center;
}

/* ── Hero ── */
.hero {
  margin-bottom: 48px;
}

.hero-eyebrow {
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent-text);
  margin: 0 0 16px;
}

.landing-title {
  font-size: 4.2rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--text-primary);
  margin: 0 0 24px;
  line-height: 1.1;
}

.landing-subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
  line-height: 1.6;
  max-width: 640px;
  margin: 24px auto 0;
}

/* ── Morse divider ── */
.morse-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin: 0 auto;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--border-default);
  flex-shrink: 0;
}

.dash {
  width: 22px;
  height: 7px;
  border-radius: 4px;
  background: var(--border-default);
  flex-shrink: 0;
}

.letterspace {
  width: 10px;
}

.wordspace {
  width: 36px;
}

/* ── Feature cards ── */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 56px;
  text-align: left;
}

.feature-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 12px;
  padding: 30px 26px;
  transition: box-shadow 0.15s, border-color 0.15s;
}

.feature-card:hover {
  border-color: var(--accent);
  box-shadow: 0 4px 16px var(--accent-shadow);
}

.feature-icon {
  display: inline-block;
  font-family: monospace;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: var(--accent-text);
  background: var(--accent-light-2);
  padding: 5px 10px;
  border-radius: 5px;
  margin-bottom: 16px;
}

.feature-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 10px;
}

.feature-desc {
  font-size: 0.93rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0;
}

/* ── CTA button ── */
.start-button {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 40px;
  background-color: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s, box-shadow 0.15s;
  box-shadow: 0 2px 8px var(--accent-shadow);
}

.start-button:hover {
  background-color: var(--accent-hover);
  box-shadow: 0 4px 16px var(--accent-shadow);
}

.btn-arrow {
  font-size: 1.1rem;
  transition: transform 0.15s;
}

.start-button:hover .btn-arrow {
  transform: translateX(3px);
}

.tutorial-button {
  display: block;
  margin: 16px auto 0;
  background: none;
  border: none;
  font-size: 0.9rem;
  color: var(--text-muted);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color 0.15s;
}

.tutorial-button:hover {
  color: var(--accent-text);
}

@media (max-width: 768px) {
  .landing-container {
    padding: 24px 16px;
    align-items: flex-start;
  }

  .hero {
    margin-bottom: 28px;
  }

  .landing-title {
    font-size: 2.4rem;
  }

  .landing-subtitle {
    font-size: 1rem;
  }

  .feature-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 32px;
  }

  .feature-card {
    padding: 20px 18px;
  }

  .morse-divider {
    flex-wrap: wrap;
  }
}
</style>
