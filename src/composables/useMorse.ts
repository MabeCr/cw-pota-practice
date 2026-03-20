import { MORSE_CODE } from '@/constants/morse'

const DURATION_UNIT = 500;
const FREQUENCY = 440;

export function useMorse() {
  const textToMorse = (text: string): string =>
    text
      .toUpperCase()
      .split('')
      .map((char) => MORSE_CODE[char] || '')
      .join()

  const playMorse = (text: string) => {
    const morseCode = textToMorse(text);
    console.log(morseCode);

    const audioContext = new AudioContext()
    const oscillator = audioContext.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(FREQUENCY, audioContext.currentTime)
    oscillator.start();
  }

  return { textToMorse, playMorse };
}
