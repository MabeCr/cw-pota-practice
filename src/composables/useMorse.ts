import { MORSE_CODE } from '@/constants/morse'

/** The duration unit in milliseconds for Morse code signals */
const DURATION_UNIT = 500;
/** The base frequency in Hz for the oscillator */
const FREQUENCY = 440;

/**
 * Composable to handle Morse code conversion and playback.
 */
export function useMorse() {
  /**
   * Converts a given string into its Morse code representation.
   * 
   * @param text - The input string to convert.
   * @returns A string representing the Morse code.
   */
  const textToMorse = (text: string): string =>
    text
      .toUpperCase()
      .split('')
      .map((char) => MORSE_CODE[char] || '')
      .join()

  /**
   * Plays the Morse code representation of the provided text using Web Audio API.
   * 
   * @param text - The input string to be converted and played.
   */
  const playMorse = (text: string) => {
    const morseCode = textToMorse(text);
    console.log(morseCode);

    // Initialize Web Audio API context
    const audioContext = new AudioContext()
    const oscillator = audioContext.createOscillator();
    
    // Configure oscillator settings
    oscillator.type = "sine";
    
    // Set the frequency at the current time
    // Note: Current implementation plays a continuous tone; 
    // logic for dots/dashes timing needs to be implemented.
    oscillator.frequency.setValueAtTime(FREQUENCY, audioContext.currentTime)
    
    oscillator.start();
  }

  return { textToMorse, playMorse };
}
