<script lang="ts" setup>
import { ref } from 'vue'
import { useChatStore } from '../stores/chatStore'

const messageLog = useChatStore();

const message = ref('');

function sendMessage() {
  messageLog.addMessage('You', message.value);
  message.value = '';
}

</script>

<template>
  <div class="conversation-input-container">
    <div class="chat-container">
      <div v-for="(msg, index) in messageLog.messages" :key="index" class="chat-message">
        <strong>{{ msg.originator }}:</strong> {{ msg.message }}
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

.chat-input {
  flex: 1;
  padding: 10px;
  border: 2px solid #333;
  border-radius: 5px;
  font-size: 16px;
  resize: none;
  height: 80vh;
  width: 80%;
  margin-top: 70vh;
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
