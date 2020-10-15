// Well, it's not a good idea to validate RecordID in compile time while the real data is not in Nymph.

// type LowerAlpha = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z'
// type UpperAlpha = `${uppercase LowerAlpha}`
// type Alpha = LowerAlpha | UpperAlpha;
// type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
// type Punctuation = "_" | "-"
// type ValidChar = Alpha | Digit | Punctuation;

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



export type PatchListStrategy = PatchListStrategyMutate | PatchListStrategyReplace;

export type PatchListStrategyType = PatchListStrategyMutateType | PatchListStrategyReplaceType;

export type PatchListStrategyMutate = {
    "$strategy-list": "append" | "prepend",
}

export type PatchListStrategyMutateType = "append" | "prepend";

export type PatchListStrategyReplace = {
    "$strategy-list": "replace",
}

export type PatchListStrategyReplaceType = "replace";

export type PatchListRemove = {
    "$list-remove": (EntryReference | PropertyMatcher)[],
}

export type PatchListMutateElement = {
    "$list-mutate": PatchListMutateElementDef,
}

export type PatchListMutateElementDef = {
    "$op": "replace",
    "$source": number,
    "$to": ListElementMatcher, // `-` means last. `-N` means N before last. Reference must be single, not range
    "$index-type": "at",
} | {
    "$op": "insert",
    "$source": number,
    "$to": ListElementMatcher,
    "$index-type": "before" | "after",
}

export type PatchListKeepElement = {
    "$list-keep": {
        "$to": EntryReference,
    }
} & PatchKeep;

export type ListElementMatcher = PropertyMatcher | number | "-";

export type PropertyMatcher = FirstFoundMatcher | LastFoundMatcher | EntryReference;

export type FirstFoundMatcher = Matcher & {
    "$found-strategy": "first"
}

export type LastFoundMatcher = Matcher & {
    "$found-strategy": "last"
}

export type Matcher = {
    "$matcher": {
        [key: string]: Condition,
    }
}

export type Condition = {
    "$equals": any
} | {
    "$script": string, // Valid variable: `target`, `self`
}

export type ListPropertyPatch<T> = {
    "$value": T[],
} & (PatchListStrategyReplace |
    (PatchListStrategyMutate &
        Partial<PatchListRemove | PatchListMutateElement | PatchListKeepElement>
    ));

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
