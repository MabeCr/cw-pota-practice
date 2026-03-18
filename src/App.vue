<script setup lang="ts">
import LogComponent from './components/LogComponent.vue';
import ConversationComponent from './components/ConversationComponent.vue';
</script>

<template>
  <div class="app-container">
    <div class="left-half">
      <LogComponent />
    </div>
    <div class="right-half">
      <ConversationComponent />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: row;
  height: 100vh;
}

.left-half {
  flex: 1;
}

.right-half {
  flex: 1;
}
</style>
