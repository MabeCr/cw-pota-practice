import { ref } from 'vue';
import { getAudioGraph } from '@/composables/useMorse';
import { useSettingsStore } from '@/stores/settingsStore';
import { MORSE_CODE } from '@/constants/morse';

type ElementType = 'dit' | 'dah';

// ─── reverse morse table ──────────────────────────────────────────────────────
// Filters out the space entry (word gaps are handled by inter-word timer).
const REVERSE_MORSE: Record<string, string> = Object.fromEntries(
    Object.entries(MORSE_CODE)
        .filter(([letter, code]) => letter !== ' ' && code.trim().length > 0)
        .map(([letter, code]) => [code, letter])
);

// ─── reactive state (exported for UI binding) ─────────────────────────────────
const isDitPressed    = ref(false);
const isDahPressed    = ref(false);
const decodedCharCount = ref(0);   // increments every time a char/space is decoded
const lastDecodedChar  = ref('');  // the most recently decoded character or ' '
const errorSignal      = ref(0);   // increments when the error procedure fires

// ─── keyer timing state ───────────────────────────────────────────────────────
let ditHeld       = false;
let dahHeld       = false;
let iambicRunning = false;
let lastElement: ElementType = 'dit';
let squeezeMemory = false;

// ─── straight key state ───────────────────────────────────────────────────────
let straightOsc:        OscillatorNode | null = null;
let straightGain:       GainNode | null       = null;
let straightKeyDownTime = 0;

// ─── decoder state ────────────────────────────────────────────────────────────
let currentSymbol      = '';
let consecutiveDitCount = 0;
let errorFired         = false;   // prevents multiple error triggers per error run
let hadCharSinceReset  = false;   // guards against spurious word spaces
let charTimer: ReturnType<typeof setTimeout> | null = null;
let wordTimer: ReturnType<typeof setTimeout> | null = null;

// ─── timing helpers ───────────────────────────────────────────────────────────
function getDitMs(): number {
    return 1200 / useSettingsStore().wpm;
}

function getRampS(): number {
    return useSettingsStore().rampTime / 1000;
}

// ─── decoder logic ────────────────────────────────────────────────────────────

function cancelBoundaryTimers(): void {
    if (charTimer) { clearTimeout(charTimer); charTimer = null; }
    if (wordTimer) { clearTimeout(wordTimer); wordTimer = null; }
}

function decodeCurrentSymbol(): void {
    charTimer = null;
    if (currentSymbol) {
        lastDecodedChar.value = REVERSE_MORSE[currentSymbol] ?? '?';
        decodedCharCount.value++;
        hadCharSinceReset = true;
    }
    currentSymbol       = '';
    consecutiveDitCount = 0;
    errorFired          = false;
}

function insertWordSpace(): void {
    wordTimer = null;
    if (hadCharSinceReset) {
        lastDecodedChar.value = ' ';
        decodedCharCount.value++;
        hadCharSinceReset = false;
    }
    currentSymbol       = '';
    consecutiveDitCount = 0;
    errorFired          = false;
}

// elapsedDits: how many dits of silence have already passed before this call.
// Iambic: 1 (the inter-element space), straight key: 0 (silence starts at key-up).
function startCharBoundaryTimers(elapsedDits: number): void {
    cancelBoundaryTimers();
    const ditMs = getDitMs();
    charTimer = setTimeout(decodeCurrentSymbol, Math.max(0, (3 - elapsedDits) * ditMs));
    wordTimer = setTimeout(insertWordSpace,      Math.max(0, (7 - elapsedDits) * ditMs));
}

// Called at the start of every element (dit or dah).
function onElementDecoded(type: '.' | '-'): void {
    if (type === '.') {
        consecutiveDitCount++;
        // 8+ consecutive dits (HH) = error procedure — clears the last word
        if (!errorFired && consecutiveDitCount >= 8) {
            currentSymbol = '';
            errorFired    = true;
            errorSignal.value++;
            return;
        }
        if (!errorFired) currentSymbol += '.';
    } else {
        consecutiveDitCount = 0;
        errorFired          = false;
        currentSymbol      += '-';
    }
}

// ─── iambic audio ─────────────────────────────────────────────────────────────

function playElement(type: ElementType): void {
    const settings = useSettingsStore();
    const { ctx, target } = getAudioGraph();

    const ditS      = getDitMs() / 1000;
    const durationS = type === 'dit' ? ditS : ditS * 3;
    const rampS     = Math.min(getRampS(), durationS / 2);

    squeezeMemory = false;
    lastElement   = type;
    cancelBoundaryTimers();
    onElementDecoded(type === 'dit' ? '.' : '-');

    const osc  = ctx.createOscillator();
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

    setTimeout(scheduleNext, (durationS + ditS) * 1000);
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
        // 1 dit of inter-element silence has already elapsed
        startCharBoundaryTimers(1);
    }
}

// ─── straight key audio ───────────────────────────────────────────────────────

function startStraightKey(): void {
    if (straightOsc) return;
    const settings = useSettingsStore();
    const { ctx, target } = getAudioGraph();
    const rampS = getRampS();

    cancelBoundaryTimers();
    straightKeyDownTime = performance.now();

    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(settings.frequency, ctx.currentTime);
    osc.connect(gain);
    gain.connect(target);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(1, ctx.currentTime + rampS);
    osc.start();

    straightOsc  = osc;
    straightGain = gain;
}

function stopStraightKey(force = false): void {
    if (!straightOsc || !straightGain) return;
    if (!force && (ditHeld || dahHeld)) return;

    // Classify the element by duration only on a natural key-up (not forced blur).
    if (!force && straightKeyDownTime > 0) {
        const durationMs = performance.now() - straightKeyDownTime;
        // Dit: < 2× reference, Dah: ≥ 2× reference
        onElementDecoded(durationMs < getDitMs() * 2 ? '.' : '-');
        startCharBoundaryTimers(0);
    }
    straightKeyDownTime = 0;

    const { ctx } = getAudioGraph();
    const rampS = getRampS();
    straightGain.gain.cancelScheduledValues(ctx.currentTime);
    straightGain.gain.setValueAtTime(straightGain.gain.value, ctx.currentTime);
    straightGain.gain.linearRampToValueAtTime(0, ctx.currentTime + rampS);
    straightOsc.stop(ctx.currentTime + rampS + 0.01);
    straightOsc  = null;
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

    // Blur handler: clears held state (iambic stops after current element finishes
    // naturally), immediately stops straight key, and cancels pending decodes.
    function cleanup(): void {
        ditHeld       = false;
        dahHeld       = false;
        squeezeMemory = false;
        isDitPressed.value = false;
        isDahPressed.value = false;
        cancelBoundaryTimers();
        currentSymbol       = '';
        consecutiveDitCount = 0;
        errorFired          = false;
        stopStraightKey(true);
    }

    return {
        onDitDown, onDitUp, onDahDown, onDahUp, cleanup,
        isDitPressed, isDahPressed,
        decodedCharCount, lastDecodedChar, errorSignal,
    };
}
