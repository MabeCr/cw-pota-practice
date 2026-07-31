<script setup lang="ts">
import { watch } from 'vue';
import NavBar from '@/components/NavBar.vue';
import TutorialOverlay from '@/components/TutorialOverlay.vue';
import { useSettingsStore } from '@/stores/settingsStore';

const settings = useSettingsStore();

watch(() => settings.theme, (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
}, { immediate: true });
</script>

<template>
  <div class="app-layout">
    <NavBar />
    <main class="app-content">
      <RouterView />
    </main>
    <TutorialOverlay />
  </div>
</template>

<style>
:root {
  --font-sans: 'IBM Plex Sans', system-ui, -apple-system, sans-serif;
  --font-mono: 'IBM Plex Mono', 'Courier New', Courier, monospace;

  /* ── Light theme (default) ─────────────────────────── */
  --bg-page:        #eef0f5;
  --bg-surface:     #ffffff;
  --bg-surface-alt: #f7f8fb;
  --bg-input:       #fafbfc;
  --border-subtle:  #f0f1f6;
  --border-default: #dde0e8;
  --border-strong:  #c0c0c0;
  --text-primary:   #1a1a1a;
  --text-secondary: #444444;
  --text-muted:     #888888;
  --text-faint:     #bbbbbb;

  --accent:         #3771d4;
  --accent-text:    #3771d4;
  --accent-light:   #eff6ff;
  --accent-light-2: #dbeafe;
  --accent-dark:    #1d4ed8;
  --accent-hover:   #2b5aab;
  --accent-shadow:  rgba(55, 113, 212, 0.18);

  --badge-active-bg:    #dbeafe; --badge-active-text:   #1d4ed8;
  --badge-ended-bg:     #f0f0f0; --badge-ended-text:    #666666;
  --badge-success-bg:   #d1fae5; --badge-success-text:  #065f46;
  --badge-error-bg:     #fee2e2; --badge-error-text:    #b91c1c;
  --badge-warn-bg:      #fef3c7; --badge-warn-text:     #92400e;

  --btn-success:        #16a34a; --btn-success-hover:   #15803d;
  --btn-danger-bg:      #fee2e2; --btn-danger-text:     #b91c1c; --btn-danger-hover:  #fecaca;
  --btn-reopen-bg:      #d1fae5; --btn-reopen-text:     #065f46; --btn-reopen-hover:  #a7f3d0;

  --ended-banner-bg:    #fef3c7; --ended-banner-border: #fcd34d; --ended-banner-text: #92400e;
  --row-highlight-bg:   #fef9c3; --row-highlight-border: #fcd34d;
  --msg-self-bg:        #dcf8c6; --msg-self-border:     #c5e1a5;

  --nav-bg:              #141e2e;
  --nav-border:          rgba(255, 255, 255, 0.05);
  --nav-brand-cw:        #60a5fa;
  --nav-brand-sep:       #2d3f5a;
  --nav-brand-name:      #94a3b8;
  --nav-link:            #64748b;
  --nav-link-hover-text: #e2e8f0;
  --nav-link-hover-bg:   rgba(255, 255, 255, 0.07);

  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04);
}

/* ── Dark theme ────────────────────────────────────────── */
[data-theme="dark"] {
  --bg-page:        #0f1117;
  --bg-surface:     #1a1d27;
  --bg-surface-alt: #1e2231;
  --bg-input:       #222635;
  --border-subtle:  #252838;
  --border-default: #2e3347;
  --border-strong:  #404560;
  --text-primary:   #e2e5f0;
  --text-secondary: #9098b0;
  --text-muted:     #606880;
  --text-faint:     #3a3f55;

  --accent:         #5b8dee;
  --accent-text:    #7aa4f4;
  --accent-light:   #1a2540;
  --accent-light-2: #162038;
  --accent-dark:    #4a7ade;
  --accent-hover:   #4a7ade;
  --accent-shadow:  rgba(91, 141, 238, 0.25);

  --badge-active-bg:    #162038; --badge-active-text:   #7aa4f4;
  --badge-ended-bg:     #222530; --badge-ended-text:    #606880;
  --badge-success-bg:   #052e16; --badge-success-text:  #4ade80;
  --badge-error-bg:     #450a0a; --badge-error-text:    #f87171;
  --badge-warn-bg:      #3a2500; --badge-warn-text:     #fbbf24;

  --btn-success:        #16a34a; --btn-success-hover:   #15803d;
  --btn-danger-bg:      #450a0a; --btn-danger-text:     #f87171; --btn-danger-hover:  #5a1010;
  --btn-reopen-bg:      #052e16; --btn-reopen-text:     #4ade80; --btn-reopen-hover:  #063a1e;

  --ended-banner-bg:    #3a2500; --ended-banner-border: #78400a; --ended-banner-text: #fbbf24;
  --row-highlight-bg:   #2a2500; --row-highlight-border: #78400a;
  --msg-self-bg:        #1a3028; --msg-self-border:     #1c4032;

  --nav-bg:              #090c14;
  --nav-border:          rgba(255, 255, 255, 0.04);
  --nav-brand-cw:        #7aa4f4;
  --nav-brand-sep:       #1a2336;
  --nav-brand-name:      #4a5676;
  --nav-link:            #3e4862;
  --nav-link-hover-text: #b0bcd4;
  --nav-link-hover-bg:   rgba(255, 255, 255, 0.06);

  --shadow-card: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.04);
}

/* ── Warm theme ────────────────────────────────────────── */
[data-theme="warm"] {
  --bg-page:        #e8dfd0;
  --bg-surface:     #f5efe4;
  --bg-surface-alt: #ede6d8;
  --bg-input:       #f0e9db;
  --border-subtle:  #ddd3c0;
  --border-default: #c8b898;
  --border-strong:  #b0a080;
  --text-primary:   #2c1f0e;
  --text-secondary: #5a4030;
  --text-muted:     #8a7060;
  --text-faint:     #b09880;

  --accent:         #8b5e2a;
  --accent-text:    #7a4e1e;
  --accent-light:   #f0e6d8;
  --accent-light-2: #e8d8c4;
  --accent-dark:    #6e4010;
  --accent-hover:   #6e4a1e;
  --accent-shadow:  rgba(139, 94, 42, 0.2);

  --badge-active-bg:    #e8d8c4; --badge-active-text:   #6e4010;
  --badge-ended-bg:     #ddd3c0; --badge-ended-text:    #8a7060;
  --badge-success-bg:   #c8e8c0; --badge-success-text:  #2a5c2a;
  --badge-error-bg:     #f0c8c0; --badge-error-text:    #8c2020;
  --badge-warn-bg:      #f0e0a0; --badge-warn-text:     #705010;

  --btn-success:        #2a7a3a; --btn-success-hover:   #206030;
  --btn-danger-bg:      #f0c8c0; --btn-danger-text:     #8c2020; --btn-danger-hover:  #e8b8b0;
  --btn-reopen-bg:      #c8e8c0; --btn-reopen-text:     #2a5c2a; --btn-reopen-hover:  #b8d8b0;

  --ended-banner-bg:    #f0e0a0; --ended-banner-border: #d8c060; --ended-banner-text: #705010;
  --row-highlight-bg:   #f0e0a0; --row-highlight-border: #d8c060;
  --msg-self-bg:        #d8e8c8; --msg-self-border:     #c0d8b0;

  --nav-bg:              #2c1f0e;
  --nav-border:          rgba(255, 255, 255, 0.06);
  --nav-brand-cw:        #d4a96a;
  --nav-brand-sep:       #4a3520;
  --nav-brand-name:      #9a8060;
  --nav-link:            #7a6048;
  --nav-link-hover-text: #e8d8c0;
  --nav-link-hover-bg:   rgba(255, 255, 255, 0.08);

  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.07);
}

html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: var(--font-sans);
  background-color: var(--bg-page);
  color: var(--text-primary);
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
