// Validates amateur radio callsign format: 1-2 letter prefix, 1-2 digit district, 1-4 letter suffix.
// Examples that pass: N9MET, W1AW, KD8VXQ, W8TK, KA8RST
export function isValidCallsign(s: string): boolean {
    return /^[A-Z]{1,2}[0-9]{1,2}[A-Z]{1,4}$/i.test(s.trim())
}
