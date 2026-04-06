import { US_STATES } from './../constants/states';

/**
 * Composable providing utilities for validating QSO (contact) data,
 * such as callsigns, RST reports, and state codes.
 */
export function useQsoUtils() {
    /** Regex for validating amateur radio callsigns (e.g., K1ABC, AA1AB, etc.) */
    const callRegEx: RegExp = new RegExp(/^(?:A[A-L][0-9][A-Z]{1,2}|[KNW][A-Z]{0,1}[0-9][A-Z]{1,3}|[KNW][0-9][A-Z]{1,3})$/i);

    /** Regex for validating RST (Readability, Strength, Tone) signal reports (e.g., 599, 59N) */
    const rstRegEx: RegExp = new RegExp(/^[1-5][1-9][1-9Nn]$/);

    /**
     * Validates if a string is a valid amateur radio callsign.
     * 
     * @param callString - The callsign string to validate.
     * @returns True if the callsign matches the expected pattern, false otherwise.
     */
    const validateCall = (callString: string) => {
        return callRegEx.test(callString);
    };

    /**
     * Validates if a string is a valid RST signal report.
     * 
     * @param rstString - The RST report string to validate.
     * @returns True if the RST report matches the expected pattern, false otherwise.
     */
    const validateRST = (rstString: string) => {
        return rstRegEx.test(rstString);
    };

    /**
     * Validates if a given state code is a valid US state code.
     * 
     * @param stateCode - The state code to validate (e.g., 'CA', 'ny').
     * @returns True if the code matches a known US state, false otherwise.
     */
    const validateState = (stateCode: string) => {
        return US_STATES.some(state => state.code.toLowerCase() === stateCode.toLocaleLowerCase());
    }

    return { validateCall, validateRST, validateState };
}