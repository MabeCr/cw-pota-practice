export const QSO_STEPS = [
    'CQ',
    'EXCHANGE',
    'CONFIRM',
    'LOGGING',
    'COMPLETED'
] as const;

export type QsoSteps = typeof QSO_STEPS[number]; 
