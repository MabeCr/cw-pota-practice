<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function startActivating() {
  router.push('/operation');
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

      <button class="start-button" @click="startActivating">
        Start Activating
        <span class="btn-arrow">→</span>
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
  color: #3771d4;
  margin: 0 0 16px;
}

.landing-title {
  font-size: 4.2rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #111;
  margin: 0 0 24px;
  line-height: 1.1;
}

.landing-subtitle {
  font-size: 1.25rem;
  color: #555;
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
  background: #c0c8d8;
  flex-shrink: 0;
}

.dash {
  width: 22px;
  height: 7px;
  border-radius: 4px;
  background: #c0c8d8;
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
  background: #f8f9fc;
  border: 1px solid #e4e8f0;
  border-radius: 12px;
  padding: 30px 26px;
  transition: box-shadow 0.15s, border-color 0.15s;
}

.feature-card:hover {
  border-color: #c5d0e8;
  box-shadow: 0 4px 16px rgba(55, 113, 212, 0.08);
}

.feature-icon {
  display: inline-block;
  font-family: monospace;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #3771d4;
  background: #dbeafe;
  padding: 5px 10px;
  border-radius: 5px;
  margin-bottom: 16px;
}

.feature-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 10px;
}

.feature-desc {
  font-size: 0.93rem;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

/* ── CTA button ── */
.start-button {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 40px;
  background-color: #3771d4;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s, box-shadow 0.15s;
  box-shadow: 0 2px 8px rgba(55, 113, 212, 0.3);
}

.start-button:hover {
  background-color: #2b5aab;
  box-shadow: 0 4px 16px rgba(55, 113, 212, 0.4);
}

.btn-arrow {
  font-size: 1.1rem;
  transition: transform 0.15s;
}

.start-button:hover .btn-arrow {
  transform: translateX(3px);
}
</style>
