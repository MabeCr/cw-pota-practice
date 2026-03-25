import { US_STATES } from './../constants/states';

export function useQsoUtils() {
    const callRegEx: RegExp = new RegExp(/^(?:A[A-L][0-9][A-Z]{1,2}|[KNW][A-Z]{0,1}[0-9][A-Z]{1,3}|[KNW][0-9][A-Z]{1,3})$/i);

    const rstRegEx: RegExp = new RegExp(/^[1-5][1-9][1-9Nn]$/);

    const callsignTypes: string[] =['1x1', '1x2', '1x3', '2x1', '2x2', '2x3'];
    const prefixes: string[]= ["k", "n", "w"];
    const alphabet: string = "abcdefghijklmnopqrstuvwxyz";

    const generateCall = () => {
        const callType = callsignTypes[Math.floor(Math.random() * callsignTypes.length)];

        let callString: string = '';

        if (callType === '1x1') {
            callString = prefixes[Math.floor(Math.random() * prefixes.length)] as string;
            callString += (Math.floor(Math.random() * 10)).toString();
            callString += alphabet[Math.floor(Math.random() * alphabet.length)] as string;
        } else if (callType === '1x2') {
            callString = prefixes[Math.floor(Math.random() * prefixes.length)] as string;
            callString += (Math.floor(Math.random() * 10)).toString();
            callString += alphabet[Math.floor(Math.random() * alphabet.length)] as string;
            callString += alphabet[Math.floor(Math.random() * alphabet.length)] as string;
        } else if (callType === '1x3') {
            callString = prefixes[Math.floor(Math.random() * prefixes.length)] as string;
            callString += (Math.floor(Math.random() * 10)).toString();
            callString += alphabet[Math.floor(Math.random() * alphabet.length)] as string;
            callString += alphabet[Math.floor(Math.random() * alphabet.length)] as string;
            callString += alphabet[Math.floor(Math.random() * alphabet.length)] as string;
        } else if (callType === '2x1') {
            callString = prefixes[Math.floor(Math.random() * prefixes.length)] as string;
            callString += alphabet[Math.floor(Math.random() * alphabet.length)] as string;
            callString += (Math.floor(Math.random() * 10)).toString();
            callString += alphabet[Math.floor(Math.random() * alphabet.length)] as string;
        } else if (callType === '2x2') {
            callString = prefixes[Math.floor(Math.random() * prefixes.length)] as string;
            callString += alphabet[Math.floor(Math.random() * alphabet.length)] as string;
            callString += (Math.floor(Math.random() * 10)).toString();
            callString += alphabet[Math.floor(Math.random() * alphabet.length)] as string;
            callString += alphabet[Math.floor(Math.random() * alphabet.length)] as string;
        } else if (callType === '2x3') {
            callString = prefixes[Math.floor(Math.random() * prefixes.length)] as string;
            callString += alphabet[Math.floor(Math.random() * alphabet.length)] as string;
            callString += (Math.floor(Math.random() * 10)).toString();
            callString += alphabet[Math.floor(Math.random() * alphabet.length)] as string;
            callString += alphabet[Math.floor(Math.random() * alphabet.length)] as string;
            callString += alphabet[Math.floor(Math.random() * alphabet.length)] as string;
        }
        return callString;
    };

    const validateCall = (callString: string) => {
        return callRegEx.test(callString);
    };

    const validateRST = (rstString: string) => {
        return rstRegEx.test(rstString);
    };

    const validateState = (stateCode: string) => {
        return US_STATES.some(state => state.code.toLowerCase() === stateCode.toLocaleLowerCase());
    }

    return { generateCall, validateCall, validateRST, validateState };
}