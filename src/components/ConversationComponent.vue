<script lang="ts" setup>
import { ref, reactive, useTemplateRef, nextTick, watch } from 'vue';
import { useChatStore } from '../stores/chatStore';
import { ConversationAiService } from '@/services/conversationAiService';
import { useMorse } from '@/composables/useMorse';
import KeyerComponent from '@/components/KeyerComponent.vue';

const chatStore = useChatStore();
const conversationAiService = new ConversationAiService();
const { playMorse, volume, isMuted, setVolume, toggleMute } = useMorse();

// Cache each hunter's audio config on first message so "EE" (sent after
// the station is removed from the active list) still uses the right settings.
const stationAudioCache = new Map<string, { frequency: number; wpm: number }>();

const message = ref('');
const activeHuntersCount = ref(0);

function onKeyerCharacter(char: string): void {
    message.value += char;
}

function onKeyerDeleteWord(): void {
    const trimmed = message.value.trimEnd();
    const lastSpace = trimmed.lastIndexOf(' ');
    message.value = lastSpace >= 0 ? trimmed.substring(0, lastSpace + 1) : '';
}

function getHunterColor(originator: string): string {
  let hash = 0;
  for (let i = 0; i < originator.length; i++) {
    hash = (hash * 31 + originator.charCodeAt(i)) & 0xffffffff;
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 38%)`;
}

// Revealed text for each hunter message, keyed by message index
const displayedText = reactive<Record<number, string>>({});

function animateMessage(index: number, fullText: string): void {
  displayedText[index] = '';
  let charIndex = 0;

  function typeNext() {
    if (charIndex >= fullText.length) return;
    charIndex++;
    displayedText[index] = fullText.slice(0, charIndex);
    setTimeout(typeNext, 80 + Math.random() * 60);
  }

  typeNext();
}

let lastAnimatedIndex = -1;

watch(
  () => chatStore.messages.length,
  (newLength) => {
    for (let i = lastAnimatedIndex + 1; i < newLength; i++) {
      const msg = chatStore.messages[i];
      if (msg && msg.originator !== 'You') {
        animateMessage(i, msg.message);
        if (!stationAudioCache.has(msg.originator)) {
          const station = conversationAiService.getActiveStations().find(s => s.callsign === msg.originator);
          if (station) {
            stationAudioCache.set(msg.originator, { frequency: station.frequency, wpm: station.wpm });
          }
        }
        const audio = stationAudioCache.get(msg.originator);
        playMorse(msg.message, audio?.wpm, audio?.frequency);
      }
    }
    lastAnimatedIndex = newLength - 1;
  }
);

const chatContainer = useTemplateRef('chatContainer');

function sendMessage() {
  if (message.value.trim()) {
    chatStore.addMessage('You', message.value.trim());
    message.value = '';
  }
}

watch(
  () => conversationAiService.getActiveStations(),
  () => {
    activeHuntersCount.value = conversationAiService.getActiveStations().length;
  },
  { deep: true }
);

watch(
  chatStore.messages,
  async () => {
    await nextTick();
    const container = chatContainer.value;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  },
  { deep: true },
)
</script>

<template>
  <div class="conversation-input-container">
    <div class="chat-header">
      <h2 class="chat-title">Activation Chat</h2>
    </div>
    <div class="chat-container" ref="chatContainer">
      <div
        v-for="(msg, index) in chatStore.messages"
        :key="index"
        class="chat-message"
        :class="msg.originator === 'You' ? 'message-self' : 'message-other'"
        :style="msg.originator !== 'You' ? { backgroundColor: getHunterColor(msg.originator) } : {}"
      >
        <div class="message-name">{{ msg.originator }}</div>
        <div class="message-text">{{ msg.originator !== 'You' ? displayedText[index] : msg.message }}</div>
      </div>
    </div>
    <div class="qso-status-header">
      <span class="active-hunters">Active Hunters: {{ activeHuntersCount }}</span>
    </div>
    <div class="input-container">
      <textarea v-model="message" class="chat-input" @input="message = message.toUpperCase()" placeholder="Type your message here..." @keydown.enter.prevent="sendMessage()"></textarea>
      <div class="send-button-container">
        <button class="send-button" @click="sendMessage()">Send</button>
      </div>
    </div>

    <div class="volume-control">
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
        class="volume-slider"
      />
    </div>

    <KeyerComponent @character="onKeyerCharacter" @delete-word="onKeyerDeleteWord" @send="sendMessage" />
  </div>
</template>

<style scoped>
.conversation-input-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 80vh;
  width: 100%;
  padding-top: 20px;
  box-sizing: border-box;
}

.chat-header {
  width: 80%;
  margin-bottom: 14px;
  flex-shrink: 0;
}

.chat-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.chat-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #c0c0c0;
  border-radius: 6px;
  font-size: 16px;
  resize: none;
  height: 100%;
  width: 80%;
}

.chat-message {
  display: flex;
  flex-direction: column;
  margin-bottom: 1vh;
  padding: 8px 12px;
  border-radius: 8px;
  max-width: 80%;
}

.message-name {
  font-weight: bold;
  font-size: 0.85em;
  margin-bottom: 4px;
  opacity: 0.8;
}

.message-text {
  font-size: 1em;
}

.message-self {
  align-self: flex-start;
  background-color: #dcf8c6; /* Light green */
  border: 1px solid #c5e1a5;
}

.message-other {
  align-self: flex-end;
  color: white;
}

.chat-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #c0c0c0;
  border-radius: 6px;
  font-size: 16px;
  resize: none;
  height: 80vh;
  width: 80%;
}

.input-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%
}

.send-button-container {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.send-button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.send-button:hover {
  background-color: #45a049;
}

.qso-status-header {
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 80%;
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
  font-size: 14px;
}

.active-hunters {
  font-weight: bold;
  color: #333;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 80%;
  max-width: 80%;
  margin-top: 12px;
}

.mute-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  padding: 0;
  line-height: 1;
}

.volume-slider {
  flex: 1;
  cursor: pointer;
  accent-color: #3771d4;
}
</style>
