import type { QsoSteps} from "@/constants/qsoStates";

export interface Station {
    callsign: string;
    state: { code: string, name: string };
    park2parkID: string | null;
    qsoStep: QsoSteps;
}