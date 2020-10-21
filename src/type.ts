// Well, it's not a good idea to validate RecordID in compile time while the real data is not in Nymph.
// type LowerAlpha = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z'
// type UpperAlpha = `${uppercase LowerAlpha}`
// type Alpha = LowerAlpha | UpperAlpha;
// type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
// type Punctuation = "_" | "-"
// type ValidChar = Alpha | Digit | Punctuation;

import {NymphPatchObject, NymphPrimitiveType} from "./merger";

export function isArray(value: any): value is NymphPatchObject[] {
    return Array.isArray(value);
}

export function isPrimitive(value: any): value is NymphPrimitiveType {
    return typeof value == "number" || typeof value == "string" || typeof value == "boolean";
}

export function isObject(value: any): value is NymphPatchObject {
    // Basic check for Type object that's not null
    if (typeof value === "object" && value !== null) {
        // If Object.getPrototypeOf supported, use it
        if (typeof Object.getPrototypeOf === "function") {
            const proto = Object.getPrototypeOf(value);
            return proto === Object.prototype || proto === null;
        }

        // Otherwise, use internal class
        // This should be reliable as if getPrototypeOf not supported, is pre-ES5
        return Object.prototype.toString.call(value) === "[object Object]";
    }

    // Not an object
    return false;
}
