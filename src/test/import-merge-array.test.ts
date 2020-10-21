import {Nymph, NymphObject, NymphPlugin} from "../merger";
import {describe, expect, test} from '@jest/globals'
import {buildPlugins} from "./utils";

const a: NymphObject[] = [{
    "$id": "objA",
    "arr1": ["1"],
    "arr2": ["1"],
    "arr3": ["1"],
}, {
    "$id": "objB",
    "arr1": ["2"],
    "arr2": ["2"],
    "arr3": ["2"],
}]

const patch: NymphObject[] = [{
    "$id": "objA",
    "$import": "objB",
    "$import-strategy": {
        "arr1": "append",
        "arr2": "prepend",
        "arr3": "replace",
    },
}
];

test("import-strategy (arr)", () => {
    const nymph: any = new Nymph(...buildPlugins(a, patch));
    console.log(nymph.processed)

    // import-strategy (arr)
    //  append
    expect(nymph.processed["objA"]["arr1"].length).toBe(2)
    expect(nymph.processed["objA"]["arr1"][0]).toBe("1")
    expect(nymph.processed["objA"]["arr1"][1]).toBe("2")
    //  prepend
    expect(nymph.processed["objA"]["arr2"].length).toBe(2)
    expect(nymph.processed["objA"]["arr2"][0]).toBe("2")
    expect(nymph.processed["objA"]["arr2"][1]).toBe("1")
    //  replace
    expect(nymph.processed["objA"]["arr3"].length).toBe(1)
    expect(nymph.processed["objA"]["arr3"][0]).toBe("2")
});
