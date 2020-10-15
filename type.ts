// Well, it's not a good idea to validate RecordID in compile time while the real data is not in Nymph.

// type LowerAlpha = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z'
// type UpperAlpha = `${uppercase LowerAlpha}`
// type Alpha = LowerAlpha | UpperAlpha;
// type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
// type Punctuation = "_" | "-"
// type ValidChar = Alpha | Digit | Punctuation;

type RecordID = string;
type PropertyName = string;
type EntryReference = string;

type PatchStrategy = {
    "$strategy": "merge" | "replace" | "replace-exist" | "add-newly",
}

type PatchImport = {
    "$import": EntryReference,
}

type PatchRemove = {
    "$remove": PropertyName[],
}

type PatchKeep = {
    "$keep": "exist"
} | {
    "$keep": "ref",
    "$keep-ref": EntryReference,
}

type PatchNonList = PatchStrategy & Partial<PatchImport | PatchRemove | PatchKeep>;



type PatchListStrategy = PatchListStrategyMutate | PatchListStrategyReplace;

type PatchListStrategyMutate = {
    "$strategy-list": "append" | "prepend",
}

type PatchListStrategyReplace = {
    "$strategy-list": "replace",
}

type PatchListRemove = {
    "$strategy-list-remove": (EntryReference | PropertyMatcher)[],
}

type PatchListMutateElement = {
    "$strategy-list-mutate": PatchListMutateElementDef,
}

type PatchListMutateElementDef = {
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

type PatchListKeepElement = {
    "$strategy-list-keep": {
        "$to": EntryReference,
    }
} & PatchKeep;

type ListElementMatcher = PropertyMatcher | number | "-";

type PropertyMatcher = FirstFoundMatcher | LastFoundMatcher | EntryReference;

type FirstFoundMatcher = Matcher & {
    "$found-strategy": "first"
}

type LastFoundMatcher = Matcher & {
    "$found-strategy": "last"
}

type Matcher = {
    "$matcher": {
        [key: string]: Condition,
    }
}

type Condition = {
    "$equals": any
} | {
    "$script": string, // Valid variable: `target`, `self`
}

type ListPropertyPatch<T> = {
    "$value": T[],
} & (PatchListStrategyReplace |
    (PatchListStrategyMutate &
        Partial<PatchListRemove | PatchListMutateElement | PatchListKeepElement>
    ));