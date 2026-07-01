<script setup lang="ts">
import NavBar from '@/components/NavBar.vue';
</script>

<template>
  <div class="app-layout">
    <NavBar />
    <main class="app-content">
      <RouterView />
    </main>
  </div>
</template>

<style>
:root {
  --font-sans: 'IBM Plex Sans', system-ui, -apple-system, sans-serif;
  --font-mono: 'IBM Plex Mono', 'Courier New', Courier, monospace;
  --bg-page: #eef0f5;
}

html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: var(--font-sans);
  background-color: var(--bg-page);
  color: #1a1a1a;
}

*, *::before, *::after {
  box-sizing: border-box;
}
</style>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.app-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: var(--bg-page);
}
</style>
