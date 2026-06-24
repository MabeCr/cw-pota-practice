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
        audioContext = new AudioContext();

        compressor = audioContext.createDynamicsCompressor();
        compressor.attack.setValueAtTime(0.001, audioContext.currentTime);
        compressor.release.setValueAtTime(0.1, audioContext.currentTime);

        masterGain = audioContext.createGain();
        masterGain.gain.setValueAtTime(isMuted.value ? 0 : volume.value, audioContext.currentTime);

        compressor.connect(masterGain);
        masterGain.connect(audioContext.destination);
    }
    return { ctx: audioContext, target: compressor! };
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
