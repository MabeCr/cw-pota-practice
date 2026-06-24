import { MORSE_CODE } from '@/constants/morse'

const WPM = 15;
const FREQUENCY = 600; // Hz — 600 is a typical CW sidetone pitch
const RAMP_TIME = 0.008; // 8ms rise/fall to eliminate keying clicks

// Singleton audio graph — shared across all callers so concurrent hunters each get
// their own oscillator/gain chain without hitting browser context limits.
// All per-message gain nodes feed through a single compressor before the destination
// to prevent clipping when multiple stations transmit simultaneously.
let audioContext: AudioContext | null = null;
let compressor: DynamicsCompressorNode | null = null;

function getAudioGraph(): { ctx: AudioContext; target: AudioNode } {
    if (!audioContext || audioContext.state === 'closed') {
        audioContext = new AudioContext();
        compressor = audioContext.createDynamicsCompressor();
        compressor.attack.setValueAtTime(0.001, audioContext.currentTime); // fast enough to catch CW key-on
        compressor.release.setValueAtTime(0.1, audioContext.currentTime);
        compressor.connect(audioContext.destination);
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
        const dit = 1200 / wpm / 1000; // dit duration in seconds

        // Each call gets its own oscillator+gain pair so concurrent messages
        // play independently without overwriting each other's scheduled events.
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
                        t += dit;       // intra-character: 1 unit
                    } else if (!isLastChar) {
                        t += dit * 3;   // inter-character: 3 units
                    } else if (!isLastWord) {
                        t += dit * 7;   // inter-word: 7 units
                    }
                });
            });
        });

        oscillator.stop(t + 0.1);
    };

    return { textToMorse, playMorse };
}
