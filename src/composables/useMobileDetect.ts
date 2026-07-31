import { ref } from 'vue'

const MQ = typeof window !== 'undefined'
    ? window.matchMedia('(max-width: 768px)')
    : null

const isMobile = ref(MQ?.matches ?? false)

MQ?.addEventListener('change', (e) => { isMobile.value = e.matches })

export function useMobileDetect() {
    return { isMobile }
}
