import { US_STATES } from './../constants/states';

export function useQsoUtils() {
    const callRegEx: RegExp = new RegExp(/^(?:A[A-L][0-9][A-Z]{1,2}|[KNW][A-Z]{0,1}[0-9][A-Z]{1,3}|[KNW][0-9][A-Z]{1,3})$/i);

    const rstRegEx: RegExp = new RegExp(/^[1-5][1-9][1-9Nn]$/);

    const validateCall = (callString: string) => {
        return callRegEx.test(callString);
    };

    const validateRST = (rstString: string) => {
        return rstRegEx.test(rstString);
    };

    const validateState = (stateCode: string) => {
        return US_STATES.some(state => state.code.toLowerCase() === stateCode.toLocaleLowerCase());
    }

    return { validateCall, validateRST, validateState };
}