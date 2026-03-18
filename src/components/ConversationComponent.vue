<script lang="ts" setup>
import { ref } from 'vue'

const message = ref('Test')
</script>

<template>
  <div class="chat-input-container">
    <textarea v-model="message" class="chat-input" placeholder="Type your message here..."></textarea>
    <div class="send-button-container">
      <button class="send-button">Send</button>
    </div>
  </div>
</template>

<style scoped>
.chat-input-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 80vh;
  width: 100%;
}

.chat-input {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  resize: none;
  height: 80vh;
  width: 80%;
  margin-top: 20vh;
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
