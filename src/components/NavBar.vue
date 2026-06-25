<template>
  <nav class="navbar">
    <RouterLink to="/" class="navbar-brand">CW POTA Practice</RouterLink>
    <div class="navbar-links">
      <RouterLink to="/" :end="true">Home</RouterLink>
      <RouterLink to="/operation">Operation</RouterLink>
      <RouterLink to="/logbook">Logbook</RouterLink>
      <RouterLink to="/preferences">Preferences</RouterLink>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 0 24px;
  height: 52px;
  background-color: #1e293b;
  flex-shrink: 0;
}

.navbar-brand {
  color: #f1f5f9;
  font-weight: 700;
  font-size: 1rem;
  text-decoration: none;
  letter-spacing: 0.03em;
}

.navbar-links {
  display: flex;
  gap: 8px;
}

.navbar-links a {
  color: #94a3b8;
  text-decoration: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: color 0.15s, background-color 0.15s;
}

.navbar-links a:hover {
  color: #f1f5f9;
  background-color: #334155;
}

.navbar-links a.router-link-active {
  color: #f1f5f9;
  background-color: #3771d4;
}
</style>
