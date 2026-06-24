<script setup lang="ts">
import { useMorse } from '@/composables/useMorse';
import { useSettingsStore } from '@/stores/settingsStore';

const { volume, isMuted, setVolume, toggleMute } = useMorse();
const settings = useSettingsStore();
</script>

<template>
  <div class="preferences-container">
    <h1>Preferences</h1>

    <section class="pref-section">
      <h2>Station</h2>

      <div class="pref-row">
        <label class="pref-label" for="callsign">Callsign</label>
        <input
          id="callsign"
          type="text"
          class="pref-input"
          :value="settings.callsign"
          @input="settings.setCallsign(($event.target as HTMLInputElement).value)"
          placeholder="e.g. W1AW"
          maxlength="10"
          spellcheck="false"
          autocomplete="off"
        />
      </div>

      <div class="pref-row">
        <label class="pref-label" for="wpm">Keyer WPM</label>
        <div class="range-row">
          <input
            id="wpm"
            type="range"
            min="5"
            max="40"
            step="1"
            :value="settings.wpm"
            @input="settings.setWpm(parseInt(($event.target as HTMLInputElement).value))"
            class="pref-slider"
          />
          <span class="range-value">{{ settings.wpm }} WPM</span>
        </div>
      </div>

      <div class="pref-row">
        <label class="pref-label" for="frequency">CW Frequency</label>
        <div class="range-row">
          <input
            id="frequency"
            type="range"
            min="400"
            max="800"
            step="10"
            :value="settings.frequency"
            @input="settings.setFrequency(parseInt(($event.target as HTMLInputElement).value))"
            class="pref-slider"
          />
          <span class="range-value">{{ settings.frequency }} Hz</span>
        </div>
      </div>

      <div class="pref-row">
        <label class="pref-label" for="rampTime">Ramp Time</label>
        <div class="range-row">
          <input
            id="rampTime"
            type="range"
            min="0"
            max="10"
            step="1"
            :value="settings.rampTime"
            @input="settings.setRampTime(parseInt(($event.target as HTMLInputElement).value))"
            class="pref-slider"
          />
          <span class="range-value">{{ settings.rampTime }} ms</span>
        </div>
      </div>
    </section>

    <section class="pref-section">
      <h2>Audio</h2>

      <div class="pref-row">
        <label class="pref-label">Volume</label>
        <div class="range-row">
          <button class="mute-button" @click="toggleMute" :title="isMuted ? 'Unmute' : 'Mute'">
            {{ isMuted ? '🔇' : '🔊' }}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            :value="volume"
            @input="setVolume(parseFloat(($event.target as HTMLInputElement).value))"
            class="pref-slider"
          />
          <span class="range-value">{{ Math.round(volume * 100) }}%</span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.preferences-container {
  padding: 40px;
  max-width: 600px;
}

h1 {
  margin-bottom: 32px;
  color: #1a1a1a;
}

.pref-section {
  margin-bottom: 40px;
}

.pref-section h2 {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #888;
  margin-bottom: 16px;
  padding-bottom: 6px;
  border-bottom: 1px solid #e0e0e0;
}

.pref-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 0;
}

.pref-label {
  width: 120px;
  font-weight: 500;
  color: #333;
  flex-shrink: 0;
}

.pref-input {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.95rem;
  width: 160px;
  font-family: monospace;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.pref-input:focus {
  outline: none;
  border-color: #3771d4;
  box-shadow: 0 0 0 2px rgba(55, 113, 212, 0.2);
}

.range-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.pref-slider {
  flex: 1;
  cursor: pointer;
  accent-color: #3771d4;
}

.range-value {
  width: 72px;
  text-align: right;
  font-size: 0.9rem;
  color: #555;
  flex-shrink: 0;
}

.mute-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  padding: 0;
  line-height: 1;
  flex-shrink: 0;
}
</style>
