<script lang="ts" setup>
import { ref, reactive, useTemplateRef, nextTick, watch } from 'vue';
import { useChatStore } from '../stores/chatStore';
import { ConversationAiService } from '@/services/conversationAiService';

const chatStore = useChatStore();
const conversationAiService = new ConversationAiService();

const message = ref('');
const activeHuntersCount = ref(0);

const HUNTER_COLORS = ['#3771d4', '#0891b2', '#6d28d9', '#047857'];
const colorMap = new Map<string, string>();

function getHunterColor(originator: string): string {
  if (!colorMap.has(originator)) {
    colorMap.set(originator, HUNTER_COLORS[colorMap.size % HUNTER_COLORS.length]!);
  }
  return colorMap.get(originator)!;
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
    <!-- QSO Status Header -->
    <div class="qso-status-header">
      <span class="active-hunters">Active Hunters: {{ activeHuntersCount }}</span>
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
    <div class="input-container">
      <textarea v-model="message" class="chat-input" @input="message = message.toUpperCase()" placeholder="Type your message here..." @keydown.enter.prevent="sendMessage()"></textarea>
      <div class="send-button-container">
        <button class="send-button" @click="sendMessage()">Send</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.conversation-input-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 80vh;
  width: 100%;
}

.chat-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  border: 2px solid #333;
  border-radius: 5px;
  font-size: 16px;
  resize: none;
  height: 100%;
  width: 80%;
  margin-top: 5vh;
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
  border: 2px solid #333;
  border-radius: 5px;
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

</style>
