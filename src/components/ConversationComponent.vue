<script lang="ts" setup>
import { ref, useTemplateRef, nextTick, watch } from 'vue';
import { useChatStore } from '../stores/chatStore';
import { ConversationAiService } from '@/services/conversationAiService';

const chatStore = useChatStore();
/**
 * Service for managing AI-driven conversations.
 * It also includes a parrot watcher functionality.
 */
const conversationAiService = new ConversationAiService();
conversationAiService.parrotWatcher();

/**
 * The current message being typed by the user.
 */
const message = ref('');

/**
 * A map of originator names to their assigned background colors.
 * Used to visually distinguish different participants in the chat.
 */
const colors = ref<Record<string, string>>({});

/**
 * Retrieves or generates a background color for a given originator.
 * If the originator is 'You', it returns undefined (no special background).
 * If a color is already assigned to the originator, it returns that color.
 * Otherwise, it generates a random light HSAL color and stores it.
 * 
 * @param originator The name of the person who sent the message.
 * @returns The HSL color string or undefined.
 */
function getOriginatorColor(originator: string) {
  if (originator === 'You') return undefined;
  if (colors.value[originator]) return colors.value[originator];

  const hue = Math.floor(Math.random() * 360);
  const color = `hsl(${hue}, 70%, 85%)`;
  colors.value[originator] = color;
  return color;
}

/**
 * Template ref for the chat container element to allow for auto-scrolling.
 */
const chatContainer = useTemplateRef('chatContainer');

/**
 * Sends the current message to the chat store.
 * Clears the input message after sending.
 *
 * @param originator The name of the person who sent the message.
 */
function sendMessage() {
  chatStore.addMessage('You', message.value);
  message.value = '';
}

/**
 * Watcher to automatically scroll the chat container to the bottom
 * whenever a new message is added to the chat store.
 */
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
    <div class="chat-container" ref="chatContainer">
      <div v-for="(msg, index) in chatStore.messages" :key="index" class="chat-message">
        <strong v-if="msg.originator === 'You'" class="message-self">{{ msg.originator }}: {{ msg.message }}</strong>
        <strong v-else class="message-other" :style="{ backgroundColor: getOriginatorColor(msg.originator) }">{{ msg.message }} :{{ msg.originator }}</strong>
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
}

.message-self {
  align-self: flex-start;
  background-color: #dcf8c6; /* Light green */
  border: 1px solid #c5e1a5;
}

.message-other {
  align-self: flex-end;
  justify-self: end;
  background-color: #3771d4; /* Light green */
  border: 1px solid #c5e1a5;
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
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}
</style>

