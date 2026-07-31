import { ref } from 'vue'

// Single source of truth for the JS side of the mobile breakpoint.
// CSS @media conditions cannot reference JS or CSS custom properties, so each
// component's <style> block still contains `@media (max-width: 768px)` directly.
// If you change this value, update all CSS @media blocks to match.
export const MOBILE_BREAKPOINT_PX = 768

const MQ = typeof window !== 'undefined'
    ? window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX}px)`)
    : null

const isMobile = ref(MQ?.matches ?? false)

MQ?.addEventListener('change', (e) => { isMobile.value = e.matches })

export function useMobileDetect() {
    return { isMobile }
}
