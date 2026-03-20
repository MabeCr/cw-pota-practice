<script lang="ts" setup>
import { ref, useTemplateRef, nextTick, watch } from 'vue';
import { useChatStore } from '../stores/chatStore';
import { ConversationAiService } from '@/services/conversationAiService';

const chatStore = useChatStore();
const conversationAiService = new ConversationAiService();
conversationAiService.parrotWatcher();

const message = ref('');

const chatContainer = useTemplateRef('chatContainer');

function sendMessage() {
  chatStore.addMessage('You', message.value);
  message.value = '';
}

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
        <strong v-else class="message-other">{{ msg.message }} :{{ msg.originator }}</strong>
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
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}
</style>
