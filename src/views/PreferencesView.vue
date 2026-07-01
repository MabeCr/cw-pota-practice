<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { keyLabel } from '@/utils/keyLabel';
import { useMorse, setNoiseLevel } from '@/composables/useMorse';
import { useSettingsStore } from '@/stores/settingsStore';
import type { KeyerType } from '@/stores/settingsStore';

const { volume, isMuted, setVolume, toggleMute } = useMorse();
const settings = useSettingsStore();

const bindingCapture = ref<'dit' | 'dah' | null>(null);

function captureKey(event: KeyboardEvent) {
    event.preventDefault();
    if (event.key === 'Escape') { bindingCapture.value = null; return; }
    if (bindingCapture.value === 'dit') settings.setDitKey(event.code);
    else if (bindingCapture.value === 'dah') settings.setDahKey(event.code);
    bindingCapture.value = null;
}

function startCapture(target: 'dit' | 'dah') {
    bindingCapture.value = target;
    document.addEventListener('keydown', captureKey, { once: true });
}

onUnmounted(() => {
    document.removeEventListener('keydown', captureKey);
});
</script>

<template>
  <div class="preferences-container">
    <h1 class="pref-page-title">Preferences</h1>

    <div class="pref-grid">

      <!-- Left column: Station + Keyer Settings -->
      <div class="pref-col">

        <section class="pref-section">
          <h2 class="section-heading">Station</h2>
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
        </section>

        <section class="pref-section">
          <h2 class="section-heading">Keyer Settings</h2>

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

          <div class="pref-row">
            <label class="pref-label" for="keyerType">Type</label>
            <select
              id="keyerType"
              class="pref-select"
              :value="settings.keyerType"
              @change="settings.setKeyerType(($event.target as HTMLSelectElement).value as KeyerType)"
            >
              <option value="straight">Straight Key</option>
              <option value="iambic-a">Iambic A</option>
              <option value="iambic-b">Iambic B</option>
            </select>
          </div>

          <div class="pref-row">
            <label class="pref-label">Dit Key</label>
            <button
              class="key-bind-btn"
              :class="{ capturing: bindingCapture === 'dit' }"
              @click="startCapture('dit')"
            >
              {{ bindingCapture === 'dit' ? 'Press any key…' : keyLabel(settings.ditKey) }}
            </button>
          </div>

          <div class="pref-row">
            <label class="pref-label">Dah Key</label>
            <button
              class="key-bind-btn"
              :class="{ capturing: bindingCapture === 'dah' }"
              @click="startCapture('dah')"
            >
              {{ bindingCapture === 'dah' ? 'Press any key…' : keyLabel(settings.dahKey) }}
            </button>
          </div>
        </section>

      </div><!-- pref-col left -->

      <!-- Right column: Difficulty Modifiers + Audio -->
      <div class="pref-col">

        <section class="pref-section">
          <h2 class="section-heading">Difficulty Modifiers</h2>

          <div class="pref-row">
            <label class="pref-label" for="hunterMaxWpm">Hunter Max WPM</label>
            <div class="range-row">
              <input
                id="hunterMaxWpm"
                type="range"
                min="5"
                max="40"
                step="1"
                :value="settings.hunterMaxWpm"
                @input="settings.setHunterMaxWpm(parseInt(($event.target as HTMLInputElement).value))"
                class="pref-slider"
              />
              <span class="range-value">{{ settings.hunterMaxWpm }} WPM</span>
            </div>
          </div>

          <div class="pref-row">
            <label class="pref-label" for="hunterCount">Max # Hunters</label>
            <div class="range-row">
              <input
                id="hunterCount"
                type="range"
                min="1"
                max="10"
                step="1"
                :value="settings.hunterCount"
                @input="settings.setHunterCount(parseInt(($event.target as HTMLInputElement).value))"
                class="pref-slider"
              />
              <span class="range-value">{{ settings.hunterCount }}</span>
            </div>
          </div>

          <div class="pref-row">
            <label class="pref-label" for="noiseLevel">Band Noise</label>
            <div class="range-row">
              <input
                id="noiseLevel"
                type="range"
                min="0"
                max="100"
                step="1"
                :value="settings.noiseLevel"
                @input="setNoiseLevel(parseInt(($event.target as HTMLInputElement).value))"
                class="pref-slider"
              />
              <span class="range-value">{{ settings.noiseLevel === 0 ? 'Off' : settings.noiseLevel + '%' }}</span>
            </div>
          </div>
        </section>

        <section class="pref-section">
          <h2 class="section-heading">Audio</h2>

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

      </div><!-- pref-col right -->

    </div><!-- pref-grid -->
  </div>
</template>

<style scoped>
.preferences-container {
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 36px 40px;
}

.pref-page-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 28px;
  letter-spacing: -0.01em;
}

.pref-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 900px) {
  .pref-grid {
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
}

.pref-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pref-section {
  background: #fff;
  border-radius: 10px;
  padding: 24px 28px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04);
}

.section-heading {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #3771d4;
  margin: 0 0 18px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eef0f5;
}

.pref-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 9px 0;
  border-bottom: 1px solid #f4f5f8;
}

.pref-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.pref-row:first-of-type {
  padding-top: 0;
}

.pref-label {
  width: 130px;
  font-size: 0.88rem;
  font-weight: 500;
  color: #444;
  flex-shrink: 0;
}

.pref-input {
  padding: 7px 11px;
  border: 1px solid #dde0e8;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: var(--font-mono);
  width: 160px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: #fafbfc;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.pref-input:focus {
  outline: none;
  border-color: #3771d4;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(55, 113, 212, 0.15);
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
  font-size: 0.875rem;
  font-family: var(--font-mono);
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

.pref-select {
  padding: 7px 11px;
  border: 1px solid #dde0e8;
  border-radius: 6px;
  font-size: 0.9rem;
  font-family: var(--font-sans);
  background: #fafbfc;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.pref-select:focus {
  outline: none;
  border-color: #3771d4;
  box-shadow: 0 0 0 3px rgba(55, 113, 212, 0.15);
}

.key-bind-btn {
  padding: 6px 16px;
  min-width: 88px;
  border: 1px solid #dde0e8;
  border-radius: 6px;
  background: #fafbfc;
  font-family: var(--font-mono);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  text-align: center;
}

.key-bind-btn:hover {
  border-color: #3771d4;
  background: #eff6ff;
}

.key-bind-btn.capturing {
  border-color: #3771d4;
  background: #e8f0ff;
  color: #3771d4;
  font-family: var(--font-sans);
  font-size: 0.85rem;
  font-weight: 500;
}
</style>
