const CODE_MAP: Record<string, string> = {
    ShiftLeft: 'L-Shift',   ShiftRight: 'R-Shift',
    ControlLeft: 'L-Ctrl',  ControlRight: 'R-Ctrl',
    AltLeft: 'L-Alt',       AltRight: 'R-Alt',
    MetaLeft: 'L-Meta',     MetaRight: 'R-Meta',
    BracketLeft: '[',        BracketRight: ']',
    Semicolon: ';',          Quote: "'",
    Backslash: '\\',         Comma: ',',
    Period: '.',             Slash: '/',
    Backquote: '`',          Minus: '-',
    Equal: '=',
    Space: 'Space',          Enter: 'Enter',
    Tab: 'Tab',              Escape: 'Esc',
    Backspace: 'Bksp',
    ArrowLeft: '←',          ArrowRight: '→',
    ArrowUp: '↑',            ArrowDown: '↓',
}

export function keyLabel(code: string): string {
    if (code in CODE_MAP) return CODE_MAP[code]!
    if (/^Key[A-Z]$/.test(code)) return code.slice(3)          // KeyA → A
    if (/^Digit\d$/.test(code)) return code.slice(5)           // Digit1 → 1
    if (code.startsWith('Numpad')) return 'Num' + code.slice(6) // Numpad0 → Num0
    if (/^F\d+$/.test(code)) return code                        // F1, F2…
    return code
}
