import { ref } from 'vue';
import { getAudioGraph } from '@/composables/useMorse';
import { useSettingsStore } from '@/stores/settingsStore';

type ElementType = 'dit' | 'dah';

// Visual state — reactive so components can bind to them
const isDitPressed = ref(false);
const isDahPressed = ref(false);

// Internal timing state — plain vars for performance
let ditHeld = false;
let dahHeld = false;
let iambicRunning = false;
let lastElement: ElementType = 'dit';
let squeezeMemory = false;     // iambic B: was opposite paddle held during current element?
let elementTimer: ReturnType<typeof setTimeout> | null = null;

// Straight key oscillator (persists while key is held)
let straightOsc: OscillatorNode | null = null;
let straightGain: GainNode | null = null;

// ─── helpers ─────────────────────────────────────────────────────────────────

function getDitS(): number {
    return 1200 / useSettingsStore().wpm / 1000;
}

function getRampS(): number {
    const settings = useSettingsStore();
    return settings.rampTime / 1000;
}

// ─── iambic ──────────────────────────────────────────────────────────────────

function playElement(type: ElementType): void {
    const settings = useSettingsStore();
    const { ctx, target } = getAudioGraph();

    const ditS = getDitS();
    const durationS = type === 'dit' ? ditS : ditS * 3;
    const rampS = Math.min(getRampS(), durationS / 2);

    lastElement = type;
    squeezeMemory = false;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(settings.frequency, ctx.currentTime);
    osc.connect(gain);
    gain.connect(target);

    const t = ctx.currentTime;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(1, t + rampS);
    gain.gain.setValueAtTime(1, t + durationS - rampS);
    gain.gain.linearRampToValueAtTime(0, t + durationS);
    osc.start(t);
    osc.stop(t + durationS + 0.05);

    // Schedule next element check after element + inter-element space
    elementTimer = setTimeout(scheduleNext, (durationS + ditS) * 1000);
}

function scheduleNext(): void {
    const { keyerType } = useSettingsStore();
    let next: ElementType | null = null;

    if (keyerType === 'iambic-b' && squeezeMemory) {
        next = lastElement === 'dit' ? 'dah' : 'dit';
    } else if (ditHeld && dahHeld) {
        next = lastElement === 'dit' ? 'dah' : 'dit';
    } else if (ditHeld) {
        next = 'dit';
    } else if (dahHeld) {
        next = 'dah';
    }

    if (next) {
        playElement(next);
    } else {
        iambicRunning = false;
    }
}

// ─── straight key ─────────────────────────────────────────────────────────────

function startStraightKey(): void {
    if (straightOsc) return;
    const settings = useSettingsStore();
    const { ctx, target } = getAudioGraph();
    const rampS = getRampS();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(settings.frequency, ctx.currentTime);
    osc.connect(gain);
    gain.connect(target);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(1, ctx.currentTime + rampS);
    osc.start();

    straightOsc = osc;
    straightGain = gain;
}

function stopStraightKey(force = false): void {
    if (!straightOsc || !straightGain) return;
    if (!force && (ditHeld || dahHeld)) return;

    const { ctx } = getAudioGraph();
    const rampS = getRampS();
    straightGain.gain.cancelScheduledValues(ctx.currentTime);
    straightGain.gain.setValueAtTime(straightGain.gain.value, ctx.currentTime);
    straightGain.gain.linearRampToValueAtTime(0, ctx.currentTime + rampS);
    straightOsc.stop(ctx.currentTime + rampS + 0.01);
    straightOsc = null;
    straightGain = null;
}

// ─── public API ───────────────────────────────────────────────────────────────

export function useKeyer() {
    function onDitDown(): void {
        if (ditHeld) return;
        ditHeld = true;
        isDitPressed.value = true;

        const { keyerType } = useSettingsStore();
        if (keyerType === 'straight') { startStraightKey(); return; }

        if (keyerType === 'iambic-b' && iambicRunning && lastElement === 'dah') {
            squeezeMemory = true;
        }
        if (!iambicRunning) {
            iambicRunning = true;
            playElement('dit');
        }
    }

    function onDitUp(): void {
        ditHeld = false;
        isDitPressed.value = false;
        if (useSettingsStore().keyerType === 'straight') stopStraightKey();
    }

    function onDahDown(): void {
        if (dahHeld) return;
        dahHeld = true;
        isDahPressed.value = true;

        const { keyerType } = useSettingsStore();
        if (keyerType === 'straight') { startStraightKey(); return; }

        if (keyerType === 'iambic-b' && iambicRunning && lastElement === 'dit') {
            squeezeMemory = true;
        }
        if (!iambicRunning) {
            iambicRunning = true;
            playElement('dah');
        }
    }

    function onDahUp(): void {
        dahHeld = false;
        isDahPressed.value = false;
        if (useSettingsStore().keyerType === 'straight') stopStraightKey();
    }

    // Called on blur: clears held state so iambic stops after current element,
    // and immediately silences the straight key.
    function cleanup(): void {
        ditHeld = false;
        dahHeld = false;
        squeezeMemory = false;
        isDitPressed.value = false;
        isDahPressed.value = false;
        stopStraightKey(true);
        // elementTimer is intentionally left running so the current iambic
        // element finishes; scheduleNext() will see no keys held and stop.
    }

    return { onDitDown, onDitUp, onDahDown, onDahUp, cleanup, isDitPressed, isDahPressed };
}
