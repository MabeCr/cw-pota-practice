import { ref } from 'vue'
import { MORSE_CODE } from '@/constants/morse'
import { useSettingsStore } from '@/stores/settingsStore'

const WPM = 15;
const FREQUENCY = 600; // Hz — 600 is a typical CW sidetone pitch

// Module-level singletons so volume state and the audio graph are shared
// across every caller of useMorse().
let audioContext: AudioContext | null = null;
let compressor: DynamicsCompressorNode | null = null;
let masterGain: GainNode | null = null;

let noiseSource: AudioBufferSourceNode | null = null;
let noiseGain: GainNode | null = null;

const MAX_NOISE_GAIN = 0.4;

function applyNoiseLevel(): void {
    if (!noiseGain || !audioContext) return;
    const level = useSettingsStore().noiseLevel;
    noiseGain.gain.setValueAtTime((level / 100) * MAX_NOISE_GAIN, audioContext.currentTime);
}

function startNoise(ctx: AudioContext, target: AudioNode): void {
    if (noiseSource) { applyNoiseLevel(); return; }

    // 10-second white noise buffer — long loop avoids audible seam
    const bufferSize = ctx.sampleRate * 10;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    // HP + LP chain: simulate receiver bandwidth (≈200 Hz – 3 kHz)
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(200, ctx.currentTime);

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(3000, ctx.currentTime);

    noiseGain = ctx.createGain();
    applyNoiseLevel();

    noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;
    noiseSource.connect(hp);
    hp.connect(lp);
    lp.connect(noiseGain);
    noiseGain.connect(target);
    noiseSource.start();
}

const volume = ref(0.8);   // 0–1
const isMuted = ref(false);

function applyVolume(): void {
    if (masterGain && audioContext) {
        masterGain.gain.setValueAtTime(
            isMuted.value ? 0 : volume.value,
            audioContext.currentTime
        );
    }
}

export function getAudioGraph(): { ctx: AudioContext; target: AudioNode } {
    if (!audioContext || audioContext.state === 'closed') {
        noiseSource = null;
        noiseGain = null;

        audioContext = new AudioContext();

        compressor = audioContext.createDynamicsCompressor();
        compressor.attack.setValueAtTime(0.001, audioContext.currentTime);
        compressor.release.setValueAtTime(0.1, audioContext.currentTime);

        masterGain = audioContext.createGain();
        masterGain.gain.setValueAtTime(isMuted.value ? 0 : volume.value, audioContext.currentTime);

        compressor.connect(masterGain);
        masterGain.connect(audioContext.destination);
    } else if (audioContext.state === 'suspended') {
        void audioContext.resume();
    }
    startNoise(audioContext, compressor!);
    return { ctx: audioContext, target: compressor! };
}

export function startBackgroundNoise(): void {
    getAudioGraph(); // ensures context is live and noise is running
}

export function setNoiseLevel(level: number): void {
    useSettingsStore().setNoiseLevel(level);
    applyNoiseLevel();
}

export function suspendAudio(): void {
    if (audioContext && audioContext.state === 'running') {
        void audioContext.suspend();
    }
}

export function useMorse() {
    const textToMorse = (text: string): string =>
        text
            .toUpperCase()
            .split('')
            .map((char) => MORSE_CODE[char] || '')
            .join(' ')

    const playMorse = (text: string, wpm: number = WPM, frequency: number = FREQUENCY): void => {
        const { ctx, target } = getAudioGraph();
        const RAMP_TIME = useSettingsStore().rampTime / 1000;
        const dit = 1200 / wpm / 1000;

        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
        oscillator.connect(gain);
        gain.connect(target);
        gain.gain.setValueAtTime(0, ctx.currentTime);

        oscillator.start();

        let t = ctx.currentTime;

        const words = text.toUpperCase().split(/\s+/).filter(w => w.length > 0);

        words.forEach((word, wi) => {
            const isLastWord = wi === words.length - 1;

            word.split('').forEach((char, ci) => {
                const isLastChar = ci === word.length - 1;
                const code = MORSE_CODE[char];
                if (!code) return;

                code.split('').forEach((element, ei) => {
                    const isLastElement = ei === code.length - 1;
                    const elementDuration = element === '-' ? dit * 3 : dit;

                    gain.gain.setValueAtTime(0, t);
                    gain.gain.linearRampToValueAtTime(1, t + RAMP_TIME);
                    gain.gain.setValueAtTime(1, t + elementDuration - RAMP_TIME);
                    gain.gain.linearRampToValueAtTime(0, t + elementDuration);

                    t += elementDuration;

                    if (!isLastElement) {
                        t += dit;
                    } else if (!isLastChar) {
                        t += dit * 3;
                    } else if (!isLastWord) {
                        t += dit * 7;
                    }
                });
            });
        });

        oscillator.stop(t + 0.1);
    };

    const setVolume = (value: number): void => {
        volume.value = value;
        if (isMuted.value && value > 0) isMuted.value = false;
        applyVolume();
    };

    const toggleMute = (): void => {
        isMuted.value = !isMuted.value;
        applyVolume();
    };

    return { textToMorse, playMorse, volume, isMuted, setVolume, toggleMute };
}
