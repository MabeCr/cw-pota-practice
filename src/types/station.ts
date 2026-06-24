import type { QsoSteps} from "@/constants/qsoStates";

export interface Station {
    callsign: string;
    state: { code: string, name: string };
    park2parkID: string | null;
    qsoStep: QsoSteps;
    frequency: number; // Hz, 400–800
    wpm: number;       // 15–20
}