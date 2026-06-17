export const QSO_STEPS = [
    'CQ',
    'HUNTER_CALL',
    'ACTIVATOR_RST',
    'HUNTER_RST',
    'ACTIVATOR_FINISH',
    'HUNTER_FINISH'
] as const;

export type QsoSteps = typeof QSO_STEPS[number]; 
