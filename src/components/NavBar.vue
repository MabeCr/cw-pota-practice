<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <nav class="navbar">
    <RouterLink to="/" class="navbar-brand">
      <span class="brand-cw">CW</span>
      <span class="brand-sep">·</span>
      <span class="brand-name">POTA Practice</span>
    </RouterLink>
    <div class="navbar-links">
      <RouterLink to="/" :end="true">Home</RouterLink>
      <RouterLink to="/operation" :class="{ 'router-link-active': route.path.startsWith('/operation') }">Operation</RouterLink>
      <RouterLink to="/logbook">Logbook</RouterLink>
      <RouterLink to="/exchange">Exchange</RouterLink>
      <RouterLink to="/preferences">Preferences</RouterLink>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  height: 58px;
  background: var(--nav-bg);
  border-bottom: 1px solid var(--nav-border);
  flex-shrink: 0;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.brand-cw {
  font-family: var(--font-mono);
  font-size: 1rem;
  font-weight: 700;
  color: var(--nav-brand-cw);
  letter-spacing: 0.1em;
}

.brand-sep {
  color: var(--nav-brand-sep);
  font-size: 1.1rem;
  line-height: 1;
  user-select: none;
}

.brand-name {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--nav-brand-name);
  letter-spacing: 0.02em;
}

.navbar-links {
  display: flex;
  gap: 2px;
}

.navbar-links a {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--nav-link);
  text-decoration: none;
  padding: 7px 14px;
  border-radius: 6px;
  letter-spacing: 0.01em;
  transition: color 0.15s, background 0.15s;
}

.navbar-links a:hover {
  color: var(--nav-link-hover-text);
  background: var(--nav-link-hover-bg);
}

.navbar-links a.router-link-active {
  color: #fff;
  background: var(--accent);
}
</style>
