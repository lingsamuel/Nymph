// Well, it's not a good idea to validate RecordID in compile time while the real data is not in Nymph.
// type LowerAlpha = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z'
// type UpperAlpha = `${uppercase LowerAlpha}`
// type Alpha = LowerAlpha | UpperAlpha;
// type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
// type Punctuation = "_" | "-"
// type ValidChar = Alpha | Digit | Punctuation;

import {ListMutateDef} from "./operator/ListMutateOperator";
import {ElementMatcherDef} from "./operator/ListMatcher";
import {ListRemoveDef} from "./operator/ListRemoveOperator";

export type RecordID = string;
export type PropertyName = string;
export type EntryReference = string;

export type PatchStrategy = {
    "$strategy": PatchStrategyType,
}

export type PatchStrategyType = "merge" | "replace" | "replace-exist" | "add-newly";

export type PatchImport = {
    "$import": EntryReference,
}

export type PatchRemove = {
    "$remove": PropertyName[],
}

export type PatchKeep = {
    "$keep": "exist"
} | {
    "$keep": "ref",
    "$keep-ref": EntryReference,
}

export type PatchNonList = PatchStrategy & Partial<PatchImport | PatchRemove | PatchKeep>;


export type PatchListKeepElement = {
    "$list-keep": {
        "$to": EntryReference,
    }
} & PatchKeep;

export type ListElementMatcherDef = ElementMatcherDef | number | "-" | EntryReference;

export type ListMatcherStrategy = "first" | "last" | "all";

export type ListPropertyPatch = {
    "$strategy-list": "replace",
} | ({
    "$strategy-list": "append" | "prepend",
} & Partial<ListRemoveDef | ListMutateDef | PatchListKeepElement>
    );

export function isObject(value: any) {
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
