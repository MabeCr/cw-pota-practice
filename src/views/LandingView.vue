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
      <h1 class="landing-title">CW POTA Practice</h1>
      <p class="landing-subtitle">Train your CW operating skills with a simulated POTA pileup.</p>

      <div class="landing-description">
        <p>
          This app simulates the experience of activating a POTA (Parks on the Air) station using
          CW (Morse code). A group of hunters will call you after your CQ, and your goal is to work
          through the pileup — picking out callsigns, exchanging signal reports and states, and
          completing each QSO using the standard POTA exchange.
        </p>
        <p>
          Hunters send their callsigns in real Morse code audio. Practice copying partial callsigns,
          handling callsign errors, and managing a busy frequency — all at your own pace.
        </p>
      </div>

      <button class="start-button" @click="startActivating">Start Activating</button>
    </div>
  </div>
</template>

<style scoped>
.landing-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 40px 20px;
  box-sizing: border-box;
}

.landing-content {
  max-width: 640px;
  text-align: center;
}

.landing-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #1a1a1a;
}

.landing-subtitle {
  font-size: 1.15rem;
  color: #555;
  margin-bottom: 32px;
}

.landing-description {
  text-align: left;
  color: #444;
  line-height: 1.7;
  margin-bottom: 40px;
}

.landing-description p {
  margin-bottom: 16px;
}

.start-button {
  padding: 14px 36px;
  background-color: #3771d4;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.start-button:hover {
  background-color: #2b5aab;
}
</style>
